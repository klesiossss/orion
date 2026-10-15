import type { ProviderHistorySource } from '@harness/contracts';
export type CodexHistoryOptions = {
    codexHome?: string;
};
/** Reads Codex's local store without starting app-server or changing its files. */
export declare function createCodexHistorySource(options?: CodexHistoryOptions): ProviderHistorySource;
//# sourceMappingURL=history.d.ts.map