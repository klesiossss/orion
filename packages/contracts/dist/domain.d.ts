import { z } from 'zod';
/**
 * The provider-agnostic model every adapter translates into.
 *
 * Thread -> Turn -> Item, borrowed from Codex's app-server because it is the
 * best-designed of the available models and maps straight onto the UI. Nothing
 * engine-specific may leak past an adapter.
 */
export declare const ProviderIdSchema: z.ZodEnum<{
    codex: "codex";
    "claude-code": "claude-code";
    grok: "grok";
}>;
export type ProviderId = z.infer<typeof ProviderIdSchema>;
/**
 * Every distinct thing an agent produces inside a turn. The UI renders each of
 * these differently — that is the whole point of not collapsing them to text.
 */
export declare const ItemTypeSchema: z.ZodEnum<{
    message: "message";
    reasoning: "reasoning";
    command: "command";
    file_change: "file_change";
    tool_call: "tool_call";
    plan: "plan";
    error: "error";
    unknown: "unknown";
}>;
export type ItemType = z.infer<typeof ItemTypeSchema>;
export declare const ItemStatusSchema: z.ZodEnum<{
    started: "started";
    completed: "completed";
    failed: "failed";
}>;
export type ItemStatus = z.infer<typeof ItemStatusSchema>;
export declare const AssistantPhaseSchema: z.ZodEnum<{
    commentary: "commentary";
    final_answer: "final_answer";
}>;
export type AssistantPhase = z.infer<typeof AssistantPhaseSchema>;
export declare const ItemSchema: z.ZodObject<{
    id: z.ZodString;
    turnId: z.ZodString;
    type: z.ZodEnum<{
        message: "message";
        reasoning: "reasoning";
        command: "command";
        file_change: "file_change";
        tool_call: "tool_call";
        plan: "plan";
        error: "error";
        unknown: "unknown";
    }>;
    status: z.ZodEnum<{
        started: "started";
        completed: "completed";
        failed: "failed";
    }>;
    role: z.ZodOptional<z.ZodEnum<{
        user: "user";
        assistant: "assistant";
    }>>;
    phase: z.ZodOptional<z.ZodEnum<{
        commentary: "commentary";
        final_answer: "final_answer";
    }>>;
    text: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
    command: z.ZodOptional<z.ZodString>;
    exitCode: z.ZodOptional<z.ZodNumber>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    path: z.ZodOptional<z.ZodString>;
    linesAdded: z.ZodOptional<z.ZodNumber>;
    linesRemoved: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export type Item = z.infer<typeof ItemSchema>;
export declare const TurnSchema: z.ZodObject<{
    id: z.ZodString;
    threadId: z.ZodString;
    status: z.ZodEnum<{
        completed: "completed";
        failed: "failed";
        running: "running";
        interrupted: "interrupted";
    }>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export type Turn = z.infer<typeof TurnSchema>;
export declare const ThreadSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    workspacePath: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export type Thread = z.infer<typeof ThreadSchema>;
/**
 * What an adapter emits. The server persists these to the event log and pushes
 * them to clients; adapters never talk to the UI directly.
 */
/**
 * The agent asking permission before it does something.
 *
 * This is the highest-privilege moment in the app: answering yes authorises
 * arbitrary execution or a write to disk. Everything about how it is shown and
 * answered is deliberate.
 */
export declare const ApprovalRequestSchema: z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
        command: "command";
        file_change: "file_change";
        permissions: "permissions";
    }>;
    reason: z.ZodOptional<z.ZodString>;
    command: z.ZodOptional<z.ZodString>;
    cwd: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export declare const ApprovalDecisionSchema: z.ZodEnum<{
    approve: "approve";
    "approve-session": "approve-session";
    deny: "deny";
    abort: "abort";
}>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export declare const ApprovalReviewSchema: z.ZodObject<{
    id: z.ZodString;
    turnId: z.ZodString;
    status: z.ZodEnum<{
        in_progress: "in_progress";
        approved: "approved";
        denied: "denied";
        timed_out: "timed_out";
        aborted: "aborted";
    }>;
    description: z.ZodString;
    rationale: z.ZodOptional<z.ZodString>;
    riskLevel: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>>;
    startedAt: z.ZodNumber;
    completedAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ApprovalReview = z.infer<typeof ApprovalReviewSchema>;
export declare const UserInputOptionSchema: z.ZodObject<{
    label: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
export type UserInputOption = z.infer<typeof UserInputOptionSchema>;
export declare const UserInputQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    header: z.ZodString;
    question: z.ZodString;
    allowOther: z.ZodBoolean;
    secret: z.ZodBoolean;
    options: z.ZodNullable<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>>>;
    multiSelect: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UserInputQuestion = z.infer<typeof UserInputQuestionSchema>;
/** A provider-neutral question set that blocks the current agent turn. */
export declare const UserInputRequestSchema: z.ZodObject<{
    id: z.ZodString;
    turnId: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        header: z.ZodString;
        question: z.ZodString;
        allowOther: z.ZodBoolean;
        secret: z.ZodBoolean;
        options: z.ZodNullable<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            description: z.ZodString;
        }, z.core.$strip>>>;
        multiSelect: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    autoResolutionMs: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export type UserInputRequest = z.infer<typeof UserInputRequestSchema>;
/** A step in the agent's own plan for the current turn. */
export declare const PlanStepSchema: z.ZodObject<{
    text: z.ZodString;
    status: z.ZodEnum<{
        running: "running";
        pending: "pending";
        done: "done";
    }>;
}, z.core.$strip>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export declare const UsageSchema: z.ZodObject<{
    inputTokens: z.ZodNumber;
    cachedInputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    reasoningTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    model: z.ZodOptional<z.ZodString>;
    cumulative: z.ZodOptional<z.ZodBoolean>;
    inputIncludesCached: z.ZodOptional<z.ZodBoolean>;
    costUsd: z.ZodOptional<z.ZodNumber>;
    contextWindow: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type Usage = z.infer<typeof UsageSchema>;
export declare const DomainEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"thread.started">;
    thread: z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        workspacePath: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"turn.started">;
    turn: z.ZodObject<{
        id: z.ZodString;
        threadId: z.ZodString;
        status: z.ZodEnum<{
            completed: "completed";
            failed: "failed";
            running: "running";
            interrupted: "interrupted";
        }>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"item.started">;
    item: z.ZodObject<{
        id: z.ZodString;
        turnId: z.ZodString;
        type: z.ZodEnum<{
            message: "message";
            reasoning: "reasoning";
            command: "command";
            file_change: "file_change";
            tool_call: "tool_call";
            plan: "plan";
            error: "error";
            unknown: "unknown";
        }>;
        status: z.ZodEnum<{
            started: "started";
            completed: "completed";
            failed: "failed";
        }>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>>;
        phase: z.ZodOptional<z.ZodEnum<{
            commentary: "commentary";
            final_answer: "final_answer";
        }>>;
        text: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
        command: z.ZodOptional<z.ZodString>;
        exitCode: z.ZodOptional<z.ZodNumber>;
        durationMs: z.ZodOptional<z.ZodNumber>;
        path: z.ZodOptional<z.ZodString>;
        linesAdded: z.ZodOptional<z.ZodNumber>;
        linesRemoved: z.ZodOptional<z.ZodNumber>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"item.delta">;
    turnId: z.ZodString;
    itemId: z.ZodString;
    textDelta: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"item.completed">;
    item: z.ZodObject<{
        id: z.ZodString;
        turnId: z.ZodString;
        type: z.ZodEnum<{
            message: "message";
            reasoning: "reasoning";
            command: "command";
            file_change: "file_change";
            tool_call: "tool_call";
            plan: "plan";
            error: "error";
            unknown: "unknown";
        }>;
        status: z.ZodEnum<{
            started: "started";
            completed: "completed";
            failed: "failed";
        }>;
        role: z.ZodOptional<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>>;
        phase: z.ZodOptional<z.ZodEnum<{
            commentary: "commentary";
            final_answer: "final_answer";
        }>>;
        text: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
        command: z.ZodOptional<z.ZodString>;
        exitCode: z.ZodOptional<z.ZodNumber>;
        durationMs: z.ZodOptional<z.ZodNumber>;
        path: z.ZodOptional<z.ZodString>;
        linesAdded: z.ZodOptional<z.ZodNumber>;
        linesRemoved: z.ZodOptional<z.ZodNumber>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"turn.completed">;
    turnId: z.ZodString;
    status: z.ZodEnum<{
        completed: "completed";
        failed: "failed";
        interrupted: "interrupted";
    }>;
    completedAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"thread.error">;
    threadId: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"plan.updated">;
    turnId: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        status: z.ZodEnum<{
            running: "running";
            pending: "pending";
            done: "done";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"usage.updated">;
    usage: z.ZodObject<{
        inputTokens: z.ZodNumber;
        cachedInputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
        reasoningTokens: z.ZodNumber;
        totalTokens: z.ZodNumber;
        model: z.ZodOptional<z.ZodString>;
        cumulative: z.ZodOptional<z.ZodBoolean>;
        inputIncludesCached: z.ZodOptional<z.ZodBoolean>;
        costUsd: z.ZodOptional<z.ZodNumber>;
        contextWindow: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"diff.updated">;
    turnId: z.ZodString;
    diff: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"approval.requested">;
    request: z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<{
            command: "command";
            file_change: "file_change";
            permissions: "permissions";
        }>;
        reason: z.ZodOptional<z.ZodString>;
        command: z.ZodOptional<z.ZodString>;
        cwd: z.ZodOptional<z.ZodString>;
        path: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"approval.resolved">;
    id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"user_input.requested">;
    request: z.ZodObject<{
        id: z.ZodString;
        turnId: z.ZodString;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            header: z.ZodString;
            question: z.ZodString;
            allowOther: z.ZodBoolean;
            secret: z.ZodBoolean;
            options: z.ZodNullable<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                description: z.ZodString;
            }, z.core.$strip>>>;
            multiSelect: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        autoResolutionMs: z.ZodNullable<z.ZodNumber>;
        createdAt: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"user_input.resolved">;
    id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"approval.review.started">;
    review: z.ZodObject<{
        id: z.ZodString;
        turnId: z.ZodString;
        status: z.ZodEnum<{
            in_progress: "in_progress";
            approved: "approved";
            denied: "denied";
            timed_out: "timed_out";
            aborted: "aborted";
        }>;
        description: z.ZodString;
        rationale: z.ZodOptional<z.ZodString>;
        riskLevel: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>>;
        startedAt: z.ZodNumber;
        completedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"approval.review.completed">;
    review: z.ZodObject<{
        id: z.ZodString;
        turnId: z.ZodString;
        status: z.ZodEnum<{
            in_progress: "in_progress";
            approved: "approved";
            denied: "denied";
            timed_out: "timed_out";
            aborted: "aborted";
        }>;
        description: z.ZodString;
        rationale: z.ZodOptional<z.ZodString>;
        riskLevel: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>>;
        startedAt: z.ZodNumber;
        completedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>], "type">;
export type DomainEvent = z.infer<typeof DomainEventSchema>;
/**
 * How much of the session context the user may shape before a session starts.
 * Engines expose this very differently — a token budget, a percentage, a model
 * variant — so each adapter declares what it can honour and translates the
 * shared settings itself.
 */
export declare const ContextControlSchema: z.ZodObject<{
    windows: z.ZodArray<z.ZodNumber>;
    compaction: z.ZodBoolean;
    compactionOff: z.ZodBoolean;
    defaultCompactAt: z.ZodOptional<z.ZodNumber>;
    latestCompactAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ContextControl = z.infer<typeof ContextControlSchema>;
/**
 * What an engine can actually do. The UI reads this and hides what is
 * unavailable rather than showing a button that fails — capability negotiation
 * is the difference between a wrapper that feels solid and one that lies.
 */
export declare const CapabilitiesSchema: z.ZodObject<{
    steer: z.ZodBoolean;
    fork: z.ZodBoolean;
    interrupt: z.ZodBoolean;
    reasoningItems: z.ZodBoolean;
    approvals: z.ZodBoolean;
    userInput: z.ZodOptional<z.ZodBoolean>;
    autoReview: z.ZodOptional<z.ZodBoolean>;
    images: z.ZodBoolean;
    context: z.ZodOptional<z.ZodObject<{
        windows: z.ZodArray<z.ZodNumber>;
        compaction: z.ZodBoolean;
        compactionOff: z.ZodBoolean;
        defaultCompactAt: z.ZodOptional<z.ZodNumber>;
        latestCompactAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type Capabilities = z.infer<typeof CapabilitiesSchema>;
/**
 * A model the user can pick, as reported by the provider itself. We never keep
 * a hardcoded list — vendors ship new models constantly and a stale dropdown is
 * worse than no dropdown.
 */
export declare const ModelSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodBoolean;
    reasoningEfforts: z.ZodArray<z.ZodString>;
    defaultReasoningEffort: z.ZodOptional<z.ZodString>;
    serviceTiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>>>;
    defaultServiceTier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type Model = z.infer<typeof ModelSchema>;
/**
 * The small model TasteCode uses for short product-owned writing such as thread
 * titles and commit-message drafts. Source identity stays explicit because
 * model ids are not globally unique across custom harnesses.
 */
export declare const BackgroundModelTargetSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    agent: z.ZodOptional<z.ZodString>;
    model: z.ZodString;
    effort: z.ZodOptional<z.ZodString>;
    serviceTier: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BackgroundModelTarget = z.infer<typeof BackgroundModelTargetSchema>;
export declare const BackgroundModelPreferenceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"automatic">;
}, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"manual">;
    target: z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        agent: z.ZodOptional<z.ZodString>;
        model: z.ZodString;
        effort: z.ZodOptional<z.ZodString>;
        serviceTier: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>], "mode">;
export type BackgroundModelPreference = z.infer<typeof BackgroundModelPreferenceSchema>;
export declare const BackgroundModelSourceSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    agent: z.ZodOptional<z.ZodString>;
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodBoolean;
        reasoningEfforts: z.ZodArray<z.ZodString>;
        defaultReasoningEffort: z.ZodOptional<z.ZodString>;
        serviceTiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
        }, z.core.$strip>>>;
        defaultServiceTier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type BackgroundModelSource = z.infer<typeof BackgroundModelSourceSchema>;
export declare const BackgroundModelSelectionSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    agent: z.ZodOptional<z.ZodString>;
    model: z.ZodString;
    effort: z.ZodOptional<z.ZodString>;
    serviceTier: z.ZodOptional<z.ZodString>;
    sourceName: z.ZodString;
    automatic: z.ZodBoolean;
}, z.core.$strip>;
export type BackgroundModelSelection = z.infer<typeof BackgroundModelSelectionSchema>;
export declare const BackgroundModelSettingsSchema: z.ZodObject<{
    preference: z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"automatic">;
    }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"manual">;
        target: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
            model: z.ZodString;
            effort: z.ZodOptional<z.ZodString>;
            serviceTier: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>], "mode">;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodString;
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        agent: z.ZodOptional<z.ZodString>;
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            displayName: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            isDefault: z.ZodBoolean;
            reasoningEfforts: z.ZodArray<z.ZodString>;
            defaultReasoningEffort: z.ZodOptional<z.ZodString>;
            serviceTiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
            }, z.core.$strip>>>;
            defaultServiceTier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    resolved: z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        agent: z.ZodOptional<z.ZodString>;
        model: z.ZodString;
        effort: z.ZodOptional<z.ZodString>;
        serviceTier: z.ZodOptional<z.ZodString>;
        sourceName: z.ZodString;
        automatic: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type BackgroundModelSettings = z.infer<typeof BackgroundModelSettingsSchema>;
/**
 * How much the agent may do without asking. Mapped per adapter onto whatever
 * the engine calls it — this is the user-facing concept, and it is the single
 * most consequential setting in the app, so it is never hidden in a menu.
 */
export declare const ApprovalModeSchema: z.ZodEnum<{
    ask: "ask";
    auto: "auto";
    "auto-review": "auto-review";
    full: "full";
}>;
export type ApprovalMode = z.infer<typeof ApprovalModeSchema>;
/**
 * Context settings the server applies to every session it launches or resumes
 * with one provider. Absent fields leave the engine's own behaviour alone.
 */
export declare const ProviderContextSettingsSchema: z.ZodObject<{
    window: z.ZodOptional<z.ZodNumber>;
    compactAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"off">]>>;
}, z.core.$strip>;
export type ProviderContextSettings = z.infer<typeof ProviderContextSettingsSchema>;
/**
 * Who the user is signed in as with a given provider.
 *
 * We learn this by asking the provider's own binary. We never read its
 * credential files — see rules/security.md.
 */
export declare const AccountSchema: z.ZodObject<{
    signedIn: z.ZodBoolean;
    email: z.ZodOptional<z.ZodString>;
    plan: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Account = z.infer<typeof AccountSchema>;
/** Actionable setup information supplied by the provider adapter. */
export declare const ProviderSetupSchema: z.ZodObject<{
    installUrl: z.ZodURL;
    installCommand: z.ZodOptional<z.ZodString>;
    login: z.ZodEnum<{
        provider: "provider";
        app: "app";
    }>;
    loginOpensBrowser: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type ProviderSetup = z.infer<typeof ProviderSetupSchema>;
/**
 * A user-owned CLI that speaks one of the protocols Harness already knows.
 * `command` is an executable name on PATH or an absolute executable path;
 * fixed argv entries stay separate so paths and values containing spaces are
 * never re-parsed through a shell.
 */
export declare const CustomHarnessSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    command: z.ZodString;
    args: z.ZodArray<z.ZodString>;
    workingDirectory: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type CustomHarness = z.infer<typeof CustomHarnessSchema>;
export declare const CustomHarnessVerificationCheckSchema: z.ZodObject<{
    label: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        passed: "passed";
        warning: "warning";
    }>;
    detail: z.ZodString;
}, z.core.$strip>;
export type CustomHarnessVerificationCheck = z.infer<typeof CustomHarnessVerificationCheckSchema>;
export declare const CustomHarnessVerificationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        error: "error";
        warning: "warning";
        ready: "ready";
    }>;
    summary: z.ZodString;
    checkedAt: z.ZodNumber;
    resolvedCommand: z.ZodOptional<z.ZodString>;
    checks: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        status: z.ZodEnum<{
            failed: "failed";
            passed: "passed";
            warning: "warning";
        }>;
        detail: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CustomHarnessVerification = z.infer<typeof CustomHarnessVerificationSchema>;
export declare const ProviderStatusSchema: z.ZodObject<{
    id: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    displayName: z.ZodString;
    installed: z.ZodBoolean;
    version: z.ZodOptional<z.ZodString>;
    auth: z.ZodEnum<{
        unknown: "unknown";
        authenticated: "authenticated";
        unauthenticated: "unauthenticated";
    }>;
    capabilities: z.ZodOptional<z.ZodObject<{
        steer: z.ZodBoolean;
        fork: z.ZodBoolean;
        interrupt: z.ZodBoolean;
        reasoningItems: z.ZodBoolean;
        approvals: z.ZodBoolean;
        userInput: z.ZodOptional<z.ZodBoolean>;
        autoReview: z.ZodOptional<z.ZodBoolean>;
        images: z.ZodBoolean;
        context: z.ZodOptional<z.ZodObject<{
            windows: z.ZodArray<z.ZodNumber>;
            compaction: z.ZodBoolean;
            compactionOff: z.ZodBoolean;
            defaultCompactAt: z.ZodOptional<z.ZodNumber>;
            latestCompactAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    setup: z.ZodOptional<z.ZodObject<{
        installUrl: z.ZodURL;
        installCommand: z.ZodOptional<z.ZodString>;
        login: z.ZodEnum<{
            provider: "provider";
            app: "app";
        }>;
        loginOpensBrowser: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    problem: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
/** Public release metadata; update commands remain on the server. */
export declare const ProviderUpdateSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    displayName: z.ZodString;
    currentVersion: z.ZodOptional<z.ZodString>;
    latestVersion: z.ZodOptional<z.ZodString>;
    updateAvailable: z.ZodBoolean;
    canUpdate: z.ZodBoolean;
    updateUrl: z.ZodURL;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProviderUpdate = z.infer<typeof ProviderUpdateSchema>;
//# sourceMappingURL=domain.d.ts.map