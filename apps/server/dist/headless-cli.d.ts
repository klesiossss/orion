type CliOptions = {
    command: 'serve' | 'help';
    port: number;
};
export declare function runHeadlessCli(args: string[], env?: NodeJS.ProcessEnv): Promise<void>;
export declare function parseCliOptions(args: string[], env?: NodeJS.ProcessEnv): CliOptions;
export {};
//# sourceMappingURL=headless-cli.d.ts.map