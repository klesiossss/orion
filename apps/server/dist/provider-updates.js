import { commandVersion, isInstalled } from '@harness/proc/cli';
import { cliVersion, isNewerVersion } from '@harness/proc/updates';
import { providerUpdateSources } from './providers.js';
const CACHE_MS = 60 * 60_000;
export class ProviderUpdateService {
    sources;
    system;
    #cached = new Map();
    #pending = new Map();
    constructor(sources = providerUpdateSources(), system = { isInstalled, version: commandVersion }) {
        this.sources = sources;
        this.system = system;
    }
    async list(refresh = false) {
        return Promise.all(this.sources.map(async (source) => (await this.#check(source, refresh)).update));
    }
    async commandFor(provider) {
        const source = this.sources.find((entry) => entry.provider === provider);
        if (!source)
            throw new Error('This provider does not support updates.');
        const { update, command } = await this.#check(source, true);
        if (update.error)
            throw new Error(update.error);
        if (!update.updateAvailable)
            throw new Error(`${source.displayName} has no newer version available.`);
        if (!command)
            throw new Error(`Update ${source.displayName} through its setup guide.`);
        return command;
    }
    #check(source, refresh) {
        const pending = this.#pending.get(source.provider);
        // A verification requested after an update must not reuse a version read
        // that began while the installer was still running in another client.
        if (pending)
            return refresh ? pending.then(() => this.#check(source, true)) : pending;
        const cached = this.#cached.get(source.provider);
        if (!refresh && cached && cached.expires > Date.now())
            return Promise.resolve(cached.result);
        const request = this.#probe(source)
            .then((result) => {
            this.#cached.set(source.provider, {
                result,
                expires: Date.now() + (result.update.error ? 60_000 : CACHE_MS),
            });
            return result;
        })
            .finally(() => this.#pending.delete(source.provider));
        this.#pending.set(source.provider, request);
        return request;
    }
    async #probe(source) {
        const update = {
            provider: source.provider,
            displayName: source.displayName,
            updateUrl: source.updater.url,
            updateAvailable: false,
            canUpdate: false,
        };
        try {
            if (!(await this.system.isInstalled(source.updater.command)))
                return { update };
            const current = await this.system.version(source.updater.command);
            const currentVersion = current && cliVersion(current);
            if (!currentVersion)
                throw new Error('Could not read the installed version. Try again later.');
            update.currentVersion = currentVersion;
            const result = await source.updater.check(currentVersion);
            const latestVersion = cliVersion(result.latestVersion);
            if (!latestVersion)
                throw new Error('Could not read the latest release version.');
            return {
                update: {
                    ...update,
                    latestVersion,
                    updateAvailable: isNewerVersion(currentVersion, latestVersion),
                    canUpdate: Boolean(result.command),
                },
                command: result.command,
            };
        }
        catch (error) {
            return {
                update: {
                    ...update,
                    error: error instanceof Error ? error.message : 'Could not check for updates.',
                },
            };
        }
    }
}
//# sourceMappingURL=provider-updates.js.map