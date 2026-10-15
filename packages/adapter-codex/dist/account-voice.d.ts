import { type VoiceHttpResponse, type VoiceTranscriptionInput } from './voice.js';
type ResolveAuth = (refresh: boolean, signal?: AbortSignal) => Promise<string>;
type Upload = (audio: Buffer, token: string, signal?: AbortSignal) => Promise<VoiceHttpResponse>;
/** Account credentials exist only inside this adapter for the duration of an upload. */
export declare class CodexVoiceTranscriber {
    private readonly resolveAuth;
    private readonly upload;
    constructor(resolveAuth?: ResolveAuth, upload?: Upload);
    status(): Promise<{
        available: boolean;
        reason?: 'sign_in_required';
    }>;
    transcribe(input: VoiceTranscriptionInput, signal?: AbortSignal): Promise<string>;
}
export {};
//# sourceMappingURL=account-voice.d.ts.map