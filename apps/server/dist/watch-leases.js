/** Visible settings views renew these; a one-shot read cannot retain a process forever. */
export class WatchLeases {
    ttlMs;
    #expires = new Map();
    constructor(ttlMs = 60_000) {
        this.ttlMs = ttlMs;
    }
    add(key) {
        this.#expires.set(key, Date.now() + this.ttlMs);
    }
    delete(key) {
        this.#expires.delete(key);
    }
    clear() {
        this.#expires.clear();
    }
    get size() {
        this.prune();
        return this.#expires.size;
    }
    get nextExpiry() {
        this.prune();
        let next;
        for (const expiry of this.#expires.values())
            next = Math.min(next ?? expiry, expiry);
        return next;
    }
    prune() {
        const now = Date.now();
        for (const [key, expiry] of this.#expires)
            if (expiry <= now)
                this.#expires.delete(key);
    }
    *[Symbol.iterator]() {
        this.prune();
        yield* this.#expires.keys();
    }
}
//# sourceMappingURL=watch-leases.js.map