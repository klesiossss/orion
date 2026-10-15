import { EventEmitter } from 'node:events';
import type { Account, ApprovalDecision, ApprovalMode, ApprovalRequest, ApprovalReview, Capabilities, DomainEvent, McpServer, McpServerConfig, Model, ProviderContextSettings, Skill, SkillDiscoveryError, Thread, Usage, UserInputRequest } from '@harness/contracts';
import { spawnCli, type JsonRpcRequestOptions, type JsonRpcValue, type ParsedJsonRpcRequestOptions, type ServerRequestHandler } from '@harness/proc';
import { type CodexRateLimitResponse, type CodexResetOutcome, type ApprovalParams, type ErrorNotification, type GuardianReviewNotification, type McpToolApprovalParams, type RequestPermissionProfile, type PermissionsRequestApprovalParams, type ThreadTokenUsageUpdatedNotification, type ToolRequestUserInputParams, type WarningNotification } from './schemas.js';
export { CODEX_CAPABILITIES } from './capabilities.js';
/** Provider state TasteCode either does not expose or already derives from shared events. */
export declare function isIgnorableCodexNotification(method: string): boolean;
export declare function formatCodexWarning(notification: WarningNotification): string;
export declare function mapCodexError(notification: ErrorNotification): DomainEvent | undefined;
export declare function mapCodexUsage(notification: ThreadTokenUsageUpdatedNotification, model?: string): Usage;
export type StartOptions = {
    instructions?: string | undefined;
    model?: string | undefined;
    serviceTier?: string | undefined;
    effort?: string | undefined;
    approval?: ApprovalMode | undefined;
    ephemeral?: boolean | undefined;
    context?: ProviderContextSettings | undefined;
};
/**
 * Codex takes both settings as config overrides, and counts the compaction
 * point in tokens rather than as a share of the window.
 */
export declare function codexContextConfig(context: ProviderContextSettings | undefined): {
    model_auto_compact_token_limit?: number;
    model_context_window?: number;
};
export type TurnOptions = Pick<StartOptions, 'model' | 'serviceTier' | 'effort'>;
type Spawn = typeof spawnCli;
export interface CodexRpc {
    onStderr(handler: (text: string) => void): void;
    onNotification(handler: (method: string, params: JsonRpcValue | undefined) => void): void;
    onServerRequest(handler: ServerRequestHandler): void;
    request(method: string, params?: unknown, options?: JsonRpcRequestOptions): Promise<JsonRpcValue | undefined>;
    request<Result>(method: string, params: unknown, options: ParsedJsonRpcRequestOptions<Result>): Promise<Result>;
    notify(method: string, params?: unknown): void;
    dispose(): void | Promise<void>;
}
export type ProviderLimit = {
    label: string;
    usedPercent: number;
    resetsAt?: number | undefined;
    valueLabel?: string | undefined;
    action?: 'consume-reset' | undefined;
    resetCredits?: {
        id?: string | undefined;
        expiresAt: number | null;
    }[] | undefined;
};
export type CodexLimitSource = {
    status: 'ready';
    limits: ProviderLimit[];
} | {
    status: 'unavailable';
};
/**
 * Our four user-facing modes onto Codex's approval policy and sandbox.
 *
 * `full` is genuinely dangerous, which is why the UI never makes it the quiet
 * default and never remembers it silently across sessions.
 */
export declare const CODEX_APPROVAL: {
    ask: {
        approvalPolicy: string;
        sandbox: string;
        approvalsReviewer: "user";
    };
    auto: {
        approvalPolicy: string;
        sandbox: string;
        approvalsReviewer: "user";
    };
    'auto-review': {
        approvalPolicy: string;
        sandbox: string;
        approvalsReviewer: "auto_review";
    };
    full: {
        approvalPolicy: string;
        sandbox: string;
        approvalsReviewer: "user";
    };
};
/**
 * Codex's wire schema allows blank text and any timeout; the shared contract
 * does not, and every consumer drops a request that fails it. Blank text is
 * filled from its neighbour, unlabelled options are dropped, and a timeout
 * the contract cannot carry is left out. Ids are answer keys Codex matches,
 * so they are never invented; the caller rejects what still does not fit.
 */
