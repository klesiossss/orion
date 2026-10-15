const FIRST_CHECK_DELAY = 15_000;
const CHECK_INTERVAL = 60 * 60 * 1000;
// A failed background attempt retries sooner than the hourly check, then backs
// off so an offline machine does not keep asking GitHub.
const RETRY_DELAYS = [5 * 60 * 1000, 15 * 60 * 1000, 30 * 60 * 1000];
// GitHub names the moment its rate limit resets; asking sooner is wasted.
function retryAt(cause) {
    if (typeof cause !== 'object' || cause === null || !('retryAt' in cause))
        return undefined;
    return typeof cause.retryAt === 'number' ? cause.retryAt : undefined;
}
export function createAppUpdateController(options) {
    const listeners = new Set();
    const setTimeoutFn = options.setTimeoutFn ?? setTimeout;
    const clearTimeoutFn = options.clearTimeoutFn ?? clearTimeout;
    const lazyLoadUpdater = options.loadUpdater;
    let timer;
    let started = false;
    let checking;
    let loading;
    let updater = options.updater;
    let updaterConfigured = false;
    let state = {
        status: options.enabled ? 'idle' : 'unsupported',
        currentVersion: options.currentVersion,
    };
    // One attempt is a check plus the download it starts. electron-updater reports
    // a failure twice (an `error` event and a rejected promise); count it once.
    let attempt = 0;
    let failedAttempt = -1;
    let failures = 0;
    let quiet = false;
    let settled = state;
    let lastCheckAt = 0;
    const reschedule = (delay) => {
        if (!started)
            return;
        if (timer)
            clearTimeoutFn(timer);
        timer = setTimeoutFn(() => {
            timer = undefined;
            void check('background').finally(() => {
                // A failure has already set its own, shorter retry.
                if (!timer)
                    reschedule(CHECK_INTERVAL);
            });
        }, delay);
        timer.unref?.();
    };
    const publish = (next) => {
        state = next;
        for (const listener of listeners)
            listener(state);
    };
    const versioned = (status, info) => ({
        status,
        currentVersion: options.currentVersion,
        version: info.version,
    });
    const fail = (cause) => {
        if (failedAttempt === attempt)
            return;
        failedAttempt = attempt;
        failures += 1;
        options.onError?.(cause);
        const backoff = RETRY_DELAYS[failures - 1] ?? CHECK_INTERVAL;
        const deferred = retryAt(cause);
        reschedule(deferred === undefined ? backoff : Math.max(backoff, deferred - Date.now()));
        // An offline launch or a GitHub outage is not the user's problem until they
        // ask. A failed install of a ready update always is.
        if (quiet && state.status !== 'ready') {
            publish(settled);
            return;
        }
        publish({
            status: 'error',
            currentVersion: options.currentVersion,
            error: cause instanceof Error ? cause.message : String(cause),
        });
    };
    const succeed = (next) => {
        failures = 0;
        publish(next);
    };
    const configureUpdater = (client) => {
        if (updaterConfigured)
            return client;
        updater = client;
        updaterConfigured = true;
        client.autoDownload = false;
        client.autoInstallOnAppQuit = true;
        client.allowPrerelease = true;
        client.allowDowngrade = false;
        client.on('checking-for-update', () => publish({ status: 'checking', currentVersion: options.currentVersion }));
        client.on('update-not-available', (info) => succeed(versioned('current', info)));
        client.on('update-available', (info) => {
            publish(versioned('downloading', info));
            void client.downloadUpdate().catch(fail);
        });
        client.on('download-progress', (progress) => {
            // After the last byte, verification and the hand-over to the native
            // updater take a while, and electron-updater reports its local copy as a
            // second download from 0 percent. Neither is the user's download.
            if (state.status === 'preparing')
                return;
            publish(progress.percent >= 100
                ? {
                    status: 'preparing',
                    currentVersion: options.currentVersion,
                    ...(state.version ? { version: state.version } : {}),
                }
                : {
                    ...state,
                    status: 'downloading',
                    currentVersion: options.currentVersion,
                    progress: Math.round(progress.percent),
                });
        });
        client.on('update-downloaded', (info) => succeed(versioned('ready', info)));
        client.on('error', fail);
        return client;
    };
    if (updater)
        configureUpdater(updater);
    const loadUpdater = () => {
        if (updater)
            return Promise.resolve(updater);
        if (!lazyLoadUpdater)
            return Promise.reject(new Error('No app updater is available.'));
        loading ??= lazyLoadUpdater()
            .then(configureUpdater)
            .catch((error) => {
            loading = undefined;
            throw error;
        });
        return loading;
    };
    const check = (origin = 'user') => {
        if (!options.enabled)
            return Promise.resolve(state);
        // A person who joins a background attempt is now waiting on its outcome.
        if (origin === 'user')
            quiet = false;
        if (checking)
            return checking;
        if (['downloading', 'preparing', 'ready'].includes(state.status))
            return Promise.resolve(state);
        attempt += 1;
        quiet = origin === 'background';
        settled = state;
        lastCheckAt = Date.now();
        checking = loadUpdater()
            .then((client) => client.checkForUpdates())
            .then(() => state, (error) => {
            fail(error);
            return state;
        })
            .finally(() => {
            checking = undefined;
        });
        return checking;
    };
    return {
        state: () => state,
        check,
        install: () => {
            if (state.status !== 'ready' || !updater)
                return false;
            updater.quitAndInstall(false, true);
            return true;
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        start: () => {
            if (!options.enabled || started)
                return;
            started = true;
            lastCheckAt = Date.now();
            reschedule(FIRST_CHECK_DELAY);
        },
        // Timers stand still while the machine sleeps, so a check that came due
        // overnight would otherwise wait another hour of waking time.
        resume: () => {
            if (started && Date.now() - lastCheckAt >= CHECK_INTERVAL)
                reschedule(FIRST_CHECK_DELAY);
        },
        dispose: () => {
            started = false;
            if (timer)
                clearTimeoutFn(timer);
            timer = undefined;
            listeners.clear();
            return updater?.dispose?.();
        },
    };
}
//# sourceMappingURL=app-updater.js.map