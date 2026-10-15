import type { DomainEvent } from '@harness/contracts';
import type { SessionUpdate, ToolCallContent, ToolKind } from './protocol.js';
export declare class Streamer {
    #private;
    constructor(turnId: string, workspacePath?: string);
    /**
     * Record what a tool call is before any update mentions it.
     *
     * A call that needs permission is described only in the permission request,
     * which is a JSON-RPC request rather than a session update. Its first and
     * only update is the completion, and that one carries no kind or title.
     */
    note(toolCallId: string, fields: {
        kind?: ToolKind;
        title?: string;
        content?: ToolCallContent[];
    }): void;
    /** Called when a turn ends, so the next one does not append to a stale item. */
    reset(): void;
    /** Finish streamed items before the turn closes so history has immutable text. */
    finish(): DomainEvent[];
    translate(update: SessionUpdate): DomainEvent[];
}
//# sourceMappingURL=events.d.ts.map