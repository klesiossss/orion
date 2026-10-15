import { EventEmitter } from 'node:events';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { ApprovalMode, Capabilities, DomainEvent, Model, ProviderContextSettings, Thread } from '@harness/contracts';
import { z } from 'zod';
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
declare const SUPPORTED = "0.1";
export declare function grokPromptJson(text: string, attachments: string[]): string;
/** Model-specific reasoning levels published for Grok 4.5. The CLI's global
 *  `--reasoning-effort` help lists every level understood by any model, so it
 *  cannot be the capability set for each row returned by `grok models`. */
export declare const GROK_EFFORTS: string[];
export type GrokStartOptions = {
    instructions?: string | undefined;
    model?: string | undefined;
    effort?: string | undefined;
    approval?: ApprovalMode | undefined;
    /** Product-owned one-shot writing. Keep it on grok-4.6 low without tool loops. */
    ephemeral?: boolean | undefined;
    context?: ProviderContextSettings | undefined;
};
/**
 * Grok reads its compaction point from the environment, as a percent of the
 * window; it has no switch for the window itself outside its own TUI.
 */
export declare function grokContextEnvironment(context: ProviderContextSettings | undefined): Record<string, string> | undefined;
export type GrokTurnOptions = Pick<GrokStartOptions, 'model' | 'effort'>;
/** How this turn should bind to Grok's native session on disk. */
export type GrokNativeSession = {
    id: string;
    mode: 'create' | 'resume';
};
/** The per-turn argv. Only a prompt file path travels through CreateProcess. */
export declare function grokTurnArgs(promptFile: string, options: GrokStartOptions, session: GrokNativeSession | undefined): string[];
/** Resolve the binary: PATH name normally, the installer's fixed home as a
 *  fallback because a parent shell's stale PATH otherwise hides it. */
export declare function grokCommand(): string;
declare const GrokFrameSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodString>;
    toolCallId: z.ZodOptional<z.ZodString>;
    toolName: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rawInput: z.ZodOptional<z.ZodObject<{
        file_path: z.ZodOptional<z.ZodString>;
        path: z.ZodOptional<z.ZodString>;
        target_file: z.ZodOptional<z.ZodString>;
        command: z.ZodOptional<z.ZodString>;
        pattern: z.ZodOptional<z.ZodString>;
        query: z.ZodOptional<z.ZodString>;
        regex: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    content: z.ZodOptional<z.ZodJSONSchema>;
    rawOutput: z.ZodOptional<z.ZodJSONSchema>;
    stopReason: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    total_cost_usd: z.ZodOptional<z.ZodNumber>;
    usage: z.ZodOptional<z.ZodObject<{
        input_tokens: z.ZodOptional<z.ZodNumber>;
        output_tokens: z.ZodOptional<z.ZodNumber>;
        reasoning_tokens: z.ZodOptional<z.ZodNumber>;
        cache_read_input_tokens: z.ZodOptional<z.ZodNumber>;
        total_tokens: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type GrokFrame = z.infer<typeof GrokFrameSchema>;
export type GrokAdapterEvents = {
    event: [DomainEvent];
    log: [string];
    /** Grok's opaque resume identity. It is not the TasteCode thread id. */
    providerSessionId: [string];
};
type SpawnFn = (command: string, args: string[], options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdio: ['pipe', 'pipe', 'pipe'];
    windowsHide: boolean;
}) => ChildProcessWithoutNullStreams;
export declare class GrokAdapter extends EventEmitter<GrokAdapterEvents> {
    #private;
    constructor(options?: {
        spawn?: SpawnFn;
    });
    get capabilities(): Capabilities;
    /** Grok's opaque resume identity. It is not the TasteCode thread id. */
    get providerSessionId(): string | undefined;
    startThread(workspacePath: string, options?: GrokStartOptions): Promise<Thread>;
    /**
     * Reattach a persisted TasteCode thread to Grok's separate native session.
     * The two ids are deliberately explicit here: passing the TasteCode id to
     * `grok --resume` would start from an identity the CLI has never heard of.
     */
    resumeThread(threadId: string, providerSessionId: string, workspacePath: string, options?: GrokStartOptions): Promise<Thread>;
    sendTurn(threadId: string, text: string, attachments?: string[], options?: GrokTurnOptions): Promise<string>;
    interrupt(): Promise<void>;
    /** Print mode starts a new process per turn; an active child keeps its policy. */
    setApproval(approval: ApprovalMode): void;
    /** `grok models` prints a default line plus an "Available models:" list. */
    listModels(): Promise<Model[]>;
    dispose(): Promise<void>;
}
export declare function grokToolLabel(name: string, title: string | undefined, input: GrokFrame['rawInput']): string;
export declare function grokToolOutput(frame: {
    content?: unknown;
    rawOutput?: unknown;
}): string | undefined;
interface GrokDiff {
    text: string;
    linesAdded: number;
    linesRemoved: number;
}
/**
 * Grok reports an edit as `{ type: 'diff', path, oldText, newText }` content
 * parts. The transcript renders file changes as unified diffs, so build one.
 * The line counts come from the texts: in the rendered diff a removed
 * `-- comment` line reads like a `---` header.
 */
export declare function grokDiff(content: unknown): GrokDiff | undefined;
/** Auth as the CLI reports it on `grok models` — nothing else is read. */
export type GrokSignIn = {
    signedIn: boolean;
};
export declare function grokSignIn(): Promise<GrokSignIn>;
/** `grok logout` clears the CLI's own cached credentials. */
export declare function signOutGrok(): Promise<void>;
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
export declare function parseGrokModels(output: string): Model[];
/** `grok-4.5` -> "Grok 4.5" while keeping future catalog ids readable. */
export declare function grokDisplayName(id: string): string;
/** The CLI announces its own auth state on `grok models`. */
export declare function parseGrokAccount(output: string): GrokSignIn;
export { SUPPORTED as GROK_SUPPORTED_VERSION };
//# sourceMappingURL=adapter.d.ts.map