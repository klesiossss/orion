import type { Rectangle } from 'electron';
export type MainWindowState = {
    version: 1;
    bounds: Rectangle;
    fullScreen: boolean;
    maximized: boolean;
};
export type RestoredMainWindowState = {
    bounds: Rectangle | Pick<Rectangle, 'width' | 'height'>;
    fullScreen: boolean;
    maximized: boolean;
};
export type MainWindowStatePersistence = {
    saveAndStop: () => void;
    stop: () => void;
};
type WindowSize = Pick<Rectangle, 'width' | 'height'>;
type MainWindowStateTarget = {
    getNormalBounds: () => Rectangle;
    on(event: 'move', listener: () => void): void;
    on(event: 'resize', listener: () => void): void;
    on(event: 'enter-full-screen', listener: () => void): void;
    on(event: 'leave-full-screen', listener: () => void): void;
    on(event: 'maximize', listener: () => void): void;
    on(event: 'unmaximize', listener: () => void): void;
    on(event: 'close', listener: () => void): void;
    off(event: 'move', listener: () => void): void;
    off(event: 'resize', listener: () => void): void;
    off(event: 'enter-full-screen', listener: () => void): void;
    off(event: 'leave-full-screen', listener: () => void): void;
    off(event: 'maximize', listener: () => void): void;
    off(event: 'unmaximize', listener: () => void): void;
    off(event: 'close', listener: () => void): void;
};
export declare function parseMainWindowState(value: unknown): MainWindowState | undefined;
export declare function loadMainWindowState(filePath: string): MainWindowState | undefined;
export declare function saveMainWindowState(filePath: string, state: MainWindowState): void;
export declare function restoreMainWindowState(state: MainWindowState | undefined, workArea: Rectangle | undefined, fallbackSize: WindowSize, minimumSize: WindowSize): RestoredMainWindowState;
export declare function persistMainWindowState(window: MainWindowStateTarget, initialState: RestoredMainWindowState, save: (state: MainWindowState) => void, onError?: (error: unknown) => void): MainWindowStatePersistence;
export {};
//# sourceMappingURL=window-state.d.ts.map