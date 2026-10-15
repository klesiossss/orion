/**
 * A private checkout per session.
 *
 * Two agents in one working directory overwrite each other's edits, and the
 * second one to write wins silently. A worktree gives each session its own
 * checkout of the same repository on its own branch, which is what makes
 * parallel work safe rather than merely concurrent.
 *
 * Everything here refuses rather than forces. An agent's work is the user's
 * work: losing it to a tidy-up is worse than leaving a directory behind.
 */
export type Worktree = {
    /** Absolute path to the private checkout. */
    path: string;
    branch: string;
    /** The repository it belongs to. */
    repoPath: string;
    /**
     * The selected project folder inside the checkout. Differs from `path` when
     * the project is a subfolder of its repository.
     */
    workPath?: string;
};
export declare class NotARepository extends Error {
    constructor(repoPath: string);
}
export declare class WorktreeDirty extends Error {
    readonly worktreePath: string;
    constructor(worktreePath: string);
}
export declare function isRepository(repoPath: string): Promise<boolean>;
/**
 * Create a worktree for a session.
 *
 * The branch is named after the session rather than the task, because at
 * creation time we have an id and not yet a topic — and a branch that silently
 * collides with an existing one would put two sessions on the same commits,
 * which is the thing this exists to prevent.
 */
export declare function createWorktree(repoPath: string, threadId: string, root: string, baseRef?: string): Promise<Worktree>;
/**
 * Remove a worktree, refusing if the agent left work behind.
 *
 * `force` is the user answering "yes, discard it" — never a default, and never
 * something we decide for them.
 */
export declare function removeWorktree(worktree: Worktree, force?: boolean): Promise<void>;
export declare function hasUncommittedChanges(worktreePath: string): Promise<boolean>;
/**
 * Forget worktrees whose directories no longer exist.
 *
 * A crash leaves git believing in a checkout that is gone, and the next
 * session on that path fails to start with a message about a path that is
 * "already registered" — an error about our own leftovers, shown to someone
 * who did nothing wrong.
 */
export declare function pruneWorktrees(repoPath: string): Promise<void>;
//# sourceMappingURL=worktree.d.ts.map