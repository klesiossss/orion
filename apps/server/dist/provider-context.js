import { CLAUDE_CAPABILITIES } from '@harness/adapter-claude-code/capabilities';
import { CODEX_CAPABILITIES } from '@harness/adapter-codex/capabilities';
import { GROK_CAPABILITIES } from '@harness/adapter-grok/capabilities';
/** What each adapter declared; these modules are constants, not vendor SDKs. */
const CONTEXT_CONTROLS = {
    codex: CODEX_CAPABILITIES.context,
    'claude-code': CLAUDE_CAPABILITIES.context,
    grok: GROK_CAPABILITIES.context,
};
export function providerContextControl(provider) {
    return CONTEXT_CONTROLS[provider];
}
/** Refuses a setting the provider never declared, before it is stored. */
export function validateContextSettings(control, settings) {
    if (settings.window !== undefined && !control?.windows.includes(settings.window)) {
        throw new Error(`This provider cannot run with a ${settings.window}-token context window.`);
    }
    if (settings.compactAt === 'off' && !control?.compactionOff) {
        throw new Error('This provider cannot switch automatic compaction off.');
    }
    if (typeof settings.compactAt === 'number' && !control?.compaction) {
        throw new Error('This provider decides on its own when to compact.');
    }
    if (typeof settings.compactAt === 'number' &&
        control?.latestCompactAt !== undefined &&
        settings.compactAt > control.latestCompactAt) {
        throw new Error(`This provider cannot compact later than ${control.latestCompactAt}%.`);
    }
}
function honoursCompactAt(control, compactAt) {
    return (control.compaction &&
        (control.latestCompactAt === undefined || compactAt <= control.latestCompactAt));
}
/**
 * What a launching session receives. A setting stored while an older engine
 * declared it is dropped quietly when the engine no longer can, so an update
 * never turns into sessions that refuse to start.
 */
export function contextForLaunch(control, settings) {
    if (!control || !settings)
        return undefined;
    const window = settings.window !== undefined && control.windows.includes(settings.window)
        ? settings.window
        : undefined;
    const compactAt = settings.compactAt === 'off'
        ? control.compactionOff
            ? 'off'
            : undefined
        : settings.compactAt !== undefined && honoursCompactAt(control, settings.compactAt)
            ? settings.compactAt
            : undefined;
    if (window === undefined && compactAt === undefined)
        return undefined;
    return {
        ...(window !== undefined ? { window } : {}),
        ...(compactAt !== undefined ? { compactAt } : {}),
    };
}
//# sourceMappingURL=provider-context.js.map