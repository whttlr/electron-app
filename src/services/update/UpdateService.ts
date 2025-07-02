import { GitHubReleaseChecker } from './GitHubReleaseChecker';
import { UpdateCheckResult, UpdateConfig, UpdateStatus, UpdateState } from './types';
import { DEFAULT_UPDATE_CONFIG } from './config';

export class UpdateService {
  private githubChecker: GitHubReleaseChecker;
  private config: UpdateConfig;
  private checkInterval?: NodeJS.Timeout;
  private state: UpdateState;
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<UpdateConfig> = {}) {
    this.config = { ...DEFAULT_UPDATE_CONFIG, ...config };
    this.githubChecker = new GitHubReleaseChecker(this.config.github);
    this.state = {
      status: UpdateStatus.IDLE
    };
  }

  async initialize(): Promise<void> {
    console.log('Initializing UpdateService...');
    
    if (this.config.checking.checkOnStartup) {
      // Check for updates after a short delay to avoid blocking startup
      setTimeout(() => {
        this.checkForUpdates().catch(error => {
          console.error('Startup update check failed:', error);
        });
      }, 5000);
    }

    if (this.config.checking.enabled) {
      this.startPeriodicChecking();
    }
  }

  async checkForUpdates(): Promise<UpdateCheckResult> {
    console.log('Checking for updates...');
    this.setState({ status: UpdateStatus.CHECKING });

    try {
      const currentVersion = await this.getCurrentVersion();
      const latestRelease = await this.githubChecker.getLatestRelease(
        this.config.releases.includePreReleases
      );

      if (!latestRelease) {
        throw new Error('No releases found');
      }

      const latestVersion = latestRelease.tag_name;
      const updateAvailable = this.githubChecker.isNewerVersion(currentVersion, latestVersion);

      const result: UpdateCheckResult = {
        updateAvailable,
        currentVersion,
        latestVersion,
        releaseNotes: latestRelease.body,
        downloadUrl: this.getDownloadUrl(latestRelease),
        publishedAt: latestRelease.published_at,
        releaseData: latestRelease
      };

      this.setState({
        status: updateAvailable ? UpdateStatus.UPDATE_AVAILABLE : UpdateStatus.IDLE,
        lastCheck: new Date(),
        updateData: result
      });

      if (updateAvailable) {
        this.emit('update-available', result);
        console.log(`Update available: ${currentVersion} -> ${latestVersion}`);
      } else {
        console.log('No updates available');
      }

      return result;
    } catch (error) {
      console.error('Update check failed:', error);
      this.setState({
        status: UpdateStatus.ERROR,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.emit('update-error', error);
      throw error;
    }
  }

  startPeriodicChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    console.log(`Starting periodic update checks every ${this.config.checking.interval}ms`);
    this.checkInterval = setInterval(() => {
      this.checkForUpdates().catch(error => {
        console.error('Periodic update check failed:', error);
      });
    }, this.config.checking.interval);
  }

  stopPeriodicChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
      console.log('Stopped periodic update checking');
    }
  }

  async getCurrentVersion(): Promise<string> {
    // In Electron main process, this would use app.getVersion()
    // For now, we'll try to get it from package.json or environment
    if (typeof window !== 'undefined' && window.electronAPI?.getAppVersion) {
      return await window.electronAPI.getAppVersion();
    }
    
    // Fallback for development
    return process.env.npm_package_version || '1.0.0';
  }

  getUpdateStatus(): UpdateState {
    return { ...this.state };
  }

  private getDownloadUrl(release: any): string | undefined {
    // Look for the appropriate asset based on platform
    const platform = process.platform;
    const arch = process.arch;
    
    const platformPatterns = {
      win32: /\.exe$/i,
      darwin: /\.dmg$/i,
      linux: /\.AppImage$/i
    };

    const pattern = platformPatterns[platform as keyof typeof platformPatterns];
    if (!pattern) return undefined;

    const asset = release.assets?.find((asset: any) => pattern.test(asset.name));
    return asset?.browser_download_url;
  }

  private setState(updates: Partial<UpdateState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('state-change', this.state);
  }

  // Event emitter functionality
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in update service listener for ${event}:`, error);
        }
      });
    }
  }

  destroy(): void {
    this.stopPeriodicChecking();
    this.listeners.clear();
    this.githubChecker.clearCache();
  }
}