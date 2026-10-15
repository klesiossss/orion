import { z } from 'zod';
import { requestGrokExtension } from './acp.js';
import { grokSignIn } from './adapter.js';
/** Only the display fields of the signed-in principal; nulls read as absent. */
const DisplayStringSchema = z.string().trim().min(1).optional().catch(undefined);
const GrokSubscriptionSchema = z.object({
    authenticated: z.boolean(),
    meta: z
        .object({
        email: DisplayStringSchema,
        subscription_tier: DisplayStringSchema,
    })
        .optional()
        .catch(undefined),
});
/**
 * `_x.ai/auth/check_subscription` names the principal Grok Build is signed in
 * as. The tier is already the vendor's display name (e.g. `X Premium`).
 */
export function parseGrokSubscription(body) {
    const parsed = GrokSubscriptionSchema.safeParse(body);
    if (!parsed.success || !parsed.data.authenticated)
        return undefined;
    const meta = parsed.data.meta;
    return {
        ...(meta?.email ? { email: meta.email } : {}),
        ...(meta?.subscription_tier ? { plan: meta.subscription_tier } : {}),
    };
}
async function readGrokSubscription() {
    return parseGrokSubscription(await requestGrokExtension('_x.ai/auth/check_subscription', 'grok account'));
}
/**
 * Sign-in comes from `grok models`; email and plan from Grok's own ACP
 * extension. The extension only adds detail, so its failure leaves the row at
 * plain "Signed in" rather than hiding the account.
 */
export async function grokAccount(options = {}) {
    const signIn = await (options.signIn ?? grokSignIn)();
    if (!signIn.signedIn)
        return { signedIn: false };
    const subscription = await (options.subscription ?? readGrokSubscription)().catch(() => undefined);
    return { signedIn: true, ...subscription };
}
//# sourceMappingURL=account.js.map