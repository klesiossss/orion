/**
 * Sleeps until the next persisted lifecycle deadline.
 *
 * A due thread that cannot be hidden yet is checked at the old 30 second
 * cadence. With no snoozed or auto-settle work, there is no timer at all.
 */
export declare class LifecycleScheduler {
    #private;
    private readonly refresh;
    private readonly nextAt;
    private readonly now;
    constructor(refresh: () => void, nextAt: () => number | undefined, now?: () => number);
    /** Direct calls report errors; timer callbacks retry them in the background. */
    refreshNow(): void;
    /** Refreshes an overdue clock without repeating lifecycle reads on every sidebar fetch. */
    refreshIfDue(): void;
    changed(): void;
    /** Keep the known earlier wake when a mutation can only postpone or remove deadlines. */
    changedLater(): void;
    /** Add one known deadline without rereading unchanged persisted deadlines. */
    deadlineAdded(at: number | undefined): void;
    dispose(): void;
}
//# sourceMappingURL=lifecycle-scheduler.d.ts.map