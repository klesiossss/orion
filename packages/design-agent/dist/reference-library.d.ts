import type { DesignBrief } from './brief.js';
import { type PageLayoutFamily } from './page.js';
import type { ReferenceDirection } from './reference-directions.js';
export declare function parseReferenceDeck(value: unknown): ReferenceDirection[];
/** The location is user configuration, never a path taken from an opened project. */
export declare function referenceLibraryRoot(): string;
export declare function loadReviewedReferences(root?: string): ReferenceDirection[];
/** Content topics can use a compatible image's geometry without relabeling that image. */
export declare function referenceCandidatesForFamily(family: PageLayoutFamily, references: readonly ReferenceDirection[]): ReferenceDirection[];
export declare function selectReviewedReferences(brief: DesignBrief, references?: ReferenceDirection[], chooseIndex?: (length: number) => number): ReferenceDirection[];
//# sourceMappingURL=reference-library.d.ts.map