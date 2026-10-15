export declare const CRASH_AGENT_IDS: readonly ["claude-code", "codex", "grok"];
export type CrashAgentId = (typeof CRASH_AGENT_IDS)[number];
export type CrashAgentAvailability = {
    id: CrashAgentId;
    installed: boolean;
};
export type CrashDetails = {
    name: string;
    message: string;
    stack: string;
    componentStack: string;
};
export type CrashEnvironment = {
    appVersion: string;
    electronVersion: string;
    chromeVersion: string;
    platform: NodeJS.Platform;
    osRelease: string;
    arch: string;
    time: string;
    diagnosticsLog: string | undefined;
};
type AgentCommand = {
    command: string;
    args: string[];
};
/**
 * One line on purpose: it travels through a terminal, a shell and, on Windows,
 * possibly a `.cmd` shim, and only a single line survives all of them intact.
 * The detail lives in the report file next to it.
 */
export declare const CRASH_AGENT_PROMPT: string;
export declare function isCrashAgentId(value: unknown): value is CrashAgentId;
/** Interactive CLI with its own skip-every-approval mode and the prompt as the first turn. */
export declare function crashAgentCommand(id: CrashAgentId, home?: string, exists?: (file: string) => boolean): AgentCommand;
export declare function crashAgentAvailability(): Promise<CrashAgentAvailability[]>;
export declare function parseCrashDetails(value: unknown): CrashDetails;
/** Every renderer-supplied field is scrubbed: the agent forwards it to its model provider. */
export declare function crashReport(details: CrashDetails, environment: CrashEnvironment): string;
export declare function posixQuote(value: string): string;
export declare function powershellQuote(value: string): string;
type TerminalLaunch = {
    script: {
        name: string;
        contents: string;
        executable: boolean;
    };
    spawn: (scriptPath: string) => AgentCommand;
};
/**
 * The prompt never touches a command line we build: the launcher reads it from
 * a file, so only our own temp paths are quoted, each for its one shell.
 */
export declare function terminalLaunch(platform: NodeJS.Platform, directory: string, agent: AgentCommand, linuxTerminal: {
    command: string;
    prefix: string[];
} | undefined, searchPath?: string): TerminalLaunch;
export declare function launchCrashAgent(id: CrashAgentId, details: CrashDetails, environment: CrashEnvironment): Promise<void>;
export {};
//# sourceMappingURL=crash-agent.d.ts.map