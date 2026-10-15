import type { DomainEvent, ProviderHistorySession } from '@harness/contracts';
type RecordValue = Record<string, unknown>;
/**
 * Native lifecycle items take precedence over their wire/event echoes. Each
 * record keeps its position among the rollout's records, which items without
 * a native id use as their stable id.
 */
export declare function parseCodexHistory(records: ReadonlyArray<{
    index: number;
    record: RecordValue;
}>, session: ProviderHistorySession): DomainEvent[];
export {};
//# sourceMappingURL=history-transcript.d.ts.map