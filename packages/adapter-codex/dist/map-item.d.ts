import type { Item, ItemStatus } from '@harness/contracts';
import { z } from 'zod';
/** Runtime projection of the Codex item fields this adapter consumes. */
export declare const CodexThreadItemSchema: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"userMessage">;
    id: z.ZodOptional<z.ZodString>;
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        text: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"hookPrompt">;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"agentMessage">;
    id: z.ZodOptional<z.ZodString>;
    text: z.ZodString;
    phase: z.ZodNullable<z.ZodEnum<{
        commentary: "commentary";
        final_answer: "final_answer";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"reasoning">;
    id: z.ZodOptional<z.ZodString>;
    summary: z.ZodArray<z.ZodString>;
    content: z.ZodArray<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"plan">;
    id: z.ZodOptional<z.ZodString>;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"commandExecution">;
    id: z.ZodOptional<z.ZodString>;
    command: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
    aggregatedOutput: z.ZodNullable<z.ZodString>;
    exitCode: z.ZodNullable<z.ZodNumber>;
    durationMs: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"fileChange">;
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    changes: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        kind: z.ZodOptional<z.ZodObject<{
            type: z.ZodString;
            move_path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        diff: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"mcpToolCall">;
    id: z.ZodOptional<z.ZodString>;
    server: z.ZodString;
    tool: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
    arguments: z.ZodOptional<z.ZodUnknown>;
    result: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        content: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        structuredContent: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>>;
    error: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>>>;
    durationMs: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"dynamicToolCall">;
    id: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tool: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
    arguments: z.ZodOptional<z.ZodUnknown>;
    contentItems: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        text: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
    success: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    durationMs: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"collabAgentToolCall">;
    id: z.ZodOptional<z.ZodString>;
    tool: z.ZodEnum<{
        spawnAgent: "spawnAgent";
        sendInput: "sendInput";
        resumeAgent: "resumeAgent";
        wait: "wait";
        closeAgent: "closeAgent";
    }>;
    status: z.ZodEnum<{
        inProgress: "inProgress";
        completed: "completed";
        failed: "failed";
    }>;
    prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    receiverThreadIds: z.ZodArray<z.ZodString>;
    agentsStates: z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodObject<{
        status: z.ZodEnum<{
            completed: "completed";
            pendingInit: "pendingInit";
            running: "running";
            interrupted: "interrupted";
            errored: "errored";
            shutdown: "shutdown";
            notFound: "notFound";
        }>;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"subAgentActivity">;
    id: z.ZodOptional<z.ZodString>;
    kind: z.ZodEnum<{
        interrupted: "interrupted";
        started: "started";
        interacted: "interacted";
    }>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"webSearch">;
    id: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"imageView">;
    id: z.ZodOptional<z.ZodString>;
    path: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"sleep">;
    id: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"imageGeneration">;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"enteredReviewMode">;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"exitedReviewMode">;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"contextCompaction">;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "type">, z.ZodPipe<z.ZodObject<{
    type: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    id?: string;
    type: "unknown";
    wireType: string;
}, {
    type: string;
    id?: string | undefined;
}>>]>;
export type CodexThreadItem = z.infer<typeof CodexThreadItemSchema>;
/**
 * Translate a Codex thread item into the provider-neutral transcript model.
 *
 * Tool activity keeps the transcript's text convention so the renderer can
 * read every provider the same way: the first line names the tool, an
 * optional JSON line carries its arguments, and whatever follows is output.
 * File changes carry a unified diff, like the replayed history does.
 */
export declare function mapThreadItem(item: CodexThreadItem, context: {
    turnId: string;
    status: ItemStatus;
    createdAt: number;
}): Item;
export declare function countDiffLines(diff: string, marker: '+' | '-'): number;
//# sourceMappingURL=map-item.d.ts.map