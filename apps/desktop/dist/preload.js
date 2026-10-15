import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { clipboardText } from './clipboard-text.js';
import { isNativeMenuActionMessage } from './menu-contract.js';
import { droppedFilePath, isAppUpdateState, isFiniteNumber } from './preload-validation.js';
const startupStartedAt = Number(process.env['HARNESS_STARTUP_STARTED_AT']);
const startupBenchmarkEnabled = Number.isFinite(startupStartedAt) && startupStartedAt > 0;
/**
 * The entire native surface exposed to the renderer.
 *
 * Everything else goes over the server socket, because the renderer is the
 * least trusted process in the app and every function added here is permanent
 * attack surface. Native dialogs, window-integrated surfaces, trackpad
 * feedback, and materializing validated clipboard images are the operations
 * that cannot work through the browser surface.
 */
const api = {
    pickFolder: () => ipcRenderer.invoke('harness:pickFolder'),
    droppedFolderPaths: (files) => {
        const paths = Array.from(files)
            .slice(0, 128)
            .map((file) => {
            try {
                return webUtils.getPathForFile(file);
            }
            catch {
                return '';
            }
        })
            .filter(Boolean);
        return ipcRenderer.invoke('harness:droppedFolderPaths', paths);
    },
    pickSkillFolder: () => ipcRenderer.invoke('harness:pickSkillFolder'),
    pickFiles: () => ipcRenderer.invoke('harness:pickFiles'),
    droppedFilePath: (file) => droppedFilePath(file, (value) => webUtils.getPathForFile(value)),
    previewViewedImage: (reference) => ipcRenderer.invoke('harness:previewViewedImage', reference),
    revealPath: (path) => ipcRenderer.invoke('harness:revealPath', path),
    revealProjectFile: (path, projectPath) => ipcRenderer.invoke('harness:revealProjectFile', path, projectPath),
    savePastedFile: (file) => ipcRenderer.invoke('harness:savePastedFile', file),
    writeClipboardText: (text) => ipcRenderer.invoke('harness:writeClipboardText', clipboardText(text)),
    setZoom: (action) => ipcRenderer.invoke('harness:setZoom', action),
    setTheme: (preference) => ipcRenderer.invoke('harness:setTheme', preference),
    setWindowChrome: (chrome) => ipcRenderer.invoke('harness:setWindowChrome', chrome),
    prepareHaptics: () => ipcRenderer.send('harness:hapticsPrepare'),
    performHaptic: (pattern) => ipcRenderer.send('harness:hapticFeedback', pattern),
    capturePreview: (request) => ipcRenderer.invoke('harness:capturePreview', request),
    cancelPreviewCapture: (requestId) => ipcRenderer.invoke('harness:cancelPreviewCapture', requestId),
    openExternal: (url) => ipcRenderer.invoke('harness:openExternal', url),
    getDiagnosticsEnabled: () => ipcRenderer.invoke('harness:getDiagnosticsEnabled'),
    setDiagnosticsEnabled: (enabled) => ipcRenderer.invoke('harness:setDiagnosticsEnabled', enabled),
    openDiagnostics: () => ipcRenderer.invoke('harness:openDiagnostics'),
    crashAgents: () => ipcRenderer.invoke('harness:crashAgents'),
    launchCrashAgent: (agent, details) => ipcRenderer.invoke('harness:launchCrashAgent', agent, details),
    reportRendererError: (message) => ipcRenderer.send('harness:reportRendererError', message.slice(0, 4_000)),
    getUpdateState: () => ipcRenderer.invoke('harness:getUpdateState'),
    checkForUpdates: () => ipcRenderer.invoke('harness:checkForUpdates'),
    installUpdate: () => ipcRenderer.invoke('harness:installUpdate'),
    setMenuShortcuts: (shortcuts) => ipcRenderer.send('harness:setMenuShortcuts', shortcuts),
    onMenuAction: (listener) => {
        const handler = (_event, message) => {
            if (isNativeMenuActionMessage(message))
                listener(message.action, message.source);
        };
        ipcRenderer.on('harness:menuAction', handler);
        ipcRenderer.send('harness:menuReady');
        return () => ipcRenderer.removeListener('harness:menuAction', handler);
    },
    suspendMenuShortcuts: (suspended) => ipcRenderer.send('harness:suspendMenuShortcuts', suspended === true),
    onUpdateState: (listener) => {
        const handler = (_event, state) => {
            if (isAppUpdateState(state))
                listener(state);
        };
        ipcRenderer.on('harness:updateState', handler);
        return () => ipcRenderer.removeListener('harness:updateState', handler);
    },
    onZoomChange: (listener) => {
        const handler = (_event, factor) => {
            if (isFiniteNumber(factor))
                listener(factor);
        };
        ipcRenderer.on('harness:zoomChanged', handler);
        return () => ipcRenderer.removeListener('harness:zoomChanged', handler);
    },
    ...(startupBenchmarkEnabled
        ? {
            reportStartupMilestone: (name) => ipcRenderer.send('harness:startupRendererMilestone', name),
        }
        : {}),
    isDesktop: true,
};
contextBridge.exposeInMainWorld('harness', api);
if (startupBenchmarkEnabled) {
    ipcRenderer.send('harness:startupPreloadReady', Date.now() - startupStartedAt);
}
//# sourceMappingURL=preload.js.map