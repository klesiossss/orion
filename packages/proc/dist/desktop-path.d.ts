export type DesktopPathOptions = {
    platform?: NodeJS.Platform;
    home?: string;
    env?: NodeJS.ProcessEnv;
};
/**
 * PATH a GUI-launched desktop process can actually use.
 *
 * Finder, Explorer and Electron do not load a login shell, so user CLI shims
 * in `~/.local/bin`, Homebrew and npm global bins are missing even when the
 * same machine's terminal has them. Provider detection, `spawnCli` and the
 * PTY all read this PATH.
 */
export declare function desktopPath(current?: string | undefined, options?: DesktopPathOptions): string;
/** Put the desktop-safe PATH on an environment object, defaulting to this process. */
export declare function applyDesktopPath(env?: NodeJS.ProcessEnv): string;
//# sourceMappingURL=desktop-path.d.ts.map