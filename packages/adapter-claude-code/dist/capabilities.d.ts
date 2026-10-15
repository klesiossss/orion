import type { Capabilities, McpServerConfig } from '@harness/contracts';
/** Keep unsupported provider operations out of saved project configuration too. */
export declare function validateClaudeMcpServer(server: McpServerConfig): asserts server is Extract<McpServerConfig, {
    enabled: true;
}>;
export declare const CLAUDE_CAPABILITIES: Capabilities;
//# sourceMappingURL=capabilities.d.ts.map