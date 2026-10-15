/**
 * One call to a Grok Build ACP extension in a short-lived provider process.
 * The process owns its credentials, request headers and token refresh
 * lifecycle; TasteCode only receives the response it deliberately exposes.
 */
export declare function requestGrokExtension(method: string, label: string): Promise<unknown>;
//# sourceMappingURL=acp.d.ts.map