import type { AssetManifest } from './assets.js';
import type { DesignBrief } from './brief.js';
import type { BrandSystem } from './brand.js';
import type { PageBlueprint } from './page.js';
export { DesignSourceQualityError, designSourceQualityBaseline, validateDesignSourceQuality, } from './source-quality.js';
export type BuildPhaseOutput = {
    status: 'complete';
    summary: string;
    files: string[];
    checks: string[];
} | {
    status: 'failed';
    error: string;
    files: string[];
    checks: string[];
};
export declare class ExactBuildFilesError extends Error {
}
export declare function designBuildPrompt(brief: DesignBrief, brand: BrandSystem, page: PageBlueprint, assets: AssetManifest, suppliedReferences?: readonly string[]): string;
export type DesignCorrectionPhase = 'build' | 'repair';
export declare function designBuildCorrectionPrompt(error: string, phase?: DesignCorrectionPhase): string;
export declare function designSourceQualityCorrectionPrompt(error: string, phase?: DesignCorrectionPhase): string;
export declare function exactBuildFileBaseline(workspacePath: string, brief: DesignBrief): string[] | undefined;
/** Capture before any Design phase can create files, including asset acquisition. */
export declare function designWorkspaceFileBaseline(workspacePath: string): string[];
export declare function validateExactBuildFiles(workspacePath: string, brief: DesignBrief, baseline?: string[]): void;
export declare function parseBuildPhaseOutput(text: string): BuildPhaseOutput;
//# sourceMappingURL=build-phase.d.ts.map