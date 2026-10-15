import type { Event, WebContents, WebPreferences } from 'electron';
export interface EmbeddedBrowserOwner {
    on(event: 'will-attach-webview', listener: (event: Event, webPreferences: WebPreferences, params: Record<string, string>) => void): unknown;
    on(event: 'did-attach-webview', listener: (event: Event, webContents: WebContents) => void): unknown;
}
/**
 * Configure renderer-owned <webview> guests before any remote content is
 * attached. The page lives in Chromium's guest process, while the UI remains a
 * normal DOM element that follows the sidebar's layout without native overlays.
 */
export declare function configureEmbeddedBrowser(owner: EmbeddedBrowserOwner): void;
export declare function browserGuestUrl(value: unknown): string;
/** Present the guest as Chromium instead of exposing the Electron shell. */
export declare function browserUserAgent(value: string): string;
//# sourceMappingURL=embedded-browser.d.ts.map