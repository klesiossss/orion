export declare function existingWorkspacePath(workspace: string, relativePath: string, directory: boolean): string;
export declare function writableWorkspacePath(workspace: string, relativePath: string): string;
/** Whether every file of `workspace` is off limits because of where the folder itself is. */
export declare function isCredentialWorkspace(workspace: string): boolean;
/**
 * Only the workspace's own name and the part below it are checked by name: a
 * project that merely lives under a folder such as `gcloud` or `release.key` is
 * not itself a credential. A workspace opened directly on `~/.aws`, or anywhere
 * inside a credential folder such as `~/.aws` or `~/.config/gcloud`, still is.
 */
export declare function assertPublicWorkspaceFile(file: string, workspace?: string): void;
export declare function isSecretWorkspaceName(name: string): boolean;
//# sourceMappingURL=api-workspace-paths.d.ts.map