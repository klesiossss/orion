export type WorkspaceInfo = {
    branch?: string;
    added: number;
    removed: number;
    dirtyFiles: number;
};
/**
 * Branch and uncommitted-change size for the composer shelf.
 *
 * Knowing which branch an agent is about to edit, and how much is already
 * uncommitted, is the difference between confidently sending a task and
 * checking a terminal first.
 *
 * Never throws: a folder that is not a repo is a normal case, not an error.
 */
export declare function readWorkspace(path: string): Promise<WorkspaceInfo>;
/** Local branches available to start work from, with the checked-out branch first. */
export declare function listWorkspaceBranches(path: string): Promise<string[]>;
/** Switch the project checkout without allowing an arbitrary git revision. */
export declare function switchWorkspaceBranch(path: string, branch: string): Promise<WorkspaceInfo>;
//# sourceMappingURL=workspace.d.ts.map