/**
 * Stable per-user directory backing TEMP/TMP/APPDATA for spawned commands.
 *
 * A fixed name inside the world-writable temp dir lets another local user
 * squat the path first; the uid suffix gives each user their own directory.
 */
export declare function commandRuntimeDirectory(): string;
/** Creates a user-only directory, refusing one another user created or redirected first. */
export declare function ensurePrivateDirectory(directory: string, label?: string): void;
export declare function safeCommandEnvironment(workspace: string, runtimeDir?: string): NodeJS.ProcessEnv;
//# sourceMappingURL=safe-command-environment.d.ts.map