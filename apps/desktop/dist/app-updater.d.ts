import type { AppUpdater } from 'electron-updater';
export type UpdateClient = Pick<AppUpdater, 'allowDowngrade' | 'allowPrerelease' | 'autoDownload' | 'autoInstallOnAppQuit' | 'checkForUpdates' | 'downloadUpdate' | 'on' | 'quitAndInstall'> & {
    dispose?: () => void | Promise<void>;
};
export type AppUpdateState = {
    status: 'unsupported' | 'idle' | 'checking' | 'downloading' | 'preparing' | 'current' | 'ready' | 'error';
    currentVersion: string;
    version?: string;
    progress?: number;
    error?: string;
};
/** Who asked for an update attempt. Only a person's own attempt may show its failure. */
export type UpdateCheckOrigin = 'user' | 'background';
export declare function createAppUpdateController(options: {
    currentVersion: string;
    enabled: boolean;
    /** Receives every failure, including the background ones the UI never shows. */
    onError?: (cause: unknown) => void;
    setTimeoutFn?: typeof setTimeout;
    clearTimeoutFn?: typeof clearTimeout;
} & ({
    updater: UpdateClient;
    loadUpdater?: never;
} | {
    updater?: never;
    loadUpdater: () => Promise<UpdateClient>;
})): {
    state: () => AppUpdateState;
    check: (origin?: UpdateCheckOrigin) => Promise<AppUpdateState>;
    install: () => boolean;
    subscribe: (listener: (next: AppUpdateState) => void) => () => boolean;
    start: () => void;
    resume: () => void;
    dispose: () => void | Promise<void> | undefined;
};
export type AppUpdateController = ReturnType<typeof createAppUpdateController>;
//# sourceMappingURL=app-updater.d.ts.map