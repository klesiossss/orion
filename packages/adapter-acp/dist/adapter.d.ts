import { EventEmitter } from 'node:events';
import type { ApprovalDecision, ApprovalMode, Capabilities, DomainEvent, ProviderId, Thread } from '@harness/contracts';
import { spawnCli, type JsonRpcRequestOptions, type JsonRpcValue, type ParsedJsonRpcRequestOptions, type ServerRequestHandler } from '@harness/proc';
import type { AcpMcpServer } from './mcp.js';
import { type ContentBlock } from './protocol.js';
/**
 * Client for the Agent Client Protocol.
 *
 * On main this is not a provider: Grok runs over it when a project has MCP
 * servers, because Grok's ACP mode accepts MCP servers per session. The ACP
 * agent roster (Gemini, Kimi, Qwen) lives on the nightly branch only.
 *
 * Verified against gemini-cli in `--experimental-acp` mode; the fixtures in
 * the tests are those captured frames.
 *
 * As with every adapter here, we spawn the vendor's binary and let it
 * authenticate itself. See rules/security.md.
 */
export type AcpAdapterEvents = {
    event: [DomainEvent];
    log: [string];
    disconnected: [];
};
export type AcpStartOptions = {
    instructions?: string | undefined;
    approval?: ApprovalMode | undefined;
    model?: string | undefined;
};
export type AcpTurnSettings = {
    model?: string | undefined;
    effort?: string | undefined;
};
export type AcpLaunchOptions = {
    name: string;
    command: string;
    args?: string[];
    /**
     * Launch arguments for a model and effort the agent accepts only at startup.
     * When set, a turn that asks for other settings restarts the agent and
     * reloads its session first.
     */
    argsFor?: (settings: AcpTurnSettings) => string[];
    /** The settings `argsFor` launches with first. */
    settings?: AcpTurnSettings;
    spawn?: typeof spawnCli;
    provider: ProviderId;
    mcpServers?: AcpMcpServer[];
    /** Added to the inherited environment, for engines tuned through it. */
    env?: Record<string, string> | undefined;
};
export interface AcpRpc {
    onStderr(handler: (text: string) => void): void;
    onNotification(handler: (method: string, params: JsonRpcValue | undefined) => void): void;
    onServerRequest(handler: ServerRequestHandler): void;
    request(method: string, params?: unknown, options?: JsonRpcRequestOptions): Promise<JsonRpcValue | undefined>;
    request<Result>(method: string, params: unknown, options: ParsedJsonRpcRequestOptions<Result>): Promise<Result>;
    notify(method: string, params?: unknown): void;
    dispose(): void | Promise<void>;
}
export { prepareAcpMcpServers, type AcpMcpServer } from './mcp.js';
export declare function acpPromptContent(text: string, attachments?: string[], images?: boolean): ContentBlock[];
export declare class AcpAdapter extends EventEmitter<AcpAdapterEvents> {
    #private;
    constructor(agentId: string, launch: AcpLaunchOptions);
    /** Whether the connected agent can reload this session after its process ends. */
    get resumable(): boolean;
    get capabilities(): Capabilities;
    startThread(workspacePath: string, options?: AcpStartOptions): Promise<Thread>;
    resumeThread(threadId: string, workspacePath: string, options?: AcpStartOptions): Promise<Thread>;
    sendTurn(threadId: string, text: string, attachments?: string[], settings?: AcpTurnSettings): Promise<string>;
    interrupt(): Promise<void>;
    respondToApproval(approvalId: string, decision: ApprovalDecision): void;
    /** Live access-level change; read again for every permission request. */
    setApproval(approval: ApprovalMode | undefined): void;
    onDisconnected(listener: () => void): () => void;
    /** Complete the ACP initialize handshake without creating a paid session. */
    verifyCompatibility(workspacePath: string): Promise<{
        protocolVersion?: number;
        agentName?: string;
        agentVersion?: string;
    }>;
    dispose(): Promise<void>;
}
export declare function parseAcpThreadId(threadId: string, agentId: string): string;
//# sourceMappingURL=adapter.d.ts.map