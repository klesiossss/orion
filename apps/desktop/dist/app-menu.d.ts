import type { MenuItemConstructorOptions } from 'electron';
import type { NativeMenuAction, NativeMenuActionSource, NativeMenuShortcut, NativeMenuShortcuts } from './menu-contract.js';
type AppMenuOptions = {
    appName: string;
    isMacOS: boolean;
    isDevelopment: boolean;
    shortcuts: NativeMenuShortcuts;
    onAction: (action: NativeMenuAction, source: NativeMenuActionSource) => void;
    onZoom: (action: 'in' | 'out' | 'reset') => void;
    onOpenDiagnostics: () => void;
};
type MenuItem = MenuItemConstructorOptions;
export declare function createApplicationMenuTemplate(options: AppMenuOptions): MenuItem[];
export declare function electronAccelerator(shortcut: NativeMenuShortcut | null | undefined): string | undefined;
export {};
//# sourceMappingURL=app-menu.d.ts.map