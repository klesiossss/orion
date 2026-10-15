import type { DomainEvent } from '@harness/contracts';
export type ItemDeltaEvent = Extract<DomainEvent, {
    type: 'item.delta';
}>;
export type RecordedDelta = {
    threadId: string;
    event: ItemDeltaEvent;
};
type RecordedDeltaBufferOptions = {
    delayMs?: number;
    maximumTextLength?: number;
    maximumEventCount?: number;
    /** Must commit atomically: a failed batch stays buffered for retry. */
    commitBatch?: (records: RecordedDelta[]) => void;
};
/**
 * Coalesce adjacent provider text deltas before they reach SQLite and the
 * WebSocket. The renderer already paints at frame cadence, so persisting and
 * sending every provider fragment only adds work and makes histories larger.
 */
export declare class RecordedDeltaBuffer {
    #private;
    private readonly commit;
    constructor(commit: (threadId: string, event: ItemDeltaEvent) => void, options?: RecordedDeltaBufferOptions);
    push(threadId: string, event: ItemDeltaEvent): void;
    flush(threadId: string): void;
    flushAll(): void;
    discard(threadId: string): void;
    discardAll(): void;
}
export {};
//# sourceMappingURL=recorded-delta-buffer.d.ts.map