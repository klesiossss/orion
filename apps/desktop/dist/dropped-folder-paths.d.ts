export declare const MAX_DROPPED_PROJECT_PATHS = 128;
/**
 * Keeps only real folders from an operating-system file drop. The renderer
 * supplies paths obtained from Electron's webUtils bridge, but filesystem
 * validation stays in the trusted desktop process.
 */
export declare function droppedFolderPaths(candidatePaths: readonly string[]): Promise<string[]>;
//# sourceMappingURL=dropped-folder-paths.d.ts.map