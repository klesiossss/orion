/**
 * A point a session can be returned to.
 *
 * An agent that has gone the wrong way for five turns leaves the user undoing
 * it by hand. A checkpoint is a snapshot of the working tree taken before the
 * agent writes, plus the point in the conversation it belongs to, so going back
 * puts both halves right rather than only one.
 *
 * Snapshots are real git commit objects protected by app-owned refs — they do not
 * appear in the log, on a branch, or in `git status`. Nothing here changes what
 * the user would see in their own terminal until they ask to restore.
 *
 * The rule that makes this safe: **restoring takes a snapshot first**. Whatever
 * state is being replaced becomes a checkpoint of its own, so no sequence of
 * restores can reach a state nobody can get back to.
 */
export type Snapshot = {
    /** A commit holding the tree, protected from Git garbage collection. */
    commit: string;
    /** True when there was nothing to record — a clean tree at HEAD. */
    clean: boolean;
};
export declare class NotARepositoryForCheckpoint extends Error {
    constructor(repoPath: string);
}
export declare class RestoreSnapshotError extends AggregateError {
    readonly snapshot: Snapshot;
    constructor(snapshot: Snapshot, errors: unknown[]);
}
/**
 * Capture the working tree, including files git is not tracking yet.
 *
 * Staging into a temporary index rather than the real one: `git add -A` would
 * otherwise stage the user's work as a side effect of us taking a backup, and
 * they would find their own staging area rearranged by something they did not
 * do.
 */
export declare function takeSnapshot(repoPath: string): Promise<Snapshot>;
/**
 * What a working tree is compared against: HEAD and its tree, or only the empty
 * tree in a repository whose first commit does not exist yet.
 */
export declare function snapshotBase(repoPath: string): Promise<{
    head: string | undefined;
    tree: string;
}>;
/**
 * Put the working tree back to a snapshot.
 *
 * Returns a snapshot of what was replaced, so the caller can offer to undo the
 * undo. Files the agent created after the checkpoint are removed — that is what
 * "go back" means — but they are inside the returned snapshot, so nothing is
 * actually gone.
 */
export declare function restoreSnapshot(repoPath: string, commit: string, namespace?: string): Promise<Snapshot>;
/** Files that differ between a snapshot and the working tree right now. */
export declare function changedSince(repoPath: string, commit: string): Promise<string[]>;
export declare function retainCheckpoint(repoPath: string, namespace: string, commit: string): Promise<void>;
/** Worktrees share refs and objects even though their writable checkouts are separate. */
export declare function checkpointRepository(repoPath: string): Promise<string>;
/** Startup migration writes only missing refs, in bounded Git transactions. */
export declare function retainCheckpoints(repoPath: string, namespace: string, commits: ReadonlySet<string>): Promise<void>;
/** Explicit offline maintenance can discard diff caches after durable refs are protected. */
export declare function clearSnapshotRefs(repoPath: string): Promise<void>;
/** Called after explicit history cleanup. Other databases' references stay intact. */
export declare function syncCheckpointRefs(repoPath: string, namespace: string, commits: ReadonlySet<string>): Promise<void>;
//# sourceMappingURL=checkpoint.d.ts.map