import { retryableLazy } from './retryable-lazy.js';
import { PROVIDER_CAPABILITIES } from './provider-capabilities.js';
const loadAdapters = retryableLazy(() => import('./adapters.js'));
function deferredRuntime(load, supportsResume) {
    const resolve = retryableLazy(load);
    const deferred = {
        async start(workspacePath, options) {
            return (await resolve()).start(workspacePath, options);
        },
        async listModels(agent) {
            return (await resolve()).listModels(agent);
        },
    };
    if (supportsResume) {
        deferred.resume = async (threadId, workspacePath, options) => {
            const loaded = await resolve();
            if (!loaded.resume)
                throw new Error('provider runtime cannot resume');
            return loaded.resume(threadId, workspacePath, options);
        };
    }
    return deferred;
}
export function providerRuntime(provider, onLog, resolveHarness = () => undefined) {
    const supportsResume = PROVIDER_CAPABILITIES[provider].resume;
    return deferredRuntime(async () => (await loadAdapters()).providerRuntime(provider, onLog, resolveHarness), supportsResume);
}
export async function verifyCustomHarness(harness, workspacePath, onLog) {
    return (await loadAdapters()).verifyCustomHarness(harness, workspacePath, onLog);
}
//# sourceMappingURL=runtime-loader.js.map