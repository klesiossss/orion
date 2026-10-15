/**
 * Whether this filesystem allows creating symbolic links at all.
 *
 * Windows without Developer Mode denies symlink creation with EPERM, so
 * symlink-based tests would fail for missing privilege rather than a broken
 * guarantee. Junction-based tests are unaffected and keep running everywhere.
 */
export declare function canCreateSymlinks(): boolean;
//# sourceMappingURL=symlink.test-support.d.ts.map