import type { PreviewPlan } from '@harness/design-agent';
type StaticPlan = Extract<PreviewPlan, {
    kind: 'static';
}>;
export declare const STATIC_PREVIEW_HEADER = "x-harness-preview-id";
/**
 * `reservedPorts` are claimed by command previews that have not bound them
 * yet, or belong to the app itself.
 */
export declare function startStaticDesignPreview(root: string, plan: StaticPlan, reservedPorts?: Pick<ReadonlySet<number>, 'has'>): Promise<{
    url: string;
    viewports: {
        name: string;
        width: number;
        height: number;
    }[];
    output: () => string;
    stop: () => Promise<void>;
}>;
export {};
//# sourceMappingURL=design-static-preview.d.ts.map