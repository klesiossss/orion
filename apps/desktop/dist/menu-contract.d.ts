export declare const NATIVE_MENU_ACTIONS: readonly ["commandPalette", "settings", "keybindings", "toggleSidebar", "newChat", "searchSessions", "focusComposer", "interrupt", "previousChat", "nextChat", "toggleSessionPin", "archiveSession", "rollback", "switchProject", "newProject", "openPullRequests", "toggleTerminal", "toggleWorkspace", "toggleFastMode", "toggleDesignMode", "toggleIsolatedSession"];
export type NativeMenuAction = (typeof NATIVE_MENU_ACTIONS)[number];
/** An accelerator is a key press and follows the renderer's shortcut guards; a click does not. */
export type NativeMenuActionSource = 'menu' | 'accelerator';
export type NativeMenuActionMessage = {
    action: NativeMenuAction;
    source: NativeMenuActionSource;
};
export declare function isNativeMenuActionMessage(value: unknown): value is NativeMenuActionMessage;
export type NativeMenuShortcut = {
    key: string;
    primary?: boolean;
    shift?: boolean;
    alt?: boolean;
};
export type NativeMenuShortcuts = Partial<Record<NativeMenuAction, NativeMenuShortcut | null>>;
export declare function isNativeMenuAction(value: unknown): value is NativeMenuAction;
export declare function parseNativeMenuShortcuts(value: unknown): NativeMenuShortcuts | undefined;
//# sourceMappingURL=menu-contract.d.ts.map