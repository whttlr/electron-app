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

  // Update service methods
  updates: {
    checkForUpdates: () => ipcRenderer.invoke('update:check'),
    downloadUpdate: () => ipcRenderer.invoke('update:download'),
    installUpdate: () => ipcRenderer.invoke('update:install'),
    getUpdateStatus: () => ipcRenderer.invoke('update:get-status'),
    
    // Event listeners
    onUpdateAvailable: (callback: (updateData: any) => void) => {
      ipcRenderer.on('update:available', (_, updateData) => callback(updateData));
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      ipcRenderer.on('update:downloaded', (_, info) => callback(info));
    },
    onUpdateError: (callback: (error: any) => void) => {
      ipcRenderer.on('update:error', (_, error) => callback(error));
    },
    onStateChange: (callback: (state: any) => void) => {
      ipcRenderer.on('update:state-change', (_, state) => callback(state));
    },
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('update:download-progress', (_, progress) => callback(progress));
    },
    
    // Remove event listeners
    removeUpdateListeners: () => {
      ipcRenderer.removeAllListeners('update:available');
      ipcRenderer.removeAllListeners('update:downloaded');
      ipcRenderer.removeAllListeners('update:error');
      ipcRenderer.removeAllListeners('update:state-change');
      ipcRenderer.removeAllListeners('update:download-progress');
    }
  }
});
