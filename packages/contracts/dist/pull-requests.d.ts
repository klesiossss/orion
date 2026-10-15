import { z } from 'zod';
export declare const GitHubRepositoryNameSchema: z.ZodString;
export type GitHubRepositoryName = z.infer<typeof GitHubRepositoryNameSchema>;
export declare const PullRequestTargetSchema: z.ZodObject<{
    repository: z.ZodString;
    number: z.ZodNumber;
}, z.core.$strip>;
export type PullRequestTarget = z.infer<typeof PullRequestTargetSchema>;
export declare const GitHubActorSchema: z.ZodObject<{
    login: z.ZodString;
    isBot: z.ZodBoolean;
}, z.core.$strip>;
export type GitHubActor = z.infer<typeof GitHubActorSchema>;
export declare const PullRequestStateSchema: z.ZodEnum<{
    OPEN: "OPEN";
    CLOSED: "CLOSED";
    MERGED: "MERGED";
}>;
export type PullRequestState = z.infer<typeof PullRequestStateSchema>;
export declare const PullRequestRelationshipSchema: z.ZodEnum<{
    authored: "authored";
    reviewing: "reviewing";
    both: "both";
}>;
export type PullRequestRelationship = z.infer<typeof PullRequestRelationshipSchema>;
export declare const PullRequestListItemSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestListItem = z.infer<typeof PullRequestListItemSchema>;
export declare const PullRequestAccountSchema: z.ZodObject<{
    available: z.ZodBoolean;
    authenticated: z.ZodBoolean;
    login: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PullRequestAccount = z.infer<typeof PullRequestAccountSchema>;
export declare const PullRequestListResultSchema: z.ZodObject<{
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
export type PullRequestListResult = z.infer<typeof PullRequestListResultSchema>;
export declare const PullRequestLabelSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
}, z.core.$strip>;
export type PullRequestLabel = z.infer<typeof PullRequestLabelSchema>;
export declare const PullRequestReviewStateSchema: z.ZodEnum<{
    APPROVED: "APPROVED";
    CHANGES_REQUESTED: "CHANGES_REQUESTED";
    COMMENTED: "COMMENTED";
    DISMISSED: "DISMISSED";
    PENDING: "PENDING";
    REQUESTED: "REQUESTED";
}>;
export type PullRequestReviewState = z.infer<typeof PullRequestReviewStateSchema>;
export declare const PullRequestReviewerSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestReviewer = z.infer<typeof PullRequestReviewerSchema>;
export declare const PullRequestCheckSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestCheck = z.infer<typeof PullRequestCheckSchema>;
export declare const PullRequestCommentSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestComment = z.infer<typeof PullRequestCommentSchema>;
export declare const PullRequestReviewSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestReview = z.infer<typeof PullRequestReviewSchema>;
export declare const PullRequestReviewThreadSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestReviewThread = z.infer<typeof PullRequestReviewThreadSchema>;
export declare const PullRequestDetailSchema: z.ZodObject<{
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
export type PullRequestDetail = z.infer<typeof PullRequestDetailSchema>;
export declare const PullRequestFileSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type PullRequestFile = z.infer<typeof PullRequestFileSchema>;
export declare const PullRequestFilesResultSchema: z.ZodObject<{
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
export type PullRequestFilesResult = z.infer<typeof PullRequestFilesResultSchema>;
export declare const PullRequestMetadataLabelSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PullRequestMetadataLabel = z.infer<typeof PullRequestMetadataLabelSchema>;
export declare const PullRequestMetadataMilestoneSchema: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
}, z.core.$strip>;
export type PullRequestMetadataMilestone = z.infer<typeof PullRequestMetadataMilestoneSchema>;
export declare const PullRequestMetadataOptionsSchema: z.ZodObject<{
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
export type PullRequestMetadataOptions = z.infer<typeof PullRequestMetadataOptionsSchema>;
export declare const PullRequestActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type PullRequestAction = z.infer<typeof PullRequestActionSchema>;
export declare const PullRequestActionResultSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
export type PullRequestActionResult = z.infer<typeof PullRequestActionResultSchema>;
/** A repository file or GitHub upload embedded in pull-request Markdown. */
export declare const PullRequestImageUrlSchema: z.ZodString;
export type PullRequestImageUrl = z.infer<typeof PullRequestImageUrlSchema>;
export declare const PULL_REQUEST_IMAGE_MAX_BYTES: number;
export declare const PullRequestImageSchema: z.ZodObject<{
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
export type PullRequestImage = z.infer<typeof PullRequestImageSchema>;
//# sourceMappingURL=pull-requests.d.ts.map