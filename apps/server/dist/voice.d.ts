import type { VoiceTranscriptionInput } from '@harness/adapter-codex/voice';
import type { ParamsOf, ProviderId } from '@harness/contracts';
export type VoiceTranscriber = {
    status(): Promise<{
        available: boolean;
        reason?: 'sign_in_required';
    }>;
    transcribe(input: VoiceTranscriptionInput, signal?: AbortSignal): Promise<string>;
};
/** The adapter owns account authorization; the server exchanges only audio and text. */
export declare class VoiceService {
    #private;
    private transcriber?;
    constructor(transcriber?: VoiceTranscriber | undefined);
    status(provider: ProviderId): Promise<{
        available: boolean;
        reason?: "sign_in_required";
    } | {
        available: boolean;
        reason: "provider_unsupported";
    }>;
    transcribe(input: ParamsOf<'voice.transcribe'>, signal?: AbortSignal): Promise<string>;
}
//# sourceMappingURL=voice.d.ts.map