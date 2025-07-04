import { UpdateConfig } from './types';

export const DEFAULT_UPDATE_CONFIG: UpdateConfig = {
  checking: {
    enabled: true,
    interval: 3600000, // 1 hour
    checkOnStartup: true,
    retryAttempts: 3,
    timeout: 30000,
  },
  notifications: {
    showBadge: true,
    autoShowPopover: false,
    dismissable: true,
  },
  releases: {
    includePreReleases: false,
    minimumVersion: '1.0.0',
  },
  github: {
    apiBaseUrl: 'https://api.github.com',
    owner: 'whttlr',
    repo: 'electron-app',
    rateLimitBuffer: 100,
  },
};

export const UPDATE_CHECK_EVENTS = {
  UPDATE_AVAILABLE: 'update:available',
  UPDATE_DOWNLOADED: 'update:downloaded',
  UPDATE_ERROR: 'update:error',
  DOWNLOAD_PROGRESS: 'update:download-progress',
} as const;
