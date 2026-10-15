import { z } from 'zod';
export declare const AccountResponseSchema: z.ZodObject<{
    account: z.ZodNullable<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"apiKey">;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"chatgpt">;
        email: z.ZodNullable<z.ZodString>;
        planType: z.ZodString;
    }, z.core.$strip>, z.ZodPipe<z.ZodObject<{
        type: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<{
        type: "other";
    }, {
        type: string;
    }>>]>>;
}, z.core.$strip>;
export declare const CodexRateLimitSnapshotSchema: z.ZodObject<{
    limitId: z.ZodNullable<z.ZodString>;
    limitName: z.ZodNullable<z.ZodString>;
    primary: z.ZodNullable<z.ZodObject<{
        usedPercent: z.ZodNumber;
        windowDurationMins: z.ZodNullable<z.ZodNumber>;
        resetsAt: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
    secondary: z.ZodNullable<z.ZodObject<{
        usedPercent: z.ZodNumber;
        windowDurationMins: z.ZodNullable<z.ZodNumber>;
        resetsAt: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
    credits: z.ZodNullable<z.ZodObject<{
        hasCredits: z.ZodBoolean;
        unlimited: z.ZodBoolean;
        balance: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    individualLimit: z.ZodNullable<z.ZodJSONSchema>;
    planType: z.ZodNullable<z.ZodString>;
    rateLimitReachedType: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const CodexRateLimitResponseSchema: z.ZodObject<{
    rateLimits: z.ZodObject<{
        limitId: z.ZodNullable<z.ZodString>;
        limitName: z.ZodNullable<z.ZodString>;
        primary: z.ZodNullable<z.ZodObject<{
            usedPercent: z.ZodNumber;
            windowDurationMins: z.ZodNullable<z.ZodNumber>;
            resetsAt: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>;
        secondary: z.ZodNullable<z.ZodObject<{
            usedPercent: z.ZodNumber;
            windowDurationMins: z.ZodNullable<z.ZodNumber>;
            resetsAt: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>;
        credits: z.ZodNullable<z.ZodObject<{
            hasCredits: z.ZodBoolean;
            unlimited: z.ZodBoolean;
            balance: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        individualLimit: z.ZodNullable<z.ZodJSONSchema>;
        planType: z.ZodNullable<z.ZodString>;
        rateLimitReachedType: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    rateLimitsByLimitId: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodObject<{
        limitId: z.ZodNullable<z.ZodString>;
        limitName: z.ZodNullable<z.ZodString>;
        primary: z.ZodNullable<z.ZodObject<{
            usedPercent: z.ZodNumber;
            windowDurationMins: z.ZodNullable<z.ZodNumber>;
            resetsAt: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>;
        secondary: z.ZodNullable<z.ZodObject<{
            usedPercent: z.ZodNumber;
            windowDurationMins: z.ZodNullable<z.ZodNumber>;
            resetsAt: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>;
        credits: z.ZodNullable<z.ZodObject<{
            hasCredits: z.ZodBoolean;
            unlimited: z.ZodBoolean;
            balance: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        individualLimit: z.ZodNullable<z.ZodJSONSchema>;
        planType: z.ZodNullable<z.ZodString>;
        rateLimitReachedType: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>>>;
    rateLimitResetCredits: z.ZodNullable<z.ZodObject<{
        availableCount: z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>;
        credits: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodJSONSchema>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CodexRateLimitSnapshot = z.infer<typeof CodexRateLimitSnapshotSchema>;
export type CodexRateLimitResponse = z.infer<typeof CodexRateLimitResponseSchema>;
export declare const CodexResetCreditSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodLiteral<"available">;
    expiresAt: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const ConsumeRateLimitResetResponseSchema: z.ZodObject<{
    outcome: z.ZodEnum<{
        reset: "reset";
        nothingToReset: "nothingToReset";
        noCredit: "noCredit";
        alreadyRedeemed: "alreadyRedeemed";
    }>;
}, z.core.$strip>;
export type CodexResetOutcome = z.infer<typeof ConsumeRateLimitResetResponseSchema>['outcome'];
export declare const LoginAccountResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"apiKey">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"chatgpt">;
    loginId: z.ZodString;
    authUrl: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"chatgptDeviceCode">;
    loginId: z.ZodString;
    verificationUrl: z.ZodString;
    userCode: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"chatgptAuthTokens">;
}, z.core.$strip>], "type">;
export declare const ModelListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hidden: z.ZodBoolean;
        supportedReasoningEfforts: z.ZodArray<z.ZodObject<{
            reasoningEffort: z.ZodString;
        }, z.core.$strip>>;
        defaultReasoningEffort: z.ZodNullable<z.ZodString>;
        serviceTiers: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
        }, z.core.$strip>>;
        defaultServiceTier: z.ZodNullable<z.ZodString>;
        isDefault: z.ZodBoolean;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const JsonObjectSchema: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
export declare const McpServerStatusSchema: z.ZodObject<{
    name: z.ZodString;
    serverInfo: z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        version: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    tools: z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        inputSchema: z.ZodJSONSchema;
        outputSchema: z.ZodOptional<z.ZodJSONSchema>;
    }, z.core.$strip>>>;
    resources: z.ZodArray<z.ZodObject<{
        uri: z.ZodString;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    resourceTemplates: z.ZodArray<z.ZodObject<{
        uriTemplate: z.ZodString;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    authStatus: z.ZodEnum<{
        unsupported: "unsupported";
        notLoggedIn: "notLoggedIn";
        bearerToken: "bearerToken";
        oAuth: "oAuth";
    }>;
}, z.core.$strip>;
export type ParsedMcpServerStatus = z.infer<typeof McpServerStatusSchema>;
export declare const ListMcpServerStatusResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        serverInfo: z.ZodNullable<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodNullable<z.ZodString>;
            version: z.ZodString;
            description: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        tools: z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            inputSchema: z.ZodJSONSchema;
            outputSchema: z.ZodOptional<z.ZodJSONSchema>;
        }, z.core.$strip>>>;
        resources: z.ZodArray<z.ZodObject<{
            uri: z.ZodString;
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        resourceTemplates: z.ZodArray<z.ZodObject<{
            uriTemplate: z.ZodString;
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        authStatus: z.ZodEnum<{
            unsupported: "unsupported";
            notLoggedIn: "notLoggedIn";
            bearerToken: "bearerToken";
            oAuth: "oAuth";
        }>;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const SkillsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        cwd: z.ZodString;
        skills: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            interface: z.ZodOptional<z.ZodObject<{
                displayName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
            dependencies: z.ZodOptional<z.ZodObject<{
                tools: z.ZodArray<z.ZodObject<{
                    type: z.ZodString;
                    value: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            path: z.ZodString;
            scope: z.ZodEnum<{
                user: "user";
                repo: "repo";
                system: "system";
                admin: "admin";
            }>;
            enabled: z.ZodBoolean;
        }, z.core.$strip>>;
        errors: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            message: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ParsedSkillsListResponse = z.infer<typeof SkillsListResponseSchema>;
export declare const SkillsConfigWriteResponseSchema: z.ZodObject<{
    effectiveEnabled: z.ZodBoolean;
}, z.core.$strip>;
export declare const McpServerOauthLoginResponseSchema: z.ZodObject<{
    authorizationUrl: z.ZodString;
}, z.core.$strip>;
export declare const ThreadStartResponseSchema: z.ZodObject<{
    thread: z.ZodObject<{
        id: z.ZodString;
        createdAt: z.ZodOptional<z.ZodNumber>;
        cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
    model: z.ZodString;
}, z.core.$strip>;
export declare const ThreadResumeResponseSchema: z.ZodObject<{
    model: z.ZodString;
    thread: z.ZodObject<{
        id: z.ZodString;
        cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TurnStartResponseSchema: z.ZodObject<{
    turn: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ToolRequestUserInputParamsSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodString;
    itemId: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        header: z.ZodString;
        question: z.ZodString;
        isOther: z.ZodBoolean;
        isSecret: z.ZodBoolean;
        options: z.ZodNullable<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            description: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    autoResolutionMs: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export type ToolRequestUserInputParams = z.infer<typeof ToolRequestUserInputParamsSchema>;
export declare const RequestPermissionProfileSchema: z.ZodObject<{
    network: z.ZodNullable<z.ZodObject<{
        enabled: z.ZodNullable<z.ZodBoolean>;
    }, z.core.$strip>>;
    fileSystem: z.ZodNullable<z.ZodObject<{
        read: z.ZodNullable<z.ZodArray<z.ZodString>>;
        write: z.ZodNullable<z.ZodArray<z.ZodString>>;
        globScanMaxDepth: z.ZodOptional<z.ZodNumber>;
        entries: z.ZodOptional<z.ZodArray<z.ZodJSONSchema>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type RequestPermissionProfile = z.infer<typeof RequestPermissionProfileSchema>;
export declare const PermissionsRequestApprovalParamsSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodString;
    itemId: z.ZodString;
    environmentId: z.ZodNullable<z.ZodString>;
    startedAtMs: z.ZodNumber;
    cwd: z.ZodString;
    reason: z.ZodNullable<z.ZodString>;
    permissions: z.ZodObject<{
        network: z.ZodNullable<z.ZodObject<{
            enabled: z.ZodNullable<z.ZodBoolean>;
        }, z.core.$strip>>;
        fileSystem: z.ZodNullable<z.ZodObject<{
            read: z.ZodNullable<z.ZodArray<z.ZodString>>;
            write: z.ZodNullable<z.ZodArray<z.ZodString>>;
            globScanMaxDepth: z.ZodOptional<z.ZodNumber>;
            entries: z.ZodOptional<z.ZodArray<z.ZodJSONSchema>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PermissionsRequestApprovalParams = z.infer<typeof PermissionsRequestApprovalParamsSchema>;
/** The approval Codex 0.162 sends through `mcpServer/elicitation/request` before an MCP tool call. */
export declare const McpToolApprovalParamsSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mode: z.ZodLiteral<"form">;
    message: z.ZodString;
    _meta: z.ZodObject<{
        codex_approval_kind: z.ZodLiteral<"mcp_tool_call">;
        persist: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
        tool_description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tool_params: z.ZodOptional<z.ZodJSONSchema>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type McpToolApprovalParams = z.infer<typeof McpToolApprovalParamsSchema>;
export declare const ApprovalParamsSchema: z.ZodObject<{
    itemId: z.ZodOptional<z.ZodString>;
    approvalId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    command: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    grantRoot: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type ApprovalParams = z.infer<typeof ApprovalParamsSchema>;
declare const GuardianActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"command">;
    command: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"execve">;
    program: z.ZodString;
    argv: z.ZodArray<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"applyPatch">;
    files: z.ZodArray<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"networkAccess">;
    target: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"mcpToolCall">;
    server: z.ZodString;
    toolName: z.ZodString;
    toolTitle: z.ZodNullable<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"requestPermissions">;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strip>], "type">;
export declare const GuardianReviewStartedSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodString;
    startedAtMs: z.ZodNumber;
    reviewId: z.ZodString;
    review: z.ZodObject<{
        status: z.ZodEnum<{
            inProgress: "inProgress";
            approved: "approved";
            denied: "denied";
            timedOut: "timedOut";
            aborted: "aborted";
        }>;
        riskLevel: z.ZodNullable<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>>;
        rationale: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"execve">;
        program: z.ZodString;
        argv: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"applyPatch">;
        files: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"networkAccess">;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"mcpToolCall">;
        server: z.ZodString;
        toolName: z.ZodString;
        toolTitle: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"requestPermissions">;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>], "type">;
}, z.core.$strip>;
export declare const GuardianReviewCompletedSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodString;
    startedAtMs: z.ZodNumber;
    reviewId: z.ZodString;
    review: z.ZodObject<{
        status: z.ZodEnum<{
            inProgress: "inProgress";
            approved: "approved";
            denied: "denied";
            timedOut: "timedOut";
            aborted: "aborted";
        }>;
        riskLevel: z.ZodNullable<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>>;
        rationale: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"command">;
        command: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"execve">;
        program: z.ZodString;
        argv: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"applyPatch">;
        files: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"networkAccess">;
        target: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"mcpToolCall">;
        server: z.ZodString;
        toolName: z.ZodString;
        toolTitle: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"requestPermissions">;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>], "type">;
    completedAtMs: z.ZodNumber;
}, z.core.$strip>;
export type GuardianReviewAction = z.infer<typeof GuardianActionSchema>;
export type GuardianReviewNotification = z.infer<typeof GuardianReviewStartedSchema> | z.infer<typeof GuardianReviewCompletedSchema>;
export declare const ThreadStartedNotificationSchema: z.ZodObject<{
    thread: z.ZodObject<{
        id: z.ZodString;
        createdAt: z.ZodOptional<z.ZodNumber>;
        cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TurnStartedNotificationSchema: z.ZodObject<{
    threadId: z.ZodString;
    turn: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TurnCompletedNotificationSchema: z.ZodObject<{
    threadId: z.ZodString;
    turn: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            inProgress: "inProgress";
            completed: "completed";
            failed: "failed";
            interrupted: "interrupted";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ItemStartedNotificationSchema: z.ZodObject<{
    item: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    threadId: z.ZodString;
    turnId: z.ZodString;
    startedAtMs: z.ZodNumber;
}, z.core.$strip>;
export declare const ItemCompletedNotificationSchema: z.ZodObject<{
    item: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    threadId: z.ZodString;
    turnId: z.ZodString;
    completedAtMs: z.ZodNumber;
}, z.core.$strip>;
export declare const ItemDeltaNotificationSchema: z.ZodObject<{
    threadId: z.ZodOptional<z.ZodString>;
    turnId: z.ZodString;
    itemId: z.ZodString;
    delta: z.ZodString;
}, z.core.$strip>;
export declare const ReasoningSummaryPartAddedNotificationSchema: z.ZodObject<{
    turnId: z.ZodString;
    itemId: z.ZodString;
    summaryIndex: z.ZodNumber;
}, z.core.$strip>;
export declare const CommandOutputDeltaNotificationSchema: z.ZodObject<{
    threadId: z.ZodOptional<z.ZodString>;
    turnId: z.ZodString;
    itemId: z.ZodString;
    delta: z.ZodOptional<z.ZodString>;
    deltaBase64: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const TurnPlanUpdatedNotificationSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodString;
    explanation: z.ZodNullable<z.ZodString>;
    plan: z.ZodArray<z.ZodObject<{
        step: z.ZodString;
        status: z.ZodEnum<{
            inProgress: "inProgress";
            completed: "completed";
            pending: "pending";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const TurnDiffUpdatedNotificationSchema: z.ZodObject<{
    turnId: z.ZodString;
    diff: z.ZodString;
}, z.core.$strip>;
export declare const ThreadTokenUsageUpdatedNotificationSchema: z.ZodObject<{
    threadId: z.ZodString;
    turnId: z.ZodString;
    tokenUsage: z.ZodObject<{
        total: z.ZodObject<{
            totalTokens: z.ZodNumber;
            inputTokens: z.ZodNumber;
            cachedInputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            reasoningOutputTokens: z.ZodNumber;
        }, z.core.$strip>;
        last: z.ZodObject<{
            totalTokens: z.ZodNumber;
            inputTokens: z.ZodNumber;
            cachedInputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            reasoningOutputTokens: z.ZodNumber;
        }, z.core.$strip>;
        modelContextWindow: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ThreadTokenUsageUpdatedNotification = z.infer<typeof ThreadTokenUsageUpdatedNotificationSchema>;
export declare const AccountLoginCompletedNotificationSchema: z.ZodObject<{
    loginId: z.ZodNullable<z.ZodString>;
    success: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const WarningNotificationSchema: z.ZodObject<{
    threadId: z.ZodNullable<z.ZodString>;
    message: z.ZodString;
}, z.core.$strip>;
export type WarningNotification = z.infer<typeof WarningNotificationSchema>;
export declare const ErrorNotificationSchema: z.ZodObject<{
    error: z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>;
    willRetry: z.ZodBoolean;
    threadId: z.ZodString;
    turnId: z.ZodString;
}, z.core.$strip>;
export type ErrorNotification = z.infer<typeof ErrorNotificationSchema>;
export declare const McpServerStatusUpdatedNotificationSchema: z.ZodObject<{
    threadId: z.ZodNullable<z.ZodString>;
    name: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        starting: "starting";
        ready: "ready";
        cancelled: "cancelled";
    }>;
    error: z.ZodNullable<z.ZodString>;
    failureReason: z.ZodNullable<z.ZodLiteral<"reauthenticationRequired">>;
}, z.core.$strip>;
export type McpServerStatusUpdatedNotification = z.infer<typeof McpServerStatusUpdatedNotificationSchema>;
export declare const McpServerOauthLoginCompletedNotificationSchema: z.ZodObject<{
    name: z.ZodString;
    threadId: z.ZodNullable<z.ZodString>;
    success: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const VoiceTranscriptResponseSchema: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>;
export declare const VoiceErrorResponseSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export {};
//# sourceMappingURL=schemas.d.ts.map