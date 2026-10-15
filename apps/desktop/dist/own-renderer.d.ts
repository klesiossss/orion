/**
 * Whether `url` is the renderer file the app itself loaded. Chromium reports
 * file URLs with an upper-case drive letter, while the loaded path keeps the
 * case the executable was started with (`c:\…` from a terminal), so Windows
 * compares the way its file system does: case-insensitively.
 */
export declare function isRendererFileUrl(url: string, indexPath: string, windows?: boolean): boolean;
/**
 * The URL the renderer file is loaded from. Electron's `loadFile` leaves a `%`
 * in the install path unescaped, so the reported URL no longer decodes to it.
 */
export declare function rendererFileUrl(indexPath: string, windows?: boolean): string;
//# sourceMappingURL=own-renderer.d.ts.map