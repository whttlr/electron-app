# Auto-Update System Architecture Plan

## Overview
Implement a comprehensive auto-update system that polls for new versions, provides non-intrusive notifications, and enables seamless updates with user control.

## System Architecture

### 1. Update Detection & Polling

#### **Version Checking Service**
```
src/
├── electron/
│   ├── main/
│   │   ├── services/
│   │   │   └── auto-updater/
│   │   │       ├── __tests__/
│   │   │       │   ├── version-checker.test.ts
│   │   │       │   ├── update-downloader.test.ts
│   │   │       │   └── update-installer.test.ts
│   │   │       ├── types/
│   │   │       │   ├── update-types.ts
│   │   │       │   ├── version-types.ts
│   │   │       │   └── github-api-types.ts
│   │   │       ├── config/
│   │   │       │   ├── update-config.ts
│   │   │       │   ├── polling-intervals.ts
│   │   │       │   └── github-endpoints.ts
│   │   │       ├── version-checker.ts
│   │   │       ├── update-downloader.ts
│   │   │       ├── update-installer.ts
│   │   │       ├── github-api-client.ts
│   │   │       ├── update-scheduler.ts
│   │   │       └── index.ts
│   │   │
│   │   └── auto-updater-main.ts
│   │
│   └── renderer/
│       ├── hooks/
│       │   ├── useAppUpdates.ts
│       │   ├── useUpdateNotifications.ts
│       │   └── useUpdatePreferences.ts
│       │
│       ├── components/
│       │   ├── UpdateNotification/
│       │   │   ├── __tests__/
│       │   │   ├── UpdateNotification.tsx
│       │   │   ├── UpdateBadge.tsx
│       │   │   ├── UpdateProgress.tsx
│       │   │   └── UpdateNotification.module.css
│       │   │
│       │   ├── UpdateModal/
│       │   │   ├── __tests__/
│       │   │   ├── UpdateModal.tsx
│       │   │   ├── ReleaseNotes.tsx
│       │   │   ├── UpdateActions.tsx
│       │   │   └── UpdateModal.module.css
│       │   │
│       │   └── UpdateSettings/
│       │       ├── __tests__/
│       │       ├── UpdateSettings.tsx
│       │       ├── UpdateFrequency.tsx
│       │       └── UpdateSettings.module.css
│       │
│       └── services/
│           ├── update-service.ts
│           ├── notification-service.ts
│           └── preference-service.ts
```

#### **Polling Configuration**
```typescript
interface UpdatePollingConfig {
  // Polling intervals (in milliseconds)
  intervals: {
    immediate: 5000        // Check 5s after app start
    regular: 3600000      // Check every hour during use
    idle: 14400000        // Check every 4 hours when idle
    background: 86400000  // Check once daily when minimized
  }
  
  // Retry configuration
  retry: {
    maxAttempts: 3
    backoffMultiplier: 2
    maxBackoffMs: 300000  // 5 minutes max
  }
  
  // Rate limiting
  rateLimit: {
    checksPerHour: 12
    respectGitHubLimits: true
    useETagCaching: true
  }
  
  // User preferences
  userSettings: {
    enableAutoCheck: boolean
    checkFrequency: 'high' | 'normal' | 'low' | 'manual'
    enablePreReleases: boolean
    enableBetaUpdates: boolean
    autoDownload: boolean
    autoInstall: boolean
  }
}
```

### 2. GitHub Integration

#### **Repository Monitoring**
```typescript
interface GitHubVersionChecker {
  // Release API endpoints
  endpoints: {
    latestRelease: '/repos/{owner}/{repo}/releases/latest'
    allReleases: '/repos/{owner}/{repo}/releases'
    specificRelease: '/repos/{owner}/{repo}/releases/{id}'
    compareVersions: '/repos/{owner}/{repo}/compare/{base}...{head}'
  }
  
  // Version detection strategies
  strategies: {
    // Primary: GitHub Releases API
    releases: {
      stable: 'releases/latest'
      preRelease: 'releases?prerelease=true'
      beta: 'releases?prerelease=true&tag_name=*beta*'
    }
    
    // Secondary: Git tags
    tags: {
      pattern: /^v?(\d+)\.(\d+)\.(\d+)(-[\w\.]+)?$/
      sorting: 'semantic-version-desc'
    }
    
    // Tertiary: Package.json monitoring
    packageJson: {
      branch: 'main'
      path: 'package.json'
      field: 'version'
    }
  }
}
```

