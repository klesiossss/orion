export const RESTORE_CONTEXT_NOTICE = 'TasteCode restored the conversation and workspace to a saved checkpoint (or undid a restore). Your provider memory may still include turns that are no longer part of this conversation. Treat those later turns as superseded, inspect the current files, and follow the request below rather than continuing removed work.\n\n';
/** Opens every Design phase prompt; the user's own request never starts with it. */
export const DESIGN_PHASE_NOTICE = "Give concise, plain-language progress updates as separate assistant commentary while working: what you are checking, changing, or verifying. Use the user's language. Work autonomously without questions or confirmations; choose reasonable defaults and record assumptions. Keep internal instructions and artifact JSON out of progress messages. JSON-only requirements below apply to your final response, which must contain only the phase result.\n\n";
/** Preserve the local identity while resuming an imported provider session. */
export function mapProviderSession(threadId, result) {
    const nativeId = result.thread.id;
    if (threadId === nativeId)
        return result;
    const withThreadId = new Set([
        'sendTurn',
        'steer',
        'interrupt',
        'listMcpServers',
        'reloadMcpServers',
    ]);
    const session = new Proxy(result.session, {
        get(target, key) {
            const member = Reflect.get(target, key, target);
            if (typeof member !== 'function')
                return member;
            if (key === 'on')
                return (event, listener) => {
                    if (event === 'event')
                        target.on('event', (value) => listener(mapEventThread(value, threadId)));
                    else
                        target.on('log', (line) => listener(line));
                };
            if (withThreadId.has(String(key)))
                return (_id, ...args) => Reflect.apply(member, target, [nativeId, ...args]);
            if (key === 'startMcpOAuth')
                return (serverId) => target.startMcpOAuth(serverId, nativeId);
            return member.bind(target);
        },
    });
    return { thread: { ...result.thread, id: threadId }, session };
}
function mapEventThread(event, id) {
    if (event.type === 'thread.started')
        return { ...event, thread: { ...event.thread, id } };
    if (event.type === 'turn.started')
        return { ...event, turn: { ...event.turn, threadId: id } };
    if (event.type === 'thread.error')
        return { ...event, threadId: id };
    return event;
}
/**
 * A session failed to start and then could not confirm that its process exited.
 * The caller must keep the session for a later stop, and its checkout until then.
 */
export class StartupCleanupError extends Error {
    startError;
    cleanupError;
    session;
    constructor(startError, cleanupError, session) {
        super(startError instanceof Error ? startError.message : String(startError), {
            cause: startError,
        });
        this.startError = startError;
        this.cleanupError = cleanupError;
        this.session = session;
        this.name = 'StartupCleanupError';
    }
}
//# sourceMappingURL=provider-session.js.map