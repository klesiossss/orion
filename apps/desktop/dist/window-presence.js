/** Reassert the main window's ordinary desktop-app behavior whenever the OS
 *  activates or presents it, so a transient hidden or inert state cannot persist. */
export function restoreMainWindowPresence(platform, application, window) {
    if (platform === 'darwin') {
        application.setActivationPolicy('regular');
        window.setHiddenInMissionControl(false);
    }
    if (platform === 'darwin' || platform === 'win32')
        window.setSkipTaskbar(false);
    window.setFocusable(true);
    window.setMovable(true);
}
//# sourceMappingURL=window-presence.js.map