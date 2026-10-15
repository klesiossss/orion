import { type ClaudeSpawn, type ClaudeUsageQueryFactory } from './sdk-runtime.js';
export type ProviderLimit = {
    label: string;
    usedPercent: number;
    resetsAt?: number | undefined;
    valueLabel?: string | undefined;
};
export type ClaudeLimitSource = {
    status: 'ready';
    limits: ProviderLimit[];
} | {
    status: 'unavailable';
};
export type ClaudeLimitSourceOptions = {
    createQuery?: ClaudeUsageQueryFactory | undefined;
    environment?: NodeJS.ProcessEnv | undefined;
    spawn?: ClaudeSpawn | undefined;
    timeoutMs?: number | undefined;
};
export declare function mapClaudeUsage(value: unknown): ClaudeLimitSource;
/** Read Claude's own structured /usage data without accessing its credentials. */
export declare function claudeLimitSource(options?: ClaudeLimitSourceOptions): Promise<ClaudeLimitSource>;
//# sourceMappingURL=limits.d.ts.map