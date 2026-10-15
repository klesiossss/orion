import type { ApprovalDecision, ApprovalMode, Capabilities, CustomHarness, CustomHarnessVerification, DomainEvent, McpServer, McpServerConfig, Model, ProviderContextSettings, ProviderId, Thread } from '@harness/contracts';
/**
 * One shape every engine is driven through.
 *
 * The orchestrator above this never learns which provider it is talking to.
 * That is the whole point of the layer: adding an engine is a new case here,
 * not a change to session handling, and capabilities tell the UI what to hide
 * rather than letting it guess.
 */
export type StartOptions = {
    instructions?: string | undefined;
    model?: string | undefined;
    serviceTier?: string | undefined;
    effort?: string | undefined;
    approval?: ApprovalMode | undefined;
    /** User-owned custom harness to launch instead of the provider's own CLI. */
    agent?: string | undefined;
    /** Provider-owned history should not retain product-internal background work. */
    ephemeral?: boolean | undefined;
    /**
     * Run this session in a private git worktree rather than in the project
     * folder itself, so two agents cannot overwrite each other.
     */
    isolate?: boolean | undefined;
    baseRef?: string | undefined;
    /** The user's context settings, already narrowed to what this engine declared. */
    context?: ProviderContextSettings | undefined;
    /** Internal project overrides and their already-resolved OS credentials. */
    mcpServers?: McpServerConfig[] | undefined;
    mcpCredentials?: Record<string, string> | undefined;
    /**
     * Server-owned, opaque provider resume identity. It is intentionally
     * separate from the stable TasteCode thread id passed to `resume`.
     */
    providerSessionId?: string | undefined;
};
export type TurnOptions = Pick<StartOptions, 'model' | 'serviceTier' | 'effort'>;
export interface AgentSession {
    readonly capabilities: Capabilities;
    sendTurn(threadId: string, text: string, attachments?: string[], options?: TurnOptions): Promise<string>;
    steer?(threadId: string, text: string, attachments?: string[]): Promise<void>;
    interrupt(threadId: string): Promise<void>;
    listMcpServers?(threadId?: string): Promise<McpServer[]>;
    reloadMcpServers?(threadId: string, servers: McpServerConfig[], credentials: Record<string, string>): Promise<void>;
    startMcpOAuth?(serverId: string, threadId: string): Promise<{
        loginId: string;
        authUrl: string;
    }>;
    onMcpOAuth?(listener: (result: {
        serverId: string;
        loginId: string;
        success: boolean;
        error: string | null;
    }) => void): void;
    /** Provider-owned subscription usage changed; the server should refetch. */
    onUsageChanged?(listener: () => void): void;
    /** Provider MCP discovery changed; the project inventory should be refreshed. */
    onMcpChanged?(listener: () => void): (() => void) | void;
    /**
     * False when the live session negotiated no way to reload it, so releasing an
     * idle runtime would lose it. Absent means the runtime's `resume` decides.
     */
    readonly resumable?: boolean;
    /** The session cannot accept more work; its terminal events have already been emitted. */
    onDisconnected?(listener: () => void): () => void;
    /** Provider reported or rotated the opaque identity needed after a restart. */
    onProviderSessionId?(listener: (providerSessionId: string) => void): void;
    respondToApproval(approvalId: string, decision: ApprovalDecision): void;
    respondToUserInput?(requestId: string, answers: Record<string, string[]>): void;
    /**
     * Apply an access-level change to the attached session, at least for its
     * next turn. An already running turn may retain its launch policy.
     * Sessions without this method must be replaced before their next turn.
     */
    setApproval?(approval: ApprovalMode): void | Promise<void>;
    dispose(): void | Promise<void>;
    on(event: 'event', listener: (event: DomainEvent) => void): void;
    on(event: 'log', listener: (line: string) => void): void;
}
export type ProviderRuntime = {
    start(workspacePath: string, options: StartOptions): Promise<{
        thread: Thread;
        session: AgentSession;
    }>;
    resume?(threadId: string, workspacePath: string, options: StartOptions): Promise<{
        thread: Thread;
        session: AgentSession;
    }>;
    listModels(agent?: string): Promise<Model[]>;
};
export declare function providerRuntime(provider: ProviderId, onLog: (line: string) => void, resolveHarness?: (id: string) => CustomHarness | undefined): ProviderRuntime;
/**
 * Side-effect-bounded compatibility check. Native integrations complete a
 * real handshake; one-shot CLIs run only their free discovery/help command,
 * never a model prompt.
 */
export declare function verifyCustomHarness(harness: CustomHarness, workspacePath?: string, onLog?: (line: string) => void): Promise<CustomHarnessVerification>;
//# sourceMappingURL=adapters.d.ts.map