import { useState, useEffect, useCallback } from 'react';
import { UpdateCheckResult, UpdateStatus, UpdateState } from '../services/update/types';

declare global {
  interface Window {
    electronAPI?: {
      updates: {
        checkForUpdates: () => Promise<UpdateCheckResult>;
        downloadUpdate: () => Promise<void>;
        installUpdate: () => void;
        getUpdateStatus: () => Promise<UpdateState>;
        onUpdateAvailable: (callback: (updateData: UpdateCheckResult) => void) => void;
        onUpdateDownloaded: (callback: (info: any) => void) => void;
        onUpdateError: (callback: (error: any) => void) => void;
        onStateChange: (callback: (state: UpdateState) => void) => void;
        onDownloadProgress: (callback: (progress: any) => void) => void;
        removeUpdateListeners: () => void;
      };
    };
  }
}

export interface UpdateServiceHook {
  updateData: UpdateCheckResult | null;
  updateStatus: UpdateStatus;
  downloadProgress: number;
  isDownloading: boolean;
  showReleaseNotes: boolean;
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => void;
  showUpdateDialog: () => void;
  hideUpdateDialog: () => void;
  error: string | null;
}

export const useUpdateService = (): UpdateServiceHook => {
  const [updateData, setUpdateData] = useState<UpdateCheckResult | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(UpdateStatus.IDLE);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    if (!window.electronAPI?.updates) {
      console.warn('Update service not available');
      return;
    }

    try {
      setError(null);
      const result = await window.electronAPI.updates.checkForUpdates();
      setUpdateData(result);
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    if (!window.electronAPI?.updates) {
      console.warn('Update service not available');
      return;
    }

    try {
      setError(null);
      setIsDownloading(true);
      await window.electronAPI.updates.downloadUpdate();
    } catch (err) {
      console.error('Failed to download update:', err);
      setError(err instanceof Error ? err.message : 'Failed to download update');
      setIsDownloading(false);
    }
  }, []);

  const installUpdate = useCallback(() => {
    if (!window.electronAPI?.updates) {
      console.warn('Update service not available');
      return;
    }

    try {
      window.electronAPI.updates.installUpdate();
    } catch (err) {
      console.error('Failed to install update:', err);
      setError(err instanceof Error ? err.message : 'Failed to install update');
    }
  }, []);

  const showUpdateDialog = useCallback(() => {
    setShowReleaseNotes(true);
  }, []);

  const hideUpdateDialog = useCallback(() => {
    setShowReleaseNotes(false);
  }, []);

  useEffect(() => {
    if (!window.electronAPI?.updates) {
      return;
    }

    // Set up event listeners
    window.electronAPI.updates.onUpdateAvailable((data: UpdateCheckResult) => {
      console.log('Update available:', data);
      setUpdateData(data);
      setUpdateStatus(UpdateStatus.UPDATE_AVAILABLE);
    });

    window.electronAPI.updates.onUpdateDownloaded(() => {
      console.log('Update downloaded');
      setIsDownloading(false);
      setUpdateStatus(UpdateStatus.DOWNLOADED);
      setDownloadProgress(100);
    });

    window.electronAPI.updates.onUpdateError((err: any) => {
      console.error('Update error:', err);
      setError(err?.message || 'Update error occurred');
      setIsDownloading(false);
      setUpdateStatus(UpdateStatus.ERROR);
    });

    window.electronAPI.updates.onStateChange((state: UpdateState) => {
      console.log('Update state change:', state);
      setUpdateStatus(state.status);
      if (state.error) {
        setError(state.error);
      }
    });

    window.electronAPI.updates.onDownloadProgress((progress: any) => {
      console.log('Download progress:', progress);
      setDownloadProgress(progress.percent || 0);
    });

    // Initial status check
    window.electronAPI.updates.getUpdateStatus().then((status) => {
      if (status) {
        setUpdateStatus(status.status);
        if (status.updateData) {
          setUpdateData(status.updateData);
        }
        if (status.error) {
          setError(status.error);
        }
      }
    }).catch((err) => {
      console.warn('Failed to get initial update status:', err);
    });

    // Cleanup listeners on unmount
    return () => {
      window.electronAPI?.updates.removeUpdateListeners();
    };
  }, []);

  return {
    updateData,
    updateStatus,
    downloadProgress,
    isDownloading,
    showReleaseNotes,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    showUpdateDialog,
    hideUpdateDialog,
    error
  };
};