import { z } from 'zod';
/**
 * The wire protocol between the desktop renderer, web client, and local core
 * and the local core server.
 *
 * Two shapes only:
 *   request/response — client asks, server answers
 *   push             — server tells, unprompted
 *
 * Every payload is validated at the transport boundary in both directions. That
 * validation is what keeps three client surfaces from silently drifting apart.
 */
export declare const PROTOCOL_VERSION = 2;
/** Bumped whenever a client and server can no longer understand each other. */
export declare const ErrorCode: {
    readonly BAD_REQUEST: "bad_request";
    readonly FORBIDDEN: "forbidden";
    readonly NOT_FOUND: "not_found";
    readonly PROVIDER_UNAVAILABLE: "provider_unavailable";
    readonly STALE_SNAPSHOT: "stale_snapshot";
    readonly INTERNAL: "internal";
};
export declare const ErrorCodeSchema: z.ZodEnum<{
    bad_request: "bad_request";
    forbidden: "forbidden";
    not_found: "not_found";
    provider_unavailable: "provider_unavailable";
    stale_snapshot: "stale_snapshot";
    internal: "internal";
}>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export declare const RequestSchema: z.ZodObject<{
    id: z.ZodString;
    method: z.ZodString;
    params: z.ZodUnknown;
}, z.core.$strip>;
export type Request = z.infer<typeof RequestSchema>;
export declare const QueuedTurnSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    attachments: z.ZodArray<z.ZodString>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export type QueuedTurn = z.infer<typeof QueuedTurnSchema>;
export declare const PanicStopSessionResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    threadId: z.ZodString;
    status: z.ZodLiteral<"interrupted">;
}, z.core.$strip>, z.ZodObject<{
    threadId: z.ZodString;
    status: z.ZodLiteral<"failed">;
    error: z.ZodString;
}, z.core.$strip>], "status">;
export type PanicStopSessionResult = z.infer<typeof PanicStopSessionResultSchema>;
export declare const PanicStopResultSchema: z.ZodObject<{
    sessions: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        threadId: z.ZodString;
        status: z.ZodLiteral<"interrupted">;
    }, z.core.$strip>, z.ZodObject<{
        threadId: z.ZodString;
        status: z.ZodLiteral<"failed">;
        error: z.ZodString;
    }, z.core.$strip>], "status">>;
}, z.core.$strip>;
export type PanicStopResult = z.infer<typeof PanicStopResultSchema>;
export declare const TerminalIdSchema: z.ZodString;
export type TerminalId = z.infer<typeof TerminalIdSchema>;
export declare const TerminalSizeSchema: z.ZodObject<{
    columns: z.ZodNumber;
    rows: z.ZodNumber;
}, z.core.$strip>;
export type TerminalSize = z.infer<typeof TerminalSizeSchema>;
export declare const ResponseSchema: z.ZodUnion<readonly [z.ZodObject<{
    id: z.ZodString;
    result: z.ZodUnknown;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    error: z.ZodObject<{
        code: z.ZodEnum<{
            bad_request: "bad_request";
            forbidden: "forbidden";
            not_found: "not_found";
            provider_unavailable: "provider_unavailable";
            stale_snapshot: "stale_snapshot";
            internal: "internal";
        }>;
        message: z.ZodString;
        detail: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>]>;
export type Response = z.infer<typeof ResponseSchema>;
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
export declare const JsonValueSchema: z.ZodType<JsonValue>;
export declare const PreviewViewportSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
}, z.core.$strip>;
export type PreviewViewport = z.infer<typeof PreviewViewportSchema>;
export declare const PreviewInteractiveTargetViolationSchema: z.ZodObject<{
    selector: z.ZodString;
    label: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    partiallyClipped: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type PreviewInteractiveTargetViolation = z.infer<typeof PreviewInteractiveTargetViolationSchema>;
export declare const PreviewDomAuditSchema: z.ZodObject<{
    h1Count: z.ZodNumber;
    interactiveTargetViolations: z.ZodArray<z.ZodObject<{
        selector: z.ZodString;
        label: z.ZodString;
        width: z.ZodNumber;
        height: z.ZodNumber;
        partiallyClipped: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    coverage: z.ZodOptional<z.ZodEnum<{
        complete: "complete";
        partial: "partial";
    }>>;
}, z.core.$strip>;
export type PreviewDomAudit = z.infer<typeof PreviewDomAuditSchema>;
export declare const PreviewScreenshotSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
    path: z.ZodString;
    domAudit: z.ZodOptional<z.ZodObject<{
        h1Count: z.ZodNumber;
        interactiveTargetViolations: z.ZodArray<z.ZodObject<{
            selector: z.ZodString;
            label: z.ZodString;
            width: z.ZodNumber;
            height: z.ZodNumber;
            partiallyClipped: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        coverage: z.ZodOptional<z.ZodEnum<{
            complete: "complete";
            partial: "partial";
        }>>;
    }, z.core.$strip>>;
    documentHeight: z.ZodOptional<z.ZodNumber>;
    capturedHeight: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type PreviewScreenshot = z.infer<typeof PreviewScreenshotSchema>;
export declare const PreviewCaptureRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    url: z.ZodURL;
    viewports: z.ZodArray<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PreviewCaptureRequest = z.infer<typeof PreviewCaptureRequestSchema>;
export declare const PreviewCaptureResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"completed">;
    requestId: z.ZodString;
    screenshots: z.ZodArray<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        path: z.ZodString;
        domAudit: z.ZodOptional<z.ZodObject<{
            h1Count: z.ZodNumber;
            interactiveTargetViolations: z.ZodArray<z.ZodObject<{
                selector: z.ZodString;
                label: z.ZodString;
                width: z.ZodNumber;
                height: z.ZodNumber;
                partiallyClipped: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
            coverage: z.ZodOptional<z.ZodEnum<{
                complete: "complete";
                partial: "partial";
            }>>;
        }, z.core.$strip>>;
        documentHeight: z.ZodOptional<z.ZodNumber>;
        capturedHeight: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"failed">;
    requestId: z.ZodString;
    error: z.ZodString;
}, z.core.$strip>], "status">;
export type PreviewCaptureResult = z.infer<typeof PreviewCaptureResultSchema>;
export declare const McpConfigValueSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    source: z.ZodLiteral<"literal">;
    value: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    source: z.ZodLiteral<"credential">;
    credentialRef: z.ZodString;
}, z.core.$strip>], "source">;
export type McpConfigValue = z.infer<typeof McpConfigValueSchema>;
export declare const McpTransportSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"stdio">;
    command: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
    cwd: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        source: z.ZodLiteral<"literal">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodLiteral<"credential">;
        credentialRef: z.ZodString;
    }, z.core.$strip>], "source">>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"http">;
    url: z.ZodURL;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        source: z.ZodLiteral<"literal">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodLiteral<"credential">;
        credentialRef: z.ZodString;
    }, z.core.$strip>], "source">>>;
}, z.core.$strip>], "type">;
export type McpTransport = z.infer<typeof McpTransportSchema>;
export declare const McpServerScopeSchema: z.ZodEnum<{
    project: "project";
    global: "global";
}>;
export type McpServerScope = z.infer<typeof McpServerScopeSchema>;
export declare const McpAuthSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"unsupported">;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"not_required">;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"sign_in_required">;
    method: z.ZodEnum<{
        oauth: "oauth";
        bearer: "bearer";
    }>;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"authenticated">;
    method: z.ZodEnum<{
        oauth: "oauth";
        bearer: "bearer";
    }>;
}, z.core.$strip>], "status">;
export type McpAuth = z.infer<typeof McpAuthSchema>;
export declare const McpStartupStatusSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    state: z.ZodLiteral<"stopped">;
}, z.core.$strip>, z.ZodObject<{
    state: z.ZodLiteral<"starting">;
}, z.core.$strip>, z.ZodObject<{
    state: z.ZodLiteral<"ready">;
}, z.core.$strip>, z.ZodObject<{
    state: z.ZodLiteral<"failed">;
    message: z.ZodString;
}, z.core.$strip>], "state">;
export type McpStartupStatus = z.infer<typeof McpStartupStatusSchema>;
export declare const McpToolSchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    inputSchema: z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strip>;
export type McpTool = z.infer<typeof McpToolSchema>;
export declare const McpResourceSchema: z.ZodObject<{
    uri: z.ZodString;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    size: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type McpResource = z.infer<typeof McpResourceSchema>;
export declare const McpResourceTemplateSchema: z.ZodObject<{
    uriTemplate: z.ZodString;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type McpResourceTemplate = z.infer<typeof McpResourceTemplateSchema>;
/** A project entry either hides an inherited server or defines its replacement. */
export declare const McpServerConfigSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    enabled: z.ZodLiteral<false>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    enabled: z.ZodLiteral<true>;
    displayName: z.ZodOptional<z.ZodString>;
    transport: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"stdio">;
        command: z.ZodString;
        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
        cwd: z.ZodOptional<z.ZodString>;
        environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            source: z.ZodLiteral<"literal">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            source: z.ZodLiteral<"credential">;
            credentialRef: z.ZodString;
        }, z.core.$strip>], "source">>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            source: z.ZodLiteral<"literal">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            source: z.ZodLiteral<"credential">;
            credentialRef: z.ZodString;
        }, z.core.$strip>], "source">>>;
    }, z.core.$strip>], "type">;
}, z.core.$strip>], "enabled">;
export type McpServerConfig = z.infer<typeof McpServerConfigSchema>;
export declare const McpServerSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    scope: z.ZodEnum<{
        project: "project";
        global: "global";
    }>;
    enabled: z.ZodBoolean;
    transport: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"stdio">;
        command: z.ZodString;
        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
        cwd: z.ZodOptional<z.ZodString>;
        environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            source: z.ZodLiteral<"literal">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            source: z.ZodLiteral<"credential">;
            credentialRef: z.ZodString;
        }, z.core.$strip>], "source">>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"http">;
        url: z.ZodURL;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            source: z.ZodLiteral<"literal">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            source: z.ZodLiteral<"credential">;
            credentialRef: z.ZodString;
        }, z.core.$strip>], "source">>>;
    }, z.core.$strip>], "type">>;
    auth: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"unsupported">;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not_required">;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"sign_in_required">;
        method: z.ZodEnum<{
            oauth: "oauth";
            bearer: "bearer";
        }>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"authenticated">;
        method: z.ZodEnum<{
            oauth: "oauth";
            bearer: "bearer";
        }>;
    }, z.core.$strip>], "status">>;
    startup: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"stopped">;
    }, z.core.$strip>, z.ZodObject<{
        state: z.ZodLiteral<"starting">;
    }, z.core.$strip>, z.ZodObject<{
        state: z.ZodLiteral<"ready">;
    }, z.core.$strip>, z.ZodObject<{
        state: z.ZodLiteral<"failed">;
        message: z.ZodString;
    }, z.core.$strip>], "state">>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        inputSchema: z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
        outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strip>>;
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
}, z.core.$strip>;
export type McpServer = z.infer<typeof McpServerSchema>;
export declare const McpCapabilitiesSchema: z.ZodObject<{
    inventory: z.ZodBoolean;
    add: z.ZodBoolean;
    update: z.ZodBoolean;
    remove: z.ZodBoolean;
    reload: z.ZodBoolean;
    startOAuth: z.ZodBoolean;
    cancelOAuth: z.ZodBoolean;
}, z.core.$strip>;
export type McpCapabilities = z.infer<typeof McpCapabilitiesSchema>;
export declare const SkillScopeSchema: z.ZodEnum<{
    user: "user";
    project: "project";
    system: "system";
    admin: "admin";
}>;
export type SkillScope = z.infer<typeof SkillScopeSchema>;
/** Where the provider discovered the skill without exposing vendor internals. */
export declare const SkillSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"folder">;
    path: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"provider">;
}, z.core.$strip>], "type">;
export type SkillSource = z.infer<typeof SkillSourceSchema>;
export declare const SkillDependencyErrorSchema: z.ZodObject<{
    dependency: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
export type SkillDependencyError = z.infer<typeof SkillDependencyErrorSchema>;
export declare const SkillSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"folder">;
        path: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"provider">;
    }, z.core.$strip>], "type">;
    scope: z.ZodEnum<{
        user: "user";
        project: "project";
        system: "system";
        admin: "admin";
    }>;
    enabled: z.ZodBoolean;
    dependencyErrors: z.ZodArray<z.ZodObject<{
        dependency: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type Skill = z.infer<typeof SkillSchema>;
export declare const SkillDiscoveryErrorSchema: z.ZodObject<{
    path: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
export type SkillDiscoveryError = z.infer<typeof SkillDiscoveryErrorSchema>;
export declare const SkillCapabilitiesSchema: z.ZodObject<{
    inventory: z.ZodBoolean;
    configure: z.ZodBoolean;
    install: z.ZodBoolean;
}, z.core.$strip>;
export type SkillCapabilities = z.infer<typeof SkillCapabilitiesSchema>;
export declare const SearchSnippetPartSchema: z.ZodObject<{
    text: z.ZodString;
    highlighted: z.ZodBoolean;
}, z.core.$strip>;
export type SearchSnippetPart = z.infer<typeof SearchSnippetPartSchema>;
export declare const SessionSearchResultSchema: z.ZodObject<{
    resultId: z.ZodOptional<z.ZodString>;
    projectPath: z.ZodString;
    projectName: z.ZodString;
    threadId: z.ZodString;
    threadTitle: z.ZodString;
    turnId: z.ZodString;
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    createdAt: z.ZodNumber;
    snippet: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        highlighted: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SessionSearchResult = z.infer<typeof SessionSearchResultSchema>;
export declare const ThreadInboxStatusSchema: z.ZodEnum<{
    failed: "failed";
    input: "input";
    ready: "ready";
    starting: "starting";
    working: "working";
    queued: "queued";
    approval: "approval";
    idle: "idle";
}>;
export type ThreadInboxStatus = z.infer<typeof ThreadInboxStatusSchema>;
export declare const ThreadLifecycleSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    state: z.ZodLiteral<"active">;
    keepActive: z.ZodBoolean;
    wokeAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    state: z.ZodLiteral<"settled">;
    settledAt: z.ZodNumber;
    reason: z.ZodEnum<{
        manual: "manual";
        inactivity: "inactivity";
        change_request: "change_request";
    }>;
}, z.core.$strip>, z.ZodObject<{
    state: z.ZodLiteral<"snoozed">;
    snoozedAt: z.ZodNumber;
    wakeAt: z.ZodNumber;
}, z.core.$strip>], "state">;
export type ThreadLifecycle = z.infer<typeof ThreadLifecycleSchema>;
export declare const ProviderContextSettingsMapSchema: z.ZodRecord<z.ZodEnum<{
    codex: "codex";
    "claude-code": "claude-code";
    grok: "grok";
}> & z.core.$partial, z.ZodObject<{
    window: z.ZodOptional<z.ZodNumber>;
    compactAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"off">]>>;
}, z.core.$strip>>;
export type ProviderContextSettingsMap = z.infer<typeof ProviderContextSettingsMapSchema>;
export declare const SidebarSettingsSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        classic: "classic";
        inbox: "inbox";
    }>;
    autoSettleDays: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export type SidebarSettings = z.infer<typeof SidebarSettingsSchema>;
