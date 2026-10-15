export type CliUpdateSource = {
    command: string;
    url: string;
    check(currentVersion: string): Promise<{
        latestVersion: string;
        command?: string | undefined;
    }>;
};
export declare function cliVersion(value: string): string | undefined;
/** Compare numeric release parts and SemVer prereleases, never display strings. */
export declare function isNewerVersion(current: string, latest: string): boolean;
export declare function latestNpmVersion(packageName: string, tag?: string): Promise<string>;
export declare function latestBrewVersion(cask: string): Promise<string>;
/** Resolve the binary actually used by the desktop, including Windows package-manager shims. */
export declare function cliPath(command: string): Promise<string | undefined>;
//# sourceMappingURL=updates.d.ts.map