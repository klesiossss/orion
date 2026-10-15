import type { CustomHarness } from '@harness/contracts';
import { spawnCli } from '@harness/proc/cli';
export type ResolvedCustomHarnessLaunch = {
    command: string;
    cwd: string;
    environment: NodeJS.ProcessEnv;
    workspacePath: string;
};
/**
 * Resolve a custom executable exactly as the desktop server will launch it.
 * Electron apps do not inherit an interactive login shell, so the PATH also
 * includes the conventional per-user locations where CLI shims are installed.
 */
export declare function resolveCustomHarnessLaunch(harness: CustomHarness, workspacePath?: string, adapterEnvironment?: NodeJS.ProcessEnv): ResolvedCustomHarnessLaunch;
/** Bind one user-owned command while keeping adapter-generated argv intact. */
export declare function customHarnessSpawn(harness: CustomHarness, fallbackWorkspacePath?: string): typeof spawnCli;
/** A short command using the same command/cwd/environment as real turns. */
export declare function runCustomHarness(harness: CustomHarness, workspacePath: string | undefined, protocolArgs: string[], timeoutMs?: number): Promise<{
    code: number | null;
    stdout: string;
}>;
export declare function actionableLaunchError(harness: CustomHarness, cause: unknown): Error;
/**
 * Later layers win. Windows variable names are case-insensitive, so a `Path`
 * in one layer replaces a `PATH` from an earlier one and only one spelling is
 * emitted; on other platforms the case is part of the name.
 */
export declare function mergeLaunchEnvironment(layers: NodeJS.ProcessEnv[], platform?: NodeJS.Platform): NodeJS.ProcessEnv;
//# sourceMappingURL=custom-harness-launch.d.ts.map