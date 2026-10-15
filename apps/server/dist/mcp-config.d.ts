import { type McpServerConfig, type ProviderId } from '@harness/contracts';
/** Human-readable project MCP definitions. Secret values never enter this file. */
export declare class McpConfigStore {
    #private;
    private readonly location;
    private readonly now;
    constructor(location?: string, now?: () => number);
    list(provider: ProviderId, projectPath: string): McpServerConfig[];
    add(provider: ProviderId, projectPath: string, server: McpServerConfig): void;
    update(provider: ProviderId, projectPath: string, server: McpServerConfig): void;
    remove(provider: ProviderId, projectPath: string, serverId: string): void;
}
//# sourceMappingURL=mcp-config.d.ts.map