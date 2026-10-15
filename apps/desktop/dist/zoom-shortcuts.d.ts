export type ZoomAction = 'in' | 'out' | 'reset';
export declare const DEFAULT_ZOOM_FACTOR = 1.1;
export declare function isZoomAction(value: unknown): value is ZoomAction;
export declare function zoomShortcut(input: {
    key: string;
    control: boolean;
    meta: boolean;
    alt: boolean;
}): ZoomAction | undefined;
export declare function nextZoomFactor(current: number, action: ZoomAction): number;
//# sourceMappingURL=zoom-shortcuts.d.ts.map