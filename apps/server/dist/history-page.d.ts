import type { DomainEvent } from '@harness/contracts';
type HistoryEntry = {
    seq: number;
    event: DomainEvent;
};
/** Newest whole turns sent when a client asks for a page without a size. */
export declare const DEFAULT_HISTORY_PAGE_TURNS = 10;
export type HistoryPageCursor = {
    seq: number;
    turnHash: string;
};
export type HistoryPage = {
    events: HistoryEntry[];
    page: {
        olderCursor: string | null;
        snapshotSeq: number;
    };
    reset?: true;
};
/** A cursor this server never issued for the requested thread. */
export declare class InvalidHistoryCursorError extends Error {
    constructor();
}
/**
 * Cursors name the turn that starts the oldest loaded block, hashed so a long
 * provider id cannot exceed the protocol's cursor length. The snapshot seq
 * lets a later read notice a rewrite that happened after the cursor was issued.
 */
export declare function encodeHistoryCursor(threadId: string, cursor: HistoryPageCursor): string;
export declare function decodeHistoryCursor(threadId: string, value: string): HistoryPageCursor;
/**
 * Cut one bounded page from a compact replay. Pages hold whole blocks: a block
 * ends only where every turn inside it has emitted its last event, so a user
 * prompt recorded before its provider's turn start, a late tool completion or
 * an interleaved provider turn never lands on the other side of a cursor.
 * The newest page also carries the thread-level state that older blocks still
 * own: the latest usage and requests nobody has answered yet.
 */
export declare function readHistoryPage(threadId: string, entries: readonly HistoryEntry[], request: {
    before?: HistoryPageCursor | undefined;
    turnLimit?: number | undefined;
    isStale?: ((cursor: HistoryPageCursor, snapshotSeq: number) => boolean) | undefined;
}): HistoryPage;
export {};
//# sourceMappingURL=history-page.d.ts.map