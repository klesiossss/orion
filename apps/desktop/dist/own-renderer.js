import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
/**
 * Whether `url` is the renderer file the app itself loaded. Chromium reports
 * file URLs with an upper-case drive letter, while the loaded path keeps the
 * case the executable was started with (`c:\…` from a terminal), so Windows
 * compares the way its file system does: case-insensitively.
 */
export function isRendererFileUrl(url, indexPath, windows = process.platform === 'win32') {
    const parsed = new URL(url);
    if (parsed.protocol !== 'file:')
        return false;
    parsed.hash = '';
    parsed.search = '';
    const file = fileURLToPath(parsed, { windows });
    return windows ? path.win32.relative(file, indexPath) === '' : file === indexPath;
}
/**
 * The URL the renderer file is loaded from. Electron's `loadFile` leaves a `%`
 * in the install path unescaped, so the reported URL no longer decodes to it.
 */
export function rendererFileUrl(indexPath, windows = process.platform === 'win32') {
    return pathToFileURL(indexPath, { windows }).href;
}
//# sourceMappingURL=own-renderer.js.map