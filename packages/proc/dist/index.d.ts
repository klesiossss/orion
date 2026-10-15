import { type JsonRpcValue } from './jsonrpc.js';
export { LineBuffer, MAX_PROTOCOL_FRAME_BYTES, ProtocolFrameError, readSseData } from './frames.js';
export { applyDesktopPath, desktopPath } from './desktop-path.js';
export type { DesktopPathOptions } from './desktop-path.js';
export { killTree, spawnOwned } from './kill.js';
export { commandVersion, isInstalled, runCli, spawnCli } from './cli.js';
export { JsonRpcError, parseJsonValue, JsonRpcValueSchema, StdioJsonRpc, type JsonRpcId, type JsonRpcRequestOptions, type JsonRpcResultParser, type JsonRpcValue, type ParsedJsonRpcRequestOptions, type ServerRequestHandler, type StdioJsonRpcProcess, } from './jsonrpc.js';
/**
 * Read newline-delimited JSON from a stream.
 *
 * Chunks split mid-line constantly, so the partial tail has to survive between
 * reads — parsing per chunk instead of per line is the bug every one of these
 * starts with.
 *
 * `onError` also receives whatever `onValue` throws. That is the consumer's
 * failure, not a broken stream, so the lines after it are still read.
 */
export declare function readNdjson(stream: NodeJS.ReadableStream, onValue: (value: JsonRpcValue) => void, onUnparsable?: (line: string) => void, options?: {
    maxFrameBytes?: number;
    onError?: (error: Error) => void;
}): void;
//# sourceMappingURL=index.d.ts.map