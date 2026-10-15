import { validateAcpMcpServer } from '@harness/adapter-acp/mcp';
import { validateClaudeMcpServer } from '@harness/adapter-claude-code/capabilities';
import { PROVIDER_CAPABILITIES } from './provider-capabilities.js';
import { retryableLazy } from './retryable-lazy.js';
import { WatchLeases } from './watch-leases.js';
const loadCodex = retryableLazy(() => import('@harness/adapter-codex'));
const loadClaude = retryableLazy(() => import('@harness/adapter-claude-code'));
const loadGrok = retryableLazy(() => import('@harness/adapter-grok'));
const defaultServices = {
    codex: {},
    'claude-code': {
        validateMcpServer: validateClaudeMcpServer,
        account: async () => (await loadClaude()).claudeAccount(),
        usageLimitSource: async () => (await loadClaude()).claudeLimitSource(),
        startLogin: async (complete) => (await loadClaude()).startClaudeLogin(complete),
        signOut: async () => (await loadClaude()).signOutClaude(),
    },
    grok: {
        // Grok's MCP sessions run through ACP.
        validateMcpServer: validateAcpMcpServer,
        account: async () => (await loadGrok()).grokAccount(),
        usageLimitSource: async () => (await loadGrok()).grokLimitSource(),
        signOut: async () => (await loadGrok()).signOutGrok(),
    },
};
/** Vendor settings and the processes that serve them have one owner. */
export class ProviderControls {
    #options;
    #controls = new Map();
    #owned = new Set();
    #logins = new Map();
    /** Starts that missed their deadline; their handle is canceled on arrival. */
    #lateLogins = new Map();
    #authQueues = new Map();
    #skills;
    #mcp;
    #idleMs;
    #loginTtlMs;
    #loginStartTimeoutMs;
    #limitCacheMs;
    #limitChangeIntervalMs;
    #limits = new Map();
    #shared;
    #users = 0;
    #idleTimer;
    #watchTimer;
    #closed = false;
    #generation = 0;
    #disposing;
    constructor(options) {
        this.#options = options;
        this.#idleMs = duration(options.controlIdleMs, 5_000, 0);
        this.#loginTtlMs = duration(options.loginTtlMs, 10 * 60_000, 1);
        this.#loginStartTimeoutMs = duration(options.loginStartTimeoutMs, 60_000, 1);
        // Codex reports a limit change after nearly every model request, and each
        // read starts a vendor process, so reads are cached and signals spaced.
        this.#limitCacheMs = duration(options.limitCacheMs, 60_000, 0);
        this.#limitChangeIntervalMs = duration(options.limitChangeIntervalMs, 30_000, 0);
        const watchTtlMs = duration(options.watchTtlMs, 60_000, 1);
        this.#skills = new WatchLeases(watchTtlMs);
        this.#mcp = new WatchLeases(watchTtlMs);
        for (const provider of Object.keys(PROVIDER_CAPABILITIES)) {
            this.#controls.set(provider, this.#makeControl(provider));
        }
    }
    forProvider(provider) {
        const control = this.#controls.get(provider);
        if (!control)
            throw new Error(`unknown provider "${provider}"`);
        return control;
    }
    forgetProject(projectPath) {
        this.#skills.delete(projectPath);
        this.#mcp.delete(projectPath);
        this.#scheduleIdle();
    }
    /**
     * Marks cached limits stale and forwards the signal at a bounded rate: the
     * first change notifies at once, a burst after it collapses into one
     * trailing notification per interval.
     */
    usageChanged(provider, immediate = false) {
        if (this.#closed)
            return;
        const entry = this.#invalidateLimits(provider);
        const wait = immediate ? 0 : entry.notifiedAt + this.#limitChangeIntervalMs - Date.now();
        if (wait <= 0) {
            clearTimeout(entry.notifyTimer);
            entry.notifyTimer = undefined;
            entry.notifiedAt = Date.now();
            this.#options.onUsageChanged?.(provider);
            return;
        }
        if (entry.notifyTimer)
            return;
        entry.notifyTimer = setTimeout(() => {
            entry.notifyTimer = undefined;
            if (this.#limits.get(provider) !== entry || this.#closed)
                return;
            entry.notifiedAt = Date.now();
            this.#options.onUsageChanged?.(provider);
        }, wait);
        entry.notifyTimer.unref?.();
    }
    /** Failed cleanup retains ownership, so a subsequent call can retry it. */
    disposeAll() {
        if (this.#disposing)
            return this.#disposing;
        this.#closed = true;
        this.#generation += 1;
        this.#users = 0;
        clearTimeout(this.#idleTimer);
        clearTimeout(this.#watchTimer);
        this.#skills.clear();
        this.#mcp.clear();
        for (const entry of this.#limits.values())
            clearTimeout(entry.notifyTimer);
        this.#limits.clear();
        for (const login of this.#logins.values())
            clearTimeout(login.timer);
        // Stopping the control process also cancels its browser login. Sending a
        // cancellation RPC while stopping that same process would race its exit.
        const codexLogin = this.#logins.get('codex');
        if (codexLogin) {
            codexLogin.expired = true;
            this.#releaseLogin('codex', codexLogin);
        }
        const disposing = (async () => {
            const results = await Promise.allSettled([
                ...[...this.#logins].map(([provider, login]) => this.#cancelOwnedLogin(provider, login)),
                ...[...this.#owned].map((entry) => this.#stop(entry)),
            ]);
            await Promise.all(this.#authQueues.values());
            // A login loader may have returned its handle during the reset. Its
            // canceled start owns cleanup; failed cleanup remains available here.
            const late = await Promise.allSettled([
                ...[...this.#logins].map(([provider, login]) => this.#cancelOwnedLogin(provider, login)),
                ...[...this.#lateLogins].map(([login, provider]) => this.#cancelOwnedLogin(provider, login).then(() => {
                    if (login.cancel)
                        this.#lateLogins.delete(login);
                })),
            ]);
            const errors = [...results, ...late].flatMap((result) => result.status === 'rejected' ? [result.reason] : []);
            if (errors.length)
                throw new AggregateError(errors, 'Provider controls could not stop');
        })();
        this.#disposing = disposing;
        void disposing.then(() => {
            this.#closed = false;
            this.#disposing = undefined;
        }, () => {
            this.#closed = false;
            this.#disposing = undefined;
        });
        return disposing;
    }
    #assertOpen(generation = this.#generation) {
        if (this.#closed || generation !== this.#generation)
            throw new Error('Provider controls were reset');
    }
    #makeControl(provider) {
        const capabilities = PROVIDER_CAPABILITIES[provider];
        const services = {
            ...defaultServices[provider],
            ...this.#options.services?.[provider],
        };
        const control = {
            capabilities,
            account: (agent) => this.#read(async () => (await services.account?.(agent)) ?? { signedIn: false }),
            usageLimitSource: () => services.usageLimitSource
                ? this.#cachedLimits(provider, () => this.#read(async () => {
                    const source = await services.usageLimitSource?.();
                    return source?.status === 'ready'
                        ? { provider, status: 'ready', limits: source.limits }
                        : { provider, status: 'unavailable' };
                }))
                : this.#read(async () => ({ provider, status: 'unavailable' })),
            signOut: (agent) => this.#auth(provider, async (generation) => {
                const login = this.#logins.get(provider);
                if (login)
                    await this.#cancelOwnedLogin(provider, login);
                this.#assertOpen(generation);
                await services.signOut?.(agent);
                this.#assertOpen(generation);
                this.#authChanged(provider);
            }),
            watch: (projectPath, targets) => this.#watch(provider, projectPath, targets),
            ...(services.validateMcpServer ? { validateMcpServer: services.validateMcpServer } : {}),
            ...(capabilities.nativeModels
                ? { listModels: (agent) => this.#readModels(provider, agent) }
                : {}),
            ...(capabilities.login && services.startLogin
                ? {
                    startLogin: () => this.#auth(provider, (generation) => this.#startOwnedLogin(provider, services.startLogin, generation)),
                    cancelLogin: (loginId) => this.#cancelLogin(provider, loginId),
                }
                : {}),
        };
        if (provider !== 'codex')
            return control;
        return {
            ...control,
            account: () => this.#withShared((adapter) => adapter.account()),
            listModels: (agent) => agent
                ? this.#readModels(provider, agent)
                : this.#withShared((adapter) => adapter.listModels()),
            listMcpServers: (readActive) => this.#read(async () => {
                const [servers, { CODEX_MCP_CAPABILITIES }] = await Promise.all([
                    readActive ? readActive() : this.#withShared((adapter) => adapter.listMcpServers()),
                    loadCodex(),
                ]);
                return { capabilities: CODEX_MCP_CAPABILITIES, servers };
            }),
            listSkills: (projectPath) => this.#read(async () => {
                const [inventory, { CODEX_SKILL_CAPABILITIES }] = await Promise.all([
                    this.#withShared((adapter) => adapter.listSkills(projectPath)),
                    loadCodex(),
                ]);
                return { capabilities: CODEX_SKILL_CAPABILITIES, ...inventory };
            }),
            setSkillEnabled: (_projectPath, skillId, enabled) => this.#withShared((adapter) => adapter.setSkillEnabled(skillId, enabled)),
            // A fresh process reads the account's current limits rather than the
            // snapshot a long-lived process captured at startup.
            usageLimitSource: () => this.#cachedLimits(provider, () => this.#withFresh(async (adapter) => {
                const source = await adapter.rateLimitSource();
                return source.status === 'ready'
                    ? { provider, status: 'ready', limits: source.limits }
                    : { provider, status: 'unavailable' };
            })),
            consumeRateLimitReset: async (idempotencyKey, creditId) => {
                const generation = this.#generation;
                const outcome = await this.#withFresh((adapter) => adapter.consumeRateLimitReset(idempotencyKey, creditId));
                this.#assertOpen(generation);
                this.usageChanged(provider, true);
                return { outcome };
            },
            startLogin: () => this.#auth(provider, (generation) => this.#startOwnedLogin(provider, () => this.#withShared(async (adapter) => {
                const response = await adapter.startLogin();
                return { ...response, cancel: () => adapter.cancelLogin(response.loginId) };
            }), generation)),
            cancelLogin: (loginId) => this.#cancelLogin(provider, loginId),
            useApiKey: (apiKey) => this.#auth(provider, async (generation) => {
                const login = this.#logins.get(provider);
                if (login)
                    await this.#cancelOwnedLogin(provider, login);
                this.#assertOpen(generation);
                const account = await this.#withShared((adapter) => adapter.useApiKey(apiKey));
                this.#assertOpen(generation);
                this.#authChanged(provider);
                return account;
            }),
            signOut: () => this.#auth(provider, async (generation) => {
                const login = this.#logins.get(provider);
                if (login)
                    await this.#cancelOwnedLogin(provider, login);
                this.#assertOpen(generation);
                await this.#withShared((adapter) => adapter.signOut());
                this.#assertOpen(generation);
                this.#authChanged(provider);
            }),
        };
    }
    #limitEntry(provider) {
        let entry = this.#limits.get(provider);
        if (!entry) {
            entry = { version: 0, freshUntil: 0, notifiedAt: Number.NEGATIVE_INFINITY };
            this.#limits.set(provider, entry);
        }
        return entry;
    }
    #invalidateLimits(provider) {
        const entry = this.#limitEntry(provider);
        entry.version += 1;
        entry.freshUntil = 0;
        // A read already in flight may predate the change; the next caller starts its own.
        entry.reading = undefined;
        return entry;
    }
    /** One read serves concurrent callers, and a fresh result serves later ones. */
    #cachedLimits(provider, read) {
        this.#assertOpen();
        const entry = this.#limitEntry(provider);
        if (entry.reading)
            return entry.reading;
        if (entry.value && Date.now() < entry.freshUntil)
            return Promise.resolve(entry.value);
        const version = entry.version;
        const reading = read()
            .then((value) => {
            if (entry.version === version && this.#limits.get(provider) === entry) {
                entry.value = value;
                entry.freshUntil = Date.now() + this.#limitCacheMs;
            }
            return value;
        })
            .finally(() => {
            if (entry.reading === reading)
                entry.reading = undefined;
        });
        entry.reading = reading;
        return reading;
    }
    #authChanged(provider) {
        this.#invalidateLimits(provider);
        this.#options.onAuthChanged?.(provider);
    }
    async #readModels(provider, agent) {
        return this.#read(() => this.#options.listModels(provider, agent));
    }
    async #read(operation) {
        const generation = this.#generation;
        this.#assertOpen(generation);
        const value = await operation();
        this.#assertOpen(generation);
        return value;
    }
    #newProcess(shared) {
        this.#assertOpen();
        const generation = this.#generation;
        const creating = Promise.resolve().then(async () => {
            this.#assertOpen(generation);
            return this.#options.createCodex
                ? this.#options.createCodex()
                : new (await loadCodex()).CodexAdapter();
        });
        const entry = {
            creating,
            ready: creating,
            closing: false,
            stopped: false,
        };
        this.#owned.add(entry);
        entry.ready = creating
            .then(async (adapter) => {
            this.#assertOpen(generation);
            if (entry.closing)
                throw new Error('Provider control process is stopping');
            adapter.on('log', (line) => {
                if (!entry.closing)
                    this.#options.onLog?.('codex', line);
            });
            if (shared)
                this.#listen(adapter, entry);
            await adapter.start();
            this.#assertOpen(generation);
            if (entry.closing)
                throw new Error('Provider control process is stopping');
            return adapter;
        })
            .catch(async (error) => {
            try {
                await this.#stop(entry);
            }
            catch (cleanup) {
                throw new AggregateError([error, cleanup], 'Provider control startup and cleanup failed');
            }
            throw error;
        });
        return entry;
    }
    #listen(adapter, entry) {
        const current = () => !this.#closed && !entry.closing && this.#shared === entry;
        adapter.onUsageChanged(() => {
            if (current())
                this.usageChanged('codex');
        });
        adapter.on('login', (result) => {
            if (!current())
                return;
            const login = this.#logins.get('codex');
            if (login)
                this.#loginResult('codex', login, result);
            else if (result.loginId === null)
                this.#emitLogin('codex', result);
        });
        adapter.on('disconnected', () => {
            if (!current())
                return;
            const login = this.#logins.get('codex');
            // A start still in flight rejects with the dead process on its own.
            if (!login || login.loginId === undefined || login.expired)
                return;
            // The callback listener died with the process, so nothing is left to cancel.
            login.expired = true;
            this.#releaseLogin('codex', login);
            this.#emitLogin('codex', {
                loginId: login.loginId,
                success: false,
                error: 'Codex sign-in stopped because its helper process exited.',
            });
        });
        adapter.on('skillsChanged', () => {
            if (!current())
                return;
            for (const projectPath of this.#skills)
                this.#options.onSkillsChanged?.('codex', projectPath);
        });
        adapter.on('mcpChanged', () => {
            if (!current())
                return;
            for (const projectPath of this.#mcp)
                this.#options.onMcpChanged?.('codex', projectPath);
        });
    }
    async #sharedAdapter() {
        const generation = this.#generation;
        this.#assertOpen();
        for (const entry of this.#owned) {
            if (entry.closing)
                await this.#stop(entry);
        }
        this.#assertOpen(generation);
        this.#shared ??= this.#newProcess(true);
        return this.#shared.ready;
    }
    async #withShared(operation) {
        const generation = this.#generation;
        this.#assertOpen();
        clearTimeout(this.#idleTimer);
        this.#users += 1;
        try {
            const adapter = await this.#sharedAdapter();
            this.#assertOpen(generation);
            const result = await operation(adapter);
            this.#assertOpen(generation);
            return result;
        }
        finally {
            if (generation === this.#generation) {
                this.#users -= 1;
                this.#scheduleIdle();
            }
        }
    }
    async #withFresh(operation) {
        const generation = this.#generation;
        // Do not accumulate another process after an earlier one failed to stop.
        for (const entry of this.#owned) {
            if (entry.closing)
                await this.#stop(entry);
        }
        this.#assertOpen(generation);
        const entry = this.#newProcess(false);
        try {
            const adapter = await entry.ready;
            this.#assertOpen(generation);
            const result = await operation(adapter);
            this.#assertOpen(generation);
            return result;
        }
        finally {
            await this.#stop(entry);
        }
    }
    #stop(entry) {
        if (entry.stopped)
            return Promise.resolve();
        if (entry.stopping)
            return entry.stopping;
        entry.closing = true;
        const stopping = (async () => {
            // A failed factory owns no process; a failed dispose still does.
            const adapter = await entry.creating.catch(() => undefined);
            await adapter?.dispose();
            entry.stopped = true;
            this.#owned.delete(entry);
            if (this.#shared === entry)
                this.#shared = undefined;
        })();
        entry.stopping = stopping;
        void stopping.then(() => {
            entry.stopping = undefined;
        }, () => {
            entry.stopping = undefined;
        });
        return stopping;
    }
    #watch(provider, projectPath, targets) {
        this.#assertOpen();
        if (PROVIDER_CAPABILITIES[provider].notifications) {
            if (targets.includes('skills'))
                this.#skills.add(projectPath);
            if (targets.includes('mcp'))
                this.#mcp.add(projectPath);
            this.#scheduleIdle();
        }
        return { expiresInMs: this.#skills.ttlMs };
    }
    #scheduleIdle() {
        clearTimeout(this.#idleTimer);
        clearTimeout(this.#watchTimer);
        if (this.#closed)
            return;
        const expiries = [this.#skills.nextExpiry, this.#mcp.nextExpiry].filter((expiry) => expiry !== undefined);
        if (expiries.length) {
            this.#watchTimer = setTimeout(() => this.#scheduleIdle(), Math.max(1, Math.min(...expiries) - Date.now()));
            this.#watchTimer.unref?.();
        }
        if (!this.#shared || this.#users || this.#logins.has('codex') || expiries.length)
            return;
        this.#idleTimer = setTimeout(() => {
            const entry = this.#shared;
            if (!entry || this.#users || this.#logins.has('codex') || this.#skills.size || this.#mcp.size)
                return;
            void this.#stop(entry).catch(() => {
                this.#options.onLog?.('codex', 'Provider control process could not stop; cleanup can be retried.');
            });
        }, this.#idleMs);
        this.#idleTimer.unref?.();
    }
    #auth(provider, operation) {
        const generation = this.#generation;
        const result = (this.#authQueues.get(provider) ?? Promise.resolve()).then(() => {
            this.#assertOpen(generation);
            return operation(generation);
        });
        const settled = result.then(() => { }, () => { });
        this.#authQueues.set(provider, settled);
        void settled.then(() => {
            if (this.#authQueues.get(provider) === settled)
                this.#authQueues.delete(provider);
        });
        return result;
    }
    async #startOwnedLogin(provider, start, generation) {
        const previous = this.#logins.get(provider);
        if (previous)
            await this.#cancelOwnedLogin(provider, previous);
        this.#assertOpen(generation);
        const login = { expired: false, canceled: false, earlyResults: [] };
        this.#logins.set(provider, login);
        login.timer = setTimeout(() => {
            login.expired = true;
            if (!login.cancel)
                return;
            void this.#cancelOwnedLogin(provider, login).then(() => {
                if (this.#closed || generation !== this.#generation)
                    return;
                this.#options.onLogin?.(provider, {
                    loginId: login.loginId ?? null,
                    success: false,
                    error: 'Provider sign-in timed out.',
                });
            }, () => {
                if (this.#closed || generation !== this.#generation)
                    return;
                this.#options.onLog?.(provider, 'Provider sign-in could not stop; cleanup can be retried.');
                this.#options.onLogin?.(provider, {
                    loginId: login.loginId ?? null,
                    success: false,
                    error: 'Provider sign-in timed out.',
                });
            });
        }, this.#loginTtlMs);
        login.timer.unref?.();
        const starting = (async () => {
            try {
                const handle = await start((result) => this.#loginResult(provider, login, result));
                login.loginId = handle.loginId;
                login.cancel = handle.cancel;
                if (this.#closed ||
                    generation !== this.#generation ||
                    login.expired ||
                    this.#logins.get(provider) !== login) {
                    await this.#cancelOwnedLogin(provider, login);
                    throw new Error('Provider sign-in was canceled');
                }
                for (const result of login.earlyResults)
                    this.#loginResult(provider, login, result);
                login.earlyResults = [];
                return { loginId: handle.loginId, ...(handle.authUrl ? { authUrl: handle.authUrl } : {}) };
            }
            catch (error) {
                // Retain a handle whose cancellation failed for a later cleanup attempt.
                if (!login.cancel)
                    this.#releaseLogin(provider, login);
                throw error;
            }
        })();
        let startTimer;
        let timedOut = false;
        const deadline = new Promise((_resolve, reject) => {
            startTimer = setTimeout(() => {
                timedOut = true;
                reject(new Error('Provider sign-in did not start in time.'));
            }, this.#loginStartTimeoutMs);
            startTimer.unref?.();
        });
        try {
            return await Promise.race([starting, deadline]);
        }
        catch (error) {
            if (timedOut) {
                // A start that never answered would hold every later sign-in, sign-out
                // and shutdown behind it. Release the queue, but keep the late handle
                // owned so it is canceled when it finally arrives.
                login.expired = true;
                this.#releaseLogin(provider, login);
                this.#lateLogins.set(login, provider);
                void starting.then(() => this.#lateLogins.delete(login), () => {
                    if (!login.cancel || login.canceled)
                        this.#lateLogins.delete(login);
                });
            }
            throw error;
        }
        finally {
            clearTimeout(startTimer);
        }
    }
    #loginResult(provider, login, result) {
        if (this.#closed || login.expired || this.#logins.get(provider) !== login)
            return;
        if (login.loginId === undefined) {
            if (login.earlyResults.length < 16)
                login.earlyResults.push(result);
            return;
        }
        if (result.loginId !== login.loginId)
            return;
        if (provider === 'codex') {
            this.#releaseLogin(provider, login);
            this.#emitLogin(provider, result);
            return;
        }
        // A CLI leader can exit before its descendants. Confirm owned-tree
        // cleanup before its success notification can release this login handle.
        const generation = this.#generation;
        void this.#cancelOwnedLogin(provider, login).then(() => {
            if (!this.#closed && generation === this.#generation)
                this.#emitLogin(provider, result);
        }, () => {
            if (!this.#closed && generation === this.#generation) {
                this.#emitLogin(provider, {
                    loginId: result.loginId,
                    success: false,
                    error: 'Provider sign-in process could not stop.',
                });
            }
        });
    }
    #emitLogin(provider, result) {
        if (result.success)
            this.#authChanged(provider);
        this.#options.onLogin?.(provider, result);
    }
    #releaseLogin(provider, login) {
        clearTimeout(login.timer);
        if (this.#logins.get(provider) === login)
            this.#logins.delete(provider);
        this.#scheduleIdle();
    }
    #cancelLogin(provider, loginId) {
        return this.#auth(provider, async () => {
            const login = this.#logins.get(provider);
            if (login?.loginId === loginId)
                await this.#cancelOwnedLogin(provider, login);
        });
    }
    #cancelOwnedLogin(provider, login) {
        clearTimeout(login.timer);
        login.expired = true;
        if (login.canceled)
            return Promise.resolve();
        if (login.canceling)
            return login.canceling;
        // A pending start cancels its handle before it can return.
        if (!login.cancel)
            return Promise.resolve();
        const canceling = Promise.resolve()
            .then(login.cancel)
            .then(() => {
            login.canceled = true;
            this.#releaseLogin(provider, login);
        });
        login.canceling = canceling;
        void canceling.then(() => {
            login.canceling = undefined;
        }, () => {
            login.canceling = undefined;
        });
        return canceling;
    }
}
function duration(value, fallback, minimum) {
    return value !== undefined && Number.isFinite(value)
        ? Math.max(minimum, Math.min(2_147_483_647, Math.floor(value)))
        : fallback;
}
//# sourceMappingURL=provider-controls.js.map