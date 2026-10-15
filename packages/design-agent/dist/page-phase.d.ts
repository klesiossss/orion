import type { DesignBrief } from './brief.js';
import type { BrandSystem } from './brand.js';
import { type PageBlueprint } from './page.js';
import { type ReferenceDirection } from './reference-directions.js';
export declare function designPagePrompt(brief: DesignBrief, brand: BrandSystem, suppliedReferences?: readonly string[], selectedReferences?: readonly ReferenceDirection[]): string;
export declare function parsePagePhaseOutput(text: string, referenceDirections?: readonly ReferenceDirection[], suppliedReferenceIds?: readonly string[], referenceDriven?: boolean): PageBlueprint;
//# sourceMappingURL=page-phase.d.ts.map