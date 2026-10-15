export { DEFAULT_PORT } from './server-config.js';
/**
 * The local core server. Owns all state; clients are thin renderers.
 *
 * Every inbound payload is validated against the declared method schema before
 * it reaches any logic, and the failure is reported as structured data rather
 * than a stack trace — "invalid message" in a log tells you nothing at 2am.
 */
export declare function startServer(options?: {
    port?: number;
    host?: string;
    accessToken?: string | undefined;
    rendererOrigin?: string;
}): {
    port: number;
    close: () => Promise<void>;
};
/**
 * Which pages may open a socket to us.
 *
 * Browsers do not apply the same-origin policy to WebSocket, so binding to
 * loopback is not a trust boundary: any page the user visits could otherwise
 * connect and drive the agent — list their repos, start a thread with `full`
 * approval, or open a terminal.
 *
 * Allowed: no Origin at all (non-browser clients such as the CLI and tests),
 * `file://` (the packaged Electron renderer), and the exact renderer origin.
 * Browsers always send Origin on an upgrade; an empty or opaque one is not
 * equivalent to the missing header of a non-browser client.
 *
 * The dev renderer defaults to http://127.0.0.1:5183. HARNESS_RENDERER_ORIGIN
 * replaces it for a custom renderer port; desktop-owned servers set file://
 * so a packaged app does not trust an unrelated HTTP server on the dev port.
 *
 * `null` is NOT allowed, and must never be added back. It is the opaque
 * origin, and any page can mint one on demand — `<iframe sandbox=
 * "allow-scripts" srcdoc=…>` or a `data:` document — so allowing it hands the
 * gate straight back to the attacker it exists to stop. If a renderer of ours
 * ever reports an opaque origin, the answer is an access token for that
 * surface, not a hole here.
 *
 * When the server deliberately binds beyond loopback, an access token is
 * mandatory (see assertSafeBind), and that token becomes the trust boundary:
 * any origin may attempt the handshake, but only a connection carrying the
 * token is admitted.
 */
export declare function allowedOrigin(origin: string | undefined, accessToken?: string, rendererOrigin?: string): boolean;
export declare function clientErrorMessage(error: unknown): string;
export declare function hasAccess(requestUrl: string | undefined, expected: string | undefined): boolean;
export declare function assertSafeBind(host: string, accessToken: string | undefined): void;
//# sourceMappingURL=server.d.ts.map