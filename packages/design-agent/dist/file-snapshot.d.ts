import type { AssetManifest } from './assets.js';
export interface DesignFileSnapshot {
    path: string;
    sha256: string;
}
export declare function snapshotDesignFiles(files: readonly string[]): DesignFileSnapshot[];
export declare function validateDesignFileSnapshot(snapshot: readonly DesignFileSnapshot[]): void;
export declare function snapshotDesignAssets(workspacePath: string, manifest: AssetManifest): DesignFileSnapshot[];
//# sourceMappingURL=file-snapshot.d.ts.map