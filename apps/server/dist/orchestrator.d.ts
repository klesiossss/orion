import type { ReviewScreenshot } from '@harness/design-agent';
import { type ProviderRuntime, type StartOptions, type TurnOptions } from './runtime-loader.js';
import { type HistoryPage } from './history-page.js';
import type { Store, StoredCheckpoint } from './store.js';
import type { Account, ApprovalDecision, ApprovalMode, BackgroundModelPreference, BackgroundModelSettings, DiffDecision, DomainEvent, McpCapabilities, McpServer, McpServerConfig, Model, PanicStopResult, ParamsOf, ProviderContextSettings, ProviderContextSettingsMap, ProviderId, ProviderLimitSource, QueuedTurn, SessionDiff, Skill, SkillCapabilities, SkillDiscoveryError, Thread, ThreadInboxStatus, ThreadLifecycle } from '@harness/contracts';
import { McpConfigStore } from './mcp-config.js';
import { CustomHarnessStore } from './custom-harnesses.js';
import { type VoiceTranscriber } from './voice.js';
type RecordedEventHandler = (threadId: string, event: DomainEvent, seq: number, serializedEvent?: string) => void;
type HistoryEntry = {
    seq: number;
    event: DomainEvent;
};
type HistoryRead = {
    events: HistoryEntry[];
    serializedEvents?: string | undefined;
};
export type LifecycleScheduleHint = 'later' | number | undefined;
/** Push channel that owns a queued turn's events: the main thread stream or Side chat. */
type QueuedTurnChannel = 'main' | 'side';
type UserSubmission = {
    id: string;
    text: string;
    attachments: string[];
    createdAt: number;
    queueId?: string;
    /** Push channel chosen when a queued item was submitted. */
    channel?: QueuedTurnChannel;
};
type QueueState = {
    items: QueuedTurn[];
    canSteer: boolean;
};
export declare function resolveWorkspacePath(workspacePath: string): string;
/**
 * Owns every live agent session.
 *
 * Sessions are independent: each has its own adapter and child process, and a
 * turn running in one does not block another. The only thing they share is
 * this map and the store.
 *
 * Every event is written to the log before it is broadcast. That ordering
 * matters — a client that reconnects mid-turn replays from the log, and an
 * event that went out but was never recorded would be one the client can never
 * get back.
 */
