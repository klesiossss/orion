import type { Options, Query, SDKMessage, SDKUserMessage, SpawnOptions, SpawnedProcess } from '@anthropic-ai/claude-agent-sdk';
import { spawnCli } from '@harness/proc';
/**
 * The SDK declares the `get_settings` control request and its runtime answers it
 * through `getSettings()`, but 0.3.232's `Query` type does not declare the method.
 * It stays optional so a runtime without it degrades instead of throwing.
 */
export type ClaudeSettingsReader = {
    getSettings?: () => Promise<unknown>;
};
export type ClaudeQueryRuntime = Pick<Query, 'close' | 'initializationResult' | 'interrupt' | 'setModel' | 'setPermissionMode' | 'supportedModels' | 'mcpServerStatus' | 'setMcpServers'> & ClaudeSettingsReader & AsyncIterable<SDKMessage>;
export type ClaudeQueryFactory = (input: {
    prompt: AsyncIterable<SDKUserMessage>;
    options: Options;
}) => ClaudeQueryRuntime;
export type ClaudeUsageQueryRuntime = Pick<Query, 'close' | 'usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET'>;
export type ClaudeUsageQueryFactory = (input: {
    prompt: AsyncIterable<SDKUserMessage>;
    options: Options;
}) => ClaudeUsageQueryRuntime;
export type ClaudeSpawn = typeof spawnCli;
export declare const createClaudeQuery: ClaudeQueryFactory;
export declare const createClaudeUsageQuery: ClaudeUsageQueryFactory;
/**
 * Let the Agent SDK own its protocol while TasteCode owns process creation.
 * `spawnCli` is the cross-platform boundary for npm `.cmd` launchers, and a
 * custom harness can replace it without losing its fixed arguments or env.
 */
export declare function claudeSdkSpawner(spawn?: ClaudeSpawn, onStderr?: (chunk: string) => void, onStop?: (stopped: Promise<void>) => void, onSpawn?: (child: ReturnType<ClaudeSpawn>) => void, onStderrEnd?: () => void): (options: SpawnOptions) => SpawnedProcess;
export declare function waitForAbort(signal: AbortSignal): AsyncGenerator<SDKUserMessage>;
//# sourceMappingURL=sdk-runtime.d.ts.map