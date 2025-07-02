# Update System Implementation Plan

## Overview
This document outlines the implementation plan for adding "new update available" notifications with release notes to the CNC Jog Controls application. The system will periodically check for new releases on GitHub and provide users with non-intrusive update notifications.

## Current State Analysis

### Existing Infrastructure
- ✅ **electron-updater** dependency already installed
- ✅ GitHub publish configuration in package.json
- ✅ Basic app version API exposed via preload script
- ❌ No active update checking implementation
- ❌ No update-related UI components
- ❌ No GitHub API integration

### Project Context
- **Repository**: `whttlr/electron-app`
- **Release Method**: GitHub Releases
- **Distribution**: Electron desktop application
- **Update Mechanism**: electron-updater with GitHub provider

## Architecture Design

### System Components

```
src/services/update/
├── __tests__/                     # Unit tests
├── __mocks__/                     # Test mocks
├── README.md                      # Module documentation
├── config.ts                      # Update configuration
├── index.ts                       # Public API exports
├── UpdateService.ts               # Main update orchestration
├── GitHubReleaseChecker.ts        # GitHub API integration
└── UpdateNotificationManager.ts  # UI notification handling
```

### Data Flow
1. **App Startup** → Initialize update service
2. **Periodic Check** → Query GitHub API for latest release
3. **Version Compare** → Compare with current app version
4. **Update Available** → Show notification badge
5. **User Interaction** → Display release notes popover
6. **Update Action** → Download and install via electron-updater

## Implementation Details

### 1. Update Service Module

#### UpdateService.ts
```typescript
interface UpdateService {
  checkForUpdates(): Promise<UpdateCheckResult>;
  startPeriodicChecking(): void;
  stopPeriodicChecking(): void;
  downloadUpdate(): Promise<void>;
  installUpdate(): void;
  getCurrentVersion(): string;
  getUpdateStatus(): UpdateStatus;
}

interface UpdateCheckResult {
  updateAvailable: boolean;
  latestVersion?: string;
  releaseNotes?: string;
  downloadUrl?: string;
  publishedAt?: string;
}
```

#### GitHubReleaseChecker.ts
```typescript
interface GitHubReleaseChecker {
  getLatestRelease(): Promise<GitHubRelease>;
  getAllReleases(): Promise<GitHubRelease[]>;
  isNewerVersion(current: string, latest: string): boolean;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string; // Markdown release notes
  published_at: string;
  assets: ReleaseAsset[];
  prerelease: boolean;
}
```

### 2. Electron Main Process Integration

#### main.ts Updates
```typescript
// Add IPC handlers
ipcMain.handle('update:check', async () => {
  return await updateService.checkForUpdates();
});

ipcMain.handle('update:download', async () => {
  return await updateService.downloadUpdate();
});

ipcMain.handle('update:install', () => {
  updateService.installUpdate();
});

// Initialize electron-updater
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'whttlr',
  repo: 'electron-app'
});
```

#### preload.ts Updates
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing APIs
  updates: {
    checkForUpdates: () => ipcRenderer.invoke('update:check'),
    downloadUpdate: () => ipcRenderer.invoke('update:download'),
    installUpdate: () => ipcRenderer.invoke('update:install'),
    onUpdateAvailable: (callback) => ipcRenderer.on('update:available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update:downloaded', callback)
  }
});
```

### 3. UI Components

#### UpdateNotificationBadge.tsx
```typescript
interface UpdateNotificationBadgeProps {
  updateAvailable: boolean;
  onClick: () => void;
}

// Features:
// - Small, non-intrusive badge
// - Shows in app header or status bar
// - Animated pulse effect when update available
// - Click handler to show release notes
```

#### ReleaseNotesPopover.tsx
```typescript
interface ReleaseNotesPopoverProps {
  visible: boolean;
  releaseData: ReleaseData;
  onUpdate: () => void;
  onDismiss: () => void;
}

