export declare const DESIGN_PHASES: readonly ["brief", "brand", "page", "assets", "build", "preview", "review"];
export type DesignPhase = (typeof DESIGN_PHASES)[number];
export type DesignRunPhase = DesignPhase | 'complete';
export type DesignRunStatus = 'running' | 'waiting' | 'failed' | 'complete';
export interface DesignRunState {
    version: 1;
    phase: DesignRunPhase;
    status: DesignRunStatus;
    completed: DesignPhase[];
    attempts: {
        build: number;
        preview: number;
        review: number;
    };
    error?: {
        phase: DesignPhase;
        message: string;
    };
}
export declare function createDesignRunState(): DesignRunState;
export declare function nextDesignPhase(completed: readonly DesignPhase[]): DesignRunPhase;
export declare function parseDesignRunState(value: unknown): DesignRunState;
//# sourceMappingURL=run.d.ts.map