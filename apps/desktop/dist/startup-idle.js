/** Measure idle memory only after startup RPCs finish and their UI commits settle.
 * New work cancels the quiet delay; work during capture invalidates the result. */
export class StartupIdleGate {
    delayMs;
    capture;
    #ready = false;
    #idle = false;
    #started = false;
    #notices = 0;
    #interrupted = false;
    #timer;
    constructor(delayMs, capture) {
        this.delayMs = delayMs;
        this.capture = capture;
    }
    get interrupted() {
        return this.#interrupted;
    }
    ready() {
        this.#ready = true;
        this.#schedule();
    }
    setIdle(idle) {
        this.#idle = idle;
        if (!idle)
            this.#busy();
        this.#schedule();
    }
    setNoticeVisible(visible) {
        this.#notices = Math.max(0, this.#notices + (visible ? 1 : -1));
        if (visible)
            this.#busy();
        this.#schedule();
    }
    #busy() {
        clearTimeout(this.#timer);
        this.#timer = undefined;
        if (this.#started)
            this.#interrupted = true;
    }
    #schedule() {
        if (!this.#ready ||
            !this.#idle ||
            this.#notices > 0 ||
            this.#started ||
            this.#timer !== undefined)
            return;
        this.#timer = setTimeout(() => {
            this.#timer = undefined;
            this.#started = true;
            this.capture();
        }, this.delayMs);
    }
}
//# sourceMappingURL=startup-idle.js.map