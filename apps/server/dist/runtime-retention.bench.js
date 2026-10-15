import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, bench, describe } from 'vitest';
import { LifecycleScheduler } from './lifecycle-scheduler.js';
import { McpConfigStore } from './mcp-config.js';
import { Orchestrator } from './orchestrator.js';
import { Store } from './store.js';
const THREAD_COUNT = 5_000;
const CONCURRENT_THREAD_COUNT = 1_000;
const OPTIONS = {
    iterations: 5,
    time: 0,
    warmupIterations: 1,
    warmupTime: 0,
};
const benchmarkRoot = mkdtempSync(path.join(tmpdir(), 'harness-runtime-retention-bench-'));
const mcpConfigLocation = path.join(benchmarkRoot, 'mcp.json');
afterAll(() => rmSync(benchmarkRoot, { recursive: true, force: true }));
class RetentionSession {
    capabilities = {
        steer: false,
        fork: false,
        interrupt: true,
        reasoningItems: false,
        approvals: false,
        images: false,
    };
    disposed = false;
    #listeners = [];
    async sendTurn() {
        return 'turn';
    }
    async interrupt() { }
    respondToApproval() { }
    dispose() {
        this.disposed = true;
    }
    on(event, listener) {
        if (event === 'event')
            this.#listeners.push(listener);
    }
    emit(event) {
        for (const listener of this.#listeners)
            listener(event);
    }
}
function retentionRuntime(sessions, createdAt) {
    let nextThread = 0;
    return {
        async start(workspacePath) {
            const session = new RetentionSession();
            const index = nextThread++;
            sessions.push(session);
            return {
                thread: {
                    id: `thread-${index}`,
                    provider: 'codex',
                    workspacePath,
                    createdAt: createdAt(index),
                },
                session,
            };
        },
        async resume() {
            throw new Error('benchmark does not resume evicted sessions');
        },
        async listModels() {
            return [];
        },
    };
}
async function runRetentionLifecycle() {
    const store = new Store(':memory:');
    const sessions = [];
    const runtime = retentionRuntime(sessions, (index) => index);
    const orchestrator = new Orchestrator(store, {
        onEvent: () => { },
        onLog: () => { },
        onLogin: () => { },
        mcpConfig: new McpConfigStore(mcpConfigLocation),
        runtimeFor: () => runtime,
        maxIdleThreadRuntimes: 16,
        idleThreadRuntimeMs: 60_000,
    });
    try {
        for (let index = 0; index < THREAD_COUNT; index += 1) {
            await orchestrator.startThread('codex', '/repo');
        }
        for (let index = 0; index < sessions.length; index += 1) {
            sessions[index].emit({
                type: 'turn.completed',
                turnId: `turn-${index}`,
                status: 'completed',
            });
        }
        const retained = sessions.filter((session) => !session.disposed).length;
        if (retained !== 16)
            throw new Error(`expected 16 retained runtimes, got ${retained}`);
    }
    finally {
        await orchestrator.disposeAll();
        store.close();
    }
}
async function runConcurrentRetentionLifecycle() {
    const store = new Store(':memory:');
    const sessions = [];
    const runtime = retentionRuntime(sessions, (index) => index);
    const orchestrator = new Orchestrator(store, {
        onEvent: () => { },
        onLog: () => { },
        onLogin: () => { },
        mcpConfig: new McpConfigStore(mcpConfigLocation),
        runtimeFor: () => runtime,
        maxIdleThreadRuntimes: 16,
        idleThreadRuntimeMs: 60_000,
    });
    try {
        for (let index = 0; index < CONCURRENT_THREAD_COUNT; index += 1) {
            await orchestrator.startThread('codex', '/repo');
        }
        for (let index = 0; index < sessions.length; index += 1) {
            sessions[index].emit({
                type: 'turn.started',
                turn: {
                    id: `turn-${index}`,
                    threadId: `thread-${index}`,
                    status: 'running',
                    createdAt: index,
                },
            });
        }
        for (let index = 0; index < sessions.length; index += 1) {
            sessions[index].emit({
                type: 'turn.completed',
                turnId: `turn-${index}`,
                status: 'completed',
            });
        }
        const retained = sessions.filter((session) => !session.disposed).length;
        if (retained !== 16)
            throw new Error(`expected 16 retained runtimes, got ${retained}`);
    }
    finally {
        await orchestrator.disposeAll();
        store.close();
    }
}
async function runScheduledThreadCreation(useDeadlineHint) {
    const store = new Store(':memory:');
    const sessions = [];
    const baseCreatedAt = Date.now();
    const runtime = retentionRuntime(sessions, (index) => baseCreatedAt + index);
    let notify = (_hint) => { };
    let nextAtCalls = 0;
    const orchestrator = new Orchestrator(store, {
        onEvent: () => { },
        onLog: () => { },
        onLogin: () => { },
        onLifecycleScheduleChanged: (hint) => notify(hint),
        mcpConfig: new McpConfigStore(mcpConfigLocation),
        runtimeFor: () => runtime,
    });
    const scheduler = new LifecycleScheduler(() => orchestrator.refreshLifecycle(), () => {
        nextAtCalls += 1;
        return store.nextLifecycleRefreshAt();
    });
    notify = useDeadlineHint
        ? (hint) => {
            if (hint === 'later')
                scheduler.changedLater();
            else if (typeof hint === 'number')
                scheduler.deadlineAdded(hint);
            else
                scheduler.changed();
        }
        : () => scheduler.changed();
    scheduler.refreshNow();
    nextAtCalls = 0;
    try {
        for (let index = 0; index < THREAD_COUNT; index += 1) {
            await orchestrator.startThread('codex', '/repo');
        }
        const expectedReads = useDeadlineHint ? 0 : THREAD_COUNT;
        if (nextAtCalls !== expectedReads) {
            throw new Error(`expected ${expectedReads} lifecycle reads, got ${nextAtCalls}`);
        }
    }
    finally {
        scheduler.dispose();
        await orchestrator.disposeAll();
        store.close();
    }
}
describe('many-thread runtime retention', () => {
    bench('starts and settles 5,000 resumable runtimes', runRetentionLifecycle, {
        iterations: 20,
        time: 0,
        warmupIterations: 5,
        warmupTime: 0,
    });
    bench('settles 1,000 concurrently active resumable runtimes', runConcurrentRetentionLifecycle, {
        iterations: 20,
        time: 0,
        warmupIterations: 5,
        warmupTime: 0,
    });
    bench('starts 5,000 runtimes with exact lifecycle reads', () => runScheduledThreadCreation(false), OPTIONS);
    bench('starts 5,000 runtimes with added-deadline scheduling', () => runScheduledThreadCreation(true), OPTIONS);
});
//# sourceMappingURL=runtime-retention.bench.js.map