export declare function mapUserInputRequest(params: ToolRequestUserInputParams): UserInputRequest;
export declare function mapAutoApprovalReview(params: GuardianReviewNotification): ApprovalReview;
export declare function mapApprovalResponse(kind: ApprovalRequest['kind'], decision: ApprovalDecision, requested?: RequestPermissionProfile): CodexApprovalResponse;
type CodexApprovalResponse = {
    decision: string;
} | {
    permissions: Record<string, JsonRpcValue>;
    scope: 'session' | 'turn';
};
export declare function mapMcpToolApprovalResponse(decision: ApprovalDecision, rememberForSession: boolean): {
    action: "accept" | "decline" | "cancel";
    content: null;
    _meta: {
        persist: string;
    } | null;
};
export declare function mapMcpToolApprovalRequest(params: McpToolApprovalParams): ApprovalRequest;
type ParsedApprovalRequest = {
    kind: 'permissions';
    params: PermissionsRequestApprovalParams;
} | {
    kind: 'command' | 'file_change';
    params: ApprovalParams;
};
export declare function mapApprovalRequest(input: ParsedApprovalRequest): ApprovalRequest;
export declare function permissionInterruptParams(threadId: string, turnId: string): {
    threadId: string;
    turnId: string;
};
export type CodexAdapterEvents = {
    event: [DomainEvent];
    log: [string];
    /** Emitted when the browser half of an OAuth flow finishes. */
    login: [{
        loginId: string | null;
        success: boolean;
        error: string | null;
    }];
    mcpOAuth: [{
        serverId: string;
        loginId: string;
        success: boolean;
        error: string | null;
    }];
    mcpChanged: [{
        threadId?: string;
    }];
    skillsChanged: [];
    /** Provider-owned subscription usage changed; consumers should refetch. */
    usageChanged: [];
    /** Unexpected transport loss, after pending cards and active turns are settled. */
    disconnected: [];
};
export declare class CodexAdapter extends EventEmitter<CodexAdapterEvents> {
    #private;
    constructor(options?: {
        mcpServers?: McpServerConfig[];
        mcpCredentials?: Record<string, string>;
        spawn?: Spawn;
    });
    get capabilities(): Capabilities;
    /** Spawn the app-server and complete the handshake. Idempotent. */
    start(): Promise<void>;
    /**
     * Who is signed in, asked of the binary itself.
     *
     * We never read ~/.codex/auth.json. The binary owns its credentials and
     * answers questions about them; that is the whole compliance posture.
     */
    account(): Promise<Account>;
    /** Subscription availability and headroom, decided inside the adapter. */
    rateLimitSource(): Promise<CodexLimitSource>;
    /** Compatibility view while the orchestrator migrates to the richer source state. */
    rateLimits(): Promise<ProviderLimit[]>;
    /**
     * Spend one earned reset. The caller owns the idempotency key so a retry of
     * the same attempt cannot redeem a second credit.
     */
    consumeRateLimitReset(idempotencyKey: string, creditId?: string): Promise<CodexResetOutcome>;
    onUsageChanged(listener: () => void): void;
    onMcpChanged(listener: () => void): () => void;
    onDisconnected(listener: () => void): () => void;
    /**
     * Starts the vendor's own OAuth flow. Returns the URL to open in a browser —
     * the user authenticates on OpenAI's site, not in our window, and we are
     * never in a position to see the credential.
     */
    startLogin(): Promise<{
        loginId: string;
        authUrl: string;
    }>;
    cancelLogin(loginId: string): Promise<void>;
    /** Bring-your-own-key. The key is the user's to use with any client. */
    useApiKey(apiKey: string): Promise<Account>;
    signOut(): Promise<void>;
    /**
     * The real catalogue, from the provider. We never ship a hardcoded model list
     * — vendors add models constantly and a stale dropdown is worse than none.
     */
    listModels(): Promise<Model[]>;
    listMcpServers(threadId?: string): Promise<McpServer[]>;
    listSkills(projectPath: string): Promise<{
        skills: Skill[];
        errors: SkillDiscoveryError[];
    }>;
    setSkillEnabled(skillId: string, enabled: boolean): Promise<boolean>;
    startMcpOAuth(serverId: string, threadId: string): Promise<{
        loginId: string;
        authUrl: string;
    }>;
    onMcpOAuth(listener: (result: {
        serverId: string;
        loginId: string;
        success: boolean;
        error: string | null;
    }) => void): void;
    startThread(workspacePath: string, options?: StartOptions): Promise<Thread>;
    resumeThread(threadId: string, workspacePath: string, options?: Pick<StartOptions, 'instructions' | 'approval' | 'context'>): Promise<Thread>;
    setApproval(approval: ApprovalMode): Promise<void>;
    sendTurn(threadId: string, text: string, attachments?: string[], options?: TurnOptions): Promise<string>;
    interrupt(threadId: string): Promise<void>;
    /**
     * Answer a pending approval.
     *
     * The reply goes back on the exact JSON-RPC request that asked, which is why
     * the responder is held rather than the question re-derived — Codex is
     * blocked waiting on that specific id.
     */
    respondToApproval(approvalId: string, decision: ApprovalDecision): void;
    respondToUserInput(requestId: string, answers: Record<string, string[]>): void;
    /** Inject input without restarting the turn. Codex is one of the few engines that can. */
    steer(threadId: string, text: string, attachments?: string[]): Promise<void>;
    dispose(): Promise<void>;
}
/** Pure mapping kept separate from the app-server transport for fixture tests. */
export declare function mapCodexRateLimits(response: CodexRateLimitResponse): ProviderLimit[];
//# sourceMappingURL=adapter.d.ts.map