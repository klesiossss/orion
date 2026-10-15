import type { ProcessMetric } from 'electron';
export declare const MAX_STARTUP_SETTLE_MS = 60000;
type ProcessMetricSummary = {
    processes: number;
    cpuPercent: number;
    idleWakeupsPerSecond: number;
    workingSetKiB: number;
    peakWorkingSetKiB: number;
    privateKiB: number;
};
export type AppMetricSummary = ProcessMetricSummary & {
    byType: Record<string, ProcessMetricSummary>;
};
export declare function startupSettleDelay(value: string | undefined): number | undefined;
export declare function summarizeAppMetrics(metrics: ProcessMetric[]): AppMetricSummary;
export {};
//# sourceMappingURL=startup-metrics.d.ts.map