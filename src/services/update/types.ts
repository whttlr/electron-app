export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: GitHubReleaseAsset[];
  prerelease: boolean;
  draft: boolean;
}

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  latestVersion?: string;
  currentVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  publishedAt?: string;
  releaseData?: GitHubRelease;
}

export interface UpdateConfig {
  checking: {
    enabled: boolean;
    interval: number;
    checkOnStartup: boolean;
    retryAttempts: number;
    timeout: number;
  };
  notifications: {
    showBadge: boolean;
    autoShowPopover: boolean;
    dismissable: boolean;
  };
  releases: {
    includePreReleases: boolean;
    minimumVersion: string;
  };
  github: {
    apiBaseUrl: string;
    owner: string;
    repo: string;
    rateLimitBuffer: number;
  };
}

export enum UpdateStatus {
  IDLE = 'idle',
  CHECKING = 'checking',
  UPDATE_AVAILABLE = 'update-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

export interface UpdateState {
  status: UpdateStatus;
  lastCheck?: Date;
  updateData?: UpdateCheckResult;
  error?: string;
  downloadProgress?: number;
}
