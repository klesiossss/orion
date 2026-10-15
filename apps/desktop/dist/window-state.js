import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const SAVE_DELAY_MS = 200;
export function parseMainWindowState(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return undefined;
    const candidate = value;
    const bounds = candidate['bounds'];
    if (typeof bounds !== 'object' || bounds === null || Array.isArray(bounds))
        return undefined;
    const rectangle = bounds;
    const x = rectangle['x'];
    const y = rectangle['y'];
    const width = rectangle['width'];
    const height = rectangle['height'];
    if (candidate['version'] !== 1 ||
        typeof candidate['fullScreen'] !== 'boolean' ||
        typeof candidate['maximized'] !== 'boolean' ||
        !Number.isSafeInteger(x) ||
        !Number.isSafeInteger(y) ||
        !Number.isSafeInteger(width) ||
        !Number.isSafeInteger(height) ||
        width <= 0 ||
        height <= 0) {
        return undefined;
    }
    return {
        version: 1,
        bounds: {
            x: x,
            y: y,
            width: width,
            height: height,
        },
        fullScreen: candidate['fullScreen'],
        maximized: candidate['maximized'],
    };
}
export function loadMainWindowState(filePath) {
    try {
        return parseMainWindowState(JSON.parse(readFileSync(filePath, 'utf8')));
    }
    catch {
        return undefined;
    }
}
export function saveMainWindowState(filePath, state) {
    mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
    writeFileSync(filePath, `${JSON.stringify(state)}\n`, { encoding: 'utf8', mode: 0o600 });
}
export function restoreMainWindowState(state, workArea, fallbackSize, minimumSize) {
    if (!state || !workArea) {
        return { bounds: fallbackSize, fullScreen: false, maximized: false };
    }
    const maximumWidth = Math.max(minimumSize.width, workArea.width);
    const maximumHeight = Math.max(minimumSize.height, workArea.height);
    const width = Math.min(Math.max(state.bounds.width, minimumSize.width), maximumWidth);
    const height = Math.min(Math.max(state.bounds.height, minimumSize.height), maximumHeight);
    const maximumX = workArea.x + Math.max(0, workArea.width - width);
    const maximumY = workArea.y + Math.max(0, workArea.height - height);
    return {
        bounds: {
            x: Math.min(Math.max(state.bounds.x, workArea.x), maximumX),
            y: Math.min(Math.max(state.bounds.y, workArea.y), maximumY),
            width,
            height,
        },
        fullScreen: state.fullScreen,
        maximized: state.maximized,
    };
}
export function persistMainWindowState(window, initialState, save, onError = () => undefined) {
    let state = {
        version: 1,
        bounds: window.getNormalBounds(),
        fullScreen: initialState.fullScreen,
        maximized: initialState.maximized,
    };
    let saveTimer;
    const saveNow = () => {
        if (saveTimer)
            clearTimeout(saveTimer);
        saveTimer = undefined;
        try {
            save(state);
        }
        catch (error) {
            onError(error);
        }
    };
    const saveSoon = () => {
        if (saveTimer)
            clearTimeout(saveTimer);
        saveTimer = setTimeout(saveNow, SAVE_DELAY_MS);
    };
    const updateBounds = () => {
        state = { ...state, bounds: window.getNormalBounds() };
    };
    const onMoveOrResize = () => {
        updateBounds();
        saveSoon();
    };
    const onEnterFullScreen = () => {
        updateBounds();
        state = { ...state, fullScreen: true };
        saveSoon();
    };
    const onLeaveFullScreen = () => {
        updateBounds();
        state = { ...state, fullScreen: false };
        saveSoon();
    };
    const onMaximize = () => {
        updateBounds();
        state = { ...state, maximized: true };
        saveSoon();
    };
    const onUnmaximize = () => {
        updateBounds();
        state = { ...state, maximized: false };
        saveSoon();
    };
    const onClose = () => {
        updateBounds();
        saveNow();
    };
    window.on('move', onMoveOrResize);
    window.on('resize', onMoveOrResize);
    window.on('enter-full-screen', onEnterFullScreen);
    window.on('leave-full-screen', onLeaveFullScreen);
    window.on('maximize', onMaximize);
    window.on('unmaximize', onUnmaximize);
    window.on('close', onClose);
    let stopped = false;
    const stop = () => {
        if (stopped)
            return;
        stopped = true;
        if (saveTimer)
            clearTimeout(saveTimer);
        window.off('move', onMoveOrResize);
        window.off('resize', onMoveOrResize);
        window.off('enter-full-screen', onEnterFullScreen);
        window.off('leave-full-screen', onLeaveFullScreen);
        window.off('maximize', onMaximize);
        window.off('unmaximize', onUnmaximize);
        window.off('close', onClose);
    };
    const saveAndStop = () => {
        if (stopped)
            return;
        updateBounds();
        saveNow();
        stop();
    };
    return { saveAndStop, stop };
}
//# sourceMappingURL=window-state.js.map