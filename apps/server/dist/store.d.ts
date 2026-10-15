import type { ApprovalMode, BackgroundModelPreference, DiffDecision, DomainEvent, JsonValue, ProviderContextSettingsMap, ProviderId, ProviderHistorySession, SidebarSettings, SessionSearchResult, ThreadLifecycle, Usage } from '@harness/contracts';
import type { TurnOptions } from './adapters.js';
import { type InboxProjection } from './inbox-projection.js';
/**
 * Everything that has to survive a restart.
 *
 * Projects and sessions lived in the renderer's localStorage while the shell
 * was being designed. That made a session something a page reload could
 * destroy, and left a crash with nothing to recover from. The server owns them
 * now, and the renderer holds no durable state of its own.
 *
 * A thread is stored as its event log rather than as a rendered result. The
 * events are already the source of truth at runtime — persisting anything else
 * would mean maintaining a second description of the same thing and keeping
 * the two in agreement.
 *
 * `node:sqlite` rather than a native driver: we ship to Windows and macOS, and
 * a package needing node-gyp is a build failure waiting for whichever of us has
 * the wrong toolchain that week. It is marked experimental in Node 22, so the
 * API surface used here is deliberately small — `exec`, `prepare`, `run`, `all`
 * — and everything goes through this file, so replacing it is one file's work.
 */
