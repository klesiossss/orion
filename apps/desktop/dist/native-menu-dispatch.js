const MAX_PENDING_ACTIONS = 16;
/**
 * Holds native menu actions until the page that handles them has installed its
 * listener. A new or reloading window accepts IPC before React has subscribed.
 */
export class NativeMenuDispatch {
    #ready = new WeakSet();
    #pending = new WeakMap();
    send(target, message) {
        if (target.isDestroyed())
            return;
        if (this.#ready.has(target)) {
            target.send('harness:menuAction', message);
            return;
        }
        const pending = this.#pending.get(target) ?? [];
        pending.push(message);
        this.#pending.set(target, pending.slice(-MAX_PENDING_ACTIONS));
    }
    markReady(target) {
        this.#ready.add(target);
        const pending = this.#pending.get(target);
        this.#pending.delete(target);
        if (target.isDestroyed())
            return;
        for (const message of pending ?? [])
            target.send('harness:menuAction', message);
    }
    /** A navigation replaces the page; actions sent from now on wait for its listener. */
    reset(target) {
        this.#ready.delete(target);
    }
}
//# sourceMappingURL=native-menu-dispatch.js.map