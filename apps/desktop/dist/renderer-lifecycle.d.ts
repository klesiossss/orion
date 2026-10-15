import type { WebContents } from 'electron';
export declare function configureRendererLifecycle(contents: Pick<WebContents, 'on' | 'reload' | 'isDestroyed'>, options: {
    cancelCaptures: () => void;
    /** The page was replaced, so state tied to the old page's listeners is stale. */
    onPageReplaced: () => void;
    isQuitting: () => boolean;
    onRepeatedCrash: () => void;
}): void;
//# sourceMappingURL=renderer-lifecycle.d.ts.map