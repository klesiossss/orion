import type { Item } from '@harness/contracts';
type Value = Record<string, unknown>;
type Base = Pick<Item, 'id' | 'turnId' | 'createdAt' | 'status'>;
/** A multi-part reasoning item's `parts`, which Codex also writes as one event each. */
export type HistoryItem = {
    item: Item;
    diff?: string;
    parts?: string[];
};
/** `root` is the session's project, which file change patches are relative to. */
export declare function historyItem(payload: Value, original: Base, root?: string): HistoryItem[];
export declare function responseItem(payload: Value, base: Base, output?: unknown): HistoryItem[];
export {};
//# sourceMappingURL=history-items.d.ts.map