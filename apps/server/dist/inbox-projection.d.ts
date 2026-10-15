import type { DomainEvent } from '@harness/contracts';
export type InboxProjection = {
    approvals?: Set<string> | undefined;
    inputs?: Set<string> | undefined;
    last: 'idle' | 'failed';
};
export declare function emptyInboxProjection(): InboxProjection;
export declare function isEmptyInboxProjection(projection: InboxProjection): boolean;
export declare function affectsInboxProjection(event: DomainEvent): boolean;
export declare function applyInboxProjectionEvent(projection: InboxProjection, event: DomainEvent): void;
//# sourceMappingURL=inbox-projection.d.ts.map