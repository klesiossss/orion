/** Share one in-flight load, but let a later operation retry a failed load. */
export declare function retryableLazy<T>(load: () => Promise<T>): () => Promise<T>;
//# sourceMappingURL=retryable-lazy.d.ts.map