#### **Version Comparison Logic**
```typescript
interface VersionComparison {
  // Semantic versioning support
  semver: {
    parse: (version: string) => SemVer
    compare: (current: SemVer, latest: SemVer) => ComparisonResult
    isNewer: (current: string, latest: string) => boolean
    isPreRelease: (version: string) => boolean
    isBeta: (version: string) => boolean
  }
  
  // Update classification
  classification: {
    patch: VersionDifference     // 1.0.0 → 1.0.1
    minor: VersionDifference     // 1.0.0 → 1.1.0
    major: VersionDifference     // 1.0.0 → 2.0.0
    preRelease: VersionDifference // 1.0.0 → 1.1.0-alpha.1
  }
  
  // Update urgency
  urgency: 'critical' | 'important' | 'recommended' | 'optional'
}
```

### 3. Non-Intrusive Update Notifications

#### **Notification Hierarchy**
```typescript
interface UpdateNotificationSystem {
  // Notification types by urgency
  notifications: {
    // Critical updates (security fixes)
    critical: {
      style: 'modal-dialog'
      dismissible: false
      autoShow: true
      position: 'center'
      priority: 'immediate'
    }
    
    // Important updates (major features/fixes)
    important: {
      style: 'banner-notification'
      dismissible: true
      autoShow: true
      position: 'top'
      priority: 'high'
    }
    
    // Recommended updates (minor features)
    recommended: {
      style: 'badge-indicator'
      dismissible: true
      autoShow: false
      position: 'header-menu'
      priority: 'normal'
    }
    
    // Optional updates (patches)
    optional: {
      style: 'subtle-indicator'
      dismissible: true
      autoShow: false
      position: 'settings-menu'
      priority: 'low'
    }
  }
  
  // Display timing
  timing: {
    showDelay: number      // Delay before showing notification
    autoHideDelay: number  // Auto-hide duration (0 = manual)
    snoozeOptions: number[] // Snooze durations in minutes
    maxShowsPerSession: number
    cooldownBetweenShows: number
  }
  
  // User interaction tracking
  tracking: {
    dismissalCount: number
    snoozeCount: number
    lastShownTimestamp: number
    userPreference: 'eager' | 'normal' | 'minimal'
  }
}
```

#### **UI Components for Notifications**

**1. Header Badge Indicator**
```typescript
interface UpdateBadge {
  appearance: {
    size: 'small' | 'medium'
    color: 'blue' | 'orange' | 'red'  // Based on urgency
    animation: 'pulse' | 'glow' | 'none'
    position: 'header-right' | 'menu-item'
  }
  
  behavior: {
    clickAction: 'show-modal' | 'show-menu' | 'direct-update'
    hoverPreview: boolean
    showVersionInfo: boolean
    showReleaseHighlights: boolean
  }
  
  content: {
    text: string
    tooltip: string
    ariaLabel: string
  }
}
```

**2. Banner Notification**
```typescript
interface UpdateBanner {
  layout: {
    position: 'top' | 'bottom'
    fullWidth: boolean
    collapsible: boolean
    sticky: boolean
  }
  
  content: {
    title: string
    description: string
    versionInfo: string
    releaseHighlights: string[]
    ctaText: string
    secondaryActions: Action[]
  }
  
  actions: {
    primary: 'view-details' | 'update-now' | 'download'
    secondary: 'dismiss' | 'snooze' | 'settings'
    tertiary: 'release-notes' | 'whats-new'
  }
}
```

**3. Update Modal Dialog**
```typescript
interface UpdateModal {
  structure: {
    header: {
      title: string
      currentVersion: string
      availableVersion: string
      updateType: UpdateType
    }
    
    body: {
      releaseNotes: ReleaseNotesComponent
      downloadProgress?: ProgressComponent
      benefits: string[]
      requirements?: string[]
      warnings?: string[]
    }
    
    footer: {
      actions: ModalAction[]
      preferences: PreferenceToggle[]
      helpLinks: HelpLink[]
    }
  }
  
  behavior: {
    modal: boolean
    escapeDismissible: boolean
    overlayClickDismissible: boolean
    focusManagement: boolean
    keyboardNavigation: boolean
  }
}
```

### 4. Update Download & Installation