// Features:
// - Markdown rendering for release notes
// - Version information display
// - Release date and changelog
// - Update/Download button
// - Dismiss option
```

### 4. Configuration System

#### config/updates.json
```json
{
  "checking": {
    "enabled": true,
    "interval": 3600000,
    "checkOnStartup": true,
    "retryAttempts": 3,
    "timeout": 30000
  },
  "notifications": {
    "showBadge": true,
    "autoShowPopover": false,
    "dismissable": true
  },
  "releases": {
    "includePreReleases": false,
    "minimumVersion": "1.0.0"
  },
  "github": {
    "apiBaseUrl": "https://api.github.com",
    "owner": "whttlr",
    "repo": "electron-app",
    "rateLimitBuffer": 100
  }
}
```

### 5. Settings Integration

#### Settings View Updates
```typescript
// Add update preferences section:
interface UpdateSettings {
  autoCheckEnabled: boolean;
  checkInterval: number; // in hours
  includePreReleases: boolean;
  autoDownload: boolean;
  notificationStyle: 'badge' | 'popup' | 'silent';
}
```

### 6. Error Handling & Edge Cases

#### Network Connectivity
- Graceful degradation when offline
- Retry logic with exponential backoff
- Cache last successful check result

#### Rate Limiting
- Respect GitHub API rate limits
- Implement request caching
- Use conditional requests (ETag/If-Modified-Since)

#### Version Comparison
- Semantic version parsing
- Handle pre-release versions
- Skip downgrades and same versions

## Implementation Timeline

### Phase 1: Core Infrastructure (High Priority)
1. Create update service module structure
2. Implement GitHub API integration
3. Add Electron main process handlers
4. Basic update checking functionality

### Phase 2: User Interface (Medium Priority)
1. Create notification badge component
2. Implement release notes popover
3. Integrate components into app layout
4. Add basic error handling

### Phase 3: Configuration & Polish (Low Priority)
1. Add update settings to Settings view
2. Implement configurable check intervals
3. Add comprehensive error handling
4. Write unit and integration tests

## Testing Strategy

### Unit Tests
- Update service logic
- Version comparison functions
- GitHub API response parsing
- Configuration loading

### Integration Tests
- Full update check workflow
- UI component interactions
- Electron IPC communication
- Error scenarios

### Manual Testing Scenarios
1. Fresh install update check
2. Update available notification flow
3. Release notes display
4. Actual update download/install
5. Network failure scenarios

## Security Considerations

### GitHub API Security
- No authentication required for public repo reads
- Validate response data structure
- Sanitize markdown content before rendering

### Update Security
- electron-updater handles signature verification
- Only download from official GitHub releases
- Validate downloaded file integrity

## Future Enhancements

### Advanced Features
- Update scheduling (install on next restart)
- Delta updates for smaller downloads
- Rollback functionality
- Update notifications via system tray

### Analytics
- Track update adoption rates
- Monitor check frequencies
- Error reporting for failed updates

## Dependencies

### Required Packages
- `electron-updater` (already installed)
- `semver` for version comparison
- `marked` or similar for markdown rendering
- `antd` components for UI (already available)

### Optional Enhancements
- `node-fetch` for GitHub API calls
- `electron-log` for update logging
- `electron-store` for persistent settings

## Configuration Files to Update

1. **package.json** - Verify publish configuration
2. **config/app.json** - Add update settings
3. **src/App.tsx** - Initialize update service
4. **src/views/Settings/SettingsView.tsx** - Add update preferences

## Rollout Strategy

### Development Phase
1. Implement on feature branch
2. Test with mock GitHub responses
3. Test with actual pre-releases

### Staging Phase
1. Deploy to internal testing environment
2. Validate update flow end-to-end
3. Performance and reliability testing

### Production Phase
1. Gradual rollout with feature flag
2. Monitor error rates and performance
3. Full activation after validation

This implementation will provide users with a seamless, non-intrusive way to stay updated with the latest application releases while maintaining full control over when and how updates are applied.