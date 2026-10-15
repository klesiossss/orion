/** Resolve directory and file aliases before choosing a database's lock. */
export declare function canonicalDataPath(database: string): string;
/**
 * Keep an OS-backed SQLite lock for the lifetime of the core or maintenance
 * process. A crash releases the lock. The stable lock file must not be deleted:
 * replacing it would let two processes lock different files for one database.
 */
export declare function acquireDataLease(database: string): () => void;
//# sourceMappingURL=data-lease.d.ts.map