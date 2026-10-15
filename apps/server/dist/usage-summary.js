export async function usageSummaryWithLimits(totals, provider, loadSource) {
    const limitSource = await loadSource(provider);
    if (limitSource.provider !== provider) {
        throw new Error('Provider limit source did not match the request.');
    }
    return {
        ...totals,
        limitSource,
        limits: limitSource.status === 'ready' ? limitSource.limits : [],
    };
}
//# sourceMappingURL=usage-summary.js.map