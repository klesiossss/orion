export declare function localDiagnosticsDirectory(userDataDirectory: string): string;
export declare class LocalDiagnostics {
    #private;
    readonly directory: string;
    constructor(directory: string);
    initialize(): Promise<void>;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): Promise<boolean>;
    record(source: string, cause: unknown): Promise<void>;
    recordSync(source: string, text: string): void;
}
export declare function boundedEntry(value: string): string;
export declare function scrub(value: string): string;
//# sourceMappingURL=local-diagnostics.d.ts.map