export declare const DiffLineSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"context">;
    oldLine: z.ZodNumber;
    newLine: z.ZodNumber;
    text: z.ZodString;
    noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"addition">;
    newLine: z.ZodNumber;
    text: z.ZodString;
    noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"deletion">;
    oldLine: z.ZodNumber;
    text: z.ZodString;
    noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>], "kind">;
export type DiffLine = z.infer<typeof DiffLineSchema>;
export declare const DiffDecisionSchema: z.ZodEnum<{
    accept: "accept";
    reject: "reject";
}>;
export type DiffDecision = z.infer<typeof DiffDecisionSchema>;
export declare const DiffHunkSchema: z.ZodObject<{
    id: z.ZodString;
    header: z.ZodString;
    oldStart: z.ZodNumber;
    oldLines: z.ZodNumber;
    newStart: z.ZodNumber;
    newLines: z.ZodNumber;
    lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"context">;
        oldLine: z.ZodNumber;
        newLine: z.ZodNumber;
        text: z.ZodString;
        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"addition">;
        newLine: z.ZodNumber;
        text: z.ZodString;
        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"deletion">;
        oldLine: z.ZodNumber;
        text: z.ZodString;
        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>], "kind">>;
    decision: z.ZodOptional<z.ZodEnum<{
        accept: "accept";
        reject: "reject";
    }>>;
}, z.core.$strip>;
export type DiffHunk = z.infer<typeof DiffHunkSchema>;
export declare const DiffFileSchema: z.ZodObject<{
    path: z.ZodString;
    previousPath: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        added: "added";
        modified: "modified";
        renamed: "renamed";
        deleted: "deleted";
    }>;
    binary: z.ZodBoolean;
    hunks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        header: z.ZodString;
        oldStart: z.ZodNumber;
        oldLines: z.ZodNumber;
        newStart: z.ZodNumber;
        newLines: z.ZodNumber;
        lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"context">;
            oldLine: z.ZodNumber;
            newLine: z.ZodNumber;
            text: z.ZodString;
            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"addition">;
            newLine: z.ZodNumber;
            text: z.ZodString;
            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"deletion">;
            oldLine: z.ZodNumber;
            text: z.ZodString;
            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>], "kind">>;
        decision: z.ZodOptional<z.ZodEnum<{
            accept: "accept";
            reject: "reject";
        }>>;
    }, z.core.$strip>>;
    decision: z.ZodOptional<z.ZodEnum<{
        accept: "accept";
        reject: "reject";
    }>>;
}, z.core.$strip>;
export type DiffFile = z.infer<typeof DiffFileSchema>;
export declare const SessionDiffSchema: z.ZodObject<{
    threadId: z.ZodString;
    version: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        previousPath: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            added: "added";
            modified: "modified";
            renamed: "renamed";
            deleted: "deleted";
        }>;
        binary: z.ZodBoolean;
        hunks: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            header: z.ZodString;
            oldStart: z.ZodNumber;
            oldLines: z.ZodNumber;
            newStart: z.ZodNumber;
            newLines: z.ZodNumber;
            lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"context">;
                oldLine: z.ZodNumber;
                newLine: z.ZodNumber;
                text: z.ZodString;
                noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>, z.ZodObject<{
                kind: z.ZodLiteral<"addition">;
                newLine: z.ZodNumber;
                text: z.ZodString;
                noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>, z.ZodObject<{
                kind: z.ZodLiteral<"deletion">;
                oldLine: z.ZodNumber;
                text: z.ZodString;
                noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>], "kind">>;
            decision: z.ZodOptional<z.ZodEnum<{
                accept: "accept";
                reject: "reject";
            }>>;
        }, z.core.$strip>>;
        decision: z.ZodOptional<z.ZodEnum<{
            accept: "accept";
            reject: "reject";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SessionDiff = z.infer<typeof SessionDiffSchema>;
export declare const ProviderLimitSchema: z.ZodObject<{
    label: z.ZodString;
    usedPercent: z.ZodNumber;
    resetsAt: z.ZodOptional<z.ZodNumber>;
    valueLabel: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodLiteral<"consume-reset">>;
    resetCredits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ProviderLimit = z.infer<typeof ProviderLimitSchema>;
export declare const ProviderLimitSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    status: z.ZodLiteral<"ready">;
    limits: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        usedPercent: z.ZodNumber;
        resetsAt: z.ZodOptional<z.ZodNumber>;
        valueLabel: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodLiteral<"consume-reset">>;
        resetCredits: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    provider: z.ZodEnum<{
        codex: "codex";
        "claude-code": "claude-code";
        grok: "grok";
    }>;
    status: z.ZodLiteral<"unavailable">;
}, z.core.$strip>], "status">;
export type ProviderLimitSource = z.infer<typeof ProviderLimitSourceSchema>;
/**
 * Method table. Adding a method means adding it here first — this object is the
 * single source of truth that the server routes against and the client calls.
 */
