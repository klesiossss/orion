import { ChildProcess, type ChildProcessWithoutNullStreams, type SpawnOptions } from 'node:child_process';
export type KillableProcess = Pick<ChildProcess, 'exitCode' | 'signalCode' | 'pid' | 'kill'>;
/** Native executable spawn with a private process group on POSIX. */
export declare function spawnOwned(command: string, args: readonly string[], options?: SpawnOptions & {
    stdio?: 'pipe' | ['pipe', 'pipe', 'pipe'];
}): ChildProcessWithoutNullStreams;
export declare function spawnOwned(command: string, args: readonly string[], options: SpawnOptions): ChildProcess;
/** Terminate only a tree we own, then wait for bounded TERM/KILL escalation. */
export declare function killTree(child: KillableProcess): Promise<void>;
//# sourceMappingURL=kill.d.ts.map