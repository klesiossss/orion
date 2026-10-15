import type { ProgressInfo } from 'electron-updater';
import type { ReleaseFetch } from './github-release-provider.js';
export type VerifiedDownload = {
    url: string;
    size: number;
    /** Lowercase hex SHA-256 that GitHub computed for the asset. */
    sha256: string;
    extension: string;
    /** Keeps one asset's bytes across attempts and app restarts. */
    directory: string;
    fetch: ReleaseFetch;
    signal: AbortSignal;
    onProgress?: (progress: ProgressInfo) => void;
    /** Gives up, keeping the bytes so far, when nothing arrives for this long. */
    stallTimeout?: number;
};
/**
 * Downloads a release asset, continuing the bytes an interrupted attempt left
 * behind, and returns the file once its size and SHA-256 match GitHub's.
 */
export declare function downloadVerified(download: VerifiedDownload): Promise<string>;
//# sourceMappingURL=update-download.d.ts.map