/** Share one in-flight load, but let a later operation retry a failed load. */
export function retryableLazy(load) {
    let pending;
    return () => {
        pending ??= load().catch((error) => {
            pending = undefined;
            throw error;
        });
        return pending;
    };
}
//# sourceMappingURL=retryable-lazy.js.map