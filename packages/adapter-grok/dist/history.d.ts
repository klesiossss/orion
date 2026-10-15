import type { ProviderHistorySource } from '@harness/contracts';
export type GrokHistoryOptions = {
    root?: string;
};
/** Read Grok's local session store without launching the CLI or modifying its files. */
export declare function createGrokHistorySource(options?: GrokHistoryOptions): ProviderHistorySource;
//# sourceMappingURL=history.d.ts.map