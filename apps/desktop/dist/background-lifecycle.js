export function shouldHideWindowOnClose(platform, appIsQuitting) {
    return platform !== 'darwin' && !appIsQuitting;
}
//# sourceMappingURL=background-lifecycle.js.map