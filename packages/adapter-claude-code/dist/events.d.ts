import type { DomainEvent, Item, Usage } from '@harness/contracts';
import { z } from 'zod';
declare const ClaudeUsageSchema: z.ZodObject<{
    input_tokens: z.ZodOptional<z.ZodNumber>;
    output_tokens: z.ZodOptional<z.ZodNumber>;
    cache_read_input_tokens: z.ZodOptional<z.ZodNumber>;
    cache_creation_input_tokens: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ClaudeEventSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    subtype: z.ZodOptional<z.ZodString>;
    session_id: z.ZodOptional<z.ZodString>;
    uuid: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            text: z.ZodOptional<z.ZodString>;
            thinking: z.ZodOptional<z.ZodString>;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
            tool_use_id: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodUnknown>;
            is_error: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>>;
        usage: z.ZodOptional<z.ZodObject<{
            input_tokens: z.ZodOptional<z.ZodNumber>;
            output_tokens: z.ZodOptional<z.ZodNumber>;
            cache_read_input_tokens: z.ZodOptional<z.ZodNumber>;
            cache_creation_input_tokens: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    result: z.ZodOptional<z.ZodString>;
    is_error: z.ZodOptional<z.ZodBoolean>;
    duration_ms: z.ZodOptional<z.ZodNumber>;
    total_cost_usd: z.ZodOptional<z.ZodNumber>;
    usage: z.ZodOptional<z.ZodObject<{
        input_tokens: z.ZodOptional<z.ZodNumber>;
        output_tokens: z.ZodOptional<z.ZodNumber>;
        cache_read_input_tokens: z.ZodOptional<z.ZodNumber>;
        cache_creation_input_tokens: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ClaudeEvent = z.infer<typeof ClaudeEventSchema>;
type ClaudeUsage = z.infer<typeof ClaudeUsageSchema>;
/**
 * Translate one envelope into domain events.
 *
 * Returns a list because a single assistant message can carry text, thinking
 * and several tool calls at once — Claude Code batches where Codex streams.
 *
 * `tools` remembers each call by its tool_use id so the result that follows
 * lands on the same item: the call turns from started into completed (or
 * failed) with its output attached, the way the saved-history replay already
 * reads. Without the map a result has nothing to attach to and stands alone.
 */
export declare function toDomainEvents(event: ClaudeEvent, turnId: string, tools?: Map<string, Item>): DomainEvent[];
type ToolInput = Record<string, unknown>;
/**
 * What a tool_use block contributes to its item. Shell tools read as a
 * command, edit tools as a file change carrying the edit as a unified diff,
 * and everything else as a tool call whose text names the tool on the first
 * line and carries its input as one JSON line — the transcript's convention
 * for every provider.
 */
export declare function toolUseItemFields(name: string, input: ToolInput): {
    type: 'command';
    command: string;
} | {
    type: 'file_change';
    path: string;
    text?: string;
    linesAdded?: number;
    linesRemoved?: number;
} | {
    type: 'tool_call';
    text: string;
};
export declare function toUsage(usage: ClaudeUsage | undefined, costUsd?: number): Usage | undefined;
export {};
//# sourceMappingURL=events.d.ts.map