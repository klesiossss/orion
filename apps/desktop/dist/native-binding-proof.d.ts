interface Disposable {
    dispose(): void;
}
interface PtyProcess {
    write(data: string): void;
    onData(listener: (data: string) => void): Disposable;
    onExit(listener: (event: {
        exitCode: number;
        signal?: number;
    }) => void): Disposable;
    resize(columns: number, rows: number): void;
    kill(): void;
}
export interface PtyModule {
    spawn(file: string, args: string[], options: {
        name: string;
        cols: number;
        rows: number;
        cwd: string;
        env: Record<string, string>;
    }): PtyProcess;
}
interface KeyringEntry {
    getPassword(): string | null;
    setPassword(value: string): void;
    deletePassword(): void;
}
export interface KeyringModule {
    Entry: new (service: string, account: string) => KeyringEntry;
}
export interface PackagedNativeModules {
    pty: PtyModule;
    keyring: KeyringModule;
    moduleEntries: string[];
    nativeBindings: string[];
    designEntry: string;
}
export declare function assertPackagedDesignReferences(proofFile: string, designEntry: string): number;
export declare function assertPackagedNativeModules(proofFile: string, modules: Pick<PackagedNativeModules, 'moduleEntries' | 'nativeBindings'>): void;
export declare function provePtyBinding(pty: PtyModule, platform?: NodeJS.Platform): Promise<void>;
export declare function proveKeyringBinding(keyring: KeyringModule): void;
export declare function runNativeBindingProof(options?: {
    proofFile?: string;
    modules?: PackagedNativeModules;
}): Promise<void>;
export {};
//# sourceMappingURL=native-binding-proof.d.ts.map