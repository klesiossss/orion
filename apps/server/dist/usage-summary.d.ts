import type { ProviderId, ProviderLimitSource, ResultOf } from '@harness/contracts';
type UsageTotals = Pick<ResultOf<'usage.summary'>, 'session' | 'today'>;
export declare function usageSummaryWithLimits(totals: UsageTotals, provider: ProviderId, loadSource: (provider: ProviderId) => Promise<ProviderLimitSource>): Promise<ResultOf<'usage.summary'>>;
export {};
//# sourceMappingURL=usage-summary.d.ts.map