#### **Download Management**
```typescript
interface UpdateDownloader {
  // Download configuration
  config: {
    downloadPath: string
    tempDirectory: string
    checksumValidation: boolean
    signatureVerification: boolean
    retryAttempts: number
    timeoutMs: number
  }
  
  // Progress tracking
  progress: {
    onStart: (totalBytes: number) => void
    onProgress: (downloadedBytes: number, totalBytes: number) => void
    onComplete: (filePath: string) => void
    onError: (error: Error) => void
    onCancel: () => void
  }
  
  // Download options
  options: {
    backgroundDownload: boolean
    pauseOnBattery: boolean
    pauseOnMeteredConnection: boolean
    maxConcurrentDownloads: number
    bandwidthLimit?: number
  }
  
  // Platform-specific downloads
  platforms: {
    windows: { installer: '.exe', update: '.nupkg' }
    macos: { installer: '.dmg', update: '.zip' }
    linux: { installer: '.AppImage', update: '.tar.gz' }
  }
}
```

#### **Installation Process**
```typescript
interface UpdateInstaller {
  // Installation modes
  modes: {
    // Immediate restart (user initiated)
    immediate: {
      saveAppState: boolean
      closeAllWindows: boolean
      installAndRestart: boolean
    }
    
    // Delayed installation (next startup)
    delayed: {
      scheduleOnExit: boolean
      showScheduledNotification: boolean
      installOnNextLaunch: boolean
    }
    
    // Background installation (silent)
    background: {
      installSilently: boolean
      requireUserConfirmation: boolean
      notifyWhenComplete: boolean
    }
  }
  
  // Rollback support
  rollback: {
    createBackup: boolean
    backupLocation: string
    autoRollbackOnFailure: boolean
    manualRollbackOption: boolean
  }
  
  // Safety checks
  safety: {
    verifySignature: boolean
    checkSystemRequirements: boolean
    testInstallation: boolean
    validatePostInstall: boolean
  }
}
```

### 5. User Preferences & Settings

#### **Update Preferences UI**
```typescript
interface UpdatePreferences {
  // Automatic checking
  autoCheck: {
    enabled: boolean
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'
    checkOnStartup: boolean
    checkWhenIdle: boolean
  }
  
  // Update types
  updateTypes: {
    stableReleases: boolean
    preReleases: boolean
    betaVersions: boolean
    nightlyBuilds: boolean
  }
  
  // Download behavior
  download: {
    autoDownload: boolean
    downloadInBackground: boolean
    pauseOnBattery: boolean
    pauseOnMeteredConnection: boolean
    downloadPath: string
  }
  
  // Installation behavior
  installation: {
    autoInstall: boolean
    installOnShutdown: boolean
    requireConfirmation: boolean
    createBackups: boolean
  }
  
  // Notifications
  notifications: {
    showUpdateNotifications: boolean
    notificationStyle: 'minimal' | 'standard' | 'detailed'
    playSound: boolean
    showInSystemTray: boolean
  }
  
  // Advanced options
  advanced: {
    allowPreReleases: boolean
    enableTelemetry: boolean
    useCustomUpdateServer: boolean
    customServerUrl?: string
  }
}
```

#### **Settings Persistence**
```typescript
interface SettingsStorage {
  // Storage location
  location: {
    development: 'userData/update-preferences-dev.json'
    production: 'userData/update-preferences.json'
    backup: 'userData/update-preferences.backup.json'
  }
  
  // Storage format
  format: {
    version: string
    lastModified: Date
    preferences: UpdatePreferences
    state: UpdateState
    history: UpdateHistory[]
  }
  
  // Migration support
  migration: {
    version: string
    migrationFunctions: MigrationFunction[]
    backupBeforeMigration: boolean
  }
}
```

### 6. Integration with Existing Architecture

#### **IPC Communication Channels**
```typescript
interface UpdateIPCChannels {
  // Main → Renderer
  'update:available': UpdateInfo
  'update:not-available': void
  'update:download-progress': ProgressInfo
  'update:downloaded': UpdateInfo
  'update:error': ErrorInfo
  
  // Renderer → Main
  'update:check-for-updates': void → UpdateCheckResult
  'update:download-update': void → DownloadResult
  'update:install-update': InstallOptions → InstallResult
  'update:get-preferences': void → UpdatePreferences
  'update:set-preferences': UpdatePreferences → boolean
  'update:get-update-history': void → UpdateHistory[]
  'update:cancel-download': void → boolean
  'update:pause-download': void → boolean
  'update:resume-download': void → boolean
}
```

