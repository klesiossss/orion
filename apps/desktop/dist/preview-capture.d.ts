import { mkdir, rm, writeFile } from 'node:fs/promises';
import type { BrowserWindow } from 'electron';
import type { PreviewCaptureRequest, PreviewCaptureResult, PreviewDomAudit } from '@harness/contracts';
type Dependencies = {
    createWindow: (request: PreviewCaptureRequest) => BrowserWindow;
    releaseWindow: (window: BrowserWindow) => void;
    directory: (requestId: string) => string;
    parseAudit: (value: unknown) => Promise<PreviewDomAudit>;
    files?: {
        mkdir: typeof mkdir;
        rm: typeof rm;
        writeFile: typeof writeFile;
    };
    timeoutMs?: number;
    cleanupTimeoutMs?: number;
};
/** The fixed Chromium partition has one owner, including while cleanup is pending. */
export declare class PreviewCaptureOwner {
    #private;
    private readonly dependencies;
    constructor(dependencies: Dependencies);
    captureAfterValidation(value: unknown, loadValidator: () => Promise<(value: unknown) => PreviewCaptureRequest>, canCapture: () => boolean): Promise<PreviewCaptureResult>;
    capture(request: PreviewCaptureRequest): Promise<PreviewCaptureResult>;
    cancel(requestId: string, reason?: Error): void;
    cancelAll(): void;
}
export {};
//# sourceMappingURL=preview-capture.d.ts.map