import type { ResultOf } from '@harness/contracts';
type Probe = {
    head(): Promise<string | undefined>;
    fetchLatest(): Promise<{
        sha: string;
        message: string;
        date: string;
    } | {
        error: string;
    }>;
};
export declare function checkForUpdates(probe?: Probe): Promise<ResultOf<'system.updateCheck'>>;
export {};
//# sourceMappingURL=update-check.d.ts.map