export declare class Orchestrator {
    #private;
    constructor(store: Store, handlers: {
        onEvent: RecordedEventHandler;
        onSideEvent?: RecordedEventHandler;
        onQueue?: (threadId: string, state: QueueState) => void;
        onLog: (line: string) => void;
        onLogin: (provider: ProviderId, result: {
            loginId: string | null;
            success: boolean;
            error: string | null;
        }) => void;
        onMcpOAuth?: (provider: ProviderId, projectPath: string, result: {
            serverId: string;
            loginId: string;
            success: boolean;
            error: string | null;
        }) => void;
        onMcpChanged?: (provider: ProviderId, projectPath: string) => void;
        onSkillsChanged?: (provider: ProviderId, projectPath: string) => void;
        onUsageChanged?: (provider: ProviderId) => void;
        onLifecycle?: (threadId: string, lifecycle: ThreadLifecycle) => void;
        onLifecycleScheduleChanged?: (hint?: LifecycleScheduleHint) => void;
        capturePreview?: (url: string, viewports: Array<{
            width: number;
            height: number;
        }>, signal?: AbortSignal) => Promise<ReviewScreenshot[] | undefined>;
        /** Ports a Design preview must never serve on: the app's own. */
        reservedPreviewPorts?: ReadonlySet<number>;
        mcpConfig?: McpConfigStore;
        customHarnesses?: CustomHarnessStore;
        readCredential?: (reference: string) => string;
        voiceTranscriber?: VoiceTranscriber;
        onTerminalOutput?: (terminalId: string, data: string, outputOffset: number) => void;
        onTerminalExit?: (terminalId: string, exitCode: number | null) => void;
        runtimeFor?: (provider: ProviderId, onLog: (line: string) => void) => ProviderRuntime;
        /** Test override for the hardware-scaled warm idle runtime limit. */
        maxIdleThreadRuntimes?: number;
        /** Test override for the shared idle runtime expiry window. */
        idleThreadRuntimeMs?: number;
        /** Test override for releasing one-shot Codex control processes. */
        controlIdleMs?: number;
        /** Where isolated checkouts live. Outside any repository, on purpose. */
        worktreeRoot?: string;
    });
    watchProvider(provider: ProviderId, projectPath: string, targets: Array<'skills' | 'mcp'>): {
        expiresInMs: number;
    };
    listModels(provider: ProviderId, agent?: string): Promise<Model[]>;
    listCustomHarnesses(): {
        id: string;
        displayName: string;
        provider: "codex" | "claude-code" | "grok";
        command: string;
        args: string[];
        workingDirectory?: string | undefined;
        environment?: Record<string, string> | undefined;
    }[];
    upsertCustomHarness(harness: Parameters<CustomHarnessStore['upsert']>[0]): {
        id: string;
        displayName: string;
        provider: "codex" | "claude-code" | "grok";
        command: string;
        args: string[];
        workingDirectory?: string | undefined;
        environment?: Record<string, string> | undefined;
    };
    verifyCustomHarness(harness: Parameters<CustomHarnessStore['upsert']>[0], workspacePath?: string): Promise<{
        status: "error" | "ready" | "warning";
        summary: string;
        checkedAt: number;
        checks: {
            label: string;
            status: "failed" | "warning" | "passed";
            detail: string;
        }[];
        resolvedCommand?: string | undefined;
    }>;
    removeCustomHarness(harnessId: string): void;
    contextSettings(): ProviderContextSettingsMap;
    updateContextSettings(provider: ProviderId, settings: ProviderContextSettings): ProviderContextSettingsMap;
    backgroundModelSettings(): Promise<BackgroundModelSettings>;
    updateBackgroundModelPreference(preference: BackgroundModelPreference): Promise<BackgroundModelSettings>;
    generateBackgroundTitle(threadId: string, request: string, expectedTitle: string): Promise<{
        title: string;
        applied: boolean;
    }>;
    generateBackgroundCommitMessage(diff: SessionDiff): Promise<string>;
    listMcpServers(provider: ProviderId, projectPath: string): Promise<{
        capabilities: McpCapabilities;
        servers: McpServer[];
    }>;
    listSkills(provider: ProviderId, projectPath: string): Promise<{
        capabilities: SkillCapabilities;
        skills: Skill[];
        errors: SkillDiscoveryError[];
    }>;
    setSkillEnabled(provider: ProviderId, projectPath: string, skillId: string, enabled: boolean): Promise<boolean>;
    installSkillFromFolder(provider: ProviderId, projectPath: string, folderPath: string): Promise<Skill>;
    addMcpServer(provider: ProviderId, projectPath: string, server: McpServerConfig): void;
    updateMcpServer(provider: ProviderId, projectPath: string, server: McpServerConfig): void;
    removeMcpServer(provider: ProviderId, projectPath: string, serverId: string): void;
    reloadMcpServers(provider: ProviderId, projectPath: string): Promise<void>;
    startMcpOAuth(provider: ProviderId, projectPath: string, serverId: string): Promise<{
        loginId: string;
        authUrl: string;
    }>;
    cancelMcpOAuth(provider: ProviderId): never;
    account(provider: ProviderId, agent?: string): Promise<Account>;
    consumeRateLimitReset(provider: ProviderId, idempotencyKey: string, creditId?: string): Promise<{
        outcome: 'reset' | 'nothingToReset' | 'noCredit' | 'alreadyRedeemed';
    }>;
    usageLimitSource(provider: ProviderId): Promise<ProviderLimitSource>;
    startLogin(provider: ProviderId): Promise<{
        loginId: string;
        authUrl?: string;
    }>;
    cancelLogin(provider: ProviderId, loginId: string): Promise<void>;
    useApiKey(provider: ProviderId, apiKey: string): Promise<Account>;
    signOut(provider: ProviderId, agent?: string): Promise<void>;
    voiceStatus(provider: ProviderId): Promise<{
        available: boolean;
        reason?: 'provider_unsupported' | 'sign_in_required' | 'unsupported_auth' | 'codex_too_old';
    }>;
    transcribeVoice(input: ParamsOf<'voice.transcribe'>): Promise<{
        text: string;
    }>;
    cancelVoice(requestId: string): void;
    startThread(provider: ProviderId, workspacePath: string, options?: StartOptions): Promise<Thread>;
    switchBranch(workspacePath: string, branch: string): Promise<import("./workspace.js").WorkspaceInfo>;
    /**
     * Starts one temporary conversation at the current parent boundary.
     *
     * This deliberately uses the same adapter start path for every provider.
     * Native fork APIs are uneven and would make Side chat silently weaker on
     * exactly the providers the shared UI promises to support.
     */
    startSideThread(parentThreadId: string, options?: Pick<StartOptions, 'model' | 'serviceTier' | 'effort' | 'approval'>): Promise<Thread>;
    sendTurn(threadId: string, text: string, attachments?: string[], options?: TurnOptions, submission?: UserSubmission): Promise<string>;
    /** Send now when idle, otherwise put the prompt behind the active turn. */
    submitTurn(threadId: string, text: string, attachments?: string[], options?: TurnOptions, clientSubmissionId?: string): Promise<{
        queued: false;
        turnId: string;
    } | {
        queued: true;
        queuedTurn: QueuedTurn;
    }>;
    queue(threadId: string): QueueState;
    deleteQueuedTurn(threadId: string, queuedTurnId: string): void;
    moveQueuedTurn(threadId: string, queuedTurnId: string, direction: 'up' | 'down'): void;
    steerQueuedTurn(threadId: string, queuedTurnId: string): Promise<void>;
    /** A thread's history, for a client opening or reattaching to it. */
    history(threadId: string, afterSeq?: number): Promise<HistoryEntry[]>;
    /** Preserve fresh snapshot JSON so the server does not encode a long replay twice. */
    historyForResponse(threadId: string, afterSeq?: number): Promise<HistoryRead>;
    /** Newest whole turns first; `before` walks back through the same compact replay. */
    historyPage(threadId: string, request: {
        before?: string | undefined;
        turnLimit?: number | undefined;
    }): Promise<HistoryPage>;
    diff(threadId: string): Promise<SessionDiff>;
    /** Reverse only the exact provider patch shown in the latest edit block. */
    undoTurnChanges(threadId: string, turnId: string, expectedDiff: string): Promise<void>;
    reviewHunk(threadId: string, version: string, filePath: string, hunkId: string, decision: DiffDecision): Promise<SessionDiff>;
    reviewFile(threadId: string, version: string, filePath: string, decision: DiffDecision): Promise<SessionDiff>;
    /** Whether a session is still live, as opposed to merely on record. */
    isRunning(threadId: string): boolean;
    /** Whether the agent is inside a turn, rather than merely attached to the session. */
    isTurnRunning(threadId: string): boolean;
    /** Changes only when an in-memory value used by `projects.list` can change. */
    sidebarStatusRevision(): number;
    /** Exact changed rows for an incremental projects.list projection, when still retained. */
    sidebarStatusChangesSince(revision: number): readonly string[] | undefined;
    inboxStatus(threadId: string, queued?: boolean, unread?: boolean): ThreadInboxStatus;
    /** Remove sparse read-model state after the owning durable thread is deleted. */
    invalidateImportedHistory(threadId: string): void;
    forgetDeletedThread(threadId: string): void;
    settleThread(threadId: string): ThreadLifecycle;
    unsettleThread(threadId: string): ThreadLifecycle;
    snoozeThread(threadId: string, wakeAt: number): ThreadLifecycle;
    unsnoozeThread(threadId: string): ThreadLifecycle;
    setThreadKeepActive(threadId: string, keepActive: boolean): ThreadLifecycle;
    markThreadRead(threadId: string): void;
    refreshLifecycle(now?: number): void;
    openTerminal(threadId: string, columns: number, rows: number, terminalKey?: string): string;
    openProjectTerminal(projectPath: string, columns: number, rows: number, terminalKey?: string): string;
    /**
     * Run a provider install command in its own terminal session. Keyed by
     * target so clicking install twice attaches to the run already going, and
     * rooted in the home directory because a global CLI install has no business
     * inside any particular project checkout.
     */
    installProvider(target: string, command: string, columns: number, rows: number): string;
    /**
     * Run a provider's interactive sign-in CLI in its own terminal session.
     * Keyed by target so a second Sign in click reattaches to the session
     * already going, and rooted in the home directory because signing in to a
     * global CLI has no business inside any particular project checkout.
     */
    launchProviderLogin(target: string, command: string, columns: number, rows: number): string;
    writeTerminal(terminalId: string, data: string): void;
    resizeTerminal(terminalId: string, columns: number, rows: number): void;
    closeTerminal(terminalId: string): Promise<void>;
    /**
     * Start closing every terminal. Server shutdown calls this before anything
     * else: terminal jobs get a fixed budget inside the desktop's force stop,
     * and disposeAll later waits for this same close.
     */
    closeAllTerminals(): Promise<void>;
    terminalStatus(terminalId: string): import("./terminal.js").TerminalStatus;
    checkpoints(threadId: string): StoredCheckpoint[];
    /**
     * Put a session back to a checkpoint — files and conversation together.
     *
     * Returns where the replaced state was saved, because restoring is itself an
     * action someone can regret. Nothing reachable this way is unrecoverable.
     */
    restoreCheckpoint(threadId: string, checkpointId: number): Promise<{
        undo: string;
    }>;
    /** Reverse the latest restore, including both files and conversation. */
    undoRestore(threadId: string, token: string): Promise<void>;
    /** What the agent has changed since a checkpoint, so a restore is informed. */
    changedSinceCheckpoint(threadId: string, checkpointId: number): Promise<string[]>;
    /** Upgrade saved checkpoints from versions that did not create Git refs. */
    protectStoredCheckpoints(): Promise<void>;
    respondToApproval(threadId: string, approvalId: string, decision: ApprovalDecision): void;
    /**
     * Change a thread's access level. Persisted threads are resumed with the
     * selected mode; attached sessions receive the change directly when their
     * adapter supports it.
     */
    setThreadApproval(threadId: string, approval: ApprovalMode): Promise<void>;
    respondToUserInput(threadId: string, requestId: string, answers: Record<string, string[]>): void;
    interrupt(threadId: string): Promise<void>;
    /** Overlapping callers share one stop, so none can lift the guard while another still runs. */
    panicStop(): Promise<PanicStopResult>;
    close(threadId: string): Promise<void>;
    /**
     * Ends a chat's agent process without archiving the chat, so the next
     * message resumes it. Removing a project uses this: the project can be added
     * back, and its chats must still accept messages then.
     */
    stopThread(threadId: string): Promise<void>;
    closeSideThread(threadId: string): Promise<void>;
    /**
     * Whether a session's private checkout still holds work nobody has seen.
     *
     * Asked before offering to discard it, so the choice is put to the user in
     * terms of what they would lose rather than as a routine tidy-up.
     */
    hasUnsavedWork(threadId: string): Promise<boolean>;
    /**
     * Remove a session's private checkout.
     *
     * Refuses when the agent left uncommitted work unless `force` — which is the
     * user answering "yes, discard it", never a default. The branch is kept
     * either way; it holds whatever was committed.
     */
    discardWorktree(threadId: string, force?: boolean): Promise<void>;
    /**
     * Clear up after a crash.
     *
     * A process killed mid-session leaves git believing in checkouts that are
     * gone, and the next session on that path fails with a message about a path
     * being "already registered" — our leftovers, reported to someone who did
     * nothing wrong. Git can forget the stale registration, but the chat keeps
     * its private path so it cannot silently resume in the main project.
     */
    recoverWorktrees(): Promise<void>;
    disposeAll(): Promise<void>;
    /** Drop per-project watch state when a project leaves the sidebar. */
    forgetProject(projectPath: string): void;
}
export {};
//# sourceMappingURL=orchestrator.d.ts.map