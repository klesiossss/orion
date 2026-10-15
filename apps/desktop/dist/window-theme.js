import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
/** Matches --titlebar-h; Windows sizes the caption buttons from it. */
const TITLE_BAR_HEIGHT = 34;
export function windowThemeOptions(themeValue) {
    if (themeValue !== 'light' && themeValue !== 'dark') {
        throw new Error('Invalid window theme');
    }
    const theme = themeValue;
    // The overlay colour must match the renderer's --bg-rail: the native caption
    // buttons sit on the title bar, and that bar carries the sidebar colour so
    // the two read as one element.
    if (theme === 'light') {
        return {
            backgroundColor: '#fdfdfd',
            titleBarOverlay: { color: '#fcfcfc', symbolColor: '#27272a', height: TITLE_BAR_HEIGHT },
        };
    }
    return {
        backgroundColor: '#202020',
        titleBarOverlay: { color: '#131313', symbolColor: '#ffffff', height: TITLE_BAR_HEIGHT },
    };
}
export function windowThemeSource(preference) {
    if (preference !== 'system' && preference !== 'light' && preference !== 'dark') {
        throw new Error('Invalid window theme preference');
    }
    return preference;
}
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
/** Validates a renderer-supplied WindowChrome; throws on anything else. */
export function parseWindowChrome(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Invalid window chrome');
    }
    const candidate = value;
    const { theme, background, caption, symbol } = candidate;
    if ((theme !== 'light' && theme !== 'dark') ||
        typeof background !== 'string' ||
        typeof caption !== 'string' ||
        typeof symbol !== 'string' ||
        ![background, caption, symbol].every((color) => HEX_COLOR.test(color))) {
        throw new Error('Invalid window chrome');
    }
    return { theme, background, caption, symbol };
}
export function windowChromeOptions(chrome) {
    return {
        backgroundColor: chrome.background,
        titleBarOverlay: {
            color: chrome.caption,
            symbolColor: chrome.symbol,
            height: TITLE_BAR_HEIGHT,
        },
    };
}
/** The chrome the renderer last reported, so the next launch opens in it instead of dark. */
export function loadWindowChrome(filePath) {
    try {
        return parseWindowChrome(JSON.parse(readFileSync(filePath, 'utf8')));
    }
    catch {
        return undefined;
    }
}
export function saveWindowChrome(filePath, chrome) {
    mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
    writeFileSync(filePath, `${JSON.stringify(chrome)}\n`, { encoding: 'utf8', mode: 0o600 });
}
//# sourceMappingURL=window-theme.js.map