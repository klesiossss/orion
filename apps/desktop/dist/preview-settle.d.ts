export declare const MAX_PREVIEW_HEIGHT = 12000;
export declare const PREVIEW_SETTLE_BUDGET_MS = 5500;
export declare const PREVIEW_SETTLE_SCRIPT: string;
export declare const PREVIEW_PAGE_HEIGHT_SCRIPT = "(() => {\n  const pageScrollerOverflow = element => {\n  const hidden = element.scrollHeight - element.offsetHeight\n  // Negated so that a missing measurement (NaN) never counts as a scroller.\n  if (!(hidden > 1 && element.clientWidth * 2 >= innerWidth && element.clientHeight * 2 >= innerHeight)) return 0\n  const overflowY = getComputedStyle(element).overflowY\n  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') return 0\n  if (typeof element.checkVisibility === 'function'\n    && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return 0\n  const rect = element.getBoundingClientRect()\n  return rect.right > 0 && rect.left < innerWidth\n    && rect.bottom + scrollY > 0 && rect.top + scrollY < innerHeight ? hidden : 0\n}\n  // The largest page scroller says how much of the page the document height leaves out.\n  // Like the DOM audit, walk open shadow roots and stop at a bound; shallowest first,\n  // where page scrollers sit, so a huge list cannot use up the bound before them. The\n  // body itself is skipped: its overflow can belong to the document, already measured.\n  const queue = document.body ? Array.from(document.body.children) : []\n  let scrollContainer = 0\n  for (let index = 0; index < queue.length && index < 20000; index += 1) {\n    const element = queue[index]\n    const hidden = pageScrollerOverflow(element)\n    if (hidden > scrollContainer) scrollContainer = hidden\n    for (const child of element.shadowRoot ? element.shadowRoot.children : []) queue.push(child)\n    for (const child of element.children) queue.push(child)\n  }\n  return {\n    documentElement: document.documentElement.scrollHeight,\n    body: document.body?.scrollHeight ?? 0,\n    scrollContainer,\n  }\n})()";
/** Validate raw DOM measurements before they reach native bitmap allocation. */
export declare function previewCaptureHeight(value: unknown, viewportHeight: number): number;
/**
 * The capture is cut at MAX_PREVIEW_HEIGHT, and never holds what a page scroller
 * hides below its first screen; the document height says how much was left out.
 */
export declare function previewPageHeights(value: unknown, viewportHeight: number): {
    documentHeight: number;
    capturedHeight: number;
};
//# sourceMappingURL=preview-settle.d.ts.map