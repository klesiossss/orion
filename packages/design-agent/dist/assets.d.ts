import type { PageBlueprint } from './page.js';
declare const ASSET_KINDS: readonly ["image", "illustration", "video", "icon", "font", "component", "data"];
declare const ASSET_STATUSES: readonly ["existing", "needed", "ready"];
declare const SOURCE_KINDS: readonly ["project", "user", "origin-kit", "generated", "external"];
declare const ASSET_ROLES: readonly ["photography", "product_image", "editorial_illustration", "interface_capture", "functional_icon", "logo", "data_diagram", "video", "font", "component", "data"];
export type AssetKind = (typeof ASSET_KINDS)[number];
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type AssetSourceKind = (typeof SOURCE_KINDS)[number];
export type AssetRole = (typeof ASSET_ROLES)[number];
export interface DesignAsset {
    id: string;
    kind: AssetKind;
    status: AssetStatus;
    purpose: string;
    requirements: string[];
    role?: AssetRole;
    sectionIds?: string[];
    aspectRatio?: string;
    composition?: string;
    source?: {
        kind: AssetSourceKind;
        reference: string;
        license?: string;
        contentType?: string;
    };
    destination?: string;
}
export interface AssetManifest {
    version: 1;
    assets: DesignAsset[];
}
export declare function parseAssetManifest(value: unknown): AssetManifest;
/**
 * Cross-artifact validation for the Asset phase. The loose parser above stays
 * backwards compatible for persisted manifests; new phase output must prove
 * exact page coverage and enough visual intent for Build to use the real asset.
 */
export declare function validateAssetManifestForPage(manifest: AssetManifest, page: PageBlueprint, workspacePath?: string, suppliedReferences?: readonly string[]): AssetManifest;
export declare function validateResolvedDesignAssets(manifest: AssetManifest): AssetManifest;
export declare function readAssetManifest(workspacePath: string): AssetManifest;
export declare function writeAssetManifest(workspacePath: string, value: unknown): AssetManifest;
export {};
//# sourceMappingURL=assets.d.ts.map