import type { Account } from '@harness/contracts';
import { runCli } from '@harness/proc';
export type ClaudeAccountOptions = {
    run?: typeof runCli;
    readRateLimitTier?: () => Promise<string | undefined>;
};
export type ClaudeLogin = {
    loginId: string;
    cancel: () => Promise<void>;
};
export declare function claudeAccount(options?: ClaudeAccountOptions): Promise<Account>;
/** The vendor's plan ids are not display strings. */
export declare function claudePlanLabel(plan: string, tier?: string): string;
export declare function parseClaudeAccount(output: string): Account;
export declare function startClaudeLogin(onComplete: (result: {
    loginId: string;
    success: boolean;
    error: string | null;
}) => void): ClaudeLogin;
export declare function signOutClaude(): Promise<void>;
//# sourceMappingURL=auth.d.ts.map