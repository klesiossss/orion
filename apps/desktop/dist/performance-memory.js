import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
/** Idle GPUs retire render resources after the last JavaScript/paint frame.
 * Require a stable window without GC, navigation or cache purges; preserve
 * the transient allocation separately from the idle-memory result. */
export async function sampleSettledMemory(sample) {
    const controller = new AbortController();
    const started = performance.now();
    const samples = [];
    let stableWindow = [];
    let pause;
    const timeout = setTimeout(() => controller.abort(new Error('Memory did not settle')), 10_000);
    const deadline = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(controller.signal.reason), {
            once: true,
        });
    });
    try {
        while (!controller.signal.aborted) {
            const sampledAt = performance.now();
            const memory = await Promise.race([sample(controller.signal), deadline]);
            samples.push({ ...memory, elapsedMs: sampledAt - started });
            const window = samples.slice(-4);
            if (window.length === 4) {
                const identities = window.map((entry) => entry.processes
                    .map((process) => `${process.pid}:${process.type}`)
                    .sort()
                    .join(','));
                const values = window.map((entry) => entry.bytes);
                const minimum = Math.min(...values);
                const maximum = Math.max(...values);
                if (Number.isFinite(minimum) &&
                    minimum > 0 &&
                    identities.every((identity) => identity !== '' && identity === identities[0]) &&
                    maximum - minimum <= minimum * 0.02) {
                    stableWindow = window;
                    break;
                }
            }
            await Promise.race([
                new Promise((resolve) => {
                    // Space capture starts by one second; OS read time is part of that interval.
                    pause = setTimeout(resolve, Math.max(0, 1_000 - (performance.now() - sampledAt)));
                }),
                deadline,
            ]);
        }
    }
    catch {
        // Missing measurements and the hard deadline are a failed gate, never zero usage.
    }
    finally {
        clearTimeout(pause);
        clearTimeout(timeout);
        controller.abort();
    }
    const candidates = stableWindow.length === 4 ? stableWindow : samples;
    const peak = candidates.reduce((largest, entry) => (entry.bytes > largest.bytes ? entry : largest), {
        metric: 'working-set',
        bytes: 0,
        rssBytes: 0,
        processes: [],
    });
    return {
        ...peak,
        bytes: peak.bytes > 0 ? peak.bytes : NaN,
        stable: stableWindow.length === 4,
        samples,
        stableWindow,
        peakBytes: samples.length > 0 ? Math.max(...samples.map((entry) => entry.bytes)) : NaN,
        peakRssBytes: samples.length > 0 ? Math.max(...samples.map((entry) => entry.rssBytes)) : NaN,
    };
}
export function collectSettledBenchmarkMemory(metrics) {
    return sampleSettledMemory((signal) => collectBenchmarkMemory(metrics(), signal));
}
function workingSets(metrics) {
    return metrics.map((metric) => ({
        pid: metric.pid,
        type: metric.type,
        bytes: metric.memory.workingSetSize * 1024,
        rssBytes: metric.memory.workingSetSize * 1024,
        source: 'working-set',
    }));
}
function summarize(processes) {
    const footprintCount = processes.filter((entry) => entry.source === 'macos-physical-footprint').length;
    return {
        metric: footprintCount === 0
            ? 'working-set'
            : footprintCount === processes.length
                ? 'macos-physical-footprint'
                : 'mixed-conservative',
        // Missing/zero process measurements fail the gate instead of looking cheap.
        bytes: processes.length === 0 ||
            processes.some((entry) => !Number.isFinite(entry.bytes) || entry.bytes <= 0)
            ? NaN
            : processes.reduce((total, entry) => total + entry.bytes, 0),
        rssBytes: processes.reduce((total, entry) => total + entry.rssBytes, 0),
        processes,
    };
}
export function parseMacFootprint(value, metrics) {
    const processes = workingSets(metrics);
    if (typeof value !== 'object' ||
        value === null ||
        !('processes' in value) ||
        !Array.isArray(value.processes) ||
        !('bytes per unit' in value) ||
        value['bytes per unit'] !== 1) {
        return summarize(processes);
    }
    for (const process of processes) {
        const entries = value.processes.filter((entry) => typeof entry === 'object' && entry !== null && 'pid' in entry && entry.pid === process.pid);
        if (entries.length !== 1)
            continue;
        const footprint = entries[0].footprint;
        if (typeof footprint !== 'number' || !Number.isSafeInteger(footprint) || footprint <= 0)
            continue;
        process.bytes = footprint;
        process.source = 'macos-physical-footprint';
    }
    return summarize(processes);
}
/** macOS working sets repeat shared Electron pages in each process. Count OS
 * physical footprints for the complete process list, retaining RSS as evidence.
 * Windows/Linux retain the existing working-set metric. Missing macOS entries
 * conservatively retain their RSS instead of disappearing from the total. */
export async function collectBenchmarkMemory(metrics, signal) {
    const fallback = summarize(workingSets(metrics));
    if (process.platform !== 'darwin' || metrics.length === 0)
        return fallback;
    const directory = await mkdtemp(path.join(os.tmpdir(), 'tastecode-memory-'));
    try {
        const destination = path.join(directory, 'footprint.json');
        await promisify(execFile)('/usr/bin/footprint', [
            '--json',
            destination,
            '--format',
            'bytes',
            '--noCategories',
            ...metrics.map((metric) => String(metric.pid)),
        ], { timeout: 2_000, maxBuffer: 1_000_000, ...(signal ? { signal } : {}) });
        return parseMacFootprint(JSON.parse(await readFile(destination, 'utf8')), metrics);
    }
    catch {
        return fallback;
    }
    finally {
        await rm(directory, { recursive: true, force: true }).catch(() => undefined);
    }
}
//# sourceMappingURL=performance-memory.js.map