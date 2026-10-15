import { EventEmitter } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JsonRpcValueSchema, killTree, ProtocolFrameError, spawnOwned, readNdjson, } from '@harness/proc';
import { captureCli } from '@harness/proc/cli';
import { z } from 'zod';
import { GROK_CAPABILITIES } from './capabilities.js';
export { GROK_CAPABILITIES } from './capabilities.js';
/**
 * Tier 3 adapter: drives xAI's Grok Build CLI (`grok`) in headless
 * streaming-json mode — one `--prompt-file` invocation per turn.
 *
 * Grok starts a fresh native session unless `--session-id` (create) or
 * `--resume` (continue) is passed. The end frame also carries `sessionId`,
 * but that arrives only after a clean stop. An interrupted first turn never
 * emits it, so follow-ups used to look like `/new` with empty context.
 * TasteCode therefore chooses a UUID at thread start, creates with
 * `--session-id`, and resumes with `--resume` even if the previous child
 * was stopped.
 *
 * Frames captured against grok 0.1.219 on Windows through real non-TTY
 * pipes (see fixtures/stream.jsonl), still valid on grok 1.0.5:
 *
 *   {"type":"thought","data":"..."}                             reasoning delta
 *   {"type":"text","data":"..."}                                answer delta
 *   {"type":"tool_call","toolCallId":"...","toolName":"write",
 *    "title":"write","status":"pending","rawInput":{...}}       tool started
 *   {"type":"tool_call_update","toolCallId":"...",
 *    "status":"completed","content":[...],"rawOutput":{...}}    tool finished
 *   {"type":"usage","usage":{...}}                              usage snapshot
 *   {"type":"end","stopReason":"end_turn","sessionId":"...",
 *    "usage":{...},"total_cost_usd":...}                        terminal frame
 *   {"type":"available_commands",...}                           roster noise
 *
 * A version banner may precede the JSON on stdout; readNdjson routes
 * unparsable lines to the log callback, so it is tolerated by construction.
 *
 * `grok.exe` is a real executable, not a .cmd shim, so it is spawned
 * directly rather than through `spawnCli`'s cmd.exe route. Prompts still do
 * not belong on argv: CreateProcess rejects long command lines even without
 * cmd.exe. Grok's `--prompt-file` keeps the exact UTF-8 text off argv.
 *
 * This never reads a credential. `grok models` reports "You are not
 * authenticated." on its own, which is the entire auth probe.
 */
const SUPPORTED = '0.1';
const IMAGE_MIME_TYPES = new Map([
    ['.gif', 'image/gif'],
    ['.jpeg', 'image/jpeg'],
    ['.jpg', 'image/jpeg'],
    ['.png', 'image/png'],
    ['.webp', 'image/webp'],
]);
export function grokPromptJson(text, attachments) {
    return JSON.stringify([
        { type: 'text', text },
        ...attachments.map((file) => {
            const mimeType = IMAGE_MIME_TYPES.get(path.extname(file).toLowerCase());
            return mimeType
                ? {
                    type: 'image',
                    data: readFileSync(file).toString('base64'),
                    mimeType,
                    uri: pathToFileURL(file).href,
                }
                : {
                    type: 'resource_link',
                    name: path.basename(file),
                    uri: pathToFileURL(file).href,
                };
        }),
    ]);
}
/** Model-specific reasoning levels published for Grok 4.5. The CLI's global
 *  `--reasoning-effort` help lists every level understood by any model, so it
 *  cannot be the capability set for each row returned by `grok models`. */
export const GROK_EFFORTS = ['low', 'medium', 'high'];
const GROK_4_6_PLUS_EFFORTS = [...GROK_EFFORTS, 'xhigh'];
const GROK_MODEL_DETAILS = new Map([
    [
        'grok-4.7',
        {
            reasoningEfforts: GROK_4_6_PLUS_EFFORTS,
            defaultReasoningEffort: 'high',
        },
    ],
    [
        'grok-4.6',
        {
            reasoningEfforts: GROK_4_6_PLUS_EFFORTS,
            defaultReasoningEffort: 'high',
        },
    ],
    [
        'grok-4.5',
        {
            reasoningEfforts: GROK_EFFORTS,
            defaultReasoningEffort: 'high',
        },
    ],
]);
const GROK_BACKGROUND_MODEL = 'grok-4.6';
const GROK_BACKGROUND_EFFORT = 'low';
/**
 * Grok reads its compaction point from the environment, as a percent of the
 * window; it has no switch for the window itself outside its own TUI.
 */
