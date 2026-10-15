import type { DesignBrief } from './brief.js';
import { type BrandSystem } from './brand.js';
import { type TypographyCandidates } from './typography.js';
export declare function designBrandPrompt(brief: DesignBrief, suppliedReferences?: readonly string[], typographyCandidates?: TypographyCandidates): string;
export declare function parseBrandPhaseOutput(text: string): BrandSystem;
//# sourceMappingURL=brand-phase.d.ts.map