export type StoredProject = {
    path: string;
    name: string;
    /** Pinned to the top of the rail. A choice the user made, so it persists. */
    pinned: boolean;
    createdAt: number;
};
export type StoredThread = {
    id: string;
    projectPath: string;
    provider: ProviderId;
    /** Custom harness id, when the thread runs one instead of the provider CLI. */
    agent?: string | undefined;
    /** Opaque provider-owned resume identity. Never used as the TasteCode id. */
    providerSessionId?: string | undefined;
    title: string;
    pinned: boolean;
    createdAt: number;
    /** Set when the session was closed. Kept, not deleted — history outlives use. */
    closedAt?: number | undefined;
    /**
     * The private checkout this session works in, when it was isolated. Stored
     * because a crash must not orphan a directory nobody remembers creating.
     */
    worktreePath?: string | undefined;
    worktreeBranch?: string | undefined;
    lifecycle: ThreadLifecycle;
    unread: boolean;
    lastActiveAt: number;
    /** Temporary fork owned by Side chat; never shown in project history. */
    ephemeral: boolean;
    /** Main conversation captured when an ephemeral Side chat was created. */
    parentThreadId?: string | undefined;
};
/** Only the fields sent by `projects.list`; recovery-only metadata stays in SQLite. */
export type StoredSidebarThread = {
    id: string;
    projectPath: string;
    provider: ProviderId;
    agent?: string | undefined;
    title: string;
    pinned: boolean;
    createdAt: number;
    closedAt?: number | undefined;
    worktreeBranch?: string | undefined;
    lifecycle: ThreadLifecycle;
    unread: boolean;
};
export type StoredCheckpoint = {
    id: number;
    threadId: string;
    /** Where in the conversation this belongs, so both halves roll back together. */
    seq: number;
    /** An unreferenced git commit holding the working tree. */
    commit: string;
    label: string;
    createdAt: number;
};
export type StoredQueuedTurn = {
    id: string;
    threadId: string;
    clientSubmissionId?: string | undefined;
    text: string;
    attachments: string[];
    options: TurnOptions;
    createdAt: number;
    intent: 'normal' | 'steer';
    /**
     * Push channel chosen when the item was queued. Rows written before the
     * channel was persisted omit it; readers fall back to the thread's stored
     * side-chat linkage instead of assuming the main channel.
     */
    channel?: 'main' | 'side' | undefined;
};
export type SessionSearchOptions = {
    query: string;
    projectPath?: string | undefined;
    provider?: ProviderId | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
};
export type SessionSearchPage = {
    results: SessionSearchResult[];
    nextCursor: string | null;
};
export type SerializedEventAppend = {
    seq: number;
    serializedEvent: string;
};
export type UsageSummary = {
    session: UsageTotal;
    today: UsageTotal;
};
type ReplayEntry = {
    seq: number;
    event: DomainEvent;
};
export declare class Store {
    #private;
    readonly checkpointNamespace: string;
    readonly location: string;
    /** `:memory:` in tests; a file under the user's data directory in the app. */
    constructor(location: string);
    close(): void;
    addProject(projectPath: string, name?: string): StoredProject;
    setPinned(projectPath: string, pinned: boolean): void;
    project(projectPath: string): StoredProject | undefined;
    projects(): StoredProject[];
    renameProject(projectPath: string, name: string): void;
    /** Hides the project from the sidebar. Re-adding it restores its chat history. */
    removeProject(projectPath: string): void;
    addThread(thread: Omit<StoredThread, 'createdAt' | 'pinned' | 'lifecycle' | 'unread' | 'lastActiveAt' | 'ephemeral'> & {
        createdAt?: number;
        ephemeral?: boolean;
    }): StoredThread;
    /**
     * Every worktree we ever created and have not forgotten.
     *
     * Read at startup: a crash leaves directories behind that nobody remembers,
     * and the record here is the only thing that knows they exist.
     */
    worktrees(): Array<{
        threadId: string;
        path: string;
        branch: string;
        repoPath: string;
    }>;
    addProviderThread(id: string, provider: ProviderId, session: ProviderHistorySession, projectPath?: string): void;
    forgetWorktree(threadId: string): void;
    thread(id: string): StoredThread | undefined;
    /** Newest first — the rail shows recent work at the top. */
    threads(projectPath?: string): StoredThread[];
    /** Compact metadata for the sidebar's all-thread refresh. */
    sidebarThreads(): StoredSidebarThread[];
    batchSidebarThreadUpdates<T>(operation: () => T): T;
    batchLifecycleUpdates<T>(operation: () => T): T;
    renameThread(id: string, title: string): void;
    setThreadPinned(id: string, pinned: boolean): void;
    /** Persist the provider's opaque resume identity as thread recovery metadata. */
    setProviderSessionId(id: string, providerSessionId: string): void;
    providerHistories(): Array<{
        provider: ProviderId;
        threadId: string;
        session: ProviderHistorySession;
        loadedRevision: string | null;
    }>;
    /** Include temporary tasks so provider discovery cannot publish their internal prompts. */
    nativeProviderThreads(provider: ProviderId): StoredThread[];
    /** Whether a client whose cursor is `seq` may still show events a restore removed. */
    historyRewrittenAfter(threadId: string, seq: number): boolean;
    providerHistoryChangedAfter(threadId: string, seq: number): boolean;
    saveProviderHistory(provider: ProviderId, threadId: string, session: ProviderHistorySession): void;
    /**
     * Saves a provider session as the thread's only history row. A Side chat's
     * tombstone is keyed by its TasteCode id until the provider reports its own
     * session id, and `thread_id` is unique, so the new key replaces the old row.
     */
    replaceProviderHistory(provider: ProviderId, threadId: string, session: ProviderHistorySession): void;
    /** Only locally recorded events, used to identify provider echoes of our own turns. */
    localHistory(threadId: string): Array<{
        seq: number;
        event: DomainEvent;
    }>;
    /** Keep stable log positions so imported updates cannot invalidate local checkpoints. */
    mergeProviderHistory(threadId: string, revision: string, entries: Array<{
        key: string;
        event: DomainEvent;
    }>): boolean;
    settleThread(id: string, reason: 'manual' | 'inactivity' | 'change_request', at?: number): ThreadLifecycle;
    settleInactiveThread(id: string, cutoff: number, at?: number): ThreadLifecycle | undefined;
    snoozeThread(id: string, wakeAt: number, at?: number): ThreadLifecycle;
    activateThread(id: string, at?: number): ThreadLifecycle;
    wakeSnoozedThread(id: string, dueAt: number, at?: number): ThreadLifecycle | undefined;
    setThreadKeepActive(id: string, keepActive: boolean, at?: number): ThreadLifecycle;
    touchThread(id: string, unread?: boolean, at?: number): ThreadLifecycle;
    markThreadRead(id: string): void;
    dueSnoozedThreadIds(now?: number): string[];
    inactiveThreadCandidates(cutoff: number): Array<{
        id: string;
        unread: boolean;
    }>;
    /** The next time a lifecycle refresh can change persisted state. */
    nextLifecycleRefreshAt(): number | undefined;
    sidebarSettings(): SidebarSettings;
    updateSidebarSettings(settings: Partial<SidebarSettings>): SidebarSettings;
    threadApproval(threadId: string): ApprovalMode | undefined;
    setThreadApproval(threadId: string, mode: ApprovalMode): void;
    backgroundModelPreference(): BackgroundModelPreference;
    updateBackgroundModelPreference(preference: BackgroundModelPreference): BackgroundModelPreference;
    providerContextSettings(): ProviderContextSettingsMap;
    updateProviderContextSettings(provider: ProviderId, settings: NonNullable<ProviderContextSettingsMap[ProviderId]>): ProviderContextSettingsMap;
    /**
     * Marks a session finished without discarding it. Closing a session ends the
     * process; it does not mean the user wanted the transcript gone.
     */
    closeThread(id: string): void;
    /** Clears the closed mark of an imported chat its provider can resume again. */
    reopenThread(id: string): void;
    deleteThread(id: string): void;
    historyStorage(): {
        databaseBytes: number;
        walBytes: number;
        reclaimableBytes: number;
        threads: number;
        closedThreads: number;
        events: number;
    };
    exportHistory(destination: string): void;
    /** No automatic retention: preview the exact eligible closed tasks before applying. */
    historyCleanupCandidates(before: number): string[];
    pruneHistory(before: number, archive: string): number;
    /**
     * Explicit maintenance: remove streamed text fragments that a later
     * completed event of the same item already contains in full. Replay reads
     * the completed text, so the transcript is unchanged. Delta-first recovery
     * sequences and imported provider records stay exact.
     */
    foldCompletedItemDeltas(): number;
    reclaimHistorySpace(): void;
    setDesignRun(threadId: string, payload: unknown): void;
    designRun(threadId: string): JsonValue | undefined;
    deleteDesignRun(threadId: string): void;
    queuedTurns(threadId: string): StoredQueuedTurn[];
    queuedThreadIds(): Set<string>;
    hasQueuedSubmission(threadId: string, clientSubmissionId: string): boolean;
    enqueueQueuedTurn(turn: Omit<StoredQueuedTurn, 'intent'>): void;
    deleteQueuedTurn(threadId: string, queueId: string): boolean;
    moveQueuedTurn(threadId: string, queueId: string, direction: 'up' | 'down'): boolean;
    claimQueuedTurn(threadId: string, queueId: string, intent: 'normal' | 'steer'): StoredQueuedTurn | undefined;
    restoreQueuedTurn(threadId: string, queueId: string): boolean;
    completeQueuedTurn(threadId: string, queueId: string): boolean;
    appendAndCompleteQueuedTurn(threadId: string, queueId: string, event: DomainEvent): SerializedEventAppend;
    clearQueuedTurns(threadId: string): void;
    clearAllQueuedTurns(): string[];
    setDiffDecision(threadId: string, targetId: string, decision: DiffDecision): void;
    diffDecision(threadId: string, targetId: string): DiffDecision | undefined;
    /**
     * Close event lifecycles that cannot still be live in this server process.
     *
     * Agent sessions and their approval callbacks are process-owned. Replaying a
     * request after restart can draw the old approval card, but accepting it can
     * never reach the callback that died with the previous process. Settle that
     * durable state before clients connect so history stays honest and the user
     * gets a clear next action instead of a button that does nothing.
     */
    recoverInterruptedThreads(): string[];
    /**
     * The terminal events for every lifecycle one thread's runtime left open.
     *
     * Restart recovery settles these for a dead process; a runtime force-stopped
     * while the server keeps running needs the same, or its turn and requests
     * stay open in the log until the next restart. The caller records them.
     */
    interruptedLifecycleEvents(threadId: string): DomainEvent[];
    /** Returns the sequence number, which is what a client resumes from. */
    append(threadId: string, event: DomainEvent): number;
    /** Return the exact stored JSON so the push path can reuse its encoding. */
    appendWithSerializedEvent(threadId: string, event: DomainEvent): SerializedEventAppend;
    /** Persist one window and retain each exact event encoding for its push. */
    appendBatchWithSerializedEvents(records: ReadonlyArray<{
        threadId: string;
        event: DomainEvent;
    }>): SerializedEventAppend[];
    hasUserSubmission(threadId: string, itemId: string): boolean;
    /**
     * The thread's history, optionally only what happened after `afterSeq`.
     *
     * A client that was connected and fell behind asks for the tail; one opening
     * the thread fresh asks for all of it. Same call either way.
     */
    history(threadId: string, afterSeq?: number): Array<{
        seq: number;
        event: DomainEvent;
    }>;
    /** Read the latest saved replay as an immutable base, even when a small tail is newer. */
    replaySnapshotBase(threadId: string): {
        seq: number;
        entries: ReplayEntry[];
    } | undefined;
    /**
     * The saved replay exactly as it stood at `seq`, even when newer events have
     * landed since. Every rewrite of older history deletes the snapshot, so a
     * replay still saved at that sequence describes the same older turns.
     */
    replaySnapshotAt(threadId: string, seq: number): ReplayEntry[] | undefined;
    /** Preserve SQLite's JSON for the first response after a process restart. */
    tailReplaySnapshotForResponse(threadId: string): {
        entries: ReplayEntry[];
        serializedEntries?: string | undefined;
    } | undefined;
    /**
     * Cache only renderer-ready derived data; the event log remains authoritative.
     * `readToEnd` marks a replay built from every stored row: it stays the latest
     * even when `seq` names an older event because the newest rows are unreadable
     * or retired.
     */
    saveReplaySnapshot(threadId: string, seq: number, entries: ReadonlyArray<{
        seq: number;
        event: DomainEvent;
    }>, options?: {
        readToEnd?: boolean;
    }): string;
    /** Build only non-default sidebar status rows in one database read. */
    inboxProjections(): Map<string, InboxProjection>;
    /** The final provider-owned patch shown for one turn. */
    turnDiff(threadId: string, turnId: string): string | undefined;
    searchSessions(options: SessionSearchOptions): SessionSearchPage;
    usageSummary(threadId: string, since: number): UsageSummary;
    recordCheckpointRepository(repoPath: string): void;
    checkpointRepositories(): string[];
    /** Include the hidden conversation tail needed to undo a restore. */
    checkpointReferences(): Array<{
        threadId: string;
        projectPath: string;
        worktreePath?: string;
        commits: Set<string>;
    }>;
    addCheckpoint(entry: {
        threadId: string;
        seq: number;
        commit: string;
        label: string;
    }): StoredCheckpoint;
    checkpoints(threadId: string): StoredCheckpoint[];
    checkpoint(id: number): StoredCheckpoint | undefined;
    threadNeedsRestoreContext(threadId: string): boolean;
    clearThreadRestoreContext(threadId: string): void;
    /** Save and remove the conversation tail so a restore remains reversible. */
    saveRestoreUndo(threadId: string, seq: number, commit: string): string;
    restoreUndo(threadId: string, token: string): {
        commit: string;
    } | undefined;
    /** Put back the exact event/checkpoint rows removed by the latest restore. */
    applyRestoreUndo(threadId: string, token: string): void;
    lastSeq(threadId: string): number;
}
export declare function createSearchSnippet(value: string, terms: readonly string[]): SessionSearchResult['snippet'];
type UsageTotal = Omit<Usage, 'contextWindow' | 'model' | 'cumulative' | 'inputIncludesCached'>;
export {};
//# sourceMappingURL=store.d.ts.map