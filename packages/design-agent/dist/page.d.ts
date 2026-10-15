export interface PageLink {
    label: string;
    target: string;
}
export declare const PAGE_LAYOUT_FAMILIES: readonly ["hero", "about", "feature", "how_it_works", "social_proof", "stats", "faq", "cta", "pricing", "contact", "footer"];
export type PageLayoutFamily = (typeof PAGE_LAYOUT_FAMILIES)[number];
export declare const PAGE_MOTION_PURPOSES: readonly ["none", "feedback", "state_change", "spatial_continuity", "explanation", "status"];
export type PageMotionPurpose = (typeof PAGE_MOTION_PURPOSES)[number];
export declare const PAGE_MOTION_TRIGGERS: readonly ["none", "load", "scroll_enter", "scroll_progress", "hover", "press", "drag", "state_change"];
export type PageMotionTrigger = (typeof PAGE_MOTION_TRIGGERS)[number];
export interface PageSectionMotion {
    purpose: PageMotionPurpose;
    trigger: PageMotionTrigger;
    behavior: string;
    durationMs: number;
    easing: string;
    reducedMotion: string;
}
export interface PageNavigationDesign {
    layoutCase?: string;
    layout: string;
    behavior: string[];
    transformation: {
        compact: string;
        medium: string;
        expanded: string;
    };
}
export interface PageBlueprint {
    version: 1;
    page: {
        title: string;
        route: string;
        description: string;
    };
    architecture: {
        contract: string;
        mode: 'scan_compare' | 'read_understand' | 'persuade_convert' | 'explore_experience' | 'operate_monitor';
        novelty: 'low' | 'medium' | 'high';
        grid: string;
        signatureRule: string;
        rhythm: string;
    };
    navigation: PageLink[];
    navigationDesign?: PageNavigationDesign;
    sections: Array<{
        id: string;
        layoutFamily?: PageLayoutFamily;
        layoutCases?: string[];
        referenceDirectionId?: string;
        purpose: string;
        userQuestion: string;
        stage: 'orient' | 'qualify' | 'evaluate' | 'prove' | 'explain' | 'de_risk' | 'act' | 'continue';
        dependencies: string[];
        evidence: string[];
        copy: {
            eyebrow?: string;
            heading: string;
            body: string[];
            callsToAction: PageLink[];
        };
        layout: string;
        motion?: PageSectionMotion;
        componentNeeds: string[];
        assetNeeds: string[];
        transformation: {
            compact: string;
            medium: string;
            expanded: string;
        };
    }>;
    responsive: string[];
    interactions: string[];
    acceptanceCriteria: string[];
}
export declare function parsePageBlueprint(value: unknown): PageBlueprint;
export declare function readPageBlueprint(workspacePath: string): PageBlueprint;
export declare function writePageBlueprint(workspacePath: string, value: unknown): PageBlueprint;
//# sourceMappingURL=page.d.ts.map