import type { McpServerConfig as ClaudeMcpServerConfig } from '@anthropic-ai/claude-agent-sdk';
import type { McpServerConfig } from '@harness/contracts';
/** Real config travels only on the SDK control stream, after empty ids reserve precedence. */
export declare function prepareClaudeMcpServers(servers: McpServerConfig[], credentials: Record<string, string>): {
    servers: {
        [k: string]: ClaudeMcpServerConfig;
    };
    secrets: string[];
};
/** Each process keeps its own redactor until stderr closes, including across restarts. */
export declare class ClaudeMcpRedactor {
    #private;
    constructor(secrets?: readonly string[]);
    redact(text: string): string;
    push(chunk: string): string;
    finish(): string;
}
//# sourceMappingURL=mcp.d.ts.map