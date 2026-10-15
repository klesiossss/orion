import type { DomainEvent } from '@harness/contracts';
type HistoryEntry = {
    seq: number;
    event: DomainEvent;
};
/**
 * Removes superseded streaming and presentation events from a fresh replay.
 * The durable log stays untouched, and incremental reads still return every
 * event; only the state snapshot sent when opening a thread is compacted.
 */
export declare function compactHistoryReplay(entries: readonly HistoryEntry[]): HistoryEntry[];
export {};
//# sourceMappingURL=history-replay.d.ts.map