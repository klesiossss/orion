import type { DomainEvent } from '@harness/contracts';
type Entry = {
    seq: number;
    event: DomainEvent;
};
/** Provider turns may predate local ones even though they were discovered later. */
export declare function orderProviderHistory(entries: Entry[]): Entry[];
export {};
//# sourceMappingURL=provider-history-order.d.ts.map