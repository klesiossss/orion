/**
 * A rollout keeps one patch per edit, while live Codex sends the turn's net
 * diff. Patches that edit the same file are composed into that file's net
 * patch, so the file is listed once with the turn's line counts. A file whose
 * patches cannot be composed keeps them in order, which Git still reverses.
 */
export declare function turnDiff(patches: readonly string[]): string;
//# sourceMappingURL=turn-diff.d.ts.map