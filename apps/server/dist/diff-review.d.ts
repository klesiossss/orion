import type { DiffDecision, SessionDiff } from '@harness/contracts';
import type { Store } from './store.js';
export declare class StaleDiffSnapshotError extends Error {
    constructor();
}
export declare function readSessionDiff(repoPath: string, threadId: string, store: Store): Promise<SessionDiff>;
/** Read the current checkout against HEAD without enabling destructive review actions. */
export declare function readWorkspaceDiff(repoPath: string): Promise<SessionDiff>;
export declare function reviewDiffHunk(repoPath: string, threadId: string, version: string, filePath: string, hunkId: string, decision: DiffDecision, store: Store): Promise<SessionDiff>;
export declare function reviewDiffFile(repoPath: string, threadId: string, version: string, filePath: string, decision: DiffDecision, store: Store): Promise<SessionDiff>;
/** Reverse one provider or Git-generated patch without touching unrelated work. */
export declare function reverseUnifiedDiff(repoPath: string, patch: string): Promise<void>;
//# sourceMappingURL=diff-review.d.ts.map