export declare const methods: {
    readonly 'client.capabilities': {
        readonly params: z.ZodObject<{
            previewCapture: z.ZodBoolean;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'preview.captureResult': {
        readonly params: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"completed">;
            requestId: z.ZodString;
            screenshots: z.ZodArray<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
                path: z.ZodString;
                domAudit: z.ZodOptional<z.ZodObject<{
                    h1Count: z.ZodNumber;
                    interactiveTargetViolations: z.ZodArray<z.ZodObject<{
                        selector: z.ZodString;
                        label: z.ZodString;
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                        partiallyClipped: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>>;
                    coverage: z.ZodOptional<z.ZodEnum<{
                        complete: "complete";
                        partial: "partial";
                    }>>;
                }, z.core.$strip>>;
                documentHeight: z.ZodOptional<z.ZodNumber>;
                capturedHeight: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            status: z.ZodLiteral<"failed">;
            requestId: z.ZodString;
            error: z.ZodString;
        }, z.core.$strip>], "status">;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'system.info': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            serverVersion: z.ZodString;
            protocolVersion: z.ZodNumber;
            platform: z.ZodEnum<{
                win32: "win32";
                darwin: "darwin";
                linux: "linux";
            }>;
        }, z.core.$strip>;
    };
    readonly 'system.panicStop': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            sessions: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                threadId: z.ZodString;
                status: z.ZodLiteral<"interrupted">;
            }, z.core.$strip>, z.ZodObject<{
                threadId: z.ZodString;
                status: z.ZodLiteral<"failed">;
                error: z.ZodString;
            }, z.core.$strip>], "status">>;
        }, z.core.$strip>;
    };
    /**
     * Compare the running checkout against the GitHub default branch. The
     * server does the network call — the renderer's CSP deliberately talks to
     * one local server and nothing else. Every field is optional because each
     * half can be unknowable (packaged build without git; offline).
     */
    readonly 'system.updateCheck': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            localCommit: z.ZodOptional<z.ZodString>;
            remote: z.ZodOptional<z.ZodObject<{
                sha: z.ZodString;
                message: z.ZodString;
                date: z.ZodString;
            }, z.core.$strip>>;
            upToDate: z.ZodOptional<z.ZodBoolean>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    readonly 'providers.list': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            providers: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    /** Context settings applied when a session launches or resumes. */
    readonly 'providers.contextSettings': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodRecord<z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }> & z.core.$partial, z.ZodObject<{
            window: z.ZodOptional<z.ZodNumber>;
            compactAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"off">]>>;
        }, z.core.$strip>>;
    };
    /** Replaces one provider's settings; sessions already running keep theirs. */
    readonly 'providers.updateContextSettings': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            settings: z.ZodObject<{
                window: z.ZodOptional<z.ZodNumber>;
                compactAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"off">]>>;
            }, z.core.$strip>;
        }, z.core.$strip>;
        readonly result: z.ZodRecord<z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }> & z.core.$partial, z.ZodObject<{
            window: z.ZodOptional<z.ZodNumber>;
            compactAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"off">]>>;
        }, z.core.$strip>>;
    };
    /** Cached background release checks, separate from startup provider detection. */
    readonly 'providers.updates': {
        readonly params: z.ZodObject<{
            refresh: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            updates: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    /** The server selects the updater; the client can only name a supported provider. */
    readonly 'providers.update': {
        readonly params: z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
    };
    /** User-owned protocol-compatible CLIs. Secrets never belong in these fields. */
    readonly 'harnesses.list': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            harnesses: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly 'harnesses.upsert': {
        readonly params: z.ZodObject<{
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
        readonly result: z.ZodObject<{
            harness: z.ZodObject<{
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
        }, z.core.$strip>;
    };
    readonly 'harnesses.verify': {
        readonly params: z.ZodObject<{
            harness: z.ZodObject<{
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
            workspacePath: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            verification: z.ZodObject<{
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
        }, z.core.$strip>;
    };
    readonly 'harnesses.remove': {
        readonly params: z.ZodObject<{
            harnessId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /**
     * Install a provider CLI in the background. The client only names the
     * target; the server resolves the install command from its own table, so no
     * command text ever crosses this boundary. The install runs in a real
     * terminal session — output and exit arrive on the usual `terminal.output`
     * and `terminal.exit` channels — so the user can be handed the live session
     * if the installer needs them. Fails when the target has no scriptable
     * install (the setup URL stays the fallback).
     */
    readonly 'providers.install': {
        readonly params: z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
    };
    /**
     * Launch a provider's own CLI in an interactive terminal session, for
     * providers whose sign-in lives inside that CLI (`setup.login ===
     * 'provider'`). Same boundary as `providers.install`: the client names the
     * target, the server resolves what to run from its own table, and no command
     * text ever crosses. The session speaks the usual `terminal.output`,
     * `terminal.input` and `terminal.exit` channels; asking again while one is
     * running reattaches instead of launching twice. Fails when the target's
     * sign-in is not provider-CLI-managed or the CLI is not installed.
     */
    readonly 'providers.launch': {
        readonly params: z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'mcp.list': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            capabilities: z.ZodObject<{
                inventory: z.ZodBoolean;
                add: z.ZodBoolean;
                update: z.ZodBoolean;
                remove: z.ZodBoolean;
                reload: z.ZodBoolean;
                startOAuth: z.ZodBoolean;
                cancelOAuth: z.ZodBoolean;
            }, z.core.$strip>;
            servers: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                displayName: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                version: z.ZodOptional<z.ZodString>;
                scope: z.ZodEnum<{
                    project: "project";
                    global: "global";
                }>;
                enabled: z.ZodBoolean;
                transport: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"stdio">;
                    command: z.ZodString;
                    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    cwd: z.ZodOptional<z.ZodString>;
                    environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        source: z.ZodLiteral<"literal">;
                        value: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        source: z.ZodLiteral<"credential">;
                        credentialRef: z.ZodString;
                    }, z.core.$strip>], "source">>>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"http">;
                    url: z.ZodURL;
                    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        source: z.ZodLiteral<"literal">;
                        value: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        source: z.ZodLiteral<"credential">;
                        credentialRef: z.ZodString;
                    }, z.core.$strip>], "source">>>;
                }, z.core.$strip>], "type">>;
                auth: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    status: z.ZodLiteral<"unsupported">;
                }, z.core.$strip>, z.ZodObject<{
                    status: z.ZodLiteral<"not_required">;
                }, z.core.$strip>, z.ZodObject<{
                    status: z.ZodLiteral<"sign_in_required">;
                    method: z.ZodEnum<{
                        oauth: "oauth";
                        bearer: "bearer";
                    }>;
                }, z.core.$strip>, z.ZodObject<{
                    status: z.ZodLiteral<"authenticated">;
                    method: z.ZodEnum<{
                        oauth: "oauth";
                        bearer: "bearer";
                    }>;
                }, z.core.$strip>], "status">>;
                startup: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    state: z.ZodLiteral<"stopped">;
                }, z.core.$strip>, z.ZodObject<{
                    state: z.ZodLiteral<"starting">;
                }, z.core.$strip>, z.ZodObject<{
                    state: z.ZodLiteral<"ready">;
                }, z.core.$strip>, z.ZodObject<{
                    state: z.ZodLiteral<"failed">;
                    message: z.ZodString;
                }, z.core.$strip>], "state">>;
                tools: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    title: z.ZodOptional<z.ZodString>;
                    description: z.ZodOptional<z.ZodString>;
                    inputSchema: z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
                    outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
                }, z.core.$strip>>;
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
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly 'mcp.add': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            server: z.ZodDiscriminatedUnion<[z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodLiteral<false>;
            }, z.core.$strip>, z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodLiteral<true>;
                displayName: z.ZodOptional<z.ZodString>;
                transport: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"stdio">;
                    command: z.ZodString;
                    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    cwd: z.ZodOptional<z.ZodString>;
                    environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        source: z.ZodLiteral<"literal">;
                        value: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        source: z.ZodLiteral<"credential">;
                        credentialRef: z.ZodString;
                    }, z.core.$strip>], "source">>>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"http">;
                    url: z.ZodURL;
                    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        source: z.ZodLiteral<"literal">;
                        value: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        source: z.ZodLiteral<"credential">;
                        credentialRef: z.ZodString;
                    }, z.core.$strip>], "source">>>;
                }, z.core.$strip>], "type">;
            }, z.core.$strip>], "enabled">;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'mcp.update': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            server: z.ZodDiscriminatedUnion<[z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodLiteral<false>;
            }, z.core.$strip>, z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodLiteral<true>;
                displayName: z.ZodOptional<z.ZodString>;
                transport: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"stdio">;
                    command: z.ZodString;
                    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    cwd: z.ZodOptional<z.ZodString>;
                    environment: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        source: z.ZodLiteral<"literal">;
                        value: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        source: z.ZodLiteral<"credential">;
                        credentialRef: z.ZodString;
                    }, z.core.$strip>], "source">>>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"http">;
                    url: z.ZodURL;
                    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
                        source: z.ZodLiteral<"literal">;
                        value: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        source: z.ZodLiteral<"credential">;
                        credentialRef: z.ZodString;
                    }, z.core.$strip>], "source">>>;
                }, z.core.$strip>], "type">;
            }, z.core.$strip>], "enabled">;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'mcp.remove': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            serverId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'mcp.reload': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'mcp.startOAuth': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            serverId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            loginId: z.ZodString;
            authUrl: z.ZodURL;
        }, z.core.$strip>;
    };
    readonly 'mcp.cancelOAuth': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            serverId: z.ZodString;
            loginId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'skills.list': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            capabilities: z.ZodObject<{
                inventory: z.ZodBoolean;
                configure: z.ZodBoolean;
                install: z.ZodBoolean;
            }, z.core.$strip>;
            skills: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                displayName: z.ZodOptional<z.ZodString>;
                description: z.ZodString;
                source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"folder">;
                    path: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"provider">;
                }, z.core.$strip>], "type">;
                scope: z.ZodEnum<{
                    user: "user";
                    project: "project";
                    system: "system";
                    admin: "admin";
                }>;
                enabled: z.ZodBoolean;
                dependencyErrors: z.ZodArray<z.ZodObject<{
                    dependency: z.ZodString;
                    message: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            errors: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                message: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly 'skills.setEnabled': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            skillId: z.ZodString;
            enabled: z.ZodBoolean;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            enabled: z.ZodBoolean;
        }, z.core.$strip>;
    };
    readonly 'skills.installFromFolder': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            folderPath: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            skill: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                displayName: z.ZodOptional<z.ZodString>;
                description: z.ZodString;
                source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"folder">;
                    path: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"provider">;
                }, z.core.$strip>], "type">;
                scope: z.ZodEnum<{
                    user: "user";
                    project: "project";
                    system: "system";
                    admin: "admin";
                }>;
                enabled: z.ZodBoolean;
                dependencyErrors: z.ZodArray<z.ZodObject<{
                    dependency: z.ZodString;
                    message: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strip>;
    };
    readonly 'search.sessions': {
        readonly params: z.ZodObject<{
            query: z.ZodString;
            projectPath: z.ZodOptional<z.ZodString>;
            provider: z.ZodOptional<z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>>;
            cursor: z.ZodOptional<z.ZodString>;
            limit: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            results: z.ZodArray<z.ZodObject<{
                resultId: z.ZodOptional<z.ZodString>;
                projectPath: z.ZodString;
                projectName: z.ZodString;
                threadId: z.ZodString;
                threadTitle: z.ZodString;
                turnId: z.ZodString;
                provider: z.ZodEnum<{
                    codex: "codex";
                    "claude-code": "claude-code";
                    grok: "grok";
                }>;
                createdAt: z.ZodNumber;
                snippet: z.ZodArray<z.ZodObject<{
                    text: z.ZodString;
                    highlighted: z.ZodBoolean;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            nextCursor: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    };
    readonly 'pullRequests.list': {
        readonly params: z.ZodObject<{
            refresh: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            account: z.ZodObject<{
                available: z.ZodBoolean;
                authenticated: z.ZodBoolean;
                login: z.ZodOptional<z.ZodString>;
                error: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            items: z.ZodArray<z.ZodObject<{
                repository: z.ZodString;
                number: z.ZodNumber;
                id: z.ZodString;
                title: z.ZodString;
                url: z.ZodString;
                author: z.ZodObject<{
                    login: z.ZodString;
                    isBot: z.ZodBoolean;
                }, z.core.$strip>;
                updatedAt: z.ZodString;
                isDraft: z.ZodBoolean;
                state: z.ZodEnum<{
                    OPEN: "OPEN";
                    CLOSED: "CLOSED";
                    MERGED: "MERGED";
                }>;
                additions: z.ZodNumber;
                deletions: z.ZodNumber;
                commentsCount: z.ZodNumber;
                headRefName: z.ZodString;
                baseRefName: z.ZodString;
                reviewDecision: z.ZodOptional<z.ZodEnum<{
                    APPROVED: "APPROVED";
                    CHANGES_REQUESTED: "CHANGES_REQUESTED";
                    REVIEW_REQUIRED: "REVIEW_REQUIRED";
                }>>;
                mergeStateStatus: z.ZodOptional<z.ZodString>;
                relationship: z.ZodEnum<{
                    authored: "authored";
                    reviewing: "reviewing";
                    both: "both";
                }>;
                localProjectPath: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            fetchedAt: z.ZodNumber;
            truncated: z.ZodBoolean;
        }, z.core.$strip>;
    };
    /**
     * Install or authenticate the local GitHub CLI in an interactive terminal.
     * The renderer names only the fixed setup action; the server owns the
     * platform-specific command so this boundary cannot become a remote shell.
     */
    readonly 'pullRequests.setup': {
        readonly params: z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            action: z.ZodEnum<{
                login: "login";
                install: "install";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'pullRequests.detail': {
        readonly params: z.ZodObject<{
            repository: z.ZodString;
            number: z.ZodNumber;
            refresh: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            repository: z.ZodString;
            number: z.ZodNumber;
            id: z.ZodString;
            title: z.ZodString;
            url: z.ZodString;
            author: z.ZodObject<{
                login: z.ZodString;
                isBot: z.ZodBoolean;
            }, z.core.$strip>;
            updatedAt: z.ZodString;
            isDraft: z.ZodBoolean;
            state: z.ZodEnum<{
                OPEN: "OPEN";
                CLOSED: "CLOSED";
                MERGED: "MERGED";
            }>;
            additions: z.ZodNumber;
            deletions: z.ZodNumber;
            commentsCount: z.ZodNumber;
            headRefName: z.ZodString;
            baseRefName: z.ZodString;
            reviewDecision: z.ZodOptional<z.ZodEnum<{
                APPROVED: "APPROVED";
                CHANGES_REQUESTED: "CHANGES_REQUESTED";
                REVIEW_REQUIRED: "REVIEW_REQUIRED";
            }>>;
            mergeStateStatus: z.ZodOptional<z.ZodString>;
            relationship: z.ZodEnum<{
                authored: "authored";
                reviewing: "reviewing";
                both: "both";
            }>;
            localProjectPath: z.ZodOptional<z.ZodString>;
            body: z.ZodString;
            createdAt: z.ZodString;
            closedAt: z.ZodOptional<z.ZodString>;
            mergedAt: z.ZodOptional<z.ZodString>;
            headRefOid: z.ZodString;
            baseRefOid: z.ZodString;
            changedFiles: z.ZodNumber;
            mergeable: z.ZodEnum<{
                MERGEABLE: "MERGEABLE";
                CONFLICTING: "CONFLICTING";
                UNKNOWN: "UNKNOWN";
            }>;
            maintainerCanModify: z.ZodBoolean;
            autoMerge: z.ZodOptional<z.ZodObject<{
                mergeMethod: z.ZodEnum<{
                    MERGE: "MERGE";
                    REBASE: "REBASE";
                    SQUASH: "SQUASH";
                }>;
                enabledAt: z.ZodOptional<z.ZodString>;
                enabledBy: z.ZodOptional<z.ZodObject<{
                    login: z.ZodString;
                    isBot: z.ZodBoolean;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            reviewers: z.ZodArray<z.ZodObject<{
                actor: z.ZodObject<{
                    login: z.ZodString;
                    isBot: z.ZodBoolean;
                }, z.core.$strip>;
                state: z.ZodEnum<{
                    APPROVED: "APPROVED";
                    CHANGES_REQUESTED: "CHANGES_REQUESTED";
                    COMMENTED: "COMMENTED";
                    DISMISSED: "DISMISSED";
                    PENDING: "PENDING";
                    REQUESTED: "REQUESTED";
                }>;
                submittedAt: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            requestedReviewers: z.ZodArray<z.ZodObject<{
                login: z.ZodString;
                isBot: z.ZodBoolean;
            }, z.core.$strip>>;
            assignees: z.ZodArray<z.ZodObject<{
                login: z.ZodString;
                isBot: z.ZodBoolean;
            }, z.core.$strip>>;
            labels: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                color: z.ZodString;
            }, z.core.$strip>>;
            milestone: z.ZodOptional<z.ZodString>;
            checks: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                workflowName: z.ZodOptional<z.ZodString>;
                state: z.ZodEnum<{
                    success: "success";
                    pending: "pending";
                    failure: "failure";
                    neutral: "neutral";
                    skipped: "skipped";
                    cancelled: "cancelled";
                }>;
                detailsUrl: z.ZodOptional<z.ZodString>;
                startedAt: z.ZodOptional<z.ZodString>;
                completedAt: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            comments: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                databaseId: z.ZodOptional<z.ZodNumber>;
                author: z.ZodObject<{
                    login: z.ZodString;
                    isBot: z.ZodBoolean;
                }, z.core.$strip>;
                body: z.ZodString;
                createdAt: z.ZodString;
                updatedAt: z.ZodOptional<z.ZodString>;
                url: z.ZodString;
                viewerDidAuthor: z.ZodBoolean;
            }, z.core.$strip>>;
            reviews: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                author: z.ZodObject<{
                    login: z.ZodString;
                    isBot: z.ZodBoolean;
                }, z.core.$strip>;
                body: z.ZodString;
                state: z.ZodEnum<{
                    APPROVED: "APPROVED";
                    CHANGES_REQUESTED: "CHANGES_REQUESTED";
                    COMMENTED: "COMMENTED";
                    DISMISSED: "DISMISSED";
                    PENDING: "PENDING";
                }>;
                submittedAt: z.ZodString;
                viewerDidAuthor: z.ZodBoolean;
            }, z.core.$strip>>;
            reviewThreads: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                path: z.ZodString;
                line: z.ZodOptional<z.ZodNumber>;
                startLine: z.ZodOptional<z.ZodNumber>;
                originalLine: z.ZodOptional<z.ZodNumber>;
                originalStartLine: z.ZodOptional<z.ZodNumber>;
                diffSide: z.ZodOptional<z.ZodEnum<{
                    LEFT: "LEFT";
                    RIGHT: "RIGHT";
                }>>;
                startDiffSide: z.ZodOptional<z.ZodEnum<{
                    LEFT: "LEFT";
                    RIGHT: "RIGHT";
                }>>;
                resolved: z.ZodBoolean;
                outdated: z.ZodBoolean;
                comments: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    databaseId: z.ZodOptional<z.ZodNumber>;
                    author: z.ZodObject<{
                        login: z.ZodString;
                        isBot: z.ZodBoolean;
                    }, z.core.$strip>;
                    body: z.ZodString;
                    createdAt: z.ZodString;
                    updatedAt: z.ZodOptional<z.ZodString>;
                    url: z.ZodString;
                    viewerDidAuthor: z.ZodBoolean;
                }, z.core.$strip>>;
                commentsTruncated: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
            reviewThreadsTruncated: z.ZodBoolean;
            reviewThreadsUnavailable: z.ZodOptional<z.ZodBoolean>;
            permissions: z.ZodObject<{
                canPush: z.ZodBoolean;
                canAdmin: z.ZodBoolean;
            }, z.core.$strip>;
            mergeMethods: z.ZodObject<{
                merge: z.ZodBoolean;
                rebase: z.ZodBoolean;
                squash: z.ZodBoolean;
                deleteBranchOnMerge: z.ZodBoolean;
            }, z.core.$strip>;
        }, z.core.$strip>;
    };
    readonly 'pullRequests.files': {
        readonly params: z.ZodObject<{
            repository: z.ZodString;
            number: z.ZodNumber;
            expectedHeadOid: z.ZodString;
            expectedBaseOid: z.ZodString;
            page: z.ZodOptional<z.ZodNumber>;
            refresh: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            headRefOid: z.ZodString;
            baseRefOid: z.ZodString;
            files: z.ZodArray<z.ZodObject<{
                sha: z.ZodString;
                path: z.ZodString;
                previousPath: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    added: "added";
                    removed: "removed";
                    modified: "modified";
                    renamed: "renamed";
                    copied: "copied";
                    changed: "changed";
                    unchanged: "unchanged";
                }>;
                additions: z.ZodNumber;
                deletions: z.ZodNumber;
                changes: z.ZodNumber;
                patch: z.ZodOptional<z.ZodString>;
                blobUrl: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            page: z.ZodNumber;
            hasMore: z.ZodBoolean;
        }, z.core.$strip>;
    };
    readonly 'pullRequests.metadataOptions': {
        readonly params: z.ZodObject<{
            repository: z.ZodString;
            refresh: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            reviewers: z.ZodArray<z.ZodObject<{
                login: z.ZodString;
                isBot: z.ZodBoolean;
            }, z.core.$strip>>;
            assignees: z.ZodArray<z.ZodObject<{
                login: z.ZodString;
                isBot: z.ZodBoolean;
            }, z.core.$strip>>;
            labels: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                color: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            milestones: z.ZodArray<z.ZodObject<{
                number: z.ZodNumber;
                title: z.ZodString;
            }, z.core.$strip>>;
            baseBranches: z.ZodArray<z.ZodString>;
            unavailable: z.ZodArray<z.ZodEnum<{
                reviewers: "reviewers";
                assignees: "assignees";
                labels: "labels";
                milestones: "milestones";
                baseBranches: "baseBranches";
            }>>;
            truncated: z.ZodBoolean;
        }, z.core.$strip>;
    };
    readonly 'pullRequests.action': {
        readonly params: z.ZodObject<{
            repository: z.ZodString;
            number: z.ZodNumber;
            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"comment">;
                body: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"review">;
                verdict: z.ZodEnum<{
                    approve: "approve";
                    comment: "comment";
                    request_changes: "request_changes";
                }>;
                body: z.ZodString;
                commitId: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"inline_comment">;
                body: z.ZodString;
                commitId: z.ZodString;
                path: z.ZodString;
                line: z.ZodNumber;
                side: z.ZodEnum<{
                    LEFT: "LEFT";
                    RIGHT: "RIGHT";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"reply_to_review">;
                commentId: z.ZodNumber;
                body: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_comment">;
                kind: z.ZodEnum<{
                    review: "review";
                    issue: "issue";
                }>;
                commentId: z.ZodNumber;
                body: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"delete_comment">;
                kind: z.ZodEnum<{
                    review: "review";
                    issue: "issue";
                }>;
                commentId: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"resolve_thread">;
                threadId: z.ZodString;
                resolved: z.ZodBoolean;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"edit">;
                title: z.ZodOptional<z.ZodString>;
                body: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_metadata">;
                baseRefName: z.ZodOptional<z.ZodString>;
                addReviewers: z.ZodArray<z.ZodString>;
                removeReviewers: z.ZodArray<z.ZodString>;
                addAssignees: z.ZodArray<z.ZodString>;
                removeAssignees: z.ZodArray<z.ZodString>;
                addLabels: z.ZodArray<z.ZodString>;
                removeLabels: z.ZodArray<z.ZodString>;
                milestone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"set_draft">;
                draft: z.ZodBoolean;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"close">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"reopen">;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_branch">;
                rebase: z.ZodBoolean;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"rerun_checks">;
                failedOnly: z.ZodBoolean;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"merge">;
                method: z.ZodEnum<{
                    merge: "merge";
                    rebase: "rebase";
                    squash: "squash";
                }>;
                deleteBranch: z.ZodBoolean;
                expectedHeadOid: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"enable_auto_merge">;
                method: z.ZodEnum<{
                    merge: "merge";
                    rebase: "rebase";
                    squash: "squash";
                }>;
                expectedHeadOid: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"disable_auto_merge">;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    };
    /**
     * Load a repository file or upload embedded as an image. The
     * renderer has no GitHub session, so the server fetches the bytes through
     * the authenticated CLI and private repositories render like public ones.
     */
    readonly 'pullRequests.image': {
        readonly params: z.ZodObject<{
            url: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            mediaType: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
                "image/gif": "image/gif";
                "image/webp": "image/webp";
                "image/avif": "image/avif";
                "image/svg+xml": "image/svg+xml";
                "image/bmp": "image/bmp";
                "image/x-icon": "image/x-icon";
            }>;
            data: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'auth.status': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            signedIn: z.ZodBoolean;
            email: z.ZodOptional<z.ZodString>;
            plan: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    /**
     * Starts the vendor's real OAuth flow and returns the URL to open. The user
     * signs in on the vendor's own site; completion arrives on `auth.event`.
     */
    readonly 'auth.startLogin': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            loginId: z.ZodString;
            authUrl: z.ZodOptional<z.ZodURL>;
        }, z.core.$strip>;
    };
    readonly 'auth.cancelLogin': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
            loginId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'auth.useApiKey': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
            apiKey: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            signedIn: z.ZodBoolean;
            email: z.ZodOptional<z.ZodString>;
            plan: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    readonly 'auth.signOut': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'workspace.info': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            branch: z.ZodOptional<z.ZodString>;
            added: z.ZodNumber;
            removed: z.ZodNumber;
            dirtyFiles: z.ZodNumber;
        }, z.core.$strip>;
    };
    readonly 'workspace.branches': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            branches: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
    };
    readonly 'workspace.switchBranch': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
            branch: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            branch: z.ZodOptional<z.ZodString>;
            added: z.ZodNumber;
            removed: z.ZodNumber;
            dirtyFiles: z.ZodNumber;
        }, z.core.$strip>;
    };
    /** Structured staged, unstaged and untracked changes in the active checkout. */
    readonly 'workspace.diff': {
        readonly params: z.ZodObject<{
            projectPath: z.ZodString;
            threadId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            threadId: z.ZodString;
            version: z.ZodString;
            files: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                previousPath: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    added: "added";
                    modified: "modified";
                    renamed: "renamed";
                    deleted: "deleted";
                }>;
                binary: z.ZodBoolean;
                hunks: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    header: z.ZodString;
                    oldStart: z.ZodNumber;
                    oldLines: z.ZodNumber;
                    newStart: z.ZodNumber;
                    newLines: z.ZodNumber;
                    lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"context">;
                        oldLine: z.ZodNumber;
                        newLine: z.ZodNumber;
                        text: z.ZodString;
                        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>, z.ZodObject<{
                        kind: z.ZodLiteral<"addition">;
                        newLine: z.ZodNumber;
                        text: z.ZodString;
                        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>, z.ZodObject<{
                        kind: z.ZodLiteral<"deletion">;
                        oldLine: z.ZodNumber;
                        text: z.ZodString;
                        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>], "kind">>;
                    decision: z.ZodOptional<z.ZodEnum<{
                        accept: "accept";
                        reject: "reject";
                    }>>;
                }, z.core.$strip>>;
                decision: z.ZodOptional<z.ZodEnum<{
                    accept: "accept";
                    reject: "reject";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    /** Lazily list one folder in a registered project or a session's isolated checkout. */
    readonly 'workspace.listDirectory': {
        readonly params: z.ZodObject<{
            projectPath: z.ZodString;
            threadId: z.ZodOptional<z.ZodString>;
            directory: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            path: z.ZodString;
            entries: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                kind: z.ZodEnum<{
                    file: "file";
                    directory: "directory";
                }>;
                size: z.ZodNumber;
                modifiedAt: z.ZodNumber;
                restricted: z.ZodBoolean;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    /**
     * Find files and folders by name anywhere in a registered project or a session's isolated
     * checkout, including folders the client has not opened yet. Follows the same visibility
     * rules as `workspace.listDirectory`.
     */
    readonly 'workspace.searchFiles': {
        readonly params: z.ZodObject<{
            projectPath: z.ZodString;
            threadId: z.ZodOptional<z.ZodString>;
            query: z.ZodString;
            limit: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            entries: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                kind: z.ZodEnum<{
                    file: "file";
                    directory: "directory";
                }>;
                size: z.ZodNumber;
                modifiedAt: z.ZodNumber;
                restricted: z.ZodBoolean;
            }, z.core.$strip>>;
            truncated: z.ZodBoolean;
        }, z.core.$strip>;
    };
    /** Read a bounded public text file without exposing renderer filesystem access. */
    readonly 'workspace.readFile': {
        readonly params: z.ZodObject<{
            projectPath: z.ZodString;
            threadId: z.ZodOptional<z.ZodString>;
            path: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            binary: z.ZodBoolean;
            truncated: z.ZodBoolean;
            content: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    readonly 'models.list': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
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
    };
    /** Model policy for short product-owned writing tasks. */
    readonly 'backgroundModel.settings': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
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
    };
    readonly 'backgroundModel.updateSettings': {
        readonly params: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        readonly result: z.ZodObject<{
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
    };
    readonly 'backgroundModel.generateTitle': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            prompt: z.ZodString;
            expectedTitle: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            title: z.ZodString;
            applied: z.ZodBoolean;
        }, z.core.$strip>;
    };
    readonly 'backgroundModel.generateCommitMessage': {
        readonly params: z.ZodObject<{
            projectPath: z.ZodString;
            threadId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    };
    /**
     * Whether this provider can accept a recorded clip. Availability is account-
     * and binary-specific, so the renderer asks instead of inferring it from a mic API.
     */
    readonly 'voice.status': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            available: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodEnum<{
                sign_in_required: "sign_in_required";
                provider_unsupported: "provider_unsupported";
                unsupported_auth: "unsupported_auth";
                codex_too_old: "codex_too_old";
            }>>;
        }, z.core.$strip>;
    };
    /** A normalized clip. The server and Codex adapter validate the WAV again. */
    readonly 'voice.transcribe': {
        readonly params: z.ZodObject<{
            requestId: z.ZodString;
            provider: z.ZodLiteral<"codex">;
            audioBase64: z.ZodString;
            mimeType: z.ZodLiteral<"audio/wav">;
            sampleRateHz: z.ZodLiteral<24000>;
            durationMs: z.ZodNumber;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            text: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'voice.cancel': {
        readonly params: z.ZodObject<{
            requestId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /**
     * Projects and sessions the server knows about. These replace what the
     * renderer used to keep in localStorage, where a reload could destroy it.
     */
    readonly 'projects.list': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            projects: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                name: z.ZodString;
                pinned: z.ZodBoolean;
                createdAt: z.ZodNumber;
                sessions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    provider: z.ZodEnum<{
                        codex: "codex";
                        "claude-code": "claude-code";
                        grok: "grok";
                    }>;
                    agent: z.ZodOptional<z.ZodString>;
                    createdAt: z.ZodNumber;
                    running: z.ZodBoolean;
                    pinned: z.ZodOptional<z.ZodBoolean>;
                    status: z.ZodOptional<z.ZodEnum<{
                        failed: "failed";
                        input: "input";
                        ready: "ready";
                        starting: "starting";
                        working: "working";
                        queued: "queued";
                        approval: "approval";
                        idle: "idle";
                    }>>;
                    unread: z.ZodOptional<z.ZodBoolean>;
                    lifecycle: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        state: z.ZodLiteral<"active">;
                        keepActive: z.ZodBoolean;
                        wokeAt: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>, z.ZodObject<{
                        state: z.ZodLiteral<"settled">;
                        settledAt: z.ZodNumber;
                        reason: z.ZodEnum<{
                            manual: "manual";
                            inactivity: "inactivity";
                            change_request: "change_request";
                        }>;
                    }, z.core.$strip>, z.ZodObject<{
                        state: z.ZodLiteral<"snoozed">;
                        snoozedAt: z.ZodNumber;
                        wakeAt: z.ZodNumber;
                    }, z.core.$strip>], "state">>;
                    closedAt: z.ZodOptional<z.ZodNumber>;
                    worktreeBranch: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly 'projects.add': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            path: z.ZodString;
            name: z.ZodString;
            pinned: z.ZodBoolean;
            createdAt: z.ZodNumber;
        }, z.core.$strip>;
    };
    readonly 'projects.pin': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
            pinned: z.ZodBoolean;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'projects.rename': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
            name: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'projects.remove': {
        readonly params: z.ZodObject<{
            path: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /** Open the platform-selected shell in a session checkout or registered project. */
    readonly 'terminal.open': {
        readonly params: z.ZodUnion<readonly [z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            threadId: z.ZodString;
            terminalKey: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            projectPath: z.ZodString;
            terminalKey: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>]>;
        readonly result: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'terminal.input': {
        readonly params: z.ZodObject<{
            terminalId: z.ZodString;
            data: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'terminal.resize': {
        readonly params: z.ZodObject<{
            columns: z.ZodNumber;
            rows: z.ZodNumber;
            terminalId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'terminal.close': {
        readonly params: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /** Recover a terminal job after output or completion was missed on reconnect. */
    readonly 'terminal.status': {
        readonly params: z.ZodObject<{
            terminalId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            status: z.ZodEnum<{
                unknown: "unknown";
                running: "running";
                exited: "exited";
            }>;
            output: z.ZodString;
            outputOffset: z.ZodNumber;
            exitCode: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>;
    };
    /** Renew short provider notification leases while a settings view is visible. */
    readonly 'providers.watch': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            projectPath: z.ZodString;
            targets: z.ZodArray<z.ZodEnum<{
                skills: "skills";
                mcp: "mcp";
            }>>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            expiresInMs: z.ZodNumber;
        }, z.core.$strip>;
    };
    /** Materialize a browser clipboard image where the local agents can read it. */
    readonly 'attachments.saveImage': {
        readonly params: z.ZodObject<{
            mimeType: z.ZodString;
            data: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            path: z.ZodString;
        }, z.core.$strip>;
    };
    readonly 'thread.rename': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            title: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.pin': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            pinned: z.ZodBoolean;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.settle': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            lifecycle: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"active">;
                keepActive: z.ZodBoolean;
                wokeAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"settled">;
                settledAt: z.ZodNumber;
                reason: z.ZodEnum<{
                    manual: "manual";
                    inactivity: "inactivity";
                    change_request: "change_request";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"snoozed">;
                snoozedAt: z.ZodNumber;
                wakeAt: z.ZodNumber;
            }, z.core.$strip>], "state">;
        }, z.core.$strip>;
    };
    readonly 'thread.unsettle': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            lifecycle: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"active">;
                keepActive: z.ZodBoolean;
                wokeAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"settled">;
                settledAt: z.ZodNumber;
                reason: z.ZodEnum<{
                    manual: "manual";
                    inactivity: "inactivity";
                    change_request: "change_request";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"snoozed">;
                snoozedAt: z.ZodNumber;
                wakeAt: z.ZodNumber;
            }, z.core.$strip>], "state">;
        }, z.core.$strip>;
    };
    readonly 'thread.snooze': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            wakeAt: z.ZodNumber;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            lifecycle: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"active">;
                keepActive: z.ZodBoolean;
                wokeAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"settled">;
                settledAt: z.ZodNumber;
                reason: z.ZodEnum<{
                    manual: "manual";
                    inactivity: "inactivity";
                    change_request: "change_request";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"snoozed">;
                snoozedAt: z.ZodNumber;
                wakeAt: z.ZodNumber;
            }, z.core.$strip>], "state">;
        }, z.core.$strip>;
    };
    readonly 'thread.unsnooze': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            lifecycle: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"active">;
                keepActive: z.ZodBoolean;
                wokeAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"settled">;
                settledAt: z.ZodNumber;
                reason: z.ZodEnum<{
                    manual: "manual";
                    inactivity: "inactivity";
                    change_request: "change_request";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"snoozed">;
                snoozedAt: z.ZodNumber;
                wakeAt: z.ZodNumber;
            }, z.core.$strip>], "state">;
        }, z.core.$strip>;
    };
    readonly 'thread.setKeepActive': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            keepActive: z.ZodBoolean;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            lifecycle: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"active">;
                keepActive: z.ZodBoolean;
                wokeAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"settled">;
                settledAt: z.ZodNumber;
                reason: z.ZodEnum<{
                    manual: "manual";
                    inactivity: "inactivity";
                    change_request: "change_request";
                }>;
            }, z.core.$strip>, z.ZodObject<{
                state: z.ZodLiteral<"snoozed">;
                snoozedAt: z.ZodNumber;
                wakeAt: z.ZodNumber;
            }, z.core.$strip>], "state">;
        }, z.core.$strip>;
    };
    readonly 'thread.delete': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /**
     * Everything that has happened in a thread, so reopening it shows the
     * conversation rather than an empty pane. `afterSeq` asks only for the tail,
     * which is what a client that fell behind needs.
     */
    readonly 'thread.history': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            afterSeq: z.ZodOptional<z.ZodNumber>;
            page: z.ZodOptional<z.ZodObject<{
                before: z.ZodOptional<z.ZodString>;
                turnLimit: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            events: z.ZodArray<z.ZodObject<{
                seq: z.ZodNumber;
                event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            }, z.core.$strip>>;
            running: z.ZodBoolean;
            reset: z.ZodOptional<z.ZodBoolean>;
            approval: z.ZodOptional<z.ZodEnum<{
                ask: "ask";
                auto: "auto";
                "auto-review": "auto-review";
                full: "full";
            }>>;
            page: z.ZodOptional<z.ZodObject<{
                olderCursor: z.ZodNullable<z.ZodString>;
                snapshotSeq: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly 'thread.diff': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            threadId: z.ZodString;
            version: z.ZodString;
            files: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                previousPath: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    added: "added";
                    modified: "modified";
                    renamed: "renamed";
                    deleted: "deleted";
                }>;
                binary: z.ZodBoolean;
                hunks: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    header: z.ZodString;
                    oldStart: z.ZodNumber;
                    oldLines: z.ZodNumber;
                    newStart: z.ZodNumber;
                    newLines: z.ZodNumber;
                    lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"context">;
                        oldLine: z.ZodNumber;
                        newLine: z.ZodNumber;
                        text: z.ZodString;
                        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>, z.ZodObject<{
                        kind: z.ZodLiteral<"addition">;
                        newLine: z.ZodNumber;
                        text: z.ZodString;
                        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>, z.ZodObject<{
                        kind: z.ZodLiteral<"deletion">;
                        oldLine: z.ZodNumber;
                        text: z.ZodString;
                        noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>], "kind">>;
                    decision: z.ZodOptional<z.ZodEnum<{
                        accept: "accept";
                        reject: "reject";
                    }>>;
                }, z.core.$strip>>;
                decision: z.ZodOptional<z.ZodEnum<{
                    accept: "accept";
                    reject: "reject";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    /** Reverse only the exact file patch represented by one completed turn's edit block. */
    readonly 'thread.undoTurnChanges': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            turnId: z.ZodString;
            expectedDiff: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.reviewHunk': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            version: z.ZodString;
            path: z.ZodString;
            hunkId: z.ZodString;
            decision: z.ZodEnum<{
                accept: "accept";
                reject: "reject";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            diff: z.ZodObject<{
                threadId: z.ZodString;
                version: z.ZodString;
                files: z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    previousPath: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        added: "added";
                        modified: "modified";
                        renamed: "renamed";
                        deleted: "deleted";
                    }>;
                    binary: z.ZodBoolean;
                    hunks: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        header: z.ZodString;
                        oldStart: z.ZodNumber;
                        oldLines: z.ZodNumber;
                        newStart: z.ZodNumber;
                        newLines: z.ZodNumber;
                        lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"context">;
                            oldLine: z.ZodNumber;
                            newLine: z.ZodNumber;
                            text: z.ZodString;
                            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>, z.ZodObject<{
                            kind: z.ZodLiteral<"addition">;
                            newLine: z.ZodNumber;
                            text: z.ZodString;
                            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>, z.ZodObject<{
                            kind: z.ZodLiteral<"deletion">;
                            oldLine: z.ZodNumber;
                            text: z.ZodString;
                            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>], "kind">>;
                        decision: z.ZodOptional<z.ZodEnum<{
                            accept: "accept";
                            reject: "reject";
                        }>>;
                    }, z.core.$strip>>;
                    decision: z.ZodOptional<z.ZodEnum<{
                        accept: "accept";
                        reject: "reject";
                    }>>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strip>;
    };
    readonly 'thread.reviewFile': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            version: z.ZodString;
            path: z.ZodString;
            decision: z.ZodEnum<{
                accept: "accept";
                reject: "reject";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            diff: z.ZodObject<{
                threadId: z.ZodString;
                version: z.ZodString;
                files: z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    previousPath: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        added: "added";
                        modified: "modified";
                        renamed: "renamed";
                        deleted: "deleted";
                    }>;
                    binary: z.ZodBoolean;
                    hunks: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        header: z.ZodString;
                        oldStart: z.ZodNumber;
                        oldLines: z.ZodNumber;
                        newStart: z.ZodNumber;
                        newLines: z.ZodNumber;
                        lines: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"context">;
                            oldLine: z.ZodNumber;
                            newLine: z.ZodNumber;
                            text: z.ZodString;
                            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>, z.ZodObject<{
                            kind: z.ZodLiteral<"addition">;
                            newLine: z.ZodNumber;
                            text: z.ZodString;
                            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>, z.ZodObject<{
                            kind: z.ZodLiteral<"deletion">;
                            oldLine: z.ZodNumber;
                            text: z.ZodString;
                            noNewlineAtEnd: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>], "kind">>;
                        decision: z.ZodOptional<z.ZodEnum<{
                            accept: "accept";
                            reject: "reject";
                        }>>;
                    }, z.core.$strip>>;
                    decision: z.ZodOptional<z.ZodEnum<{
                        accept: "accept";
                        reject: "reject";
                    }>>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strip>;
    };
    /** Persistent token totals, with money only when the provider reports it. */
    readonly 'usage.summary': {
        readonly params: z.ZodUnion<readonly [z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
        }, z.core.$strip>]>;
        readonly result: z.ZodObject<{
            session: z.ZodObject<{
                inputTokens: z.ZodNumber;
                cachedInputTokens: z.ZodNumber;
                outputTokens: z.ZodNumber;
                reasoningTokens: z.ZodNumber;
                totalTokens: z.ZodNumber;
                costUsd: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            today: z.ZodObject<{
                inputTokens: z.ZodNumber;
                cachedInputTokens: z.ZodNumber;
                outputTokens: z.ZodNumber;
                reasoningTokens: z.ZodNumber;
                totalTokens: z.ZodNumber;
                costUsd: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            limits: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                usedPercent: z.ZodNumber;
                resetsAt: z.ZodOptional<z.ZodNumber>;
                valueLabel: z.ZodOptional<z.ZodString>;
                action: z.ZodOptional<z.ZodLiteral<"consume-reset">>;
                resetCredits: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    expiresAt: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>;
            limitSource: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                provider: z.ZodEnum<{
                    codex: "codex";
                    "claude-code": "claude-code";
                    grok: "grok";
                }>;
                status: z.ZodLiteral<"ready">;
                limits: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    usedPercent: z.ZodNumber;
                    resetsAt: z.ZodOptional<z.ZodNumber>;
                    valueLabel: z.ZodOptional<z.ZodString>;
                    action: z.ZodOptional<z.ZodLiteral<"consume-reset">>;
                    resetCredits: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodOptional<z.ZodString>;
                        expiresAt: z.ZodNullable<z.ZodNumber>;
                    }, z.core.$strip>>>;
                }, z.core.$strip>>;
            }, z.core.$strip>, z.ZodObject<{
                provider: z.ZodEnum<{
                    codex: "codex";
                    "claude-code": "claude-code";
                    grok: "grok";
                }>;
                status: z.ZodLiteral<"unavailable">;
            }, z.core.$strip>], "status">>;
        }, z.core.$strip>;
    };
    /**
     * Spend one earned rate-limit reset. The provider must have declared a
     * `consume-reset` limit row. Callers generate a UUID and reuse it when
     * retrying the same attempt.
     */
    readonly 'usage.consumeReset': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            idempotencyKey: z.ZodString;
            creditId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            outcome: z.ZodEnum<{
                reset: "reset";
                nothingToReset: "nothingToReset";
                noCredit: "noCredit";
                alreadyRedeemed: "alreadyRedeemed";
            }>;
        }, z.core.$strip>;
    };
    /** Start a temporary conversation forked from the current main chat. */
    readonly 'sideChat.start': {
        readonly params: z.ZodObject<{
            parentThreadId: z.ZodString;
            model: z.ZodOptional<z.ZodString>;
            serviceTier: z.ZodOptional<z.ZodString>;
            effort: z.ZodOptional<z.ZodString>;
            approval: z.ZodOptional<z.ZodEnum<{
                ask: "ask";
                auto: "auto";
                "auto-review": "auto-review";
                full: "full";
            }>>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
    };
    /** Dispose the provider session and erase its temporary transcript. */
    readonly 'sideChat.close': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.start': {
        readonly params: z.ZodObject<{
            provider: z.ZodEnum<{
                codex: "codex";
                "claude-code": "claude-code";
                grok: "grok";
            }>;
            agent: z.ZodOptional<z.ZodString>;
            workspacePath: z.ZodString;
            model: z.ZodOptional<z.ZodString>;
            serviceTier: z.ZodOptional<z.ZodString>;
            effort: z.ZodOptional<z.ZodString>;
            approval: z.ZodOptional<z.ZodEnum<{
                ask: "ask";
                auto: "auto";
                "auto-review": "auto-review";
                full: "full";
            }>>;
            isolate: z.ZodOptional<z.ZodBoolean>;
            baseRef: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
    };
    /**
     * Points this session can be returned to. One is taken before every turn
     * that could write, so going back is possible without having planned for it.
     */
    readonly 'thread.checkpoints': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            checkpoints: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                seq: z.ZodNumber;
                label: z.ZodString;
                createdAt: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    /** What the agent has changed since a checkpoint, so a restore is informed. */
    readonly 'thread.changedSince': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            checkpointId: z.ZodNumber;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            files: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
    };
    /**
     * Put files and conversation back to a checkpoint. Whatever is replaced is
     * itself saved first, so no restore reaches a state nobody can get back to.
     */
    readonly 'thread.restore': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            checkpointId: z.ZodNumber;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            undo: z.ZodString;
        }, z.core.$strip>;
    };
    /** Reverse the latest restore using the opaque token it returned. */
    readonly 'thread.undoRestore': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            undo: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /** Whether a session's private checkout holds work nobody has committed. */
    readonly 'thread.unsavedWork': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            isolated: z.ZodBoolean;
            uncommitted: z.ZodBoolean;
        }, z.core.$strip>;
    };
    /**
     * Remove a session's private checkout. Fails when it holds uncommitted work
     * unless `force`, which is the user saying to discard it.
     */
    readonly 'thread.discardWorktree': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            force: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.sendTurn': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            text: z.ZodString;
            clientSubmissionId: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
            model: z.ZodOptional<z.ZodString>;
            effort: z.ZodOptional<z.ZodString>;
            serviceTier: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly result: z.ZodDiscriminatedUnion<[z.ZodObject<{
            queued: z.ZodLiteral<false>;
            turnId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            queued: z.ZodLiteral<true>;
            queuedTurn: z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
                attachments: z.ZodArray<z.ZodString>;
                createdAt: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>], "queued">;
    };
    /** Prompts waiting behind the turn currently in progress. */
    readonly 'thread.queue': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
                attachments: z.ZodArray<z.ZodString>;
                createdAt: z.ZodNumber;
            }, z.core.$strip>>;
            canSteer: z.ZodBoolean;
        }, z.core.$strip>;
    };
    readonly 'thread.deleteQueuedTurn': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            queuedTurnId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.moveQueuedTurn': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            queuedTurnId: z.ZodString;
            direction: z.ZodEnum<{
                up: "up";
                down: "down";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.steerQueuedTurn': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            queuedTurnId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.respondToApproval': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            approvalId: z.ZodString;
            decision: z.ZodEnum<{
                approve: "approve";
                "approve-session": "approve-session";
                deny: "deny";
                abort: "abort";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.respondToUserInput': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            requestId: z.ZodString;
            answers: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.interrupt': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    /**
     * Change the access level of a live thread. Adapters that keep approval
     * state mutable honour it for pending and future permission requests;
     * engines that map the mode onto launch switches keep the sandbox they
     * started with.
     */
    readonly 'thread.setApproval': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
            approval: z.ZodEnum<{
                ask: "ask";
                auto: "auto";
                "auto-review": "auto-review";
                full: "full";
            }>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'thread.close': {
        readonly params: z.ZodObject<{
            threadId: z.ZodString;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{}, z.core.$strip>;
    };
    readonly 'sidebar.settings': {
        readonly params: z.ZodObject<{}, z.core.$strip>;
        readonly result: z.ZodObject<{
            mode: z.ZodEnum<{
                classic: "classic";
                inbox: "inbox";
            }>;
            autoSettleDays: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>;
    };
    readonly 'sidebar.updateSettings': {
        readonly params: z.ZodObject<{
            mode: z.ZodOptional<z.ZodEnum<{
                classic: "classic";
                inbox: "inbox";
            }>>;
            autoSettleDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strip>;
        readonly result: z.ZodObject<{
            mode: z.ZodEnum<{
                classic: "classic";
                inbox: "inbox";
            }>;
            autoSettleDays: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>;
    };
};
export type MethodName = keyof typeof methods;
export type ParamsOf<M extends MethodName> = z.infer<(typeof methods)[M]['params']>;
export type ResultOf<M extends MethodName> = z.infer<(typeof methods)[M]['result']>;
/**
 * `sequence` is monotonic per connection. A client that sees a gap knows it
 * missed something and can resync, instead of silently diverging from the
 * server — which is the failure mode that is impossible to debug later.
 */
export declare const PushSchema: z.ZodObject<{
    channel: z.ZodString;
    sequence: z.ZodNumber;
    data: z.ZodUnknown;
}, z.core.$strip>;
export type Push = z.infer<typeof PushSchema>;
export declare const channels: {
    readonly 'preview.captureRequested': z.ZodObject<{
        requestId: z.ZodString;
        url: z.ZodURL;
        viewports: z.ZodArray<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    readonly 'preview.captureCancelled': z.ZodObject<{
        requestId: z.ZodString;
    }, z.core.$strip>;
    readonly 'server.welcome': z.ZodObject<{
        serverVersion: z.ZodString;
        protocolVersion: z.ZodNumber;
    }, z.core.$strip>;
    readonly 'auth.event': z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        agent: z.ZodOptional<z.ZodString>;
        loginId: z.ZodNullable<z.ZodString>;
        success: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    readonly 'mcp.oauth': z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        projectPath: z.ZodString;
        serverId: z.ZodString;
        loginId: z.ZodString;
        success: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    readonly 'mcp.changed': z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        projectPath: z.ZodString;
    }, z.core.$strip>;
    readonly 'skills.changed': z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
        projectPath: z.ZodString;
    }, z.core.$strip>;
    /** A provider reported that its subscription usage or limits changed. */
    readonly 'usage.changed': z.ZodObject<{
        provider: z.ZodEnum<{
            codex: "codex";
            "claude-code": "claude-code";
            grok: "grok";
        }>;
    }, z.core.$strip>;
    readonly 'thread.event': z.ZodObject<{
        threadId: z.ZodString;
        event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        seq: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    /** Provider metadata or saved transcripts changed outside TasteCode. */
    readonly 'providerHistory.changed': z.ZodObject<{
        threadIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    /** Events from an ephemeral Side chat stay out of the main conversation stream. */
    readonly 'sideChat.event': z.ZodObject<{
        threadId: z.ZodString;
        event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        seq: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    readonly 'thread.queue': z.ZodObject<{
        threadId: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            attachments: z.ZodArray<z.ZodString>;
            createdAt: z.ZodNumber;
        }, z.core.$strip>>;
        canSteer: z.ZodBoolean;
    }, z.core.$strip>;
    readonly 'thread.lifecycle': z.ZodObject<{
        threadId: z.ZodString;
        lifecycle: z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"active">;
            keepActive: z.ZodBoolean;
            wokeAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            state: z.ZodLiteral<"settled">;
            settledAt: z.ZodNumber;
            reason: z.ZodEnum<{
                manual: "manual";
                inactivity: "inactivity";
                change_request: "change_request";
            }>;
        }, z.core.$strip>, z.ZodObject<{
            state: z.ZodLiteral<"snoozed">;
            snoozedAt: z.ZodNumber;
            wakeAt: z.ZodNumber;
        }, z.core.$strip>], "state">;
    }, z.core.$strip>;
    readonly 'sidebar.settings': z.ZodObject<{
        mode: z.ZodEnum<{
            classic: "classic";
            inbox: "inbox";
        }>;
        autoSettleDays: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
    readonly 'terminal.output': z.ZodObject<{
        terminalId: z.ZodString;
        data: z.ZodString;
        outputOffset: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    readonly 'terminal.exit': z.ZodObject<{
        terminalId: z.ZodString;
        exitCode: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
};
export type ChannelName = keyof typeof channels;
export type DataOf<C extends ChannelName> = z.infer<(typeof channels)[C]>;
/**
 * What a failed boundary decode produces. Structured on purpose: "invalid
 * message" in a log tells you nothing at 2am.
 */
export type DecodeDiagnostic = {
    direction: 'inbound' | 'outbound';
    what: string;
    reason: string;
    path?: string;
};
//# sourceMappingURL=protocol.d.ts.map