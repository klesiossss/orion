import type { BrandSystem } from './brand.js';
export declare const GRADIENT_PURPOSES: readonly ["card", "section", "page"];
export type GradientPurpose = (typeof GRADIENT_PURPOSES)[number];
export interface GradientRecipe {
    purpose: GradientPurpose;
    background: string;
    contentSurface: string;
    usage: string;
}
export interface GradientSet {
    version: 1;
    seed: number;
    recipes: GradientRecipe[];
}
export declare function generateGradientSet(input: unknown): GradientSet;
export declare function gradientSetForBrand(brand: BrandSystem): GradientSet | undefined;
//# sourceMappingURL=gradients.d.ts.map