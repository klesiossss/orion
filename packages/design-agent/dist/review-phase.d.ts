import type { AssetManifest } from './assets.js';
import type { DesignBrief } from './brief.js';
import type { BrandSystem } from './brand.js';
import type { PageBlueprint } from './page.js';
import { type ReferenceDirection } from './reference-directions.js';
declare const SEVERITIES: readonly ["blocking", "major", "minor"];
export type ReviewSeverity = (typeof SEVERITIES)[number];
declare const EVIDENCE_TYPES: readonly ["automated", "visual_inspection"];
declare const CONFIDENCE_LEVELS: readonly ["high", "medium", "low", "unknown"];
export interface ReviewScreenshot {
    path: string;
    width: number;
    height: number;
    domAudit?: {
        h1Count: number;
        interactiveTargetViolations: Array<{
            selector: string;
            label: string;
            width: number;
            height: number;
            partiallyClipped?: boolean | undefined;
        }>;
        coverage?: 'complete' | 'partial' | undefined;
    } | undefined;
    documentHeight?: number | undefined;
    capturedHeight?: number | undefined;
}
/** Viewports (`WxH`) whose screenshot stopped before the end of the document. */
export declare function croppedReviewScreenshots(screenshots: readonly ReviewScreenshot[]): string[];
export interface VisualReview {
    version: 1;
    verdict: 'pass' | 'repair';
    summary: string;
    findings: Array<{
        id: string;
        severity: ReviewSeverity;
        area: string;
        evidenceType: (typeof EVIDENCE_TYPES)[number];
        confidence: (typeof CONFIDENCE_LEVELS)[number];
        evidence: string;
        repair: string;
    }>;
}
export interface RepairPhaseOutput {
    status: 'complete' | 'failed';
    summary: string;
    files: string[];
    checks: string[];
}
export declare function designReviewPrompt(brief: DesignBrief, brand: BrandSystem, page: PageBlueprint, screenshots: ReviewScreenshot[], suppliedReferences?: readonly string[], referenceDeck?: readonly ReferenceDirection[], expectedViewports?: readonly {
    width: number;
    height: number;
}[]): string;
export declare function parseReviewPhaseOutput(text: string): VisualReview;
export declare function enforceDomAuditFindings(review: VisualReview, screenshots: ReviewScreenshot[], expectedViewports?: readonly {
    width: number;
    height: number;
}[]): VisualReview;
export declare function validateReviewScreenshots(screenshots: readonly ReviewScreenshot[], expectedViewports?: readonly {
    width: number;
    height: number;
}[]): void;
export declare function readVisualReview(workspacePath: string): VisualReview;
export declare function writeVisualReview(workspacePath: string, review: VisualReview): VisualReview;
export declare function designRepairPrompt(review: VisualReview, attempt: number, limit: number, brief?: DesignBrief, brand?: BrandSystem, page?: PageBlueprint, assets?: AssetManifest, suppliedReferences?: readonly string[], screenshots?: readonly ReviewScreenshot[]): string;
export declare function parseRepairPhaseOutput(text: string): RepairPhaseOutput;
export {};
//# sourceMappingURL=review-phase.d.ts.map