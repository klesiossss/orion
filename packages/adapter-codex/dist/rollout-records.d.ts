type JsonObject = Record<string, unknown>;
/**
 * The rollout records the transcript parser reads, in order, each with its
 * position among all records. A long task's rollout holds hundreds of
 * megabytes of compaction snapshots and tool images, and each open or send
 * after a turn parsed all of it again. Records the parser ignores, and
 * response items of turns already in the local log, are skipped by their
 * prefix without being decoded.
 */
export declare function transcriptRecords(file: string, localTurnIds?: ReadonlySet<string>): Promise<Array<{
    index: number;
    record: JsonObject;
}>>;
export {};
//# sourceMappingURL=rollout-records.d.ts.map