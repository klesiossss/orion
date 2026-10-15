/** Visible settings views renew these; a one-shot read cannot retain a process forever. */
export declare class WatchLeases implements Iterable<string> {
    #private;
    readonly ttlMs: number;
    constructor(ttlMs?: number);
    add(key: string): void;
    delete(key: string): void;
    clear(): void;
    get size(): number;
    get nextExpiry(): number | undefined;
    prune(): void;
    [Symbol.iterator](): Iterator<string>;
}
//# sourceMappingURL=watch-leases.d.ts.map