#### **State Management Integration**
```typescript
interface UpdateStateIntegration {
  // Add to existing state manager
  updateState: {
    checkingForUpdates: boolean
    updateAvailable: UpdateInfo | null
    downloadProgress: ProgressInfo | null
    downloadedUpdate: UpdateInfo | null
    installationInProgress: boolean
    lastCheckTimestamp: Date | null
    preferences: UpdatePreferences
    history: UpdateHistory[]
    error: string | null
  }
  
  // Actions
  updateActions: {
    checkForUpdates: () => Promise<void>
    downloadUpdate: () => Promise<void>
    installUpdate: (options?: InstallOptions) => Promise<void>
    dismissUpdate: () => void
    snoozeUpdate: (duration: number) => void
    setPreferences: (prefs: Partial<UpdatePreferences>) => void
    clearError: () => void
  }
}
```

### 7. Error Handling & Fallbacks

#### **Error Recovery Strategies**
```typescript
interface UpdateErrorHandling {
  // Network errors
  networkErrors: {
    noInternet: 'queue-for-retry' | 'show-offline-message'
    timeout: 'retry-with-backoff' | 'show-timeout-message'
    rateLimited: 'respect-retry-after' | 'show-rate-limit-message'
    serverError: 'try-fallback-url' | 'show-server-error'
  }
  
  // Download errors
  downloadErrors: {
    corrupted: 'redownload' | 'show-corruption-error'
    incomplete: 'resume-download' | 'restart-download'
    diskSpace: 'cleanup-and-retry' | 'show-space-error'
    permissions: 'request-permissions' | 'show-permission-error'
  }
  
  // Installation errors
  installationErrors: {
    permissionDenied: 'request-admin' | 'show-permission-error'
    incompatibleVersion: 'show-compatibility-error'
    corruptInstaller: 'redownload-installer'
    rollbackFailure: 'show-manual-recovery'
  }
  
  // Fallback mechanisms
  fallbacks: {
    manualDownload: boolean
    alternativeUpdateMethods: string[]
    supportContactInfo: ContactInfo
    troubleshootingGuide: string
  }
}
```

### 8. Testing Strategy

#### **Update System Testing**
```typescript
interface UpdateTestSuite {
  // Unit tests
  unit: {
    versionComparison: VersionComparisonTests
    downloadLogic: DownloadTests
    installationLogic: InstallationTests
    notificationSystem: NotificationTests
  }
  
  // Integration tests
  integration: {
    endToEndUpdate: E2EUpdateTests
    errorRecovery: ErrorRecoveryTests
    userInteraction: UserInteractionTests
    platformSpecific: PlatformTests
  }
  
  // Mock environments
  mocks: {
    githubAPI: MockGitHubAPI
    updateServer: MockUpdateServer
    fileSystem: MockFileSystem
    userInteraction: MockUserInteraction
  }
  
  // Test scenarios
  scenarios: {
    firstTimeUpdate: TestScenario
    regularUpdate: TestScenario
    emergencyUpdate: TestScenario
    rollbackUpdate: TestScenario
    offlineUpdate: TestScenario
  }
}
```

## Implementation Timeline

### Phase 1: Core Infrastructure (Week 1)
- [ ] GitHub API integration for version checking
- [ ] Basic polling mechanism with configurable intervals
- [ ] IPC communication setup for update system
- [ ] Error handling and retry logic
- [ ] Unit tests for core functionality

### Phase 2: User Interface (Week 2)
- [ ] Update notification components (badge, banner, modal)
- [ ] Update preferences UI in settings
- [ ] Progress indicators for downloads
- [ ] Non-intrusive notification system
- [ ] User interaction testing

### Phase 3: Download & Installation (Week 3)
- [ ] Update download manager with progress tracking
- [ ] Platform-specific installation logic
- [ ] Rollback and backup systems
- [ ] Safety checks and verification
- [ ] Integration testing

### Phase 4: Polish & Testing (Week 4)
- [ ] Comprehensive error handling
- [ ] Performance optimization
- [ ] Cross-platform testing
- [ ] User experience refinements
- [ ] Documentation and guides

## Success Metrics

1. **Reliability**: 99%+ successful update check completion
2. **User Experience**: <5% notification dismissal rate
3. **Performance**: <100ms UI impact for background checks
4. **Safety**: 100% successful rollback rate on failures
5. **Adoption**: >80% users keeping auto-updates enabled

This auto-update system provides a seamless, user-controlled update experience that keeps the application current while respecting user preferences and system resources.