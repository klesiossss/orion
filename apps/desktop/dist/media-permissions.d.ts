/** Only an explicit audio-only request may reach the OS microphone prompt. */
export declare function allowsMicrophoneRequest(details: unknown): boolean;
export declare function isOwnRendererPermission(permission: string, mediaType?: unknown): boolean;
/**
 * Permission requests the app's own main-frame renderer may make. Element
 * fullscreen (the media viewer) only arrives as a request, so the
 * synchronous check path keeps answering through isOwnRendererPermission.
 */
export declare function allowsOwnRendererRequest(permission: string): boolean;
//# sourceMappingURL=media-permissions.d.ts.map