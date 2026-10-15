import type { BrandSystem } from './brand.js';
import type { DesignBrief } from './brief.js';
/** Verified against google/fonts OFL metadata; each family gets one vote, not one per weight. */
export declare const DESIGN_FONT_POOLS: {
    readonly sans: readonly ["Bricolage Grotesque", "Syne", "Hanken Grotesk", "Schibsted Grotesk", "Space Grotesk", "Onest", "Instrument Sans", "Commissioner", "Spline Sans", "Figtree"];
    readonly serif: readonly ["Fraunces", "Newsreader", "Bodoni Moda", "Cormorant Garamond", "DM Serif Display", "Young Serif", "Instrument Serif", "Prata", "Gloock", "Lora"];
    readonly display: readonly ["Unbounded", "Dela Gothic One", "Archivo Black", "Big Shoulders", "Bebas Neue", "Changa One", "Righteous", "Bowlby One SC", "Paytone One", "Anybody"];
    readonly mono: readonly ["Martian Mono", "Azeret Mono", "Space Mono", "Fragment Mono", "Spline Sans Mono", "Roboto Mono", "Red Hat Mono", "PT Mono", "IBM Plex Mono", "JetBrains Mono"];
};
export type TypographyCandidates = Record<keyof typeof DESIGN_FONT_POOLS, string[]>;
export declare function selectTypographyCandidates(chooseIndex?: (length: number) => number): TypographyCandidates;
export declare function typographyGuidance(candidates: TypographyCandidates): string;
export declare function validateTypographySelection(brief: DesignBrief, brand: BrandSystem, candidates: TypographyCandidates): void;
//# sourceMappingURL=typography.d.ts.map