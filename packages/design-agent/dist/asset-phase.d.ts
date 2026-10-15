import { type AssetManifest } from './assets.js';
import type { DesignBrief } from './brief.js';
import type { BrandSystem } from './brand.js';
import type { PageBlueprint } from './page.js';
export declare function designAssetPrompt(brief: DesignBrief, brand: BrandSystem, page: PageBlueprint, suppliedReferences?: readonly string[]): string;
export declare function parseAssetPhaseOutput(text: string, page?: PageBlueprint, workspacePath?: string, suppliedReferences?: readonly string[]): AssetManifest;
//# sourceMappingURL=asset-phase.d.ts.map