/** A route-owned JSON payload that has already been encoded from immutable data. */
export declare class SerializedResult {
    readonly json: string;
    constructor(json: string);
}
/** Reuse the encoded form while an immutable response keeps the same identity. */
export declare function createSerializedResultCache<T extends object>(): (value: T, encoded?: string) => SerializedResult;
export declare function serializeSuccessResponse(id: string, result: unknown): string;
//# sourceMappingURL=response-serializer.d.ts.map