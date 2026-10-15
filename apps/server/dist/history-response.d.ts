import type { ApprovalMode, DomainEvent, ResultOf } from '@harness/contracts';
type HistoryEntry = {
    seq: number;
    event: DomainEvent;
};
type HistoryResult = ResultOf<'thread.history'>;
/** Retain the response wrapper while a parsed immutable replay remains current. */
export declare function createHistoryResponseProjector(): (events: HistoryEntry[], isRunning: boolean, approval: ApprovalMode) => HistoryResult;
export {};
//# sourceMappingURL=history-response.d.ts.map