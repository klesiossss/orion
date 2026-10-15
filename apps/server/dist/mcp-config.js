import { randomUUID } from 'node:crypto';
import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync, } from 'node:fs';
import path from 'node:path';
import { McpServerConfigSchema, ProviderIdSchema, } from '@harness/contracts';
import { configFile } from './product-paths.js';
const EMPTY_CONFIG = { version: 1, projects: {}, unsupported: {} };
const CACHE_RECHECK_MS = 100;
const PROJECT_PATH_CACHE_LIMIT = 256;
function defaultLocation() {
    return configFile('mcp.json');
}
function canonicalProjectPath(projectPath) {
    const absolute = path.resolve(projectPath);
    const resolved = existsSync(absolute) ? realpathSync.native(absolute) : absolute;
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}
function configFileStamp(location) {
    const stats = statSync(location, { bigint: true, throwIfNoEntry: false });
    if (!stats)
        return 'missing';
    return `${stats.dev}:${stats.ino}:${stats.size}:${stats.mtimeNs}:${stats.ctimeNs}`;
}
function deepFreeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value))
        return value;
    for (const nested of Object.values(value))
        deepFreeze(nested);
    return Object.freeze(value);
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** Server IDs are user-chosen, so `__proto__` must stay an ordinary own key. */
function setOwn(target, key, value) {
    Object.defineProperty(target, key, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
    });
}
function parseConfig(raw) {
    // Walked by hand rather than with record schemas, which drop a `__proto__` key.
    const value = JSON.parse(raw);
    if (!isObject(value) || value.version !== 1 || !isObject(value.projects)) {
        throw new Error('invalid MCP config: expected a version 1 project map');
    }
    let skipped = false;
    // One malformed entry must not take the whole file down: throwing here
    // made every MCP operation fail, which also removed the only way to repair
    // the file from inside the app. Invalid entries are skipped and logged;
    // the next write persists the sanitised shape.
    const projects = {};
    const unsupported = {};
    for (const [projectPath, providersValue] of Object.entries(value.projects)) {
        if (!isObject(providersValue)) {
            skipped = true;
            console.warn(`[mcp-config] skipping invalid project entry "${projectPath}"`);
            continue;
        }
        const providers = {};
        for (const [providerName, serversValue] of Object.entries(providersValue)) {
            const provider = ProviderIdSchema.safeParse(providerName);
            if (!provider.success) {
                const kept = Object.hasOwn(unsupported, projectPath) ? unsupported[projectPath] : {};
                setOwn(kept, providerName, serversValue);
                setOwn(unsupported, projectPath, kept);
                continue;
            }
            if (!isObject(serversValue)) {
                skipped = true;
                console.warn(`[mcp-config] skipping invalid provider "${providerName}" for "${projectPath}"`);
                continue;
            }
            const servers = {};
            for (const [serverId, serverValue] of Object.entries(serversValue)) {
                const server = McpServerConfigSchema.safeParse(serverValue);
                if (!server.success || server.data.id !== serverId) {
                    skipped = true;
                    console.warn(`[mcp-config] skipping invalid server "${serverId}" for "${projectPath}"`);
                    continue;
                }
                setOwn(servers, serverId, server.data);
            }
            providers[provider.data] = servers;
        }
        setOwn(projects, projectPath, providers);
    }
    return { config: { version: 1, projects, unsupported }, skipped };
}
function serializeConfig(file) {
    const projects = {};
    for (const projectPath of new Set([
        ...Object.keys(file.unsupported),
        ...Object.keys(file.projects),
    ])) {
        const providers = {};
        for (const source of [file.unsupported[projectPath], file.projects[projectPath]]) {
            for (const [provider, servers] of Object.entries(source ?? {}))
                setOwn(providers, provider, servers);
        }
        setOwn(projects, projectPath, providers);
    }
    return `${JSON.stringify({ version: 1, projects }, null, 2)}\n`;
}
/** Human-readable project MCP definitions. Secret values never enter this file. */
export class McpConfigStore {
    location;
    now;
    #cachedConfig;
    #canonicalProjectPaths = new Map();
    constructor(location = defaultLocation(), now = () => performance.now()) {
        this.location = location;
        this.now = now;
    }
    list(provider, projectPath) {
        return Object.values(this.#read().projects[this.#projectPath(projectPath)]?.[provider] ?? {});
    }
    add(provider, projectPath, server) {
        const file = structuredClone(this.#read(true));
        const servers = this.#servers(file, provider, projectPath);
        if (Object.hasOwn(servers, server.id))
            throw new Error(`project MCP server "${server.id}" already exists`);
        setOwn(servers, server.id, structuredClone(server));
        this.#write(file);
    }
    update(provider, projectPath, server) {
        const file = structuredClone(this.#read(true));
        const servers = this.#servers(file, provider, projectPath);
        if (!Object.hasOwn(servers, server.id))
            throw new Error(`project MCP server "${server.id}" does not exist`);
        setOwn(servers, server.id, structuredClone(server));
        this.#write(file);
    }
    remove(provider, projectPath, serverId) {
        const file = structuredClone(this.#read(true));
        const projectKey = this.#projectPath(projectPath, true);
        const servers = file.projects[projectKey]?.[provider];
        if (!servers || !Object.hasOwn(servers, serverId))
            throw new Error(`project MCP server "${serverId}" does not exist`);
        delete servers[serverId];
        if (Object.keys(servers).length === 0)
            delete file.projects[projectKey]?.[provider];
        if (Object.keys(file.projects[projectKey] ?? {}).length === 0)
            delete file.projects[projectKey];
        this.#write(file);
    }
    #servers(file, provider, projectPath) {
        const projectKey = this.#projectPath(projectPath, true);
        if (!Object.hasOwn(file.projects, projectKey))
            setOwn(file.projects, projectKey, {});
        const project = file.projects[projectKey];
        return (project[provider] ??= {});
    }
    /** Set when the last read skipped entries; the original must be kept. */
    #readLossy = false;
    #read(force = false) {
        const checkedAt = this.now();
        if (!force &&
            this.#cachedConfig &&
            checkedAt >= this.#cachedConfig.checkedAt &&
            checkedAt - this.#cachedConfig.checkedAt < CACHE_RECHECK_MS) {
            return this.#cachedConfig.config;
        }
        const stamp = configFileStamp(this.location);
        if (this.#cachedConfig?.stamp === stamp) {
            this.#cachedConfig.checkedAt = checkedAt;
            return this.#cachedConfig.config;
        }
        if (stamp === 'missing') {
            this.#readLossy = false;
            return this.#cache(structuredClone(EMPTY_CONFIG), stamp, checkedAt);
        }
        const raw = readFileSync(this.location, 'utf8');
        const parsed = parseConfig(raw);
        this.#readLossy = parsed.skipped;
        return this.#cache(parsed.config, stamp, checkedAt);
    }
    #write(file) {
        mkdirSync(path.dirname(this.location), { recursive: true });
        const temporary = `${this.location}.${randomUUID()}.tmp`;
        try {
            writeFileSync(temporary, serializeConfig(file), {
                encoding: 'utf8',
                mode: 0o600,
            });
            // A hand-edited file with entries we could not parse is not ours to
            // destroy: copy the original aside, and leave it active until the
            // complete replacement is atomically in place.
            if (this.#readLossy && existsSync(this.location)) {
                copyFileSync(this.location, `${this.location}.invalid-${Date.now()}-${randomUUID().slice(0, 8)}.bak`, constants.COPYFILE_EXCL);
            }
            renameSync(temporary, this.location);
            this.#readLossy = false;
            let stamp;
            try {
                stamp = configFileStamp(this.location);
            }
            catch {
                // The write succeeded. A later read can establish the signature.
            }
            this.#cache(file, stamp, this.now());
        }
        catch (error) {
            // A failed atomic write (disk full, AV holding the handle) must not
            // leave a stray .tmp behind on every retry.
            try {
                rmSync(temporary, { force: true });
            }
            catch {
                // Report the write failure, not the cleanup one.
            }
            throw error;
        }
    }
    #cache(config, stamp, checkedAt) {
        const frozen = deepFreeze(config);
        this.#cachedConfig = { config: frozen, stamp, checkedAt };
        return frozen;
    }
    #projectPath(projectPath, force = false) {
        const checkedAt = this.now();
        const cached = this.#canonicalProjectPaths.get(projectPath);
        if (!force &&
            cached &&
            checkedAt >= cached.checkedAt &&
            checkedAt - cached.checkedAt < CACHE_RECHECK_MS) {
            return cached.path;
        }
        const resolved = canonicalProjectPath(projectPath);
        if (!this.#canonicalProjectPaths.has(projectPath) &&
            this.#canonicalProjectPaths.size >= PROJECT_PATH_CACHE_LIMIT) {
            const oldest = this.#canonicalProjectPaths.keys().next().value;
            if (oldest !== undefined)
                this.#canonicalProjectPaths.delete(oldest);
        }
        this.#canonicalProjectPaths.set(projectPath, { path: resolved, checkedAt });
        return resolved;
    }
}
//# sourceMappingURL=mcp-config.js.map