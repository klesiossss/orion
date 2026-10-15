/** A route-owned JSON payload that has already been encoded from immutable data. */
export class SerializedResult {
    json;
    constructor(json) {
        this.json = json;
    }
}
/** Reuse the encoded form while an immutable response keeps the same identity. */
export function createSerializedResultCache() {
    const cache = new WeakMap();
    return (value, encoded) => {
        const cached = cache.get(value);
        if (cached)
            return cached;
        const serialized = new SerializedResult(encoded ?? JSON.stringify(value));
        cache.set(value, serialized);
        return serialized;
    };
}
export function serializeSuccessResponse(id, result) {
    if (result instanceof SerializedResult) {
        return `{"id":${JSON.stringify(id)},"result":${result.json}}`;
    }
    return JSON.stringify({ id, result });
}
//# sourceMappingURL=response-serializer.js.map