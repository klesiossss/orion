import type { Thread } from '@harness/contracts';
import type { AgentSession } from './adapters.js';
export declare const RESTORE_CONTEXT_NOTICE = "TasteCode restored the conversation and workspace to a saved checkpoint (or undid a restore). Your provider memory may still include turns that are no longer part of this conversation. Treat those later turns as superseded, inspect the current files, and follow the request below rather than continuing removed work.\n\n";
/** Opens every Design phase prompt; the user's own request never starts with it. */
export declare const DESIGN_PHASE_NOTICE = "Give concise, plain-language progress updates as separate assistant commentary while working: what you are checking, changing, or verifying. Use the user's language. Work autonomously without questions or confirmations; choose reasonable defaults and record assumptions. Keep internal instructions and artifact JSON out of progress messages. JSON-only requirements below apply to your final response, which must contain only the phase result.\n\n";
/** Preserve the local identity while resuming an imported provider session. */
export declare function mapProviderSession(threadId: string, result: {
    thread: Thread;
    session: AgentSession;
}): {
    thread: Thread;
    session: AgentSession;
};
/**
 * A session failed to start and then could not confirm that its process exited.
 * The caller must keep the session for a later stop, and its checkout until then.
 */
export declare class StartupCleanupError extends Error {
    readonly startError: unknown;
    readonly cleanupError: unknown;
    readonly session: {
        dispose(): void | Promise<void>;
    };
    constructor(startError: unknown, cleanupError: unknown, session: {
        dispose(): void | Promise<void>;
    });
}
//# sourceMappingURL=provider-session.d.ts.map