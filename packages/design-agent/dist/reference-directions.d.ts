import type { BrandSystem } from './brand.js';
import type { DesignBrief } from './brief.js';
import { type PageBlueprint, type PageLayoutFamily } from './page.js';
export interface ReferenceDirection {
    id: string;
    family: PageLayoutFamily;
    cue: string;
    imagePath: string;
    mobileImagePath?: string;
    source?: string;
    group?: string;
    tags?: string[];
}
export declare const REFERENCE_DIRECTIONS: readonly [ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection, ReferenceDirection];
export declare function referenceDirectionAttachmentPath(direction: ReferenceDirection): string;
export declare function referenceDirectionAttachments(directions: readonly ReferenceDirection[]): string[];
export declare function referenceDirectionsForPage(page: PageBlueprint, deck?: readonly ReferenceDirection[]): ReferenceDirection[];
export declare function lockPageReferenceDirections(page: PageBlueprint, deck: readonly ReferenceDirection[], suppliedReferenceIds?: readonly string[]): PageBlueprint;
export declare function selectReferenceDirectionDeck(brief: DesignBrief, _brand: BrandSystem): ReferenceDirection[];
//# sourceMappingURL=reference-directions.d.ts.map