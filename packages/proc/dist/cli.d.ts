import { type ChildProcessWithoutNullStreams } from 'node:child_process';
/**
 * Spawn a CLI that may have been installed as an npm shim.
 *
 * On Windows, `codex` is `codex.cmd` and `claude` is `claude.cmd` — batch
 * files. `spawn('codex')` fails with EINVAL because CreateProcess cannot
 * execute a .cmd directly; it has to go through cmd.exe. This is the single
 * most common way a cross-platform agent wrapper breaks on Windows, so every
 * adapter shares this one implementation rather than each rediscovering it.
 *
 * Native executables bypass the shell. Batch shims need both Windows argv
 * quoting and cmd escaping; Node's default argv quoting alone is not enough.
 */
export declare function spawnCli(command: string, args: string[], options?: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    replaceEnv?: boolean;
}): ChildProcessWithoutNullStreams;
export declare function quoteCmdArgument(value: string, batch?: boolean): string;
/**
 * Whether a command exists on PATH.
 *
 * Asked with the platform's own lookup rather than by running the thing: agent
 * CLIs open browsers, start sessions, and print banners on first launch, none
 * of which is an acceptable side effect of drawing a list.
 */
export declare function isInstalled(command: string, environment?: NodeJS.ProcessEnv): Promise<boolean>;
/**
 * A CLI's own version string, or undefined if it will not say.
 *
 * Every vendor formats this differently and some print startup noise first, so
 * this takes the first line that contains a version-looking number rather than
 * trusting position. Reporting nothing beats reporting a deprecation warning as
 * if it were a version.
 */
export declare function commandVersion(command: string, timeoutMs?: number): Promise<string | undefined>;
/** Run a short, non-interactive CLI command and capture its public output. */
export declare function runCli(command: string, args: string[], timeoutMs?: number): Promise<{
    code: number | null;
    stdout: string;
    stderr?: string | undefined;
}>;
/**
 * Bound combined stdout/stderr before retaining bytes; settle only after owned cleanup.
 * stdin stays open: callers that send a request body write and end it themselves.
 */
export declare function captureCli(child: ChildProcessWithoutNullStreams, timeoutMs?: number, maxBytes?: number): Promise<CapturedCli>;
export type CapturedCli = {
    code: number | null;
    signal: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
};
//# sourceMappingURL=cli.d.ts.map