export function grokContextEnvironment(context) {
    return typeof context?.compactAt === 'number'
        ? { GROK_AUTO_COMPACT_THRESHOLD_PERCENT: String(context.compactAt) }
        : undefined;
}
function applyGrokTurnOptions(current, next) {
    if (Object.keys(next).length === 0)
        return current;
    const merged = { ...current };
    for (const field of ['model', 'effort']) {
        if (!(field in next))
            continue;
        const value = next[field];
        if (value === undefined)
            delete merged[field];
        else
            merged[field] = value;
    }
    return merged;
}
function applyGrokBackgroundDefaults(options) {
    if (!options.ephemeral)
        return options;
    return {
        ...options,
        model: options.model ?? GROK_BACKGROUND_MODEL,
        effort: options.effort ?? GROK_BACKGROUND_EFFORT,
    };
}
/** The per-turn argv. Only a prompt file path travels through CreateProcess. */
export function grokTurnArgs(promptFile, options, session) {
    return [
        '--prompt-file',
        promptFile,
        '--output-format',
        'streaming-json',
        ...(options.model ? ['--model', options.model] : []),
        ...(options.effort ? ['--reasoning-effort', options.effort] : []),
        // One model reply, no tool loop: background titles must not wait on a TTY
        // permission prompt in an empty temp workspace.
        ...(options.ephemeral ? ['--max-turns', '1'] : []),
        // ask -> the CLI's default permission behavior; auto -> accept edits but
        // not commands; full -> the CLI's own skip-everything mode.
        ...(options.approval === 'auto' ? ['--permission-mode', 'acceptEdits'] : []),
        ...(options.approval === 'full' ? ['--permission-mode', 'bypassPermissions'] : []),
        // Long flags: `-r` takes an optional value, so a bare `-r` can swallow the
        // next switch or resume the wrong session. `--session-id` creates; it
        // cannot resume an existing UUID.
        ...(session
            ? session.mode === 'create'
                ? ['--session-id', session.id]
                : ['--resume', session.id]
            : []),
    ];
}
/** Resolve the binary: PATH name normally, the installer's fixed home as a
 *  fallback because a parent shell's stale PATH otherwise hides it. */
