import type { PreviewCaptureRequest, PreviewCaptureResult, PreviewScreenshot, PreviewViewport } from '@harness/contracts';
import type { WebSocket } from 'ws';
export declare class PreviewCaptureCoordinator<Client extends object = WebSocket> {
    #private;
    private readonly send;
    private readonly timeoutMs;
    private readonly cancel;
    constructor(send: (socket: Client, request: PreviewCaptureRequest) => void, timeoutMs?: number, cancel?: (socket: Client, requestId: string) => void);
    get available(): boolean;
    setCapability(socket: Client, available: boolean): void;
    remove(socket: Client): void;
    capture(url: string, viewports: PreviewViewport[], signal?: AbortSignal): Promise<PreviewScreenshot[]>;
    complete(socket: Client, result: PreviewCaptureResult): void;
}
//# sourceMappingURL=preview-capture.d.ts.map