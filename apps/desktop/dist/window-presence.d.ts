type ApplicationPresence = {
    setActivationPolicy: (policy: 'regular' | 'accessory' | 'prohibited') => void;
};
type WindowPresence = {
    setFocusable: (focusable: boolean) => void;
    setHiddenInMissionControl: (hidden: boolean) => void;
    setMovable: (movable: boolean) => void;
    setSkipTaskbar: (skip: boolean) => void;
};
/** Reassert the main window's ordinary desktop-app behavior whenever the OS
 *  activates or presents it, so a transient hidden or inert state cannot persist. */
export declare function restoreMainWindowPresence(platform: NodeJS.Platform, application: ApplicationPresence, window: WindowPresence): void;
export {};
//# sourceMappingURL=window-presence.d.ts.map