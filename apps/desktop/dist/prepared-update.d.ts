import { rm } from 'node:fs/promises';
import type { UpdateInfo } from 'electron-updater';
type StagingCleanup = {
    remove?: typeof rm;
    onError?: (error: unknown) => void;
};
/**
 * Staging removal is best effort. After a native handover succeeded, a locked
 * temp folder must not turn Ready into an error; after a failure, the original
 * error is the one worth reporting.
 */
export declare function withUpdateDirectory<T>(use: (directory: string) => Promise<T>, cleanup?: StagingCleanup): Promise<T>;
export declare function updateFileHashes(file: string): Promise<{
    sha256: string;
    sha512: string;
    size: number;
}>;
export declare function servePreparedUpdate<T>(file: string, info: UpdateInfo, use: (url: string, prepared: UpdateInfo) => Promise<T>): Promise<T>;
export {};
//# sourceMappingURL=prepared-update.d.ts.map