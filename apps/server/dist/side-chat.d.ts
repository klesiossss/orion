import type { DomainEvent, Item } from '@harness/contracts';
type SideChatSnapshotEntry = {
    kind: 'message';
    role: 'user' | 'assistant';
    text: string;
} | {
    kind: 'activity';
    type: Exclude<Item['type'], 'message' | 'reasoning'>;
    status: Item['status'];
    text?: string | undefined;
    command?: string | undefined;
    path?: string | undefined;
    exitCode?: number | undefined;
    linesAdded?: number | undefined;
    linesRemoved?: number | undefined;
};
/** The orchestrator already supplies a compact replay with one final event per item. */
export declare function sideChatInstructionsFromReplay(history: ReadonlyArray<{
    event: DomainEvent;
}>): string;
/**
 * Projects a renderer-ready replay without materializing its complete item list.
 * The replay has one item boundary per item, so old rows can be skipped as soon
 * as the bounded tail and its latest user message are known.
 */
export declare function snapshotCompactReplayEntries(history: ReadonlyArray<{
    event: DomainEvent;
}>): SideChatSnapshotEntry[];
export declare function snapshotEntries(history: ReadonlyArray<{
    event: DomainEvent;
}>): SideChatSnapshotEntry[];
export declare function projectHistoryItems(history: ReadonlyArray<{
    event: DomainEvent;
}>): Item[];
export {};
//# sourceMappingURL=side-chat.d.ts.map