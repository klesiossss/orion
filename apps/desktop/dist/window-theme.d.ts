export declare function windowThemeOptions(themeValue: unknown): {
    backgroundColor: string;
    titleBarOverlay: {
        color: string;
        symbolColor: string;
        height: number;
    };
};
export declare function windowThemeSource(preference: unknown): 'system' | 'light' | 'dark';
/**
 * The colours the renderer actually paints where native chrome meets it: the
 * page background, the title bar under the caption buttons and the title-bar
 * symbol colour. Theme, tinted backdrops and the open surface (the Settings
 * title bar is a shade off the rail) all change them, which a light/dark pair
 * of constants cannot follow.
 */
export type WindowChrome = {
    theme: 'light' | 'dark';
    background: string;
    caption: string;
    symbol: string;
};
/** Validates a renderer-supplied WindowChrome; throws on anything else. */
export declare function parseWindowChrome(value: unknown): WindowChrome;
export declare function windowChromeOptions(chrome: WindowChrome): {
    backgroundColor: string;
    titleBarOverlay: {
        color: string;
        symbolColor: string;
        height: number;
    };
};
/** The chrome the renderer last reported, so the next launch opens in it instead of dark. */
export declare function loadWindowChrome(filePath: string): WindowChrome | undefined;
export declare function saveWindowChrome(filePath: string, chrome: WindowChrome): void;
//# sourceMappingURL=window-theme.d.ts.map