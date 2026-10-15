import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { PreviewPlan } from '@harness/design-agent';
export type RunningPreview = {
    url: string;
    viewports: PreviewPlan['viewports'];
    output: () => string;
    stop: () => Promise<void>;
};
export type PreviewChild = Pick<ChildProcessWithoutNullStreams, 'exitCode' | 'once'>;
export declare function startDesignPreview(workspacePath: string, plan: PreviewPlan, timeoutMs?: number, signal?: AbortSignal, 
/** The app's own ports: the control socket and the renderer origin it trusts. */
reservedPorts?: ReadonlySet<number>): Promise<RunningPreview>;
/**
 * The plan must start code that already lives in the workspace.
 *
 * Design Mode reads the project's own README, package.json and source while
 * it works, so anything in there can steer the model's choice of preview
 * command. Without this, a line in a README was enough to make the harness
 * run a command of the repository's choosing with no user approval. Package
 * scripts and workspace files are code the user already opted into by
 * pointing Design Mode at the project; a package name resolved off the
 * network is not.
 */
export declare function assertRunsWorkspaceCode(workspace: string, cwd: string, plan: Extract<PreviewPlan, {
    kind: 'command';
}>): void;
export declare function waitForPreview(child: PreviewChild, url: string, timeoutMs: number, output: () => string, childFailure: Promise<never>, signal?: AbortSignal): Promise<void>;
export declare function watchPreviewChild(child: PreviewChild): Promise<never>;
//# sourceMappingURL=design-preview-runner.d.ts.map