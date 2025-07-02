import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // API configuration methods
  getApiConfig: () => ipcRenderer.invoke('get-api-config'),
  apiHealthCheck: () => ipcRenderer.invoke('api-health-check'),

  // Listen for API ready event
  onApiReady: (callback: (config: { baseUrl: string }) => void) => ipcRenderer.on('api-ready', (_, config) => callback(config)),
});
