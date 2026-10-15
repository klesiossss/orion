import type { AppUpdater, ResolvedUpdateFileInfo, UpdateInfo } from 'electron-updater';
import { Provider, type ProviderRuntimeOptions } from 'electron-updater/out/providers/Provider.js';
import { z } from 'zod';
export declare const releaseRepository = "Leonxlnx/tastecode";
declare const assetSchema: z.ZodObject<{
    name: z.ZodString;
    state: z.ZodLiteral<"uploaded">;
    size: z.ZodNumber;
    digest: z.ZodString;
    browser_download_url: z.ZodString;
}, z.core.$strip>;
declare const releaseSchema: z.ZodObject<{
    tag_name: z.ZodString;
    draft: z.ZodBoolean;
    published_at: z.ZodNullable<z.ZodString>;
    assets: z.ZodArray<z.ZodUnknown>;
}, z.core.$strip>;
type Release = z.infer<typeof releaseSchema>;
export type ReleaseAsset = z.infer<typeof assetSchema>;
export type AssetUpdateInfo = UpdateInfo & {
    asset: ReleaseAsset;
};
export type ReleaseFetch = (url: string, init?: RequestInit) => Promise<Response>;
export type ReleaseProviderOptions = {
    provider: 'custom';
    fetch?: ReleaseFetch;
};
type InstalledVersion = Pick<AppUpdater, 'currentVersion'>;
/** GitHub asked for the next release lookup to wait until `retryAt`. */
export declare class UpdateCheckDeferredError extends Error {
    readonly retryAt: number;
    constructor(retryAt: number);
}
/** When a rate-limited response says the next request may succeed. */
export declare function deferredUntil(response: Response, now?: number): number | undefined;
/** Tags in GitHub's release feed: published releases and bare tags, newest ten first. */
export declare function feedTags(feed: string): string[];
/** Tags of versions above `current`, highest version first. */
export declare function newerTags(tags: string[], current: string): string[];
export declare function selectLatestRelease(rows: unknown[]): Release;
export declare function releaseUpdateInfo(release: Release, platform: string, arch: string): AssetUpdateInfo;
export declare function assetFromUpdateInfo(info: UpdateInfo): ReleaseAsset;
export declare class GitHubReleaseProvider extends Provider<UpdateInfo> {
    private readonly installed;
    private readonly platform;
    private readonly fetch;
    private releaseList;
    constructor(options: ReleaseProviderOptions, installed: InstalledVersion, runtime: ProviderRuntimeOptions);
    /** The response, or undefined for a 404. */
    private request;
    getLatestVersion(): Promise<UpdateInfo>;
    private latestFromReleaseList;
    resolveFiles(): ResolvedUpdateFileInfo[];
}
export {};
//# sourceMappingURL=github-release-provider.d.ts.map