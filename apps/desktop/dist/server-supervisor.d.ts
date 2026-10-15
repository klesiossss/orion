import { spawn } from 'node:child_process';
/**
 * The packaged app owns its core server. In development tools/scripts/dev.js
 * runs the server with a watcher and the shell must keep its hands off — that
 * is signalled by HARNESS_DEV_SERVER being set. Everywhere else, nothing would
 * start the server at all and every feature would sit behind a permanent
 * "Reconnecting…" — which is exactly how the first packaged build behaved.
 *
 * Supervision, not just spawning: a server that dies comes back with backoff,
 * and one that keeps dying stops being restarted so a broken install does not
 * burn CPU in a loop. The child is torn down with the app.
 */
/** Exponential backoff, capped: 0.5s, 1s, 2s, 4s, 8s, then 15s forever. */
export declare function restartDelayMs(consecutiveFailures: number): number;
/** After this many failures in a row the server is not coming back on its own. */
export declare const MAX_CONSECUTIVE_FAILURES = 8;
export declare const SERVER_SHUTDOWN_TIMEOUT_MS = 3000;
type SupervisorCallbacks = {
    onLog: (line: string) => void;
    /** Called once when the supervisor gives up, for a user-facing surface. */
    onGaveUp?: (() => void) | undefined;
};
type CommandSupervisorOptions = {
    command: string;
    args: string[];
    env: NodeJS.ProcessEnv;
    cwd?: string | undefined;
    spawnFn?: typeof spawn;
};
export type SupervisedServerProcess = {
    stdout: NodeJS.ReadableStream | null;
    stderr: NodeJS.ReadableStream | null;
    kill: () => boolean;
    requestShutdown?: () => void | Promise<void>;
    onError: (listener: (error: unknown) => void) => void;
    onExit: (listener: (code: number | null, signal: NodeJS.Signals | null) => void) => void;
};
type ProcessSupervisorOptions = {
    launch: () => SupervisedServerProcess;
};
export type SupervisorOptions = SupervisorCallbacks & (CommandSupervisorOptions | ProcessSupervisorOptions);
export declare class ServerSupervisor {
    #private;
    constructor(options: SupervisorOptions);
    /** True after restarts stopped and before a deliberate restart. */
    get gaveUp(): boolean;
    /** Starts again after giving up. Only a user action calls this, so it cannot loop. */
    restart(): boolean;
    start(): void;
    stop(): Promise<void>;
}
export {};
//# sourceMappingURL=server-supervisor.d.ts.map