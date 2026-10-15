import { query } from '@anthropic-ai/claude-agent-sdk';
import { killTree, spawnCli } from '@harness/proc';
export const createClaudeQuery = (input) => query(input);
export const createClaudeUsageQuery = (input) => query(input);
/**
 * Let the Agent SDK own its protocol while TasteCode owns process creation.
 * `spawnCli` is the cross-platform boundary for npm `.cmd` launchers, and a
 * custom harness can replace it without losing its fixed arguments or env.
 */
export function claudeSdkSpawner(spawn = spawnCli, onStderr, onStop, onSpawn, onStderrEnd) {
    return (options) => {
        const child = spawn(options.command, options.args, {
            ...(options.cwd ? { cwd: options.cwd } : {}),
            env: options.env,
            replaceEnv: true,
        });
        onSpawn?.(child);
        const stop = () => {
            const stopped = killTree(child);
            onStop?.(stopped);
            return stopped;
        };
        const abort = () => {
            void stop();
        };
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => onStderr?.(chunk));
        child.stderr.once('end', () => onStderrEnd?.());
        child.stderr.resume();
        if (options.signal.aborted)
            abort();
        else
            options.signal.addEventListener('abort', abort, { once: true });
        child.once('exit', () => options.signal.removeEventListener('abort', abort));
        return {
            stdin: child.stdin,
            stdout: child.stdout,
            get killed() {
                return child.killed;
            },
            get exitCode() {
                return child.exitCode;
            },
            get signalCode() {
                return child.signalCode;
            },
            kill: () => {
                void stop();
                return true;
            },
            on: child.on.bind(child),
            once: child.once.bind(child),
            off: child.off.bind(child),
        };
    };
}
// oxlint-disable-next-line require-yield -- This prompt intentionally stays empty until abort.
export async function* waitForAbort(signal) {
    if (signal.aborted)
        return;
    await new Promise((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }));
}
//# sourceMappingURL=sdk-runtime.js.map