import type { spawn as NodePtySpawn } from 'node-pty';
export type TerminalStatus = {
    status: 'running' | 'exited' | 'unknown';
    output: string;
    outputOffset: number;
    exitCode: number | null;
};
type SpawnPty = typeof NodePtySpawn;
/**
 * One POSIX process as `ps` reports it: its parent, process group, its
 * terminal's foreground group, its session, whether it leads that session, and
 * whether it has exited and only waits to be reaped.
 */
type ProcessRow = {
    pid: number;
    parent: number;
    group: number;
    foreground: number;
    /**
     * Only ever compared. Linux prints the session id; macOS prints 0 for every
     * process, so there the session re-check of a job guards nothing.
     */
    session: string;
    leader: boolean;
    zombie: boolean;
};
/** Reads and signals POSIX processes; injectable so tests need no real job. */
type Processes = {
    /**
     * These processes, read synchronously: a close has to learn which job holds
     * the terminal before node-pty hangs it up.
     */
    inspect(pids: number[]): ProcessRow[];
    /** Every process, or undefined when they cannot be listed. */
    list(): Promise<ProcessRow[] | undefined>;
    signal(group: number, signal: NodeJS.Signals): void;
};
/** One short output clock for every active terminal owned by a manager. */
export declare class TerminalOutputScheduler {
    #private;
    private readonly delayMs;
    constructor(delayMs?: number);
    schedule(buffer: TerminalOutputBuffer): void;
    cancel(buffer: TerminalOutputBuffer): void;
}
/**
 * Coalesce a burst of native PTY chunks into frame-sized renderer updates.
 * node-pty can emit thousands of tiny chunks during command output; forwarding
 * each one as its own JSON/WebSocket message costs far more than parsing the
 * same bytes in xterm. Interactive output still flushes within four
 * milliseconds, while sustained output flushes at 64 KiB to keep memory and
 * latency bounded.
 */
export declare class TerminalOutputBuffer {
    #private;
    private readonly emit;
    private readonly delayMs;
    private readonly maximumSize;
    private readonly scheduler?;
    constructor(emit: (data: string) => void, delayMs?: number, maximumSize?: number, scheduler?: TerminalOutputScheduler | undefined);
    push(data: string): void;
    flush(): void;
    dispose(): void;
}
export declare class TerminalManager {
    #private;
    constructor(handlers: {
        onOutput: (terminalId: string, data: string, outputOffset: number) => void;
        onExit: (terminalId: string, exitCode: number | null) => void;
        onLog?: (message: string) => void;
    }, options?: {
        spawnPty?: SpawnPty;
        processes?: Processes;
        closeTimeoutMs?: number;
    });
    open(threadId: string, cwd: string, columns: number, rows: number, terminalKey?: string): string;
    /**
     * Run one command to completion in a terminal. Keyed like a thread terminal
     * so a second request for the same key reattaches to the run in progress
     * instead of starting the command twice. A real pty rather than a plain
     * child process, so an installer that asks a question can be handed to the
     * user instead of hanging invisibly.
     */
    run(key: string, command: string, cwd: string, columns: number, rows: number): string;
    write(terminalId: string, data: string): void;
    status(terminalId: string): TerminalStatus;
    resize(terminalId: string, columns: number, rows: number): void;
    close(terminalId: string): Promise<void>;
    closeThread(threadId: string): Promise<void>;
    closeAll(): Promise<void>;
}
export declare function platformShell(platform?: NodeJS.Platform, environment?: NodeJS.ProcessEnv): string;
export declare function terminalEnvironment(environment?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export {};
//# sourceMappingURL=terminal.d.ts.map