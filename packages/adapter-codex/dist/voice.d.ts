export declare const VOICE_SAMPLE_RATE = 24000;
export declare const MAX_VOICE_DURATION_MS = 120000;
export declare const MAX_VOICE_BYTES: number;
export declare const OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";
export declare const OPENAI_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";
export type VoiceTranscriptionInput = {
    audioBase64: string;
    mimeType: 'audio/wav';
    sampleRateHz: 24_000;
    durationMs: number;
};
export type VoiceHttpResponse = {
    status: number;
    body: string;
};
type RequestTranscription = (audio: Buffer, apiKey: string, signal?: AbortSignal) => Promise<VoiceHttpResponse>;
export declare class VoiceTranscriptionError extends Error {
    readonly code: 'invalid_audio' | 'unsupported_auth' | 'unsupported_codex' | 'cancelled' | 'upstream_failure';
    constructor(code: 'invalid_audio' | 'unsupported_auth' | 'unsupported_codex' | 'cancelled' | 'upstream_failure', message: string);
}
export declare class OpenAiVoiceTranscriber {
    #private;
    constructor(requestVoiceTranscription?: RequestTranscription);
    transcribe(input: VoiceTranscriptionInput, apiKey: string, signal?: AbortSignal): Promise<string>;
}
export declare function requestOpenAiTranscription(audio: Buffer, apiKey: string, signal?: AbortSignal, account?: boolean): Promise<VoiceHttpResponse>;
export declare function validateVoiceClip(input: VoiceTranscriptionInput): Buffer;
export { CodexVoiceTranscriber } from './account-voice.js';
//# sourceMappingURL=voice.d.ts.map