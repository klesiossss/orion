import type { ProcessMetric } from 'electron';
type MemoryProcess = Pick<ProcessMetric, 'pid' | 'type' | 'memory'>;
type ProcessMemory = {
    pid: number;
    type: string;
    bytes: number;
    rssBytes: number;
    source: 'macos-physical-footprint' | 'working-set';
};
export type BenchmarkMemory = {
    metric: 'macos-physical-footprint' | 'working-set' | 'mixed-conservative';
    bytes: number;
    rssBytes: number;
    processes: ProcessMemory[];
};
type MemorySample = BenchmarkMemory & {
    elapsedMs: number;
};
export type SettledBenchmarkMemory = BenchmarkMemory & {
    stable: boolean;
    samples: MemorySample[];
    stableWindow: MemorySample[];
    peakBytes: number;
    peakRssBytes: number;
};
/** Idle GPUs retire render resources after the last JavaScript/paint frame.
 * Require a stable window without GC, navigation or cache purges; preserve
 * the transient allocation separately from the idle-memory result. */
export declare function sampleSettledMemory(sample: (signal: AbortSignal) => Promise<BenchmarkMemory>): Promise<SettledBenchmarkMemory>;
export declare function collectSettledBenchmarkMemory(metrics: () => MemoryProcess[]): Promise<SettledBenchmarkMemory>;
export declare function parseMacFootprint(value: unknown, metrics: MemoryProcess[]): BenchmarkMemory;
/** macOS working sets repeat shared Electron pages in each process. Count OS
 * physical footprints for the complete process list, retaining RSS as evidence.
 * Windows/Linux retain the existing working-set metric. Missing macOS entries
 * conservatively retain their RSS instead of disappearing from the total. */
export declare function collectBenchmarkMemory(metrics: MemoryProcess[], signal?: AbortSignal): Promise<BenchmarkMemory>;
export {};
//# sourceMappingURL=performance-memory.d.ts.map