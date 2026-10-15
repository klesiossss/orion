import { z } from 'zod';
import { requestGrokExtension } from './acp.js';
import { grokSignIn } from './adapter.js';
const NumericValueSchema = z.union([z.number(), z.string()]).catch(Number.NaN);
const CentsSchema = z.object({ val: NumericValueSchema.optional() }).catch({});
const BillingPeriodSchema = z.object({
    type: z.string().optional(),
    end: z.string().optional(),
});
const BillingConfigSchema = z.object({
    currentPeriod: BillingPeriodSchema.optional().catch(undefined),
    billingPeriodEnd: z.string().optional().catch(undefined),
    creditUsagePercent: NumericValueSchema.optional(),
    monthlyLimit: CentsSchema.optional(),
    used: CentsSchema.optional(),
    prepaidBalance: CentsSchema.optional(),
    onDemandCap: CentsSchema.optional(),
    onDemandUsed: CentsSchema.optional(),
});
const GrokBillingSchema = z.object({
    config: BillingConfigSchema,
    on_demand_enabled: z.boolean().optional().catch(undefined),
    onDemandEnabled: z.boolean().optional().catch(undefined),
});
function finiteNumber(value) {
    if (value === undefined)
        return undefined;
    const stringValue = z.string().safeParse(value);
    if (stringValue.success) {
        if (!stringValue.data.trim())
            return undefined;
        const numeric = Number(stringValue.data);
        return Number.isFinite(numeric) ? numeric : undefined;
    }
    const numberValue = z.number().safeParse(value);
    return numberValue.success && Number.isFinite(numberValue.data) ? numberValue.data : undefined;
}
function percent(value) {
    const numeric = finiteNumber(value);
    return numeric === undefined ? undefined : Math.max(0, Math.min(100, numeric));
}
/** Grok's billing RPC defines signed Cent values; an empty object is proto3 zero. */
function cents(value) {
    if (value === undefined)
        return undefined;
    const numeric = finiteNumber(value.val ?? 0);
    return numeric !== undefined && Number.isSafeInteger(numeric) ? numeric : undefined;
}
function dollars(value) {
    return `$${(value / 100).toFixed(2)}`;
}
function timestamp(value) {
    if (value === undefined)
        return undefined;
    const parsed = Date.parse(value);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}
function includedCreditsRow(config) {
    const period = config.currentPeriod;
    const periodType = period?.type;
    const label = periodType === 'USAGE_PERIOD_TYPE_WEEKLY'
        ? 'Weekly'
        : periodType === 'USAGE_PERIOD_TYPE_MONTHLY' || (!period && config.monthlyLimit)
            ? 'Monthly'
            : 'Included credits';
    const resetsAt = timestamp(period?.end ?? config.billingPeriodEnd);
    const usedPercent = percent(config.creditUsagePercent);
    if (usedPercent !== undefined) {
        return [{ label, usedPercent, ...(!(resetsAt === undefined) ? { resetsAt } : {}) }];
    }
    const rawLimit = cents(config.monthlyLimit);
    const rawUsed = cents(config.used);
    const limit = rawLimit !== undefined && rawLimit >= 0 ? rawLimit : undefined;
    const used = rawUsed !== undefined && rawUsed >= 0 ? rawUsed : undefined;
    if ((limit ?? 0) > 0 || (used ?? 0) > 0) {
        const includedUsed = limit !== undefined && used !== undefined ? Math.min(used, limit) : used;
        const valueLabel = limit !== undefined && includedUsed !== undefined
            ? `${dollars(includedUsed)} of ${dollars(limit)} used`
            : limit !== undefined
                ? `${dollars(limit)} included`
                : `${dollars(includedUsed)} used`;
        return [
            {
                label,
                usedPercent: limit && includedUsed !== undefined ? percent((includedUsed / limit) * 100) : 0,
                ...(!(resetsAt === undefined) ? { resetsAt } : {}),
                valueLabel,
            },
        ];
    }
    // Grok's credits response is protobuf JSON: zero-valued scalar fields are
    // omitted. A current period without creditUsagePercent therefore means 0%,
    // matching Grok Build's own credit bar mapper.
    return period
        ? [
            {
                label,
                usedPercent: 0,
                ...(!(resetsAt === undefined) ? { resetsAt } : {}),
                ...(config.creditUsagePercent !== undefined
                    ? {
                        valueLabel: 'Usage not reported',
                    }
                    : {}),
            },
        ]
        : [];
}
function prepaidCreditsRow(config) {
    const balance = cents(config.prepaidBalance);
    const remaining = balance === undefined ? undefined : Math.abs(balance);
    return !remaining
        ? []
        : [{ label: 'Credits', usedPercent: 0, valueLabel: `${dollars(remaining)} remaining` }];
}
function onDemandCreditsRow(root, config) {
    const enabled = root.on_demand_enabled ?? root.onDemandEnabled;
    if (enabled === false)
        return [];
    const rawCap = cents(config.onDemandCap);
    const explicitUsed = cents(config.onDemandUsed);
    const totalUsed = cents(config.used);
    const monthlyLimit = cents(config.monthlyLimit);
    const rawUsed = explicitUsed ??
        (totalUsed !== undefined && monthlyLimit !== undefined
            ? Math.max(totalUsed - monthlyLimit, 0)
            : undefined);
    const cap = rawCap === undefined ? undefined : Math.abs(rawCap);
    const used = rawUsed === undefined ? undefined : Math.abs(rawUsed);
    const hasAmounts = (cap ?? 0) > 0 || (used ?? 0) > 0;
    if (enabled !== true && !hasAmounts)
        return [];
    const valueLabel = cap && used !== undefined
        ? `${dollars(used)} used of ${dollars(cap)} limit`
        : (cap ?? 0) > 0
            ? `${dollars(cap)} limit`
            : (used ?? 0) > 0
                ? `${dollars(used)} used`
                : 'Enabled';
    return [
        {
            label: 'Pay-as-you-go',
            usedPercent: cap && used !== undefined ? percent((used / cap) * 100) : 0,
            valueLabel,
        },
    ];
}
/** Pure mapping so the billing shape is testable without the network. */
export function mapGrokBilling(body) {
    const parsed = GrokBillingSchema.safeParse(body);
    if (!parsed.success)
        return [];
    const root = parsed.data;
    const config = root.config;
    return [
        ...includedCreditsRow(config),
        ...prepaidCreditsRow(config),
        ...onDemandCreditsRow(root, config),
    ];
}
async function readGrokBilling() {
    const body = await requestGrokExtension('_x.ai/billing', 'grok billing');
    const parsed = GrokBillingSchema.safeParse(body);
    if (!parsed.success)
        throw new Error('Grok billing response was invalid.');
    return parsed.data;
}
let billingRead;
function grokBilling() {
    billingRead ??= readGrokBilling().finally(() => {
        billingRead = undefined;
    });
    return billingRead;
}
export async function grokLimits() {
    return mapGrokBilling(await grokBilling());
}
/** Provider-local availability keeps shared code free of Grok auth checks. */
export async function grokLimitSource(signIn = grokSignIn) {
    if (!(await signIn()).signedIn)
        return { status: 'unavailable' };
    const body = await grokBilling();
    return { status: 'ready', limits: mapGrokBilling(body) };
}
//# sourceMappingURL=limits.js.map