export function grokCommand() {
    const installed = path.join(homedir(), '.grok', 'bin', process.platform === 'win32' ? 'grok.exe' : 'grok');
    return existsSync(installed) ? installed : 'grok';
}
const GrokFrameSchema = z.object({
    type: z.string().optional(),
    data: z.string().optional(),
    toolCallId: z.string().optional(),
    toolName: z.string().optional(),
    title: z.string().optional(),
    status: z.string().nullable().optional(),
    // Passthrough: the keys below drive labels, but a generic tool's whole input
    // is what the transcript shows as its arguments.
    rawInput: z
        .object({
        file_path: z.string().optional(),
        path: z.string().optional(),
        target_file: z.string().optional(),
        command: z.string().optional(),
        pattern: z.string().optional(),
        query: z.string().optional(),
        regex: z.string().optional(),
    })
        .passthrough()
        .optional(),
    content: JsonRpcValueSchema.optional(),
    rawOutput: JsonRpcValueSchema.optional(),
    stopReason: z.string().optional(),
    /** An `error` frame's reason, e.g. a model the CLI no longer lists. */
    message: z.string().optional(),
    sessionId: z.string().optional(),
    total_cost_usd: z.number().optional(),
    usage: z
        .object({
        input_tokens: z.number().optional(),
        output_tokens: z.number().optional(),
        reasoning_tokens: z.number().optional(),
        cache_read_input_tokens: z.number().optional(),
        total_tokens: z.number().optional(),
    })
        .optional(),
});
export class GrokAdapter extends EventEmitter {
    #processStop = Promise.resolve();
    #spawn;
    #workspacePath = '';
    #options = {};
    /** Stable TasteCode identity, kept separate from Grok's opaque resume id. */
    #threadId;
    /** Grok's own session id, so follow-up turns resume rather than restart. */
    #providerSessionId;
    /**
     * True once a child has been spawned against `#providerSessionId`. The first
     * spawn creates with `--session-id`; every later spawn resumes with
     * `--resume`, including after Stop.
     */
    #nativeSessionCreated = false;
    /** Last native id emitted to the server; used to skip duplicate announces. */
    #announcedProviderSessionId;
    #child;
    /** Why we killed a child: only an explicit Stop completes the turn. */
    #killReasons = new WeakMap();
    #promptDirectories = new WeakMap();
    /** Session instructions ride in front of the first prompt: the CLI's
     *  --system-prompt-override would REPLACE the agent's own prompt, which is
     *  more than session instructions should do. */
    #instructionsPending = false;
    /** Set by dispose. A turn waiting on the previous child must not launch after it. */
    #disposed = false;
    constructor(options = {}) {
        super();
        this.#spawn = options.spawn ?? spawnOwned;
    }
    get capabilities() {
        return GROK_CAPABILITIES;
    }
    /** Grok's opaque resume identity. It is not the TasteCode thread id. */
    get providerSessionId() {
        return this.#providerSessionId;
    }
    async startThread(workspacePath, options = {}) {
        if (options.approval === 'auto-review') {
            throw new Error('Grok does not support automatic approval review');
        }
        this.#workspacePath = workspacePath;
        this.#options = applyGrokBackgroundDefaults(options);
        const threadId = `grok-${crypto.randomUUID()}`;
        this.#threadId = threadId;
        // Chosen here, not from the end frame: Stop can kill the first child
        // before Grok emits `sessionId`, and `--session-id` must be a UUID the
        // CLI has not already created.
        this.#providerSessionId = crypto.randomUUID();
        this.#nativeSessionCreated = false;
        this.#announcedProviderSessionId = undefined;
        this.#instructionsPending = Boolean(options.instructions);
        return {
            id: threadId,
            provider: 'grok',
            workspacePath,
            createdAt: Date.now(),
        };
    }
    /**
     * Reattach a persisted TasteCode thread to Grok's separate native session.
     * The two ids are deliberately explicit here: passing the TasteCode id to
     * `grok --resume` would start from an identity the CLI has never heard of.
     */
    async resumeThread(threadId, providerSessionId, workspacePath, options = {}) {
        if (options.approval === 'auto-review') {
            throw new Error('Grok does not support automatic approval review');
        }
        if (!threadId)
            throw new Error('TasteCode thread id is required to resume Grok');
        if (!providerSessionId)
            throw new Error('Grok native session id is required to resume');
        this.#workspacePath = workspacePath;
        this.#options = applyGrokBackgroundDefaults(options);
        this.#threadId = threadId;
        this.#providerSessionId = providerSessionId;
        this.#nativeSessionCreated = true;
        this.#announcedProviderSessionId = undefined;
        // The provider session already received its initial instructions. Adding
        // them to the next user message would duplicate and expose them as text.
        this.#instructionsPending = false;
        return {
            id: threadId,
            provider: 'grok',
            workspacePath,
            createdAt: Date.now(),
        };
    }
    async sendTurn(threadId, text, attachments = [], options = {}) {
        if (this.#disposed)
            throw new Error('Grok session is closed');
        if (threadId !== this.#threadId) {
            throw new Error(`Grok adapter is attached to a different TasteCode thread`);
        }
        this.#options = applyGrokTurnOptions(this.#options, options);
        // A process restart resets in-memory counters. Random ids cannot collide
        // with turns already persisted for this thread before the restart.
        const turnId = `${threadId}-turn-${crypto.randomUUID()}`;
        const prompt = this.#instructionsPending && this.#options.instructions
            ? `<system-instructions>\n${this.#options.instructions}\n</system-instructions>\n\n${text}`
            : text;
        const promptDirectory = mkdtempSync(path.join(tmpdir(), 'harness-grok-'));
        const promptFile = path.join(promptDirectory, attachments.length ? 'prompt.json' : 'prompt.md');
        try {
            writeFileSync(promptFile, attachments.length ? grokPromptJson(prompt, attachments) : prompt, 'utf8');
        }
        catch (error) {
            rmSync(promptDirectory, { recursive: true, force: true });
            throw error;
        }
        const session = this.#providerSessionId
            ? {
                id: this.#providerSessionId,
                mode: this.#nativeSessionCreated ? 'resume' : 'create',
            }
            : undefined;
        const args = grokTurnArgs(promptFile, this.#options, session);
        const environment = grokContextEnvironment(this.#options.context);
        // A turn already in flight would be orphaned by the reassignment below.
        if (this.#child)
            await this.#stop(this.#child);
        // dispose() can run during that wait. A child launched after it would be
        // an agent turn nobody owns, still editing the workspace.
        if (this.#disposed) {
            rmSync(promptDirectory, { recursive: true, force: true });
            throw new Error('Grok session is closed');
        }
        let child;
        try {
            child = this.#spawn(grokCommand(), args, {
                cwd: this.#workspacePath,
                ...(environment ? { env: { ...process.env, ...environment } } : {}),
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true,
            });
        }
        catch (error) {
            rmSync(promptDirectory, { recursive: true, force: true });
            throw error;
        }
        this.#promptDirectories.set(child, promptDirectory);
        this.#child = child;
        if (this.#nativeSessionCreated)
            this.#announceProviderSessionId(this.#providerSessionId);
        // spawn() can return a child that later reports ENOENT. Only a successful
        // launch may switch subsequent attempts from creation to resume.
        child.once('spawn', () => {
            if (this.#child !== child)
                return;
            this.#nativeSessionCreated = true;
            this.#announceProviderSessionId(this.#providerSessionId);
        });
        this.emit('event', {
            type: 'turn.started',
            turn: { id: turnId, threadId, status: 'running', createdAt: Date.now() },
        });
        let terminal = false;
        /** Grok prints an `error` frame and exits without `end`; its reason is the useful one. */
        let reportedError;
        let messageCounter = 1;
        let message = new StreamedItem(`${turnId}-message-${messageCounter}`);
        let reasoningCounter = 1;
        let reasoning = new StreamedItem(`${turnId}-reasoning-${reasoningCounter}`);
        let toolCounter = 0;
        const closeReasoning = (status = 'completed') => {
            reasoning.complete(turnId, 'reasoning', this, status);
            reasoning = new StreamedItem(`${turnId}-reasoning-${++reasoningCounter}`);
        };
        /** toolCallId -> the open item it maps to. */
        const tools = new Map();
        const completeTool = (entry, status, output, diff) => {
            this.emit('event', {
                type: 'item.completed',
                item: {
                    id: entry.itemId,
                    turnId,
                    type: entry.itemType,
                    status,
                    ...(entry.itemType === 'command'
                        ? {
                            command: entry.command ?? entry.label,
                            ...(output ? { text: output } : {}),
                        }
                        : {}),
                    ...(entry.itemType === 'file_change' && entry.path ? { path: entry.path } : {}),
                    ...(entry.itemType === 'file_change' && (diff || output)
                        ? {
                            text: diff?.text ?? output,
                            ...(diff ? { linesAdded: diff.linesAdded, linesRemoved: diff.linesRemoved } : {}),
                        }
                        : {}),
                    ...(entry.itemType === 'tool_call'
                        ? { text: [entry.label, entry.argumentLine, output].filter(Boolean).join('\n') }
                        : {}),
                    createdAt: Date.now(),
                },
            });
        };
        const finishItems = (status, messagePhase) => {
            reasoning.complete(turnId, 'reasoning', this, status);
            message.complete(turnId, 'message', this, status, messagePhase);
            for (const entry of tools.values())
                completeTool(entry, status);
            tools.clear();
        };
        readNdjson(child.stdout, (value) => {
            if (terminal)
                return;
            const parsed = GrokFrameSchema.safeParse(value);
            if (!parsed.success) {
                this.emit('log', `unrecognized Grok frame: ${JSON.stringify(value).slice(0, 200)}`);
                return;
            }
            const frame = parsed.data;
            if (this.#child === child &&
                (frame.type === 'thought' ||
                    frame.type === 'text' ||
                    frame.type === 'tool_call' ||
                    (frame.type === 'end' && frame.stopReason === 'end_turn'))) {
                this.#nativeSessionCreated = true;
                this.#instructionsPending = false;
                this.#announceProviderSessionId(this.#providerSessionId);
            }
            if (frame.type === 'error' && frame.message) {
                reportedError = frame.message;
                return;
            }
            if (frame.type === 'thought' && frame.data !== undefined) {
                message.complete(turnId, 'message', this, 'completed', 'commentary');
                message = new StreamedItem(`${turnId}-message-${++messageCounter}`);
                if (reasoning.push(frame.data, turnId, 'reasoning', this))
                    return;
                return;
            }
            if (frame.type === 'text' && frame.data !== undefined) {
                closeReasoning();
                message.push(frame.data, turnId, 'message', this);
                return;
            }
            if (frame.type === 'tool_call' && frame.toolCallId) {
                closeReasoning();
                message.complete(turnId, 'message', this, 'completed', 'commentary');
                message = new StreamedItem(`${turnId}-message-${++messageCounter}`);
                const name = frame.toolName ?? frame.title ?? 'tool';
                const itemType = name === 'write' || name === 'search_replace'
                    ? 'file_change'
                    : name === 'run_terminal_command'
                        ? 'command'
                        : 'tool_call';
                const itemId = `${turnId}-tool-${++toolCounter}`;
                const path = grokToolPath(frame.rawInput);
                const argumentLine = itemType === 'tool_call' && frame.rawInput && Object.keys(frame.rawInput).length > 0
                    ? JSON.stringify(frame.rawInput)
                    : undefined;
                const entry = {
                    itemId,
                    itemType,
                    label: grokToolLabel(name, frame.title, frame.rawInput),
                    ...(argumentLine ? { argumentLine } : {}),
                    ...(frame.rawInput?.command
                        ? {
                            command: frame.rawInput.command,
                        }
                        : {}),
                    ...(path
                        ? {
                            path,
                        }
                        : {}),
                };
                tools.set(frame.toolCallId, entry);
                this.emit('event', {
                    type: 'item.started',
                    item: {
                        id: itemId,
                        turnId,
                        type: itemType,
                        status: 'started',
                        ...(itemType === 'command'
                            ? {
                                command: frame.rawInput?.command ?? entry.label,
                            }
                            : {}),
                        ...(itemType === 'file_change' && entry.path
                            ? {
                                path: entry.path,
                            }
                            : {}),
                        ...(itemType === 'tool_call'
                            ? { text: [entry.label, argumentLine].filter(Boolean).join('\n') }
                            : {}),
                        createdAt: Date.now(),
                    },
                });
                return;
            }
            if (frame.type === 'tool_call_update' && frame.toolCallId && frame.status) {
                const entry = tools.get(frame.toolCallId);
                if (!entry)
                    return;
                const output = grokToolOutput(frame);
                const diff = entry.itemType === 'file_change' ? grokDiff(frame.content) : undefined;
                completeTool(entry, frame.status === 'failed' ? 'failed' : 'completed', output, diff);
                tools.delete(frame.toolCallId);
                return;
            }
            if (frame.type === 'end') {
                if (terminal)
                    return;
                terminal = true;
                const status = frame.stopReason === 'end_turn' ? 'completed' : 'failed';
                // close skips a turn whose end frame was seen, so a throwing listener
                // must not keep turn.completed from going out.
                try {
                    if (this.#child === child)
                        this.#announceProviderSessionId(frame.sessionId);
                    finishItems(status, status === 'completed' ? 'final_answer' : undefined);
                    const usage = frame.usage;
                    if (usage) {
                        const reasoningTokens = usage.reasoning_tokens ?? 0;
                        this.emit('event', {
                            type: 'usage.updated',
                            usage: {
                                ...(this.#options.model
                                    ? {
                                        model: this.#options.model,
                                    }
                                    : {}),
                                inputTokens: usage.input_tokens ?? 0,
                                cachedInputTokens: usage.cache_read_input_tokens ?? 0,
                                outputTokens: (usage.output_tokens ?? 0) + reasoningTokens,
                                reasoningTokens,
                                totalTokens: usage.total_tokens ?? 0,
                                inputIncludesCached: false,
                                ...(frame.total_cost_usd !== undefined
                                    ? {
                                        costUsd: frame.total_cost_usd,
                                    }
                                    : {}),
                            },
                        });
                    }
                    if (status === 'failed') {
                        this.emit('event', {
                            type: 'thread.error',
                            threadId,
                            message: `Grok finished with stop reason ${frame.stopReason ?? 'unknown'}`,
                        });
                    }
                }
                finally {
                    this.emit('event', { type: 'turn.completed', turnId, status });
                }
            }
            // usage snapshots and available_commands are noise between turns.
        }, (line) => this.emit('log', `unparsable stdout: ${line.slice(0, 200)}`), {
            onError: (error) => {
                // A throwing event listener leaves the stream intact; keep reading it.
                if (!(error instanceof ProtocolFrameError)) {
                    this.emit('log', `Grok event handling failed: ${error.message}`);
                    return;
                }
                finishProcess(error.message);
                void killTree(child);
            },
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => this.emit('log', chunk.trimEnd()));
        const finishProcess = (errorMessage) => {
            this.#cleanupPrompt(child);
            if (this.#child === child)
                this.#child = undefined;
            if (terminal)
                return;
            terminal = true;
            const killReason = this.#killReasons.get(child);
            if (!killReason) {
                this.emit('event', { type: 'thread.error', threadId, message: errorMessage });
            }
            finishItems('failed');
            if (killReason !== 'silent') {
                this.emit('event', {
                    type: 'turn.completed',
                    turnId,
                    status: killReason === 'interrupt' ? 'interrupted' : 'failed',
                });
            }
        };
        // An exit without an end frame would otherwise look like a hang.
        child.on('close', (code) => finishProcess(reportedError ?? `grok exited with code ${code ?? 'unknown'} before reporting a result`));
        // A spawn failure emits 'error' on the child; without a listener that
        // throws out of the event loop and takes the whole server down.
        child.on('error', (error) => finishProcess(String(error)));
        child.stdin.end();
        return turnId;
    }
    async interrupt() {
        if (this.#child)
            await this.#stop(this.#child, 'interrupt');
    }
    /** Print mode starts a new process per turn; an active child keeps its policy. */
    setApproval(approval) {
        if (approval === 'auto-review') {
            throw new Error('Grok does not support automatic approval review');
        }
        this.#options = { ...this.#options, approval };
    }
    /** `grok models` prints a default line plus an "Available models:" list. */
    async listModels() {
        return parseGrokModels(await this.#capture(['models']));
    }
    dispose() {
        this.#disposed = true;
        const stopped = this.#child ? this.#stop(this.#child) : this.#processStop;
        this.#child = undefined;
        this.#processStop = stopped;
        return stopped;
    }
    #announceProviderSessionId(id) {
        if (!id || id === this.#announcedProviderSessionId)
            return;
        this.#providerSessionId = id;
        this.#announcedProviderSessionId = id;
        this.emit('providerSessionId', id);
    }
    #stop(child, reason = 'silent') {
        if (reason === 'interrupt' || !this.#killReasons.has(child))
            this.#killReasons.set(child, reason);
        this.#processStop = killTree(child);
        return this.#processStop;
    }
    #cleanupPrompt(child) {
        const directory = this.#promptDirectories.get(child);
        if (!directory)
            return;
        this.#promptDirectories.delete(child);
        try {
            rmSync(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
        }
        catch (error) {
            this.emit('log', `temporary prompt cleanup failed: ${String(error)}`);
        }
    }
    #capture(args, timeoutMs = 15000) {
        return captureGrok(this.#spawn, args, timeoutMs);
    }
}
async function captureGrok(spawnFn, args, timeoutMs = 15000) {
    const child = spawnFn(grokCommand(), args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
    });
    const captured = captureCli(child, timeoutMs);
    child.stdin.on('error', () => undefined);
    child.stdin.end();
    const result = await captured;
    if (result.code !== 0)
        throw new Error(`grok exited with code ${result.code ?? 'unknown'}`);
    return result.stdout;
}
export function grokToolLabel(name, title, input) {
    const path = grokToolPath(input);
    const pattern = firstString(input, ['pattern', 'query', 'regex']);
    switch (name) {
        case 'read_file':
        case 'read':
            return path ? `Read ${path}` : 'Read file';
        case 'grep':
        case 'search':
        case 'codebase_search':
            return pattern ? `Searched ${pattern}` : 'Searched';
        case 'list_dir':
        case 'list_files':
            return path ? `Listed ${path}` : 'Listed files';
        default:
            return title ?? name;
    }
}
export function grokToolOutput(frame) {
    const parts = [readableGrokValue(frame.content), readableGrokValue(frame.rawOutput)].filter((value) => value !== undefined);
    const unique = [...new Set(parts)];
    return unique.length ? unique.join('\n') : undefined;
}
/**
 * Grok reports an edit as `{ type: 'diff', path, oldText, newText }` content
 * parts. The transcript renders file changes as unified diffs, so build one.
 * The line counts come from the texts: in the rendered diff a removed
 * `-- comment` line reads like a `---` header.
 */
export function grokDiff(content) {
    if (!Array.isArray(content))
        return undefined;
    let linesAdded = 0;
    let linesRemoved = 0;
    const files = content.flatMap((part) => {
        if (typeof part !== 'object' || part === null)
            return [];
        const record = part;
        if (record.type !== 'diff')
            return [];
        const path = typeof record.path === 'string' ? record.path : 'file';
        const lines = (value) => typeof value === 'string' && value !== '' ? value.replace(/\n$/, '').split('\n') : [];
        const removed = lines(record.oldText);
        const added = lines(record.newText);
        if (removed.length === 0 && added.length === 0)
            return [];
        linesAdded += added.length;
        linesRemoved += removed.length;
        return [
            [
                `diff --git a/${path} b/${path}`,
                removed.length ? `--- a/${path}` : '--- /dev/null',
                `+++ b/${path}`,
                `@@ -${removed.length ? `1,${removed.length}` : '0,0'} +${added.length ? `1,${added.length}` : '0,0'} @@`,
                ...removed.map((line) => `-${line}`),
                ...added.map((line) => `+${line}`),
            ].join('\n'),
        ];
    });
    return files.length ? { text: files.join('\n'), linesAdded, linesRemoved } : undefined;
}
function grokToolPath(input) {
    return firstString(input, ['file_path', 'path', 'target_file']);
}
function firstString(input, keys) {
    if (!input)
        return undefined;
    for (const key of keys) {
        const value = input[key];
        if (typeof value === 'string' && value.trim())
            return value;
    }
    return undefined;
}
function readableGrokValue(value, depth = 0) {
    if (depth > 8 || value === null || value === undefined || value === '')
        return undefined;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return undefined;
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                return readableGrokValue(JSON.parse(trimmed), depth + 1) ?? value;
            }
            catch {
                return value;
            }
        }
        return value;
    }
    if (typeof value !== 'object')
        return undefined;
    if (Array.isArray(value)) {
        if (value.every((entry) => typeof entry === 'number'))
            return undefined;
        const parts = value
            .map((entry) => readableGrokValue(entry, depth + 1))
            .filter((entry) => entry !== undefined);
        const unique = [...new Set(parts)];
        return unique.length ? unique.join('\n') : undefined;
    }
    const record = value;
    if (typeof record.newText === 'string' || typeof record.oldText === 'string') {
        const path = typeof record.path === 'string' ? record.path : undefined;
        const next = typeof record.newText === 'string' ? record.newText : undefined;
        const parts = [path, next].filter((entry) => Boolean(entry));
        return parts.length ? parts.join('\n') : undefined;
    }
    for (const key of ['text', 'stdout', 'output', 'result', 'message', 'content']) {
        if (key in record) {
            const extracted = readableGrokValue(record[key], depth + 1);
            if (extracted)
                return extracted;
        }
    }
    return undefined;
}
export async function grokSignIn() {
    return parseGrokAccount(await captureGrok(spawnOwned, ['models']));
}
/** `grok logout` clears the CLI's own cached credentials. */
export async function signOutGrok() {
    await captureGrok(spawnOwned, ['logout']);
}
/** One streamed text item (message or reasoning): started lazily on the
 *  first delta, completed once, with the accumulated text. */
class StreamedItem {
    #id;
    #text = '';
    #started = false;
    #completed = false;
    #startedAt = 0;
    constructor(id) {
        this.#id = id;
    }
    push(delta, turnId, type, emitter) {
        if (!delta)
            return false;
        if (!this.#started) {
            this.#started = true;
            this.#startedAt = Date.now();
            emitter.emit('event', {
                type: 'item.started',
                item: {
                    id: this.#id,
                    turnId,
                    type,
                    ...(type === 'message' ? { role: 'assistant' } : {}),
                    status: 'started',
                    text: '',
                    createdAt: this.#startedAt,
                },
            });
        }
        this.#text += delta;
        emitter.emit('event', { type: 'item.delta', turnId, itemId: this.#id, textDelta: delta });
        return true;
    }
    complete(turnId, type, emitter, status = 'completed', phase) {
        if (!this.#started || this.#completed)
            return;
        this.#completed = true;
        const createdAt = this.#startedAt || Date.now();
        emitter.emit('event', {
            type: 'item.completed',
            item: {
                id: this.#id,
                turnId,
                type,
                ...(type === 'message' ? { role: 'assistant' } : {}),
                ...(type === 'message' && phase ? { phase } : {}),
                status,
                text: this.#text.trimEnd(),
                createdAt,
                ...(type === 'reasoning' ? { durationMs: Math.max(0, Date.now() - createdAt) } : {}),
            },
        });
    }
}
/**
 * Parse `grok models`. Grok 1.0 marks the default with `*` and the remaining
 * available models with `-`; 0.1 used `*` for every row.
 *
 *   You are not authenticated.
 *
 *   Default model: grok-4.5
 *
 *   Available models:
 *     * grok-4.5 (default)
 */
export function parseGrokModels(output) {
    const models = [];
    let reading = false;
    let foundModel = false;
    for (const rawLine of output.split(/\r\n|\n|\r/)) {
        const line = rawLine.trim();
        if (/^Available models:/i.test(line)) {
            reading = true;
            continue;
        }
        if (!reading)
            continue;
        if (!line) {
            if (foundModel)
                break;
            continue;
        }
        const match = line.match(/^[*-]\s*(\S+)(\s+\(default\))?/);
        if (!match) {
            if (foundModel)
                break;
            continue;
        }
        foundModel = true;
        const id = match[1];
        const details = GROK_MODEL_DETAILS.get(id);
        models.push({
            id,
            displayName: grokDisplayName(id),
            isDefault: Boolean(match[2]),
            reasoningEfforts: details ? [...details.reasoningEfforts] : [],
            ...(details
                ? {
                    defaultReasoningEffort: details.defaultReasoningEffort,
                }
                : {}),
            serviceTiers: [],
        });
    }
    return models;
}
/** `grok-4.5` -> "Grok 4.5" while keeping future catalog ids readable. */
export function grokDisplayName(id) {
    return id
        .split('-')
        .filter(Boolean)
        .map((token) => {
        if (token.toLowerCase() === 'grok')
            return 'Grok';
        if (/^\d+(?:\.\d+)*$/.test(token))
            return token;
        return token.charAt(0).toUpperCase() + token.slice(1);
    })
        .join(' ');
}
/** The CLI announces its own auth state on `grok models`. */
export function parseGrokAccount(output) {
    return { signedIn: !/You are not authenticated/i.test(output) };
}
export { SUPPORTED as GROK_SUPPORTED_VERSION };
//# sourceMappingURL=adapter.js.map