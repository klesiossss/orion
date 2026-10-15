import type { Account } from '@harness/contracts';
import { type GrokSignIn } from './adapter.js';
export type GrokSubscription = Pick<Account, 'email' | 'plan'>;
/**
 * `_x.ai/auth/check_subscription` names the principal Grok Build is signed in
 * as. The tier is already the vendor's display name (e.g. `X Premium`).
 */
export declare function parseGrokSubscription(body: unknown): GrokSubscription | undefined;
export type GrokAccountOptions = {
    signIn?: () => Promise<GrokSignIn>;
    subscription?: () => Promise<GrokSubscription | undefined>;
};
/**
 * Sign-in comes from `grok models`; email and plan from Grok's own ACP
 * extension. The extension only adds detail, so its failure leaves the row at
 * plain "Signed in" rather than hiding the account.
 */
export declare function grokAccount(options?: GrokAccountOptions): Promise<Account>;
//# sourceMappingURL=account.d.ts.map