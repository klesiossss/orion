import type { ApprovalDecision } from '@harness/contracts';
import type { RequestPermissionParams } from './protocol.js';
/**
 * Choosing which option to send back when the user answers a permission
 * request.
 *
 * This is the highest-consequence mapping in the adapter: it converts a human
 * "no" into a wire value, and getting it wrong authorises something nobody
 * agreed to. It is a pure function so it can be tested directly, and it never
 * crosses from allow to reject or back.
 */
export type PermissionOption = NonNullable<RequestPermissionParams['options']>[number];
export declare function optionFor(options: readonly PermissionOption[], decision: ApprovalDecision): string | undefined;
//# sourceMappingURL=approvals.d.ts.map