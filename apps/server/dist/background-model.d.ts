import type { BackgroundModelPreference, BackgroundModelSelection, BackgroundModelSource, SessionDiff } from '@harness/contracts';
import type { ProviderRuntime } from './adapters.js';
export type AvailableBackgroundModelSource = BackgroundModelSource & {
    codexSubscription?: boolean | undefined;
};
export declare function resolveBackgroundModel(preference: BackgroundModelPreference, sources: AvailableBackgroundModelSource[]): BackgroundModelSelection | undefined;
export declare function runBackgroundCompletion(input: {
    runtime: ProviderRuntime;
    selection: BackgroundModelSelection;
    prompt: string;
    timeoutMs?: number | undefined;
    /** A provider process that could not be stopped; its folder is kept. */
    onCleanupError?: ((error: unknown) => void) | undefined;
}): Promise<string>;
export declare function titlePrompt(request: string): string;
export declare function cleanGeneratedTitle(output: string, fallback: string): string;
export declare function commitMessagePrompt(diff: SessionDiff): string;
export declare function cleanGeneratedCommitMessage(output: string): string;
//# sourceMappingURL=background-model.d.ts.map