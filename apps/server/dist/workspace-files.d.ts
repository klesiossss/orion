export type WorkspaceFileEntry = {
    name: string;
    path: string;
    kind: 'directory' | 'file';
    size: number;
    modifiedAt: number;
    restricted: boolean;
};
export type WorkspaceFileContents = {
    name: string;
    path: string;
    size: number;
    binary: boolean;
    truncated: boolean;
    content?: string;
};
/**
 * Lists one directory in a registered workspace. Directories are loaded on
 * demand so opening Files never walks node_modules or a monorepo eagerly.
 */
export declare function listWorkspaceDirectory(workspacePath: string, relativeDirectory?: string): Promise<{
    path: string;
    entries: WorkspaceFileEntry[];
}>;
/** Breadth-first search keeps unopened folders discoverable without an unbounded tree walk. */
export declare function searchWorkspaceFiles(workspacePath: string, query: string, limit?: number): Promise<{
    entries: WorkspaceFileEntry[];
    truncated: boolean;
}>;
export declare function compareWorkspaceEntries(left: WorkspaceFileEntry, right: WorkspaceFileEntry): number;
/** Reads at most two MiB of one public UTF-8 workspace file. */
export declare function readWorkspaceTextFile(workspacePath: string, relativeFile: string): Promise<WorkspaceFileContents>;
//# sourceMappingURL=workspace-files.d.ts.map