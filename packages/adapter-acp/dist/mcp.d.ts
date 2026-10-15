import type { McpServerConfig } from '@harness/contracts';
export type AcpMcpServer = {
    name: string;
    command: string;
    args: string[];
    env: Array<{
        name: string;
        value: string;
    }>;
} | {
    type: 'http';
    name: string;
    url: string;
    headers: Array<{
        name: string;
        value: string;
    }>;
};
/** ACP sessions can only add servers, so reject saves the launch could not honor. */
export declare function validateAcpMcpServer(server: McpServerConfig): asserts server is Extract<McpServerConfig, {
    enabled: true;
}>;
/** Translate TasteCode's credential-safe config into the ACP session shape. */
export declare function prepareAcpMcpServers(servers: McpServerConfig[], credentials: Record<string, string>): AcpMcpServer[];
//# sourceMappingURL=mcp.d.ts.map