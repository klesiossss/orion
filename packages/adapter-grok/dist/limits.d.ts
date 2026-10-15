import { type GrokSignIn } from './adapter.js';
/** Weekly credit pool through Grok Build's own ACP extension. */
export type ProviderLimit = {
    label: string;
    usedPercent: number;
    resetsAt?: number | undefined;
    valueLabel?: string | undefined;
};
export type GrokLimitSource = {
    status: 'ready';
    limits: ProviderLimit[];
} | {
    status: 'unavailable';
};
/** Pure mapping so the billing shape is testable without the network. */
export declare function mapGrokBilling(body: unknown): ProviderLimit[];
export declare function grokLimits(): Promise<ProviderLimit[]>;
/** Provider-local availability keeps shared code free of Grok auth checks. */
export declare function grokLimitSource(signIn?: () => Promise<GrokSignIn>): Promise<GrokLimitSource>;
//# sourceMappingURL=limits.d.ts.map