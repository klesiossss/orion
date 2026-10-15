import { EventEmitter } from 'node:events';
import type { Options as ClaudeQueryOptions, SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import type { ApprovalDecision, ApprovalMode, Capabilities, DomainEvent, McpServerConfig, Model, ProviderContextSettings, Thread } from '@harness/contracts';
import { type ClaudeQueryFactory, type ClaudeSpawn } from './sdk-runtime.js';
export { CLAUDE_CAPABILITIES } from './capabilities.js';
export declare const CLAUDE_MODELS: Model[];
/**
 * Ultracode is the top level of Claude's effort control, but it is not an API
 * effort. claude 2.1.296 reads it as the session-scoped `ultracode` flag setting:
 * xhigh effort plus standing dynamic-workflow orchestration. That is what its
 * own `--effort ultracode` alias resolves to, so this sends the same pair.
 */
export declare const CLAUDE_ULTRACODE_EFFORT = "ultracode";
export declare function claudeEffortOptions(effort: string | undefined): Pick<ClaudeQueryOptions, 'effort' | 'settings'>;
export type ClaudeAdapterEvents = {
    event: [DomainEvent];
    log: [string];
    usageChanged: [];
    disconnected: [];
};
export type ClaudeStartOptions = {
    instructions?: string | undefined;
    model?: string | undefined;
    effort?: string | undefined;
    approval?: ApprovalMode | undefined;
    ephemeral?: boolean | undefined;
    mcpServers?: McpServerConfig[] | undefined;
    mcpCredentials?: Record<string, string> | undefined;
    context?: ProviderContextSettings | undefined;
};
/**
 * Claude Code reads both settings from its environment: the window as a token
 * budget it clamps to the model's own, the compaction point as a percent that
 * can only bring compaction earlier. `DISABLE_AUTO_COMPACT` keeps a manual
 * /compact working, unlike `DISABLE_COMPACT`.
 */
export declare function claudeContextEnvironment(context: ProviderContextSettings | undefined): {
    DISABLE_AUTO_COMPACT: string;
    CLAUDE_CODE_AUTO_COMPACT_WINDOW?: string;
} | {
    CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: string;
    CLAUDE_CODE_AUTO_COMPACT_WINDOW?: string;
} | {
    CLAUDE_CODE_AUTO_COMPACT_WINDOW?: string;
};
export type ClaudeTurnOptions = Pick<ClaudeStartOptions, 'model' | 'effort'>;
/** Build one SDK user message; prompts and file contents never travel on argv. */
export declare function claudeUserMessage(text: string, attachments?: string[], sessionId?: string): SDKUserMessage;
export declare class ClaudeCodeAdapter extends EventEmitter<ClaudeAdapterEvents> {
    #private;
    constructor(options?: {
        createQuery?: ClaudeQueryFactory;
        spawn?: ClaudeSpawn;
        environment?: NodeJS.ProcessEnv;
        startupTimeoutMs?: number;
    });
    get capabilities(): Capabilities;
    onDisconnected(listener: () => void): () => void;
    startThread(workspacePath: string, options?: ClaudeStartOptions): Promise<Thread>;
    resumeThread(threadId: string, workspacePath: string, options?: ClaudeStartOptions): Promise<Thread>;
    sendTurn(threadId: string, text: string, attachments?: string[], options?: ClaudeTurnOptions): Promise<string>;
    steer(threadId: string, text: string, attachments?: string[]): Promise<void>;
    interrupt(): Promise<void>;
    setApproval(approval: ApprovalMode): Promise<void>;
    respondToApproval(approvalId: string, decision: ApprovalDecision): void;
    respondToUserInput(requestId: string, answers: Record<string, string[]>): void;
    /** Ask the installed Claude runtime for its live model inventory without sending a prompt. */
    listModels(): Promise<Model[]>;
    dispose(): Promise<void>;
}
//# sourceMappingURL=adapter.d.ts.map