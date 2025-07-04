import { GitHubRelease, UpdateConfig } from './types';

export class GitHubReleaseChecker {
  private config: UpdateConfig['github'];

  private lastETag?: string;

  private cachedReleases?: GitHubRelease[];

  private lastFetch?: Date;

  constructor(config: UpdateConfig['github']) {
    this.config = config;
  }

  async getLatestRelease(includePreReleases = false): Promise<GitHubRelease | null> {
    try {
      const releases = await this.getAllReleases();

      if (!releases.length) {
        return null;
      }

      // Filter out drafts and optionally pre-releases
      const validReleases = releases.filter((release) => {
        if (release.draft) return false;
        if (!includePreReleases && release.prerelease) return false;
        return true;
      });

      // Sort by publication date (newest first)
      validReleases.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

      return validReleases[0] || null;
    } catch (error) {
      console.error('Failed to fetch latest release:', error);
      throw error;
    }
  }

  async getAllReleases(): Promise<GitHubRelease[]> {
    // Use cache if available and fresh (within 5 minutes)
    const now = new Date();
    if (this.cachedReleases && this.lastFetch
        && (now.getTime() - this.lastFetch.getTime()) < 300000) {
      return this.cachedReleases;
    }

    try {
      const url = `${this.config.apiBaseUrl}/repos/${this.config.owner}/${this.config.repo}/releases`;

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': `${this.config.repo}-app`,
      };

      // Use ETag for conditional requests
      if (this.lastETag) {
        headers['If-None-Match'] = this.lastETag;
      }

      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(this.config.rateLimitBuffer * 1000),
      });

      // If not modified, return cached data
      if (response.status === 304 && this.cachedReleases) {
        return this.cachedReleases;
      }

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      // Update ETag for future requests
      const etag = response.headers.get('ETag');
      if (etag) {
        this.lastETag = etag;
      }

      const releases: GitHubRelease[] = await response.json();

      // Update cache
      this.cachedReleases = releases;
      this.lastFetch = now;

      return releases;
    } catch (error) {
      // Return cached data if available during errors
      if (this.cachedReleases) {
        console.warn('Using cached release data due to fetch error:', error);
        return this.cachedReleases;
      }
      throw error;
    }
  }

  isNewerVersion(current: string, latest: string): boolean {
    // Remove 'v' prefix if present
    const cleanCurrent = current.replace(/^v/, '');
    const cleanLatest = latest.replace(/^v/, '');

    // Simple semantic version comparison
    const currentParts = cleanCurrent.split('.').map(Number);
    const latestParts = cleanLatest.split('.').map(Number);

    // Pad arrays to same length
    const maxLength = Math.max(currentParts.length, latestParts.length);
    while (currentParts.length < maxLength) currentParts.push(0);
    while (latestParts.length < maxLength) latestParts.push(0);

    for (let i = 0; i < maxLength; i++) {
      if (latestParts[i] > currentParts[i]) {
        return true;
      } if (latestParts[i] < currentParts[i]) {
        return false;
      }
    }

    return false; // Versions are equal
  }

  clearCache(): void {
    this.cachedReleases = undefined;
    this.lastFetch = undefined;
    this.lastETag = undefined;
  }
}
