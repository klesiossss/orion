import type { ProviderStatus } from '@harness/contracts';
type AuthStatus = ProviderStatus['auth'];
type LoginStatusRunner = (command: string, args: string[]) => Promise<{
    code: number | null;
    stdout: string;
    stderr?: string | undefined;
}>;
/** Parse only Codex's public login-status output; credential files stay provider-owned. */
export declare function parseCodexLoginStatus(stdout: string, code: number | null): AuthStatus;
/** A short CLI check avoids starting the much larger app-server during application startup. */
export declare function codexLoginStatus(run?: LoginStatusRunner): Promise<AuthStatus>;
export {};
//# sourceMappingURL=auth.d.ts.map