import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, bench, describe } from 'vitest';
import { McpConfigStore } from './mcp-config.js';
import { Orchestrator } from './orchestrator.js';
import { Store } from './store.js';
const THREAD_COUNT = 10_000;
const TARGET_PROJECT = `/project-${THREAD_COUNT - 1}`;
const OPTIONS = {
    iterations: 10,
    time: 500,
    warmupIterations: 5,
    warmupTime: 100,
};
const benchmarkRoot = mkdtempSync(path.join(tmpdir(), 'harness-mcp-runtime-bench-'));
class McpRuntimeSession {
    capabilities = {
        steer: false,
        fork: false,
        interrupt: true,
        reasoningItems: false,
        approvals: false,
        images: false,
    };
    reloadCount = 0;
    async sendTurn() {
        return 'turn';
    }
    async interrupt() { }
    async reloadMcpServers() {
        this.reloadCount += 1;
    }
    respondToApproval() { }
    dispose() { }
    on() { }
}
function mcpRuntime(sessions) {
    let nextThread = 0;
    return {
        async start(workspacePath) {
            const index = nextThread++;
            const session = new McpRuntimeSession();
            sessions.push(session);
            return {
                thread: {
                    id: `thread-${index}`,
                    provider: 'codex',
                    workspacePath,
                    createdAt: index,
                },
                session,
            };
        },
        async listModels() {
            return [];
        },
    };
}
let orchestrator;
let store;
let target;
beforeAll(async () => {
    store = new Store(':memory:');
    const sessions = [];
    const runtime = mcpRuntime(sessions);
    orchestrator = new Orchestrator(store, {
        onEvent: () => { },
        onLog: () => { },
        onLogin: () => { },
        mcpConfig: new McpConfigStore(path.join(benchmarkRoot, 'mcp.json')),
        runtimeFor: () => runtime,
    });
    for (let index = 0; index < THREAD_COUNT; index += 1) {
        await orchestrator.startThread('codex', `/project-${index}`);
    }
    target = sessions.at(-1);
    await orchestrator.reloadMcpServers('codex', TARGET_PROJECT);
}, 30_000);
afterAll(async () => {
    await orchestrator.disposeAll();
    store.close();
    rmSync(benchmarkRoot, { recursive: true, force: true });
});
describe('many-thread MCP runtime lookup', () => {
    bench('reloads MCP on the last of 10,000 active runtimes', async () => {
        const previousReloadCount = target.reloadCount;
        await orchestrator.reloadMcpServers('codex', TARGET_PROJECT);
        if (target.reloadCount !== previousReloadCount + 1) {
            throw new Error('reloaded the wrong MCP runtime');
        }
    }, OPTIONS);
});
//# sourceMappingURL=orchestrator-mcp-runtime.bench.js.map