import { z } from 'zod';
import { killTree } from './kill.js';
import { LineBuffer } from './frames.js';
export const JsonRpcValueSchema = z.json();
// JSON.parse already establishes JSON compatibility. This schema validates
// only the JSON-RPC envelope instead of walking every payload a second time.
const ParsedJsonValueSchema = z.custom();
const JsonRpcFrameSchema = z.object({
    id: z.union([z.number(), z.string()]).optional(),
    method: z.string().optional(),
    params: ParsedJsonValueSchema.optional(),
    result: ParsedJsonValueSchema.optional(),
    error: z
        .object({
        code: z.number().optional(),
        message: z.string().optional(),
        data: ParsedJsonValueSchema.optional(),
    })
        .optional(),
});
export function parseJsonValue(text) {
    // SAFETY: JSON.parse can return only JSON primitives, arrays, and objects.
    return JSON.parse(text);
}
export class JsonRpcError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'JsonRpcError';
    }
}
export class StdioJsonRpc {
    #child;
    /**
     * Our outbound calls only.
     *
     * The peer numbers its own requests independently and starts at 0, so ids
     * collide across directions. They are never confused because an incoming
     * frame carrying `method` is a request to us, and one without is a reply to
     * us — the id alone is not enough to tell them apart.
     */
    #pending = new Map();
    #nextId = 1;
    #buffer;
    #disposed = false;
    #termination;
    #exited = false;
    /** Why the transport is finished, so late callers get an answer not a hang. */
    #failure;
    #label;
    #onProtocolError;
    #onFailure;
    #onNotification = () => { };
    #onServerRequest = (_m, _p, respond) => respond(null);
    #onStderr = () => { };
    /** `label` names the process in errors, so a dead child says which one died. */
    constructor(child, label = 'agent', options = {}) {
        this.#child = child;
        this.#label = label;
        this.#buffer = new LineBuffer(options.maxFrameBytes);
        this.#onProtocolError = options.onProtocolError;
        this.#onFailure = options.onFailure;
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => this.#ingest(chunk));
        child.stdout.on('end', () => this.#flush());
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => this.#onStderr(chunk));
        child.on('close', (code) => {
            this.#exited = true;
            this.#fail(new Error(`${this.#label} exited (code ${code})`));
        });
        child.on('error', (error) => {
            this.#exited = true;
            this.#fail(error);
        });
        // A write after the peer died raises EPIPE as a stream 'error' event;
        // without a listener that crashes the process instead of failing a call.
        child.stdin.on('error', (error) => this.#failInput(error));
    }
    onNotification(handler) {
        this.#onNotification = handler;
    }
    onServerRequest(handler) {
        this.#onServerRequest = handler;
    }
    onStderr(handler) {
        this.#onStderr = handler;
    }
    request(method, params = {}, options = {}) {
        // Also when the process is gone: #write silently drops the frame once the
        // child has exited, so a call made after a crash used to sit pending
        // forever — the session stayed at "Working" with no error and no way out.
        if (this.#failure)
            return Promise.reject(this.#failure);
        if (this.#disposed)
            return Promise.reject(new Error('transport disposed'));
        // Existing replies may still drain from stdout after exit, but no new
        // request can reach that process while we wait for its pipes to close.
        if (this.#child.exitCode != null || this.#child.signalCode != null) {
            return Promise.reject(new Error(`${this.#label} has exited`));
        }
        const id = this.#nextId++;
        const promise = new Promise((resolve, reject) => {
            const call = { resolve, reject };
            if (options.timeoutMs !== undefined) {
                call.timer = setTimeout(() => {
                    if (this.#pending.delete(id)) {
                        reject(new Error(`${this.#label} request timed out: ${method}`));
                    }
                }, options.timeoutMs);
            }
            this.#pending.set(id, call);
        });
        this.#write({ jsonrpc: '2.0', id, method, params });
        return 'result' in options ? promise.then((value) => options.result.parse(value)) : promise;
    }
    notify(method, params = {}) {
        if (this.#disposed)
            return;
        this.#write({ jsonrpc: '2.0', method, params });
    }
    dispose() {
        if (this.#disposed)
            return this.#termination ?? Promise.resolve();
        this.#disposed = true;
        this.#failAll(new Error('transport disposed'));
        this.#buffer.clear();
        this.#termination = killTree(this.#child);
        return this.#termination;
    }
    #write(message) {
        if (this.#exited ||
            this.#disposed ||
            this.#failure ||
            this.#child.exitCode != null ||
            this.#child.signalCode != null) {
            return;
        }
        if (!this.#child.stdin.writable) {
            this.#failInput(new Error(`${this.#label} input stream is not writable`));
            return;
        }
        const frame = JSON.stringify(message) + '\n';
        try {
            this.#child.stdin.write(frame, (error) => {
                if (error)
                    this.#failInput(error);
            });
        }
        catch (error) {
            this.#failInput(error instanceof Error ? error : new Error(String(error)));
        }
    }
    #failInput(error) {
        if (!this.#fail(error))
            return;
        this.#logFailure(`stdin: ${String(error)}`);
        void this.dispose().catch(() => undefined);
    }
    #fail(error) {
        if (this.#failure || this.#disposed)
            return false;
        this.#failure = error;
        this.#buffer.clear();
        this.#failAll(error);
        try {
            this.#onFailure?.(error);
        }
        catch (handlerError) {
            this.#logFailure(`failure handler failed: ${String(handlerError)}`);
        }
        return true;
    }
    #logFailure(message) {
        try {
            this.#onStderr(message);
        }
        catch {
            // A failed observer or logger must never interrupt transport cleanup.
        }
    }
    #ingest(chunk) {
        if (this.#failure || this.#disposed)
            return;
        try {
            this.#buffer.write(chunk, (line) => {
                if (line.trim())
                    this.#handleLine(line.trim());
            });
        }
        catch (error) {
            const failure = error instanceof Error ? error : new Error('Provider stream failed');
            if (!this.#fail(failure))
                return;
            this.#logFailure(failure.message);
            void this.dispose().catch(() => undefined);
            try {
                this.#onProtocolError?.(failure);
            }
            catch (handlerError) {
                this.#logFailure(`protocol error handler failed: ${String(handlerError)}`);
            }
        }
    }
    /**
     * A peer that exits right after its last write may leave that frame without
     * a newline. Settle it before the close fails every pending call.
     */
    #flush() {
        if (this.#failure || this.#disposed)
            return;
        this.#buffer.end((line) => {
            if (line.trim())
                this.#handleLine(line.trim());
        });
    }
    #handleLine(line) {
        if (this.#failure || this.#disposed)
            return;
        let parsed;
        try {
            parsed = parseJsonValue(line);
        }
        catch {
            // A non-JSON line means the CLI printed something to stdout that is not
            // protocol traffic. Surfacing it beats silently discarding it, because
            // that is usually a real error message.
            this.#onStderr(`non-JSON on stdout: ${line}`);
            return;
        }
        const frame = JsonRpcFrameSchema.safeParse(parsed);
        if (!frame.success) {
            this.#onStderr(`invalid JSON-RPC on stdout: ${line}`);
            return;
        }
        const message = frame.data;
        const { id, method } = message;
        if (id !== undefined && method === undefined) {
            this.#settle(id, message);
            return;
        }
        // Handlers cast frames to the shapes the protocol documents, so a frame
        // that is valid JSON but the wrong shape throws a TypeError — and this
        // runs inside a stdout listener, where an escaping throw would take down
        // the whole server, every session, over one agent's bad frame.
        // The peer waits on every request id, so each one gets exactly one reply.
        let responded = false;
        try {
            if (id !== undefined && method !== undefined) {
                // A request from the agent — approvals and file access arrive this way.
                this.#onServerRequest(method, message.params, (result) => {
                    if (responded)
                        return;
                    responded = true;
                    this.#write({ jsonrpc: '2.0', id, result });
                }, id);
                return;
            }
            if (method !== undefined) {
                this.#onNotification(method, message.params);
            }
        }
        catch (error) {
            this.#onStderr(`handler failed for ${method ?? 'response'}: ${String(error)}`);
            // Without a reply the peer blocks on this id and the turn never ends.
            if (id !== undefined && method !== undefined && !responded) {
                responded = true;
                const text = error instanceof Error ? error.message : String(error);
                this.#write({ jsonrpc: '2.0', id, error: { code: -32603, message: text } });
            }
        }
    }
    #settle(id, message) {
        const call = this.#pending.get(id);
        if (!call)
            return;
        this.#pending.delete(id);
        clearTimeout(call.timer);
        const { error } = message;
        if (error) {
            call.reject(new JsonRpcError(error.code ?? 0, error.message ?? 'unknown error', error.data));
            return;
        }
        call.resolve(message.result);
    }
    #failAll(error) {
        for (const [, call] of this.#pending) {
            clearTimeout(call.timer);
            call.reject(error);
        }
        this.#pending.clear();
    }
}
//# sourceMappingURL=jsonrpc.js.map