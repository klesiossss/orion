import type { ProviderHistorySession } from '@harness/contracts';
type RecordValue = Record<string, unknown>;
export declare function record(value: unknown): RecordValue;
export declare function text(value: unknown): string | undefined;
/** ACP updates retain display content, timing, diffs and turn boundaries lost from model history. */
export declare function grokHistoryEvents(session: ProviderHistorySession, updates: RecordValue[], chat: RecordValue[]): ({
    type: "thread.started";
    thread: {
        id: string;
        provider: "grok" | "codex" | "claude-code";
        workspacePath: string;
        createdAt: number;
        title?: string | undefined;
    };
} | {
    type: "turn.started";
    turn: {
        id: string;
        threadId: string;
        status: "completed" | "failed" | "interrupted" | "running";
        createdAt: number;
    };
} | {
    type: "item.started";
    item: {
        id: string;
        turnId: string;
        type: "command" | "message" | "file_change" | "tool_call" | "error" | "unknown" | "reasoning" | "plan";
        status: "completed" | "failed" | "started";
        createdAt: number;
        role?: "assistant" | "user" | undefined;
        phase?: "commentary" | "final_answer" | undefined;
        text?: string | undefined;
        attachments?: string[] | undefined;
        command?: string | undefined;
        exitCode?: number | undefined;
        durationMs?: number | undefined;
        path?: string | undefined;
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
    };
} | {
    type: "item.delta";
    turnId: string;
    itemId: string;
    textDelta: string;
} | {
    type: "item.completed";
    item: {
        id: string;
        turnId: string;
        type: "command" | "message" | "file_change" | "tool_call" | "error" | "unknown" | "reasoning" | "plan";
        status: "completed" | "failed" | "started";
        createdAt: number;
        role?: "assistant" | "user" | undefined;
        phase?: "commentary" | "final_answer" | undefined;
        text?: string | undefined;
        attachments?: string[] | undefined;
        command?: string | undefined;
        exitCode?: number | undefined;
        durationMs?: number | undefined;
        path?: string | undefined;
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
    };
} | {
    type: "turn.completed";
    turnId: string;
    status: "completed" | "failed" | "interrupted";
    completedAt?: number | undefined;
} | {
    type: "thread.error";
    threadId: string;
    message: string;
} | {
    type: "plan.updated";
    turnId: string;
    steps: {
        text: string;
        status: "done" | "running" | "pending";
    }[];
} | {
    type: "usage.updated";
    usage: {
        inputTokens: number;
        cachedInputTokens: number;
        outputTokens: number;
        reasoningTokens: number;
        totalTokens: number;
        model?: string | undefined;
        cumulative?: boolean | undefined;
        inputIncludesCached?: boolean | undefined;
        costUsd?: number | undefined;
        contextWindow?: number | undefined;
    };
} | {
    type: "diff.updated";
    turnId: string;
    diff: string;
} | {
    type: "approval.requested";
    request: {
        id: string;
        kind: "command" | "file_change" | "permissions";
        createdAt: number;
        reason?: string | undefined;
        command?: string | undefined;
        cwd?: string | undefined;
        path?: string | undefined;
    };
} | {
    type: "approval.resolved";
    id: string;
} | {
    type: "user_input.requested";
    request: {
        id: string;
        turnId: string;
        questions: {
            id: string;
            header: string;
            question: string;
            allowOther: boolean;
            secret: boolean;
            options: {
                label: string;
                description: string;
            }[] | null;
            multiSelect?: boolean | undefined;
        }[];
        autoResolutionMs: number | null;
        createdAt: number;
    };
} | {
    type: "user_input.resolved";
    id: string;
} | {
    type: "approval.review.started";
    review: {
        id: string;
        turnId: string;
        status: "in_progress" | "approved" | "denied" | "timed_out" | "aborted";
        description: string;
        startedAt: number;
        rationale?: string | undefined;
        riskLevel?: "low" | "medium" | "high" | "critical" | undefined;
        completedAt?: number | undefined;
    };
} | {
    type: "approval.review.completed";
    review: {
        id: string;
        turnId: string;
        status: "in_progress" | "approved" | "denied" | "timed_out" | "aborted";
        description: string;
        startedAt: number;
        rationale?: string | undefined;
        riskLevel?: "low" | "medium" | "high" | "critical" | undefined;
        completedAt?: number | undefined;
    };
})[];
export {};
//# sourceMappingURL=history-transcript.d.ts.map