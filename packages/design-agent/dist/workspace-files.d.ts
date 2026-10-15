export interface WorkspaceEntry {
    relative: string;
    file: boolean;
}
export declare function normalizeWorkspaceFile(file: string): string | undefined;
/** Traverse real directories only, with explicit limits instead of silently skipping work. */
export declare function workspaceEntries(workspacePath: string, ignoredDirectories?: ReadonlySet<string>): WorkspaceEntry[];
export declare function containedWorkspaceFile(workspacePath: string, relativePath: string, label: string, allowDirectory?: boolean): string;
/** Bound allocation and read through one descriptor; a growing file cannot bypass the limit. */
export declare function readWorkspaceFile(filePath: string, maxBytes: number): Buffer;
//# sourceMappingURL=workspace-files.d.ts.map