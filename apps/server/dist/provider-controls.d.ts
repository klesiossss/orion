import type { CodexAdapter } from '@harness/adapter-codex';
import type { Account, McpCapabilities, McpServer, McpServerConfig, Model, ProviderId, ProviderLimit, ProviderLimitSource, Skill, SkillCapabilities, SkillDiscoveryError } from '@harness/contracts';
import { type ProviderControlCapabilities } from './provider-capabilities.js';
export type ProviderLoginResult = {
    loginId: string | null;
    success: boolean;
    error: string | null;
};
type LoginResponse = {
    loginId: string;
    authUrl?: string;
};
type LoginHandle = LoginResponse & {
    cancel: () => Promise<void>;
};
type LimitSource = {
    status: 'ready';
    limits: ProviderLimit[];
} | {
    status: 'unavailable';
};
type WatchTarget = 'skills' | 'mcp';
/** Only this settings surface is required of an injected control process. */
export type CodexControlAdapter = Pick<CodexAdapter, 'start' | 'dispose' | 'onUsageChanged' | 'account' | 'listModels' | 'listMcpServers' | 'listSkills' | 'setSkillEnabled' | 'rateLimitSource' | 'consumeRateLimitReset' | 'startLogin' | 'cancelLogin' | 'useApiKey' | 'signOut'> & {
    on(event: 'log', listener: (line: string) => void): void;
    on(event: 'login', listener: (result: ProviderLoginResult) => void): void;
    on(event: 'skillsChanged' | 'mcpChanged' | 'disconnected', listener: () => void): void;
};
/** Injectable readers keep auth tests independent of installed CLIs and credentials. */
export type ProviderServices = {
    validateMcpServer?: (server: McpServerConfig) => void;
    account?: (agent?: string) => Promise<Account>;
    usageLimitSource?: () => Promise<LimitSource>;
    startLogin?: (onComplete: (result: ProviderLoginResult) => void) => LoginHandle | Promise<LoginHandle>;
    signOut?: (agent?: string) => Promise<void>;
};
export type ProviderControl = {
    capabilities: ProviderControlCapabilities;
    validateMcpServer?: (server: McpServerConfig) => void;
    account(agent?: string): Promise<Account>;
    usageLimitSource(): Promise<ProviderLimitSource>;
    signOut(agent?: string): Promise<void>;
    watch(projectPath: string, targets: WatchTarget[]): {
        expiresInMs: number;
    };
    listModels?: (agent?: string) => Promise<Model[]>;
    listMcpServers?: (readActive?: () => Promise<McpServer[]>) => Promise<{
        capabilities: McpCapabilities;
        servers: McpServer[];
    }>;
    listSkills?: (projectPath: string) => Promise<{
        capabilities: SkillCapabilities;
        skills: Skill[];
        errors: SkillDiscoveryError[];
    }>;
    setSkillEnabled?: (projectPath: string, skillId: string, enabled: boolean) => Promise<boolean>;
    startLogin?: () => Promise<LoginResponse>;
    cancelLogin?: (loginId: string) => Promise<void>;
    useApiKey?: (apiKey: string) => Promise<Account>;
    consumeRateLimitReset?: (idempotencyKey: string, creditId?: string) => Promise<{
        outcome: 'reset' | 'nothingToReset' | 'noCredit' | 'alreadyRedeemed';
    }>;
};
export type ProviderControlsOptions = {
    /** Runtime injection also handles custom harness model discovery. */
    listModels: (provider: ProviderId, agent?: string) => Promise<Model[]>;
    onLog?: (provider: ProviderId, line: string) => void;
    onLogin?: (provider: ProviderId, result: ProviderLoginResult) => void;
    onUsageChanged?: (provider: ProviderId) => void;
    onMcpChanged?: (provider: ProviderId, projectPath: string) => void;
    onSkillsChanged?: (provider: ProviderId, projectPath: string) => void;
    onAuthChanged?: (provider: ProviderId) => void;
    controlIdleMs?: number;
    watchTtlMs?: number;
    loginTtlMs?: number;
    /** How long a sign-in may take to return its URL before later auth work proceeds. */
    loginStartTimeoutMs?: number;
    /** How long a successful limit read answers later reads without a change signal. */
    limitCacheMs?: number;
    /** Minimum spacing of forwarded usage-change signals per provider. */
    limitChangeIntervalMs?: number;
    createCodex?: () => CodexControlAdapter | Promise<CodexControlAdapter>;
    services?: Partial<Record<ProviderId, ProviderServices>>;
};
/** Vendor settings and the processes that serve them have one owner. */
export declare class ProviderControls {
    #private;
    constructor(options: ProviderControlsOptions);
    forProvider(provider: ProviderId): ProviderControl;
    forgetProject(projectPath: string): void;
    /**
     * Marks cached limits stale and forwards the signal at a bounded rate: the
     * first change notifies at once, a burst after it collapses into one
     * trailing notification per interval.
     */
    usageChanged(provider: ProviderId, immediate?: boolean): void;
    /** Failed cleanup retains ownership, so a subsequent call can retry it. */
    disposeAll(): Promise<void>;
}
export {};
//# sourceMappingURL=provider-controls.d.ts.map