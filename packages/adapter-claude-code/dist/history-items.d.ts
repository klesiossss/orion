import type { Item } from '@harness/contracts';
export type SavedRecord = Record<string, unknown>;
export declare function object(value: unknown): SavedRecord;
export declare function string(value: unknown): string | undefined;
export declare function contentBlocks(row: SavedRecord): SavedRecord[];
export declare function isInterruptMarker(row: SavedRecord): boolean;
export declare function isPrompt(row: SavedRecord): boolean;
/** Keep each tool's result on its own typed item, including failed command output. */
export declare function historyItems(row: SavedRecord, turnId: string, at: number, tools: Map<string, Item>): Item[];
//# sourceMappingURL=history-items.d.ts.map