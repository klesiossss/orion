import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { z } from 'zod';
/**
 * Newline-delimited JSON-RPC 2.0 over a child process's stdio.
 *
 * Bidirectional on purpose: agents initiate requests too — Codex asks for
 * command approval, ACP agents ask for permission and for file reads — so this
 * is a peer, not a client.
 *
 * Shared because both protocols framed themselves the same way. The parts that
 * differ between them are method names and payloads, which belong in adapters,
 * not here.
 */
export type JsonRpcId = number | string;
export type StdioJsonRpcProcess = Pick<ChildProcessWithoutNullStreams, 'stdin' | 'stdout' | 'stderr' | 'on' | 'exitCode' | 'signalCode' | 'pid' | 'kill'>;
export declare const JsonRpcValueSchema: z.ZodJSONSchema;
export type JsonRpcValue = z.infer<typeof JsonRpcValueSchema>;
type JsonRpcResult = JsonRpcValue | undefined;
export declare function parseJsonValue(text: string): JsonRpcValue;
export interface JsonRpcResultParser<Result> {
    parse(value: unknown): Result;
}
export interface JsonRpcRequestOptions {
    timeoutMs?: number;
}
export interface ParsedJsonRpcRequestOptions<Result> extends JsonRpcRequestOptions {
    result: JsonRpcResultParser<Result>;
}
export type ServerRequestHandler = (method: string, params: JsonRpcResult, respond: (result: JsonRpcValue) => void, requestId?: JsonRpcId) => void;
export declare class JsonRpcError extends Error {
    readonly code: number;
    readonly data?: JsonRpcValue | undefined;
    constructor(code: number, message: string, data?: JsonRpcValue | undefined);
}
export declare class StdioJsonRpc {
    #private;
    /** `label` names the process in errors, so a dead child says which one died. */
    constructor(child: StdioJsonRpcProcess, label?: string, options?: {
        maxFrameBytes?: number;
        onProtocolError?: (error: Error) => void;
        /** Fires once for an unexpected terminal failure, never for dispose(). */
        onFailure?: (error: Error) => void;
    });
    onNotification(handler: (method: string, params: JsonRpcResult) => void): void;
    onServerRequest(handler: ServerRequestHandler): void;
    onStderr(handler: (text: string) => void): void;
    request(method: string, params?: unknown, options?: JsonRpcRequestOptions): Promise<JsonRpcResult>;
    request<Result>(method: string, params: unknown, options: ParsedJsonRpcRequestOptions<Result>): Promise<Result>;
    notify(method: string, params?: unknown): void;
    dispose(): Promise<void>;
}
export {};
//# sourceMappingURL=jsonrpc.d.ts.map