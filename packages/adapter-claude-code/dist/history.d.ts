import type { ProviderHistorySource } from '@harness/contracts';
export type ClaudeHistoryOptions = {
    /** Claude Code's config directory, containing projects/. Never reads credentials. */
    configDir?: string;
};
export declare function createClaudeHistorySource(options?: ClaudeHistoryOptions): ProviderHistorySource;
//# sourceMappingURL=history.d.ts.map