export function object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
export function timestamp(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value < 1e12 ? value * 1000 : value;
    const parsed = typeof value === 'string' ? Date.parse(value) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
//# sourceMappingURL=history-values.js.map