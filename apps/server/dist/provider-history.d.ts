import type { DomainEvent, ProviderHistorySource, ProviderId } from '@harness/contracts';
import { Store } from './store.js';
type Source = {
    provider: ProviderId;
    history: ProviderHistorySource;
};
/** Metadata is refreshed in the background; transcripts are read only when opened. */
export declare class ProviderHistory {
    #private;
    private store;
    private sources;
    private hooks;
    constructor(store: Store, sources: Source[], hooks: {
        isBusy(threadId: string): boolean;
        canImport?(): boolean;
        changed(threadIds: string[]): void;
        log(message: string): void;
    });
    refresh(): Promise<void>;
    load(threadId: string): Promise<boolean>;
    close(): Promise<void>;
}
export declare function importedEvents(events: DomainEvent[], threadId: string, local: DomainEvent[]): Array<{
    key: string;
    event: DomainEvent;
}>;
export {};
//# sourceMappingURL=provider-history.d.ts.map