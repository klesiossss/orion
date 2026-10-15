import { z } from 'zod';
/**
 * The Agent Client Protocol, as agents actually speak it.
 *
 * These decoders follow captured frames from `gemini --experimental-acp`.
 * Optional fields keep independent ACP implementations interoperable while
 * every frame is still decoded before it reaches the adapter.
 */
export declare const PROTOCOL_VERSION = 1;
export declare const ContentBlockSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
    uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
}, z.core.$strip>;
export declare const InitializeResultSchema: z.ZodObject<{
    protocolVersion: z.ZodOptional<z.ZodNumber>;
    agentInfo: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    agentCapabilities: z.ZodOptional<z.ZodObject<{
        loadSession: z.ZodOptional<z.ZodBoolean>;
        promptCapabilities: z.ZodOptional<z.ZodObject<{
            image: z.ZodOptional<z.ZodBoolean>;
            audio: z.ZodOptional<z.ZodBoolean>;
            embeddedContext: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    authMethods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const NewSessionResultSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    modes: z.ZodOptional<z.ZodObject<{
        currentModeId: z.ZodOptional<z.ZodString>;
        availableModes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    configOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        currentValue: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const StopReasonSchema: z.ZodEnum<{
    end_turn: "end_turn";
    max_tokens: "max_tokens";
    max_turn_requests: "max_turn_requests";
    refusal: "refusal";
    cancelled: "cancelled";
}>;
export declare const PromptResultSchema: z.ZodObject<{
    stopReason: z.ZodOptional<z.ZodEnum<{
        end_turn: "end_turn";
        max_tokens: "max_tokens";
        max_turn_requests: "max_turn_requests";
        refusal: "refusal";
        cancelled: "cancelled";
    }>>;
    usage: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        totalTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        inputTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        outputTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        thoughtTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        cachedReadTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        cachedWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ToolKindSchema: z.ZodEnum<{
    read: "read";
    edit: "edit";
    delete: "delete";
    move: "move";
    search: "search";
    execute: "execute";
    think: "think";
    fetch: "fetch";
    switch_mode: "switch_mode";
    other: "other";
}>;
export declare const ToolCallStatusSchema: z.ZodEnum<{
    pending: "pending";
    in_progress: "in_progress";
    completed: "completed";
    failed: "failed";
}>;
export declare const ToolCallContentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"content">;
    content: z.ZodOptional<z.ZodObject<{
        type: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"diff">;
    path: z.ZodOptional<z.ZodString>;
    oldText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    newText: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"terminal">;
    terminalId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "type">;
export declare const ToolCallFieldsSchema: z.ZodObject<{
    toolCallId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
    kind: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        read: "read";
        edit: "edit";
        delete: "delete";
        move: "move";
        search: "search";
        execute: "execute";
        think: "think";
        fetch: "fetch";
        switch_mode: "switch_mode";
        other: "other";
    }>>>, z.ZodTransform<NonNullable<"read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other"> | undefined, "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other" | null | undefined>>>;
    status: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        pending: "pending";
        in_progress: "in_progress";
        completed: "completed";
        failed: "failed";
    }>>>, z.ZodTransform<NonNullable<"pending" | "in_progress" | "completed" | "failed"> | undefined, "pending" | "in_progress" | "completed" | "failed" | null | undefined>>>;
    content: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"content">;
        content: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
            data: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
            uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"diff">;
        path: z.ZodOptional<z.ZodString>;
        oldText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        newText: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"terminal">;
        terminalId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>>>, z.ZodTransform<({
        type: "content";
        content?: {
            type?: string | undefined;
            text?: string | undefined;
            data?: string | undefined;
            mimeType?: string | undefined;
            uri?: string | undefined;
        } | undefined;
    } | {
        type: "diff";
        path?: string | undefined;
        oldText?: string | null | undefined;
        newText?: string | undefined;
    } | {
        type: "terminal";
        terminalId?: string | undefined;
    })[] | undefined, ({
        type: "content";
        content?: {
            type?: string | undefined;
            text?: string | undefined;
            data?: string | undefined;
            mimeType?: string | undefined;
            uri?: string | undefined;
        } | undefined;
    } | {
        type: "diff";
        path?: string | undefined;
        oldText?: string | null | undefined;
        newText?: string | undefined;
    } | {
        type: "terminal";
        terminalId?: string | undefined;
    })[] | null | undefined>>>;
    locations: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        path: z.ZodOptional<z.ZodString>;
        line: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | undefined, number | null | undefined>>>;
    }, z.core.$strip>>>>, z.ZodTransform<{
        path?: string | undefined;
        line?: number | undefined;
    }[] | undefined, {
        path?: string | undefined;
        line?: number | undefined;
    }[] | null | undefined>>>;
    rawInput: z.ZodOptional<z.ZodJSONSchema>;
}, z.core.$strip>;
export declare const SessionUpdateSchema: z.ZodObject<{
    sessionUpdate: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
    }, z.core.$strip>, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"content">;
        content: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
            data: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
            uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"diff">;
        path: z.ZodOptional<z.ZodString>;
        oldText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        newText: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"terminal">;
        terminalId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>]>>>, z.ZodTransform<NonNullable<{
        type?: string | undefined;
        text?: string | undefined;
        data?: string | undefined;
        mimeType?: string | undefined;
        uri?: string | undefined;
    } | ({
        type: "content";
        content?: {
            type?: string | undefined;
            text?: string | undefined;
            data?: string | undefined;
            mimeType?: string | undefined;
            uri?: string | undefined;
        } | undefined;
    } | {
        type: "diff";
        path?: string | undefined;
        oldText?: string | null | undefined;
        newText?: string | undefined;
    } | {
        type: "terminal";
        terminalId?: string | undefined;
    })[]> | undefined, {
        type?: string | undefined;
        text?: string | undefined;
        data?: string | undefined;
        mimeType?: string | undefined;
        uri?: string | undefined;
    } | ({
        type: "content";
        content?: {
            type?: string | undefined;
            text?: string | undefined;
            data?: string | undefined;
            mimeType?: string | undefined;
            uri?: string | undefined;
        } | undefined;
    } | {
        type: "diff";
        path?: string | undefined;
        oldText?: string | null | undefined;
        newText?: string | undefined;
    } | {
        type: "terminal";
        terminalId?: string | undefined;
    })[] | null | undefined>>>;
    entries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    availableCommands: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    currentModeId: z.ZodOptional<z.ZodString>;
    used: z.ZodOptional<z.ZodNumber>;
    size: z.ZodOptional<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        amount: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    toolCallId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
    kind: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        read: "read";
        edit: "edit";
        delete: "delete";
        move: "move";
        search: "search";
        execute: "execute";
        think: "think";
        fetch: "fetch";
        switch_mode: "switch_mode";
        other: "other";
    }>>>, z.ZodTransform<NonNullable<"read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other"> | undefined, "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other" | null | undefined>>>;
    status: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        pending: "pending";
        in_progress: "in_progress";
        completed: "completed";
        failed: "failed";
    }>>>, z.ZodTransform<NonNullable<"pending" | "in_progress" | "completed" | "failed"> | undefined, "pending" | "in_progress" | "completed" | "failed" | null | undefined>>>;
    locations: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        path: z.ZodOptional<z.ZodString>;
        line: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | undefined, number | null | undefined>>>;
    }, z.core.$strip>>>>, z.ZodTransform<{
        path?: string | undefined;
        line?: number | undefined;
    }[] | undefined, {
        path?: string | undefined;
        line?: number | undefined;
    }[] | null | undefined>>>;
    rawInput: z.ZodOptional<z.ZodJSONSchema>;
}, z.core.$strip>;
export declare const SessionNotificationSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    update: z.ZodOptional<z.ZodObject<{
        sessionUpdate: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
            data: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
            uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        }, z.core.$strip>, z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"content">;
            content: z.ZodOptional<z.ZodObject<{
                type: z.ZodOptional<z.ZodString>;
                text: z.ZodOptional<z.ZodString>;
                data: z.ZodOptional<z.ZodString>;
                mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
                uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"diff">;
            path: z.ZodOptional<z.ZodString>;
            oldText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            newText: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"terminal">;
            terminalId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>]>>>, z.ZodTransform<NonNullable<{
            type?: string | undefined;
            text?: string | undefined;
            data?: string | undefined;
            mimeType?: string | undefined;
            uri?: string | undefined;
        } | ({
            type: "content";
            content?: {
                type?: string | undefined;
                text?: string | undefined;
                data?: string | undefined;
                mimeType?: string | undefined;
                uri?: string | undefined;
            } | undefined;
        } | {
            type: "diff";
            path?: string | undefined;
            oldText?: string | null | undefined;
            newText?: string | undefined;
        } | {
            type: "terminal";
            terminalId?: string | undefined;
        })[]> | undefined, {
            type?: string | undefined;
            text?: string | undefined;
            data?: string | undefined;
            mimeType?: string | undefined;
            uri?: string | undefined;
        } | ({
            type: "content";
            content?: {
                type?: string | undefined;
                text?: string | undefined;
                data?: string | undefined;
                mimeType?: string | undefined;
                uri?: string | undefined;
            } | undefined;
        } | {
            type: "diff";
            path?: string | undefined;
            oldText?: string | null | undefined;
            newText?: string | undefined;
        } | {
            type: "terminal";
            terminalId?: string | undefined;
        })[] | null | undefined>>>;
        entries: z.ZodOptional<z.ZodArray<z.ZodObject<{
            content: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        availableCommands: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        currentModeId: z.ZodOptional<z.ZodString>;
        used: z.ZodOptional<z.ZodNumber>;
        size: z.ZodOptional<z.ZodNumber>;
        cost: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            amount: z.ZodOptional<z.ZodNumber>;
            currency: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        toolCallId: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        kind: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            read: "read";
            edit: "edit";
            delete: "delete";
            move: "move";
            search: "search";
            execute: "execute";
            think: "think";
            fetch: "fetch";
            switch_mode: "switch_mode";
            other: "other";
        }>>>, z.ZodTransform<NonNullable<"read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other"> | undefined, "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other" | null | undefined>>>;
        status: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            pending: "pending";
            in_progress: "in_progress";
            completed: "completed";
            failed: "failed";
        }>>>, z.ZodTransform<NonNullable<"pending" | "in_progress" | "completed" | "failed"> | undefined, "pending" | "in_progress" | "completed" | "failed" | null | undefined>>>;
        locations: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            line: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | undefined, number | null | undefined>>>;
        }, z.core.$strip>>>>, z.ZodTransform<{
            path?: string | undefined;
            line?: number | undefined;
        }[] | undefined, {
            path?: string | undefined;
            line?: number | undefined;
        }[] | null | undefined>>>;
        rawInput: z.ZodOptional<z.ZodJSONSchema>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const PermissionOptionKindSchema: z.ZodEnum<{
    allow_once: "allow_once";
    allow_always: "allow_always";
    reject_once: "reject_once";
    reject_always: "reject_always";
}>;
export declare const RequestPermissionParamsSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    toolCall: z.ZodOptional<z.ZodObject<{
        toolCallId: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
        kind: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            read: "read";
            edit: "edit";
            delete: "delete";
            move: "move";
            search: "search";
            execute: "execute";
            think: "think";
            fetch: "fetch";
            switch_mode: "switch_mode";
            other: "other";
        }>>>, z.ZodTransform<NonNullable<"read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other"> | undefined, "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "switch_mode" | "other" | null | undefined>>>;
        status: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            pending: "pending";
            in_progress: "in_progress";
            completed: "completed";
            failed: "failed";
        }>>>, z.ZodTransform<NonNullable<"pending" | "in_progress" | "completed" | "failed"> | undefined, "pending" | "in_progress" | "completed" | "failed" | null | undefined>>>;
        content: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"content">;
            content: z.ZodOptional<z.ZodObject<{
                type: z.ZodOptional<z.ZodString>;
                text: z.ZodOptional<z.ZodString>;
                data: z.ZodOptional<z.ZodString>;
                mimeType: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
                uri: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>>;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"diff">;
            path: z.ZodOptional<z.ZodString>;
            oldText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            newText: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"terminal">;
            terminalId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "type">>>>, z.ZodTransform<({
            type: "content";
            content?: {
                type?: string | undefined;
                text?: string | undefined;
                data?: string | undefined;
                mimeType?: string | undefined;
                uri?: string | undefined;
            } | undefined;
        } | {
            type: "diff";
            path?: string | undefined;
            oldText?: string | null | undefined;
            newText?: string | undefined;
        } | {
            type: "terminal";
            terminalId?: string | undefined;
        })[] | undefined, ({
            type: "content";
            content?: {
                type?: string | undefined;
                text?: string | undefined;
                data?: string | undefined;
                mimeType?: string | undefined;
                uri?: string | undefined;
            } | undefined;
        } | {
            type: "diff";
            path?: string | undefined;
            oldText?: string | null | undefined;
            newText?: string | undefined;
        } | {
            type: "terminal";
            terminalId?: string | undefined;
        })[] | null | undefined>>>;
        locations: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            path: z.ZodOptional<z.ZodString>;
            line: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | undefined, number | null | undefined>>>;
        }, z.core.$strip>>>>, z.ZodTransform<{
            path?: string | undefined;
            line?: number | undefined;
        }[] | undefined, {
            path?: string | undefined;
            line?: number | undefined;
        }[] | null | undefined>>>;
        rawInput: z.ZodOptional<z.ZodJSONSchema>;
    }, z.core.$strip>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        optionId: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        kind: z.ZodOptional<z.ZodEnum<{
            allow_once: "allow_once";
            allow_always: "allow_always";
            reject_once: "reject_once";
            reject_always: "reject_always";
        }>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type InitializeResult = z.infer<typeof InitializeResultSchema>;
export type NewSessionResult = z.infer<typeof NewSessionResultSchema>;
export type StopReason = z.infer<typeof StopReasonSchema>;
export type PromptResult = z.infer<typeof PromptResultSchema>;
export type ToolKind = z.infer<typeof ToolKindSchema>;
export type ToolCallStatus = z.infer<typeof ToolCallStatusSchema>;
export type ToolCallContent = z.infer<typeof ToolCallContentSchema>;
export type ToolCallFields = z.infer<typeof ToolCallFieldsSchema>;
export type SessionUpdate = z.infer<typeof SessionUpdateSchema>;
export type SessionNotification = z.infer<typeof SessionNotificationSchema>;
export type PermissionOptionKind = z.infer<typeof PermissionOptionKindSchema>;
export type RequestPermissionParams = z.infer<typeof RequestPermissionParamsSchema>;
//# sourceMappingURL=protocol.d.ts.map