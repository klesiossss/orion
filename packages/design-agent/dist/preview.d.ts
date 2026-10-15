interface PreviewPlanBase {
    version: 1;
    cwd: string;
    url: string;
    viewports: Array<{
        name: string;
        width: number;
        height: number;
    }>;
}
export type PreviewPlan = (PreviewPlanBase & {
    kind: 'command';
    command: string;
    args: string[];
    readyPattern?: string;
}) | (PreviewPlanBase & {
    kind: 'static';
    entry: string;
});
export declare function designPreviewPrompt(): string;
export declare function parsePreviewPhaseOutput(text: string): PreviewPlan;
export declare function assertReviewViewports(viewports: readonly {
    width: number;
    height: number;
}[]): void;
export declare function parsePreviewPlan(value: unknown): PreviewPlan;
export {};
//# sourceMappingURL=preview.d.ts.map