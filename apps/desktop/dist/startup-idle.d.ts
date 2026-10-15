/** Measure idle memory only after startup RPCs finish and their UI commits settle.
 * New work cancels the quiet delay; work during capture invalidates the result. */
export declare class StartupIdleGate {
    #private;
    private delayMs;
    private capture;
    constructor(delayMs: number, capture: () => void);
    get interrupted(): boolean;
    ready(): void;
    setIdle(idle: boolean): void;
    setNoticeVisible(visible: boolean): void;
}
//# sourceMappingURL=startup-idle.d.ts.map