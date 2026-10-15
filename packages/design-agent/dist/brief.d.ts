export interface ExplicitBriefAnswer {
    question: string;
    answer: string;
}
export interface DesignBrief {
    originalRequest: string;
    subject: string;
    pageType: string;
    scope: string;
    primaryGoal: string;
    audience: string;
    offer: string;
    primaryAction: string;
    requiredContent: string[];
    constraints: string[];
    brandInputs: string[];
    creativeControl: string;
    explicitAnswers: ExplicitBriefAnswer[];
    assumptions: string[];
    unresolved: string[];
}
export declare function parseDesignBrief(value: unknown): DesignBrief;
export declare function readDesignBrief(workspacePath: string): DesignBrief;
export declare function writeDesignBrief(workspacePath: string, value: unknown): DesignBrief;
//# sourceMappingURL=brief.d.ts.map