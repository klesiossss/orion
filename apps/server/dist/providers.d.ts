import type { CliUpdateSource } from '@harness/proc/updates';
import type { ProviderStatus } from '@harness/contracts';
/**
 * main ships exactly three subscription plans: Claude Code, Codex and Grok.
 * Every other provider lives on the nightly branch only — see AGENTS.md.
 */
/**
 * The machine, as far as this file is concerned.
 *
 * Injected so the reporting logic can be tested without a real PATH — the
 * interesting part is what we say about what we found, and that should not
 * depend on which agents happen to be installed on the machine running CI.
 */
export type SystemProbe = {
    isInstalled(command: string): Promise<boolean>;
    version(command: string): Promise<string | undefined>;
    auth(provider: ProviderStatus['id']): Promise<ProviderStatus['auth']>;
};
export declare function providerUpdateSources(): {
    provider: "codex" | "claude-code" | "grok";
    displayName: string;
    updater: CliUpdateSource;
}[];
/**
 * The install command for a provider, from the table above and nowhere else.
 * The renderer names a target; it never sends command text — that is what
 * keeps `providers.install` from being a remote shell.
 */
export declare function installCommandFor(provider: ProviderStatus['id']): Promise<string>;
/**
 * The interactive sign-in command for a provider whose login lives in its own
 * CLI (`setup.login === 'provider'`). Same boundary as `installCommandFor`:
 * the renderer names a target and the command comes from this table only.
 */
export declare function launchCommandFor(provider: ProviderStatus['id']): Promise<string>;
/**
 * Start one provider scan before the renderer asks for it. The resolved result
 * is consumed once, so later refreshes still observe installs and login changes.
 */
export declare function prewarmProviders(system?: SystemProbe): Promise<ProviderStatus[]>;
export declare function detectProviders(system?: SystemProbe): Promise<ProviderStatus[]>;
//# sourceMappingURL=providers.d.ts.map