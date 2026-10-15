import type { Writable } from 'node:stream';
export type MacHapticPattern = 'alignment' | 'generic';
type HapticHelperProcess = {
    stdin: Writable;
    once: (event: 'error' | 'exit', listener: () => void) => HapticHelperProcess;
    kill: () => boolean;
};
type MacOSHapticsOptions = {
    platform?: NodeJS.Platform;
    spawnHelper?: () => HapticHelperProcess;
    now?: () => number;
};
/** Low-latency, macOS-only AppKit haptics with a hard flood limit. */
export declare class MacOSHaptics {
    #private;
    constructor(options?: MacOSHapticsOptions);
    prepare(): void;
    perform(pattern: MacHapticPattern): void;
    stop(): void;
}
export declare function isMacHapticPattern(value: unknown): value is MacHapticPattern;
export {};
//# sourceMappingURL=macos-haptics.d.ts.map