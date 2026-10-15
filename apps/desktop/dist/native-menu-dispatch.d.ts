import type { NativeMenuActionMessage } from './menu-contract.js';
type MenuTarget = {
    isDestroyed(): boolean;
    send(channel: 'harness:menuAction', message: NativeMenuActionMessage): void;
};
/**
 * Holds native menu actions until the page that handles them has installed its
 * listener. A new or reloading window accepts IPC before React has subscribed.
 */
export declare class NativeMenuDispatch<Target extends MenuTarget> {
    #private;
    send(target: Target, message: NativeMenuActionMessage): void;
    markReady(target: Target): void;
    /** A navigation replaces the page; actions sent from now on wait for its listener. */
    reset(target: Target): void;
}
export {};
//# sourceMappingURL=native-menu-dispatch.d.ts.map