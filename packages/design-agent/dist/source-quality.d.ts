import type { AssetManifest } from './assets.js';
import type { PageBlueprint } from './page.js';
export declare class DesignSourceQualityError extends Error {
}
/** Reject the recurring generated card-rail motif before Preview and after Repair. */
export declare function validateDesignSourceQuality(workspacePath: string, reportedFiles?: readonly string[], baseline?: readonly string[], assets?: AssetManifest, page?: PageBlueprint): void;
export declare function designSourceQualityBaseline(workspacePath: string, assets?: AssetManifest): string[];
//# sourceMappingURL=source-quality.d.ts.map