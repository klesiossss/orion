export const NATIVE_MENU_ACTIONS = [
    'commandPalette',
    'settings',
    'keybindings',
    'toggleSidebar',
    'newChat',
    'searchSessions',
    'focusComposer',
    'interrupt',
    'previousChat',
    'nextChat',
    'toggleSessionPin',
    'archiveSession',
    'rollback',
    'switchProject',
    'newProject',
    'openPullRequests',
    'toggleTerminal',
    'toggleWorkspace',
    'toggleFastMode',
    'toggleDesignMode',
    'toggleIsolatedSession',
];
export function isNativeMenuActionMessage(value) {
    if (!isRecord(value))
        return false;
    const keys = Object.keys(value);
    return (keys.length === 2 &&
        isNativeMenuAction(value['action']) &&
        (value['source'] === 'menu' || value['source'] === 'accelerator'));
}
const nativeMenuActions = new Set(NATIVE_MENU_ACTIONS);
const nativeMenuShortcutKeys = new Set(['key', 'primary', 'shift', 'alt']);
export function isNativeMenuAction(value) {
    return typeof value === 'string' && nativeMenuActions.has(value);
}
export function parseNativeMenuShortcuts(value) {
    if (!isRecord(value))
        return undefined;
    const shortcuts = {};
    for (const [action, candidate] of Object.entries(value)) {
        if (!isNativeMenuAction(action))
            return undefined;
        if (candidate === null) {
            shortcuts[action] = null;
            continue;
        }
        if (!isRecord(candidate))
            return undefined;
        if (Object.keys(candidate).some((key) => !nativeMenuShortcutKeys.has(key)))
            return undefined;
        const { key, primary, shift, alt } = candidate;
        if (typeof key !== 'string' || key.length === 0 || key.length > 24)
            return undefined;
        if (primary !== undefined && typeof primary !== 'boolean')
            return undefined;
        if (shift !== undefined && typeof shift !== 'boolean')
            return undefined;
        if (alt !== undefined && typeof alt !== 'boolean')
            return undefined;
        shortcuts[action] = {
            key,
            ...(primary === undefined ? {} : { primary }),
            ...(shift === undefined ? {} : { shift }),
            ...(alt === undefined ? {} : { alt }),
        };
    }
    return shortcuts;
}
function isRecord(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
//# sourceMappingURL=menu-contract.js.map