import { type AppUpdater } from 'electron-updater';
import type { DownloadUpdateOptions } from 'electron-updater/out/AppUpdater.js';
import { type ReleaseFetch } from './github-release-provider.js';
export type ReleaseDownloads = {
    fetch: ReleaseFetch;
    /** Where an interrupted download waits to be continued, across restarts. */
    directory: string;
};
export declare function downloadRelease(updater: AppUpdater, options: DownloadUpdateOptions, install: (prepared: DownloadUpdateOptions) => Promise<string[]>, downloads: ReleaseDownloads): Promise<string[]>;
export declare function createReleaseUpdater(release: {
    fetch: ReleaseFetch;
}): AppUpdater & {
    dispose: () => Promise<void>;
};
//# sourceMappingURL=release-updater.d.ts.map