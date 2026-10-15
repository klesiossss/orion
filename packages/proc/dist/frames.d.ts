/** Large enough for image and tool payloads, but finite even without a delimiter. */
export declare const MAX_PROTOCOL_FRAME_BYTES: number;
export declare class ProtocolFrameError extends Error {
    constructor();
}
/** Retains at most one bounded line, including when chunks contain many lines. */
export declare class LineBuffer {
    #private;
    readonly maxBytes: number;
    constructor(maxBytes?: number);
    get bufferedBytes(): number;
    write(chunk: string, onLine: (line: string) => void): void;
    end(onLine: (line: string) => void): void;
    clear(): void;
}
/** Shared SSE framing, including split CRLF, multiline data and bounded tails. */
export declare function readSseData(body: ReadableStream<Uint8Array>, maxBytes?: number): AsyncGenerator<string>;
//# sourceMappingURL=frames.d.ts.map