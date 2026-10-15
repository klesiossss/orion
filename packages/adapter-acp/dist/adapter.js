import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnCli, StdioJsonRpc, } from '@harness/proc';
import { optionFor } from './approvals.js';
import { Streamer } from './events.js';
import { acpSessionUsage, acpTurnUsage } from './usage.js';
import { PROTOCOL_VERSION, InitializeResultSchema, NewSessionResultSchema, PromptResultSchema, RequestPermissionParamsSchema, SessionNotificationSchema, } from './protocol.js';
export { prepareAcpMcpServers } from './mcp.js';
const IMAGE_MIME_TYPES = new Map([
    ['.gif', 'image/gif'],
    ['.jpeg', 'image/jpeg'],
    ['.jpg', 'image/jpeg'],
    ['.png', 'image/png'],
    ['.webp', 'image/webp'],
]);
export function acpPromptContent(text, attachments = [], images = false) {
    if (attachments.length > 0 && !images)
        throw new Error('ACP agent does not support images');
    return [
        { type: 'text', text },
        ...attachments.map((file) => {
            const mimeType = IMAGE_MIME_TYPES.get(path.extname(file).toLowerCase());
            if (!mimeType)
                throw new Error(`ACP image type is not supported: ${path.extname(file)}`);
            return {
                type: 'image',
                data: readFileSync(file).toString('base64'),
                mimeType,
                uri: pathToFileURL(file).href,
            };
        }),
    ];
}
export class AcpAdapter extends EventEmitter {
    #processStop = Promise.resolve();
    #spec;
    #spawn;
    #provider;
    #mcpServers;
    #env;
    #argsFor;
    #settings;
    #relaunching = false;
    #rpc;
    #initialize;
    #sessionId;
    #workspacePath = '';
    #model;
    #streamer;
    #activeTurn;
    #turnCounter = 0;
    #instructions;
    #instructionsPending = false;
    #approval = 'ask';
    #images = false;
    #loadSession = false;
    /**
     * Permission requests waiting on the user.
     *
     * The agent blocks on the JSON-RPC id until we reply, so the responder is
     * held here rather than answered eagerly — replying early would be answering
     * on the user's behalf, which is the one thing an approval must never do.
     */
    #pendingApprovals = new Map();
    /** The options the agent offered, kept until the user answers. */
    #optionsById = new Map();
    constructor(agentId, launch) {
        super();
        this.#spawn = launch.spawn ?? spawnCli;
        this.#provider = launch.provider;
        this.#mcpServers = launch.mcpServers ?? [];
        this.#env = launch.env;
        this.#argsFor = launch.argsFor;
        this.#settings = { ...launch.settings };
        this.#spec = {
            id: agentId,
            name: launch.name,
            command: launch.command,
            args: launch.args ?? [],
        };
    }
    /** Whether the connected agent can reload this session after its process ends. */
    get resumable() {
        return this.#loadSession;
    }
    get capabilities() {
        return {
            // ACP has no steer or fork. It does have cancellation and thinking, and
            // permission requests are core to it rather than optional.
            steer: false,
            fork: false,
            interrupt: true,
            reasoningItems: true,
            approvals: true,
            images: this.#images,
        };
    }
    async startThread(workspacePath, options = {}) {
        this.#setApproval(options.approval);
        this.#instructions = options.instructions;
        this.#instructionsPending = Boolean(options.instructions);
        this.#model = options.model;
        const rpc = await this.#connect(workspacePath, options.model);
        const session = await rpc
            .request('session/new', {
            cwd: workspacePath,
            mcpServers: this.#mcpServers,
        }, { result: NewSessionResultSchema })
            .catch((cause) => {
            // Agents report an expired or missing login as a bare protocol error.
            // Passing that through gives the user two words and no way forward, so
            // it becomes the one instruction that actually fixes it.
            const message = cause instanceof Error ? cause.message : String(cause);
            if (/auth/i.test(message)) {
                throw new Error(`${this.#spec.name} is not signed in. Run \`${this.#spec.command}\` once in a ` +
                    `terminal and sign in there — we deliberately never handle its credentials.`);
            }
            throw cause;
        });
        if (!session.sessionId)
            throw new Error(`${this.#spec.name} started no session`);
        this.#sessionId = session.sessionId;
        await this.#selectSessionModel(options.model);
        return {
            id: `acp-${this.#spec.id}-${session.sessionId}`,
            provider: this.#provider,
            workspacePath,
            createdAt: Date.now(),
        };
    }
    async resumeThread(threadId, workspacePath, options = {}) {
        this.#setApproval(options.approval);
        this.#instructions = options.instructions;
        this.#instructionsPending = false;
        this.#model = options.model;
        const sessionId = parseAcpThreadId(threadId, this.#spec.id);
        const rpc = await this.#connect(workspacePath, options.model);
        if (!this.#loadSession) {
            await this.dispose();
            throw new Error(`${this.#spec.name} does not support session resume`);
        }
        await rpc.request('session/load', {
            sessionId,
            cwd: workspacePath,
            mcpServers: this.#mcpServers,
        });
        this.#sessionId = sessionId;
        await this.#selectSessionModel(options.model);
        return {
            id: `acp-${this.#spec.id}-${sessionId}`,
            provider: this.#provider,
            workspacePath,
            createdAt: Date.now(),
        };
    }
    async sendTurn(threadId, text, attachments = [], settings = {}) {
        if (!this.#rpc || !this.#sessionId)
            throw new Error('session not started');
        if (this.#activeTurn || this.#relaunching)
            throw new Error('ACP already has a running turn');
        await this.#applySettings(settings);
        const rpc = this.#rpc;
        if (!rpc || !this.#sessionId)
            throw new Error('session not started');
        const prompt = this.#instructionsPending && this.#instructions
            ? `<system-instructions>\n${this.#instructions}\n</system-instructions>\n\n${text}`
            : text;
        // Read and validate attachments before opening the turn. A preparation
        // error must reject sendTurn without leaving a started turn orphaned.
        const promptContent = acpPromptContent(prompt, attachments, this.#images);
        // The random suffix keeps turn ids from a resumed process distinct from
        // the persisted turns of the process it replaced — a bare counter reset
        // to zero on every construction and merged two different turns' items.
        const turnId = `${threadId}-turn-${++this.#turnCounter}-${crypto.randomUUID().slice(0, 8)}`;
        const streamer = new Streamer(turnId, this.#workspacePath);
        this.#streamer = streamer;
        this.#activeTurn = { threadId, turnId };
        this.emit('event', {
            type: 'turn.started',
            turn: { id: turnId, threadId, status: 'running', createdAt: Date.now() },
        });
        // Deliberately not awaited inline: updates stream in while this is pending,
        // and the caller needs the turn id now to route them.
        this.#instructionsPending = false;
        void rpc
            .request('session/prompt', {
            sessionId: this.#sessionId,
            prompt: promptContent,
        }, { result: PromptResultSchema })
            .then((result) => this.#finishTurn(threadId, turnId, result, streamer))
            .catch((cause) => {
            if (this.#streamer !== streamer)
                return;
            this.#clearTurn();
            this.emit('event', {
                type: 'thread.error',
                threadId,
                message: cause instanceof Error ? cause.message : String(cause),
            });
            this.emit('event', { type: 'turn.completed', turnId, status: 'failed' });
        });
        return turnId;
    }
    async interrupt() {
        if (!this.#rpc || !this.#sessionId)
            return;
        // A notification, not a request: the agent acknowledges by resolving the
        // in-flight prompt with `cancelled`, not by replying to this.
        this.#rpc.notify('session/cancel', { sessionId: this.#sessionId });
        // An agent blocked on a permission request cannot resolve that prompt, so
        // the spec has the client answer each one `cancelled` after the cancel.
        this.#cancelPendingApprovals();
    }
    respondToApproval(approvalId, decision) {
        const respond = this.#pendingApprovals.get(approvalId);
        if (!respond)
            return;
        this.#pendingApprovals.delete(approvalId);
        const optionId = optionFor(this.#optionsById.get(approvalId) ?? [], decision);
        this.#optionsById.delete(approvalId);
        respond(optionId
            ? { outcome: { outcome: 'selected', optionId } }
            : // No matching option means we cannot express the answer. Cancelling is
                // the safe reading: it does not proceed.
                { outcome: { outcome: 'cancelled' } });
        this.emit('event', { type: 'approval.resolved', id: approvalId });
        if (decision === 'abort')
            void this.interrupt();
    }
    /** Live access-level change; read again for every permission request. */
    setApproval(approval) {
        this.#setApproval(approval);
    }
    onDisconnected(listener) {
        this.on('disconnected', listener);
        return () => this.off('disconnected', listener);
    }
    #clearTurn() {
        const streamer = this.#streamer;
        this.#streamer = undefined;
        this.#activeTurn = undefined;
        for (const event of streamer?.finish() ?? [])
            this.emit('event', event);
        this.#cancelPendingApprovals();
    }
    #cancelPendingApprovals() {
        // Anything still waiting is now unanswerable. The agent is still blocked on
        // its request, so it must hear "cancelled", not silence; the UI must hear
        // "resolved".
        for (const [id, respond] of this.#pendingApprovals) {
            respond({ outcome: { outcome: 'cancelled' } });
            this.emit('event', { type: 'approval.resolved', id });
        }
        this.#pendingApprovals.clear();
        this.#optionsById.clear();
    }
    /** Complete the ACP initialize handshake without creating a paid session. */
    async verifyCompatibility(workspacePath) {
        await this.#connect(workspacePath, undefined);
        const initialize = this.#initialize;
        const protocolVersion = initialize?.protocolVersion;
        const agentName = initialize?.agentInfo?.name;
        const agentVersion = initialize?.agentInfo?.version;
        return {
            ...(protocolVersion !== null && protocolVersion !== undefined ? { protocolVersion } : {}),
            ...(agentName ? { agentName } : {}),
            ...(agentVersion ? { agentVersion } : {}),
        };
    }
    dispose() {
        this.#clearTurn();
        const stopped = this.#rpc ? Promise.resolve(this.#rpc.dispose()) : this.#processStop;
        this.#rpc = undefined;
        this.#initialize = undefined;
        this.#sessionId = undefined;
        this.#model = undefined;
        this.#loadSession = false;
        this.#pendingApprovals.clear();
        this.#processStop = stopped;
        return stopped;
    }
    /** Restart with launch-only settings, keeping the session through `session/load`. */
    async #applySettings(settings) {
        if (!this.#argsFor)
            return;
        const next = {
            model: settings.model ?? this.#settings.model,
            effort: settings.effort ?? this.#settings.effort,
        };
        if (next.model === this.#settings.model && next.effort === this.#settings.effort)
            return;
        if (!this.#loadSession) {
            throw new Error(`${this.#spec.name} cannot reload this chat, so it keeps the model and effort it started with. Start a new chat to change them.`);
        }
        const sessionId = this.#sessionId;
        const previous = this.#rpc;
        this.#relaunching = true;
        this.#rpc = undefined;
        this.#sessionId = undefined;
        try {
            await previous?.dispose();
            this.#settings = next;
            const rpc = await this.#connect(this.#workspacePath, next.model);
            if (!this.#loadSession)
                throw new Error(`${this.#spec.name} no longer supports session resume`);
            await rpc.request('session/load', {
                sessionId,
                cwd: this.#workspacePath,
                mcpServers: this.#mcpServers,
            });
            this.#sessionId = sessionId;
            this.#model = next.model;
        }
        catch (error) {
            // The old process is gone. Report the session lost so it is resumed afresh.
            await this.dispose();
            this.emit('disconnected');
            throw error;
        }
        finally {
            this.#relaunching = false;
        }
    }
    async #connect(workspacePath, model) {
        this.#workspacePath = workspacePath;
        const args = this.#argsFor
            ? this.#argsFor(this.#settings)
            : model && this.#spec.modelArg
                ? [...this.#spec.args, this.#spec.modelArg, model]
                : this.#spec.args;
        // A second connect (retry after a failed resume, say) must not orphan the
        // agent process the first one spawned.
        await this.#rpc?.dispose();
        const rpc = new StdioJsonRpc(this.#spawn(this.#spec.command, args, {
            cwd: workspacePath,
            ...(this.#env ? { env: this.#env } : {}),
        }), this.#spec.name, {
            onFailure: (error) => {
                if (this.#rpc !== rpc)
                    return;
                this.#rpc = undefined;
                this.#sessionId = undefined;
                const turn = this.#activeTurn;
                this.#clearTurn();
                if (turn) {
                    this.emit('event', {
                        type: 'thread.error',
                        threadId: turn.threadId,
                        message: error.message,
                    });
                    this.emit('event', { type: 'turn.completed', turnId: turn.turnId, status: 'failed' });
                }
                this.#processStop = Promise.resolve(rpc.dispose());
                this.emit('disconnected');
            },
        });
        this.#rpc = rpc;
        rpc.onStderr((text) => this.emit('log', text.trimEnd()));
        rpc.onNotification((method, params) => this.#onNotification(method, params));
        rpc.onServerRequest((method, params, respond) => this.#onRequest(method, params, respond));
        const init = await rpc.request('initialize', {
            protocolVersion: PROTOCOL_VERSION,
            clientCapabilities: { fs: { readTextFile: false, writeTextFile: false } },
            clientInfo: { name: 'tastecode', version: '0.0.0' },
        }, { result: InitializeResultSchema });
        this.#initialize = init;
        if (init.protocolVersion !== undefined && init.protocolVersion !== PROTOCOL_VERSION) {
            this.emit('log', `${this.#spec.name} speaks ACP ${init.protocolVersion}, this adapter was written for ${PROTOCOL_VERSION}`);
        }
        const version = init.agentInfo?.version;
        if (version &&
            this.#spec.supportedVersion &&
            !version.startsWith(this.#spec.supportedVersion)) {
            this.emit('log', `${this.#spec.name} ${version} is outside verified ${this.#spec.supportedVersion}.x`);
        }
        this.#images = init.agentCapabilities?.promptCapabilities?.image ?? false;
        this.#loadSession = init.agentCapabilities?.loadSession ?? false;
        return rpc;
    }
    async #selectSessionModel(model) {
        if (!model || !this.#spec.modelConfigId || !this.#rpc || !this.#sessionId)
            return;
        await this.#rpc.request('session/set_config_option', {
            sessionId: this.#sessionId,
            configId: this.#spec.modelConfigId,
            value: model,
        });
    }
    #setApproval(approval) {
        if (approval === 'auto-review') {
            throw new Error('ACP agents do not support automatic approval review');
        }
        this.#approval = approval ?? 'ask';
    }
    #onNotification(method, params) {
        if (method !== 'session/update')
            return;
        const notification = SessionNotificationSchema.safeParse(params);
        if (!notification.success)
            return;
        const update = notification.data.update;
        if (!update)
            return;
        if (update.sessionUpdate === 'usage_update') {
            const usage = acpSessionUsage(update, this.#model);
            if (usage)
                this.emit('event', { type: 'usage.updated', usage });
            return;
        }
        if (!this.#streamer)
            return;
        if (update.sessionUpdate === 'available_commands' ||
            update.sessionUpdate === 'current_mode_update') {
            return;
        }
        for (const event of this.#streamer.translate(update)) {
            this.emit('event', event);
        }
    }
    #onRequest(method, params, respond) {
        if (method !== 'session/request_permission') {
            // We declared no filesystem capability, so fs/* should never arrive. If
            // one does, refusing is better than silently reading a file.
            this.emit('log', `unhandled request from ${this.#spec.name}: ${method}`);
            respond(null);
            return;
        }
        const parsed = RequestPermissionParamsSchema.safeParse(params);
        if (!parsed.success) {
            this.emit('log', `invalid permission request from ${this.#spec.name}`);
            respond(null);
            return;
        }
        const request = parsed.data;
        if (!this.#streamer) {
            respond({ outcome: { outcome: 'cancelled' } });
            return;
        }
        const call = request.toolCall ?? {};
        // Never replace a pending responder: two requests sharing a tool call id,
        // or arriving without one in the same millisecond, left the first one
        // unanswered and the agent blocked on it.
        const id = call.toolCallId && !this.#pendingApprovals.has(call.toolCallId)
            ? call.toolCallId
            : `approval-${crypto.randomUUID()}`;
        const options = request.options ?? [];
        // This is the only place a permissioned call is described. Its completion
        // update carries neither kind nor title, so record them now or the finished
        // command shows up as an anonymous "tool". A proposed edit is kept too, and
        // reaches the turn diff only if the call completes.
        if (call.toolCallId) {
            this.#streamer?.note(call.toolCallId, {
                ...(call.kind ? { kind: call.kind } : {}),
                ...(call.title ? { title: call.title } : {}),
                ...(call.content ? { content: call.content } : {}),
            });
        }
        const auto = this.#autoDecision(call.kind);
        if (auto) {
            const optionId = options.find((option) => option.kind === auto)?.optionId;
            if (optionId) {
                respond({ outcome: { outcome: 'selected', optionId } });
                return;
            }
            // Fall through and ask, rather than guess at an option the agent did not
            // offer.
        }
        this.#pendingApprovals.set(id, respond);
        this.#optionsById.set(id, options);
        // Deletes and moves are file work, not commands — typing them as
        // 'command' rendered an approval card with an empty command field.
        const kind = call.kind === 'execute'
            ? 'command'
            : call.kind === 'edit' || call.kind === 'delete' || call.kind === 'move'
                ? 'file_change'
                : 'command';
        this.emit('event', {
            type: 'approval.requested',
            request: {
                id,
                kind,
                // The title is what the agent says it wants to do, shown verbatim.
                ...(call.kind === 'execute' ? { command: call.title } : { path: call.title }),
                createdAt: Date.now(),
            },
        });
    }
    /**
     * ACP always asks. Our approval modes decide which of those questions the
     * user actually sees — `full` answers all of them, `auto` answers only the
     * ones that do not run a command, and `ask` answers none.
     */
    #autoDecision(kind) {
        if (this.#approval === 'full')
            return 'allow_once';
        // `auto` has no sandbox under ACP, so it may only wave through actions
        // that cannot mutate anything. Deletes, moves, edits and fetches stay
        // questions for the user.
        if (this.#approval === 'auto' && (kind === 'read' || kind === 'search' || kind === 'think')) {
            return 'allow_once';
        }
        return undefined;
    }
    #finishTurn(threadId, turnId, result, streamer) {
        const stopReason = result.stopReason;
        // Finish the streamer this turn owns, never whichever one is current —
        // a late completion must not close the next turn's open items.
        const owned = streamer ?? this.#streamer;
        if (owned !== this.#streamer)
            return;
        this.#clearTurn();
        const usage = acpTurnUsage(result.usage, this.#model);
        if (usage)
            this.emit('event', { type: 'usage.updated', usage });
        // A refused or truncated turn must not look identical to a successful
        // one — the stop reason goes to the user, not into a log nobody reads.
        if (stopReason === 'refusal') {
            this.emit('event', {
                type: 'thread.error',
                threadId,
                message: 'The agent refused to continue this turn.',
            });
        }
        else if (stopReason === 'max_tokens' || stopReason === 'max_turn_requests') {
            this.emit('event', {
                type: 'thread.error',
                threadId,
                message: `The turn stopped early (${stopReason.replace(/_/g, ' ')}).`,
            });
        }
        else if (stopReason && stopReason !== 'end_turn' && stopReason !== 'cancelled') {
            this.emit('log', `turn ended: ${stopReason}`);
        }
        this.emit('event', {
            type: 'turn.completed',
            turnId,
            status: stopReason === 'cancelled'
                ? 'interrupted'
                : stopReason === 'refusal'
                    ? 'failed'
                    : 'completed',
        });
    }
}
export function parseAcpThreadId(threadId, agentId) {
    const prefix = `acp-${agentId}-`;
    if (!threadId.startsWith(prefix) || threadId.length === prefix.length) {
        throw new Error(`thread does not belong to ACP agent "${agentId}"`);
    }
    return threadId.slice(prefix.length);
}
//# sourceMappingURL=adapter.js.map