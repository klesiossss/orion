import type { McpCapabilities, McpServer, McpServerConfig, McpStartupStatus } from '@harness/contracts';
import type { JsonValue } from './generated/serde_json/JsonValue.js';
import { type McpServerStatusUpdatedNotification, type ParsedMcpServerStatus } from './schemas.js';
export declare const CODEX_MCP_CAPABILITIES: McpCapabilities;
export type PreparedMcpConfig = {
    servers: Record<string, JsonValue>;
    environment: NodeJS.ProcessEnv;
};
export declare function prepareMcpConfig(servers: McpServerConfig[], credentials: Record<string, string>): PreparedMcpConfig;
/**
 * Codex hands its own environment to every shell command the model runs, so
 * the header credentials would reach `printenv`. An `exclude` override would
 * replace the user's list; a dotted `set` leaf merges into their policy and
 * is applied after inherit and exclude, so the commands see the name blank.
 */
export declare function mcpShellEnvironmentConfig(environment: NodeJS.ProcessEnv): Record<string, JsonValue>;
export declare function mapMcpStartupStatus(status: McpServerStatusUpdatedNotification): McpStartupStatus;
export declare function mcpStartupInventory(startupByKey: ReadonlyMap<string, McpStartupStatus>, threadId?: string): McpServer[];
export declare function mapMcpServerStatus(status: ParsedMcpServerStatus, startup?: McpStartupStatus): McpServer;
//# sourceMappingURL=mcp.d.ts.map