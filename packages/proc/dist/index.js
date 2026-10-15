import { parseJsonValue } from './jsonrpc.js';
import { LineBuffer } from './frames.js';
export { LineBuffer, MAX_PROTOCOL_FRAME_BYTES, ProtocolFrameError, readSseData } from './frames.js';
export { applyDesktopPath, desktopPath } from './desktop-path.js';
export { killTree, spawnOwned } from './kill.js';
export { commandVersion, isInstalled, runCli, spawnCli } from './cli.js';
export { JsonRpcError, parseJsonValue, JsonRpcValueSchema, StdioJsonRpc, } from './jsonrpc.js';
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
export function readNdjson(stream, onValue, onUnparsable, options = {}) {
    const buffer = new LineBuffer(options.maxFrameBytes);
    let failed = false;
    const onLine = (raw) => {
        const line = raw.trim();
        if (line === '')
            return;
        let value;
        try {
            value = parseJsonValue(line);
        }
        catch {
            onUnparsable?.(line);
            return;
        }
        try {
            onValue(value);
        }
        catch (error) {
            options.onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    };
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
        if (failed)
            return;
        try {
            buffer.write(chunk, onLine);
        }
        catch (error) {
            failed = true;
            buffer.clear();
            const failure = error instanceof Error ? error : new Error('Provider stream failed');
            if (options.onError)
                options.onError(failure);
            else
                onUnparsable?.(failure.message);
        }
    });
    stream.on('end', () => {
        if (!failed)
            buffer.end(onLine);
    });
}
//# sourceMappingURL=index.js.map