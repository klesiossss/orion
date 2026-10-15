/**
 * Windows' compositor can wrongly conclude the main window is invisible and
 * stop painting it: the window sits on screen showing only its background
 * colour while the page keeps running with document.visibilityState 'hidden'.
 * Diagnosed over CDP against a live black window — DOM complete, renderer
 * healthy, focus true, paint off. It is intermittent, which is why it read as
 * "the app worked a moment ago and went black".
 *
 * Two defences. The occlusion tracker that causes most of it is switched off
 * in main.ts (CalculateNativeWinOcclusion). And because the state was observed
 * even then, this watchdog reads the main frame's native visibility state at
 * a slow interval and heals a visible-but-hidden mismatch with a hide/show
 * cycle, which re-attaches the compositor without waking renderer JavaScript.
 */
type WatchedWindow = {
    isDestroyed(): boolean;
    isVisible(): boolean;
    isMinimized(): boolean;
    isFocused(): boolean;
    hide(): void;
    show(): void;
    on?(event: WatchdogWindowEvent, listener: () => void): unknown;
    removeListener?(event: WatchdogWindowEvent, listener: () => void): unknown;
    webContents: {
        mainFrame: {
            readonly visibilityState: string;
        };
    };
};
type WatchdogWindowEvent = 'focus' | 'blur' | 'show' | 'hide' | 'restore' | 'minimize' | 'closed';
/** Decides whether a heal is needed; pure so the policy is testable. */
export declare function needsCompositorNudge(state: {
    destroyed: boolean;
    visible: boolean;
    minimized: boolean;
    focused: boolean;
    pageVisibility: string;
}): boolean;
export declare function startVisibilityWatchdog(window: WatchedWindow, onLog: (line: string) => void, intervalMs?: number, platform?: NodeJS.Platform): () => void;
export {};
//# sourceMappingURL=window-visibility-watchdog.d.ts.map