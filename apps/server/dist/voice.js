/** The adapter owns account authorization; the server exchanges only audio and text. */
export class VoiceService {
    transcriber;
    #starting;
    constructor(transcriber) {
        this.transcriber = transcriber;
    }
    async status(provider) {
        if (provider !== 'codex')
            return { available: false, reason: 'provider_unsupported' };
        return (await this.#get()).status();
    }
    async transcribe(input, signal) {
        if (input.provider !== 'codex')
            throw new Error('This provider does not support dictation.');
        signal?.throwIfAborted();
        return (await this.#get()).transcribe({
            audioBase64: input.audioBase64,
            mimeType: input.mimeType,
            sampleRateHz: input.sampleRateHz,
            durationMs: input.durationMs,
        }, signal);
    }
    async #get() {
        if (this.transcriber)
            return this.transcriber;
        this.#starting ??= import('@harness/adapter-codex/voice').then(({ CodexVoiceTranscriber }) => new CodexVoiceTranscriber());
        try {
            this.transcriber = await this.#starting;
            return this.transcriber;
        }
        finally {
            this.#starting = undefined;
        }
    }
}
//# sourceMappingURL=voice.js.map