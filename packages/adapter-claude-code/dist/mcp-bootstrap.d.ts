import type { McpServerConfig } from '@anthropic-ai/claude-agent-sdk';
import type { ClaudeQueryRuntime } from './sdk-runtime.js';
/** Reserve project ids before inherited MCP discovery, without exposing real config on argv. */
export declare function createClaudeMcpBootstrap(ids: string[], signal: AbortSignal): Promise<{
    servers: {
        [k: string]: {
            type: "http";
            url: string;
        };
    };
    close: () => Promise<void>;
}>;
type McpControls = Pick<ClaudeQueryRuntime, 'mcpServerStatus' | 'setMcpServers'>;
/** The caller supplies the startup deadline and does not accept a turn until this settles. */
export declare function activateClaudeMcpServers(query: McpControls, bootstrap: Record<string, McpServerConfig>, servers: Record<string, McpServerConfig>, signal: AbortSignal): Promise<void>;
export {};
//# sourceMappingURL=mcp-bootstrap.d.ts.map