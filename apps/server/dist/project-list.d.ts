import type { ResultOf, ThreadInboxStatus } from '@harness/contracts';
import type { StoredProject, StoredSidebarThread } from './store.js';
type ProjectList = ResultOf<'projects.list'>;
export type ProjectListState = {
    isTurnRunning: (threadId: string) => boolean;
    inboxStatus: (threadId: string, queued: boolean, unread: boolean) => ThreadInboxStatus;
    revision: () => number;
    changesSince?: ((revision: number) => readonly string[] | undefined) | undefined;
};
/** Retains unchanged response objects and projects only status rows named by the change journal. */
export declare function createProjectListProjector(options?: {
    includeDefaults?: boolean;
}): (projects: StoredProject[], threads: readonly StoredSidebarThread[], queuedThreadIds: ReadonlySet<string>, state: ProjectListState) => ProjectList;
export {};
//# sourceMappingURL=project-list.d.ts.map