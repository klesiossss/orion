import { codexLoginStatus } from '@harness/adapter-codex/auth';
import { CLAUDE_CAPABILITIES } from '@harness/adapter-claude-code/capabilities';
import { CODEX_CAPABILITIES } from '@harness/adapter-codex/capabilities';
import { GROK_CAPABILITIES } from '@harness/adapter-grok/capabilities';
import { CODEX_UPDATES, codexInstallCommand } from '@harness/adapter-codex/updates';
import { CLAUDE_UPDATES } from '@harness/adapter-claude-code/updates';
import { GROK_UPDATES } from '@harness/adapter-grok/updates';
import { commandVersion, isInstalled } from '@harness/proc/cli';
/**
 * The order here is the order `providers.list` reports, and the renderer
 * builds its catalog, first-run choice and update list from that answer.
 * Claude Code leads, then Codex, then Grok.
 */
const PROBES = [
    {
        id: 'claude-code',
        updater: CLAUDE_UPDATES,
        displayName: 'Claude Code',
        command: 'claude',
        capabilities: CLAUDE_CAPABILITIES,
        setup: {
            installUrl: 'https://code.claude.com/docs/en/getting-started',
            installCommand: 'npm install -g @anthropic-ai/claude-code',
            login: 'provider',
            loginOpensBrowser: true,
        },
        loginCommand: 'claude auth login',
    },
    {
        id: 'codex',
        updater: CODEX_UPDATES,
        displayName: 'Codex',
        command: 'codex',
        capabilities: CODEX_CAPABILITIES,
        setup: {
            installUrl: 'https://developers.openai.com/codex/cli',
            installCommand: codexInstallCommand(),
            login: 'provider',
            loginOpensBrowser: true,
        },
        loginCommand: 'codex login',
    },
    {
        id: 'grok',
        updater: GROK_UPDATES,
        displayName: 'Grok',
        command: 'grok',
        capabilities: GROK_CAPABILITIES,
        setup: {
            installUrl: 'https://x.ai/cli',
            login: 'provider',
            loginOpensBrowser: false,
        },
        // Device flow in the CLI's own terminal, same shape as `kimi login`.
        loginCommand: 'grok login',
    },
];
const REAL_SYSTEM = {
    isInstalled,
    version: commandVersion,
    auth: (provider) => provider === 'codex' ? codexLoginStatus() : Promise.resolve('unknown'),
};
export function providerUpdateSources() {
    return PROBES.flatMap((entry) => entry.updater
        ? [{ provider: entry.id, displayName: entry.displayName, updater: entry.updater }]
        : []);
}
/**
 * The install command for a provider, from the table above and nowhere else.
 * The renderer names a target; it never sends command text — that is what
 * keeps `providers.install` from being a remote shell.
 */
export async function installCommandFor(provider) {
    const entry = PROBES.find((candidate) => candidate.id === provider);
    if (!entry)
        throw new Error(`unknown install target: ${provider}`);
    if (!entry.setup.installCommand) {
        throw new Error(`${entry.displayName} has no scripted install; use its setup page`);
    }
    return entry.setup.installCommand;
}
/**
 * The interactive sign-in command for a provider whose login lives in its own
 * CLI (`setup.login === 'provider'`). Same boundary as `installCommandFor`:
 * the renderer names a target and the command comes from this table only.
 */
export async function launchCommandFor(provider) {
    const entry = PROBES.find((candidate) => candidate.id === provider);
    if (!entry)
        throw new Error(`unknown launch target: ${provider}`);
    if (entry.setup.login !== 'provider' || !entry.loginCommand) {
        throw new Error(`${entry.displayName} signs in through the app, not its own CLI`);
    }
    return entry.loginCommand;
}
const providerDetections = new WeakMap();
const PROVIDER_PREWARM_TTL_MS = 30_000;
const prewarmedProviderDetections = new WeakMap();
/**
 * Start one provider scan before the renderer asks for it. The resolved result
 * is consumed once, so later refreshes still observe installs and login changes.
 */
export function prewarmProviders(system = REAL_SYSTEM) {
    const current = prewarmedProviderDetections.get(system);
    if (current)
        return current.detection;
    const detection = scanProviders(system);
    prewarmedProviderDetections.set(system, {
        detection,
        expiresAt: Date.now() + PROVIDER_PREWARM_TTL_MS,
    });
    void detection.catch(() => {
        if (prewarmedProviderDetections.get(system)?.detection === detection) {
            prewarmedProviderDetections.delete(system);
        }
    });
    return detection;
}
export function detectProviders(system = REAL_SYSTEM) {
    const prewarmed = prewarmedProviderDetections.get(system);
    if (prewarmed) {
        prewarmedProviderDetections.delete(system);
        if (prewarmed.expiresAt >= Date.now())
            return prewarmed.detection;
    }
    return scanProviders(system);
}
function scanProviders(system) {
    const current = providerDetections.get(system);
    if (current)
        return current;
    const detection = Promise.all(PROBES.map((entry) => probe(entry, system)));
    providerDetections.set(system, detection);
    const clear = () => {
        if (providerDetections.get(system) === detection)
            providerDetections.delete(system);
    };
    void detection.then(clear, clear);
    return detection;
}
async function probe(entry, system) {
    if (!entry.command) {
        return {
            id: entry.id,
            displayName: entry.displayName,
            installed: false,
            auth: 'unknown',
            setup: entry.setup,
            ...(entry.unbuilt ? { problem: entry.unbuilt } : {}),
        };
    }
    const installed = await system.isInstalled(entry.command);
    if (!installed) {
        return {
            id: entry.id,
            displayName: entry.displayName,
            installed: false,
            auth: 'unknown',
            setup: entry.setup,
            problem: `${entry.command} is not on PATH`,
        };
    }
    const [version, auth] = await Promise.all([system.version(entry.command), system.auth(entry.id)]);
    const unsupported = version && entry.supportedVersion && !version.includes(entry.supportedVersion);
    return {
        id: entry.id,
        displayName: entry.displayName,
        installed: true,
        auth,
        setup: entry.setup,
        ...(version ? { version } : {}),
        ...(entry.capabilities ? { capabilities: entry.capabilities } : {}),
        ...(unsupported
            ? {
                problem: `Adapter supports ${entry.supportedVersion}.x; installed version is ${version}`,
            }
            : {}),
    };
}
//# sourceMappingURL=providers.js.map