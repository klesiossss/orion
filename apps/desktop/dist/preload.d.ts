import type { PreviewCaptureRequest, PreviewCaptureResult } from '@harness/contracts';
import type { AppUpdateState } from './app-updater.js';
import { type NativeMenuActionSource } from './menu-contract.js';
import type { WindowChrome } from './window-theme.js';
type PickedAttachment = {
    path: string;
    name: string;
    mediaType?: 'image' | 'video';
    previewUrl?: string;
    thumbnailUrl?: string;
};
/**
 * The entire native surface exposed to the renderer.
 *
 * Everything else goes over the server socket, because the renderer is the
 * least trusted process in the app and every function added here is permanent
 * attack surface. Native dialogs, window-integrated surfaces, trackpad
 * feedback, and materializing validated clipboard images are the operations
 * that cannot work through the browser surface.
 */
declare const api: {
    isDesktop: boolean;
    reportStartupMilestone?: (name: string) => void;
    pickFolder: () => Promise<string | undefined>;
    droppedFolderPaths: (files: File[]) => Promise<string[]>;
    pickSkillFolder: () => Promise<string | undefined>;
    pickFiles: () => Promise<PickedAttachment[]>;
    droppedFilePath: (file: File) => string | undefined;
    previewViewedImage: (reference: string) => Promise<PickedAttachment | undefined>;
    revealPath: (path: string) => Promise<void>;
    revealProjectFile: (path: string, projectPath: string) => Promise<void>;
    savePastedFile: (file: {
        name: string;
        type: string;
        bytes: ArrayBuffer;
    }) => Promise<PickedAttachment>;
    writeClipboardText: (text: string) => Promise<void>;
    setZoom: (action: "in" | "out" | "reset") => Promise<void>;
    setTheme: (preference: "system" | "light" | "dark") => Promise<void>;
    setWindowChrome: (chrome: WindowChrome) => Promise<void>;
    prepareHaptics: () => void;
    performHaptic: (pattern: NativeHapticPattern) => void;
    capturePreview: (request: PreviewCaptureRequest) => Promise<PreviewCaptureResult>;
    cancelPreviewCapture: (requestId: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
    getDiagnosticsEnabled: () => Promise<boolean>;
    setDiagnosticsEnabled: (enabled: boolean) => Promise<boolean>;
    openDiagnostics: () => Promise<boolean>;
    crashAgents: () => Promise<unknown>;
    launchCrashAgent: (agent: string, details: unknown) => Promise<void>;
    reportRendererError: (message: string) => void;
    getUpdateState: () => Promise<AppUpdateState>;
    checkForUpdates: () => Promise<AppUpdateState>;
    installUpdate: () => Promise<boolean>;
    setMenuShortcuts: (shortcuts: unknown) => void;
    onMenuAction: (listener: (action: string, source: NativeMenuActionSource) => void) => (() => void);
    suspendMenuShortcuts: (suspended: boolean) => void;
    onUpdateState: (listener: (state: AppUpdateState) => void) => (() => void);
    onZoomChange: (listener: (factor: number) => void) => (() => void);
};
export type HarnessBridge = typeof api;
type NativeHapticPattern = 'alignment' | 'generic';
export {};
//# sourceMappingURL=preload.d.ts.map