export function configurePreviewNavigation(contents, previewUrl) {
    contents.on('will-navigate', (event, url) => {
        if (!allowsPreviewNavigation(previewUrl, url))
            event.preventDefault();
    });
    contents.on('will-redirect', (details) => {
        if (details.isMainFrame && !allowsPreviewNavigation(previewUrl, details.url))
            details.preventDefault();
    });
}
export function allowsPreviewNavigation(previewUrl, navigationUrl) {
    // A throw here would skip preventDefault in the navigation handler — deny.
    try {
        return new URL(navigationUrl).origin === new URL(previewUrl).origin;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=preview-navigation.js.map