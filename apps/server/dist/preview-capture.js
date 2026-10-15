import { randomUUID } from 'node:crypto';
function captureAborted() {
    return Object.assign(new Error('Preview capture cancelled'), { name: 'AbortError' });
}
export class PreviewCaptureCoordinator {
    send;
    timeoutMs;
    cancel;
    #clients = new Set();
    #pending = new Map();
    #queue = [];
    constructor(send, timeoutMs = 35_000, cancel = () => undefined) {
        this.send = send;
        this.timeoutMs = timeoutMs;
        this.cancel = cancel;
    }
    get available() {
        return this.#clients.size > 0;
    }
    setCapability(socket, available) {
        if (available) {
            this.#clients.add(socket);
            this.#dispatchNext();
        }
        else
            this.remove(socket);
    }
    remove(socket) {
        this.#clients.delete(socket);
        for (const [requestId, pending] of this.#pending) {
            if (pending.socket !== socket)
                continue;
            this.#pending.delete(requestId);
            this.#cancel(socket, requestId);
            delete pending.socket;
            // Keep the original deadline, but give the replacement native capture a
            // fresh identity so late cancellation/results cannot affect its retry.
            pending.request = { ...pending.request, requestId: randomUUID() };
            this.#pending.set(pending.request.requestId, pending);
        }
        this.#dispatchNext();
    }
    capture(url, viewports, signal) {
        if (signal?.aborted)
            return Promise.reject(captureAborted());
        if (!this.available)
            return Promise.reject(new Error('Preview capture is unavailable'));
        if (this.#queue.length >= 16)
            return Promise.reject(new Error('Preview capture queue is full'));
        const request = { requestId: randomUUID(), url, viewports };
        return new Promise((resolve, reject) => {
            const onAbort = () => this.#abort(queued.resolve);
            const queued = {
                request,
                resolve: (screenshots) => {
                    signal?.removeEventListener('abort', onAbort);
                    resolve(screenshots);
                },
                reject: (error) => {
                    signal?.removeEventListener('abort', onAbort);
                    reject(error);
                },
            };
            signal?.addEventListener('abort', onAbort, { once: true });
            this.#queue.push(queued);
            this.#dispatchNext();
        });
    }
    complete(socket, result) {
        const pending = this.#pending.get(result.requestId);
        if (!pending || pending.socket !== socket)
            throw new Error('Unknown preview capture request');
        clearTimeout(pending.timer);
        this.#pending.delete(result.requestId);
        if (result.status === 'failed') {
            pending.reject(new Error(result.error));
            this.#dispatchNext();
            return;
        }
        if (result.screenshots.length !== pending.request.viewports.length ||
            result.screenshots.some((screenshot, index) => {
                const viewport = pending.request.viewports[index];
                return (!viewport || screenshot.width !== viewport.width || screenshot.height !== viewport.height);
            })) {
            pending.reject(new Error('Preview capture returned unexpected viewports'));
            this.#dispatchNext();
            return;
        }
        pending.resolve(result.screenshots);
        this.#dispatchNext();
    }
    #dispatchNext() {
        const interrupted = this.#pending.values().next().value;
        if (interrupted?.socket || (!interrupted && this.#queue.length === 0))
            return;
        let socket;
        for (const client of this.#clients) {
            socket = client;
            break;
        }
        if (!socket) {
            if (interrupted)
                return;
            for (const queued of this.#queue.splice(0)) {
                queued.reject(new Error('Preview capture client disconnected'));
            }
            return;
        }
        if (interrupted) {
            interrupted.socket = socket;
            try {
                this.send(socket, interrupted.request);
            }
            catch {
                this.remove(socket);
            }
            return;
        }
        const queued = this.#queue.shift();
        const timer = setTimeout(() => {
            this.#pending.delete(pending.request.requestId);
            if (pending.socket)
                this.#cancel(pending.socket, pending.request.requestId);
            queued.reject(new Error('Preview capture timed out'));
            this.#dispatchNext();
        }, this.timeoutMs);
        timer.unref();
        const pending = { socket, timer, ...queued };
        this.#pending.set(queued.request.requestId, pending);
        try {
            this.send(socket, queued.request);
        }
        catch {
            this.remove(socket);
        }
    }
    // A pending entry is a copy of its queued entry and a reconnect can renew
    // its request ID, so the settle callback is the only stable identity.
    #abort(resolve) {
        const index = this.#queue.findIndex((queued) => queued.resolve === resolve);
        if (index >= 0) {
            this.#queue.splice(index, 1)[0].reject(captureAborted());
            return;
        }
        for (const [requestId, pending] of this.#pending) {
            if (pending.resolve !== resolve)
                continue;
            clearTimeout(pending.timer);
            this.#pending.delete(requestId);
            if (pending.socket)
                this.#cancel(pending.socket, requestId);
            pending.reject(captureAborted());
            this.#dispatchNext();
            return;
        }
    }
    #cancel(socket, requestId) {
        try {
            this.cancel(socket, requestId);
        }
        catch {
            // A disconnected client cannot receive cancellation. Its own bounded
            // capture lifetime still releases the window and isolated session.
        }
    }
}
//# sourceMappingURL=preview-capture.js.map