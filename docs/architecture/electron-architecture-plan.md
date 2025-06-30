# Electron Application Architecture Plan

## Overview
Transform the current React-based jog-controls playground into a full-featured Electron desktop application for CNC machine control.

## Current State Analysis
- **Frontend**: React + TypeScript with modular architecture
- **Core Logic**: Well-structured core modules (machine, positioning, dimensions, units)
- **State Management**: Custom hooks with centralized state
- **Testing**: Comprehensive test suite with 281 passing tests
- **Architecture**: Enforced module boundaries with ESLint

## Target Architecture

### 1. Electron Main Process Structure
```
src/
├── electron/
│   ├── main/                           # Main process code
│   │   ├── __tests__/                  # Main process tests
│   │   ├── __mocks__/                  # Mock electron APIs
│   │   ├── config/                     # Main process configuration
│   │   │   ├── app-config.ts           # Application settings
│   │   │   ├── menu-config.ts          # Application menu structure
│   │   │   ├── window-config.ts        # Window creation settings
│   │   │   └── security-config.ts      # Security policies
│   │   ├── services/                   # Main process services
│   │   │   ├── auto-updater/           # Auto-update service
│   │   │   ├── serial-manager/         # Serial port management
│   │   │   ├── file-manager/           # File operations
│   │   │   ├── preferences/            # User preferences storage
│   │   │   └── window-manager/         # Window lifecycle management
│   │   ├── security/                   # Security implementations
│   │   │   ├── content-security.ts     # CSP policies
│   │   │   ├── context-isolation.ts    # Context isolation setup
│   │   │   └── preload-validation.ts   # Preload script validation
│   │   ├── utils/                      # Main process utilities
│   │   │   ├── app-lifecycle.ts        # App startup/shutdown
│   │   │   ├── crash-reporter.ts       # Crash reporting
│   │   │   └── system-info.ts          # System information
│   │   └── main.ts                     # Main process entry point
│   │
│   ├── preload/                        # Preload scripts
│   │   ├── __tests__/                  # Preload script tests
│   │   ├── api/                        # Exposed APIs
│   │   │   ├── machine-api.ts          # Machine control API
│   │   │   ├── file-api.ts             # File operations API
│   │   │   ├── preferences-api.ts      # Settings API
│   │   │   ├── updater-api.ts          # Update system API
│   │   │   └── system-api.ts           # System information API
│   │   ├── types/                      # API type definitions
│   │   │   ├── electron-api.d.ts       # Main API types
│   │   │   └── ipc-channels.ts         # IPC channel definitions
│   │   └── preload.ts                  # Main preload script
│   │
│   └── renderer/                       # Renderer process enhancements
│       ├── hooks/                      # Electron-specific hooks
│       │   ├── useElectronAPI.ts       # Access to electron APIs
│       │   ├── useSerialPorts.ts       # Serial port management
│       │   ├── useFileOperations.ts    # File operations
│       │   └── useAppUpdates.ts        # Update system integration
│       ├── services/                   # Renderer-side services
│       │   ├── ipc-service.ts          # IPC communication wrapper
│       │   ├── error-boundary.ts       # Enhanced error handling
│       │   └── performance-monitor.ts  # Performance monitoring
│       └── types/                      # Renderer type definitions
           └── electron-types.d.ts     # Electron-specific types
```

### 2. IPC Communication Architecture

#### **Bidirectional Communication Channels**
```typescript
// IPC Channel Definitions
interface IPCChannels {
  // Machine Control
  'machine:connect': { port: string } → { success: boolean, error?: string }
  'machine:disconnect': void → { success: boolean }
  'machine:jog': JogCommand → { success: boolean, position: Position }
  'machine:home': void → { success: boolean, position: Position }
  'machine:status': void → MachineState
  
  // Serial Port Management
  'serial:list-ports': void → SerialPortInfo[]
  'serial:port-status': { port: string } → SerialPortStatus
  
  // File Operations
  'file:open-gcode': void → { path: string, content: string } | null
  'file:save-gcode': { path: string, content: string } → { success: boolean }
  'file:recent-files': void → RecentFile[]
  
  // Preferences
  'preferences:get': void → UserPreferences
  'preferences:set': Partial<UserPreferences> → { success: boolean }
  'preferences:reset': void → { success: boolean }
  
  // Updates
  'updater:check-for-updates': void → UpdateInfo | null
  'updater:download-update': void → { progress: number }
  'updater:install-update': void → { success: boolean }
  'updater:get-release-notes': { version: string } → ReleaseNotes
}
```

#### **Event-Driven Updates**
```typescript
// Main → Renderer Events
interface MainToRendererEvents {
  'machine:state-changed': MachineState
  'machine:error': { error: string, code: string }
  'serial:port-connected': { port: string }
  'serial:port-disconnected': { port: string }
  'serial:ports-changed': SerialPortInfo[]
  'updater:update-available': UpdateInfo
  'updater:update-downloaded': void
  'updater:download-progress': { percent: number, bytesPerSecond: number }
  'app:error': { error: string, stack: string }
}
```

### 3. Security Implementation

#### **Content Security Policy**
```typescript
// Enhanced CSP for Electron
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], // Only for development
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://api.github.com"], // For updates
  workerSrc: ["'self'"],
  fontSrc: ["'self'"],
  manifestSrc: ["'self'"],
  mediaSrc: ["'self'"]
};
```

#### **Context Isolation & Preload Security**
- **Strict Context Isolation**: No access to Node.js APIs from renderer
- **Validated IPC**: All IPC messages validated with TypeScript schemas
- **Sandboxed Renderer**: Renderer process runs in sandbox mode
- **Limited Node Integration**: Zero node integration in renderer

### 4. Serial Port Integration

#### **Main Process Serial Manager**
```typescript
interface SerialManager {
  // Discovery & Management
  listPorts(): Promise<SerialPortInfo[]>
  connectToPort(portPath: string, options: SerialOptions): Promise<void>
  disconnectFromPort(): Promise<void>
  
  // Communication
  sendCommand(command: string): Promise<string>
  sendGCode(lines: string[]): Promise<void>
  
  // Monitoring
  onDataReceived(callback: (data: string) => void): void
  onStatusChange(callback: (status: SerialStatus) => void): void
  onError(callback: (error: Error) => void): void
  
  // State
  getConnectionStatus(): SerialConnectionStatus
  getPortInfo(): SerialPortInfo | null
}
```

#### **Real-time Communication**
- **Streaming Data**: Real-time machine status updates
- **Command Queue**: Managed G-code command execution
- **Error Handling**: Robust error recovery and reporting
- **Connection Monitoring**: Automatic reconnection on disconnect

### 5. File System Integration

#### **Enhanced File Operations**
```typescript
interface FileManager {
  // G-code Files
  openGCodeFile(): Promise<{ path: string, content: string } | null>
  saveGCodeFile(content: string, path?: string): Promise<string>
  validateGCodeFile(content: string): ValidationResult
  
  // Project Files
  openProject(): Promise<ProjectData | null>
  saveProject(project: ProjectData): Promise<void>
  
  // Recent Files
  getRecentFiles(): RecentFile[]
  addToRecent(filePath: string): void
  clearRecent(): void
  
  // Import/Export
  exportSettings(): Promise<void>
  importSettings(): Promise<UserPreferences | null>
  exportLogs(): Promise<void>
}
```

### 6. Application Menu & Native Integration

#### **Native Menu Structure**
```
Application Menu:
├── File
│   ├── New Project              Ctrl+N
│   ├── Open G-code File         Ctrl+O
│   ├── Save                     Ctrl+S
│   ├── Save As                  Ctrl+Shift+S
│   ├── Recent Files            ►
│   ├── ─────────────────────
│   ├── Import Settings
│   ├── Export Settings
│   ├── ─────────────────────
│   └── Exit                     Ctrl+Q
├── Machine
│   ├── Connect                  Ctrl+Shift+C
│   ├── Disconnect               Ctrl+Shift+D
│   ├── Home Machine             Ctrl+H
│   ├── ─────────────────────
│   ├── Jog Controls            ►
│   └── Machine Settings
├── Tools
│   ├── Preferences              Ctrl+,
│   ├── ─────────────────────
│   ├── Export Logs
│   └── Reset Settings
├── Window
│   ├── Minimize                 Ctrl+M
│   ├── Close                    Ctrl+W
│   ├── ─────────────────────
│   ├── Developer Tools          F12
│   └── Reload                   Ctrl+R
└── Help
    ├── Check for Updates
    ├── Release Notes
    ├── ─────────────────────
    ├── Documentation
    ├── Report Issue
    └── About
```

### 7. Development & Build Process

#### **Build Configuration**
```typescript
// electron-builder configuration
interface BuildConfig {
  appId: "com.jogger.cnc-controller"
  productName: "CNC Jog Controls"
  directories: {
    buildResources: "build-resources"
    output: "dist-electron"
  }
  files: [
    "dist/**/*",
    "node_modules/**/*",
    "package.json"
  ]
  extraResources: [
    "drivers/**/*",
    "documentation/**/*"
  ]
  mac: {
    category: "public.app-category.developer-tools"
    hardenedRuntime: true
    entitlements: "build-resources/entitlements.mac.plist"
  }
  win: {
    target: "nsis"
    publisherName: "Jogger CNC Tools"
  }
  linux: {
    target: "AppImage"
    category: "Development"
  }
}
```

#### **Development Scripts**
```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux",
    "electron:pack": "npm run build && electron-builder --dir",
    "electron:test": "jest --config jest.electron.config.js",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

### 8. Testing Strategy

#### **Multi-Process Testing**
```typescript
// Main Process Testing
describe('Main Process', () => {
  describe('SerialManager', () => {
    test('should list available ports')
    test('should connect to valid port')
    test('should handle connection errors')
  })
  
  describe('FileManager', () => {
    test('should open G-code files')
    test('should validate file content')
    test('should maintain recent files list')
  })
})

// IPC Testing
describe('IPC Communication', () => {
  test('should handle machine control commands')
  test('should validate IPC message schemas')
  test('should handle IPC errors gracefully')
})

// Integration Testing
describe('Electron Integration', () => {
  test('should launch application successfully')
  test('should create main window')
  test('should handle app lifecycle events')
})
```

### 9. Performance Considerations

#### **Optimization Strategies**
- **Lazy Loading**: Load heavy modules only when needed
- **Worker Threads**: Use worker threads for CPU-intensive tasks
- **Memory Management**: Proper cleanup of resources and event listeners
- **Bundle Optimization**: Separate main and renderer bundles
- **Asset Optimization**: Optimize images and fonts for distribution

#### **Monitoring & Diagnostics**
- **Performance Metrics**: Built-in performance monitoring
- **Memory Usage**: Track memory consumption
- **Crash Reporting**: Automated crash report collection
- **Usage Analytics**: Optional usage statistics (with user consent)

### 10. Distribution & Deployment

#### **Multi-Platform Support**
- **macOS**: Code-signed .dmg with notarization
- **Windows**: Signed .exe installer with auto-update
- **Linux**: AppImage with desktop integration

#### **Auto-Update Infrastructure**
- **GitHub Releases**: Automated release creation
- **Update Server**: Optional custom update server
- **Delta Updates**: Minimal download sizes for updates
- **Rollback Support**: Ability to rollback failed updates

## Implementation Phases

### Phase 1: Core Electron Setup (Week 1)
- [ ] Basic Electron application structure
- [ ] Main process setup with window management
- [ ] Preload script and IPC communication
- [ ] Security implementation (CSP, context isolation)
- [ ] Development environment setup

### Phase 2: Native Integration (Week 2)
- [ ] Serial port integration in main process
- [ ] File system operations
- [ ] Application menu implementation
- [ ] Native dialogs and notifications
- [ ] Error handling and crash reporting

### Phase 3: Enhanced Features (Week 3)
- [ ] Preferences system
- [ ] Recent files management
- [ ] Performance monitoring
- [ ] Developer tools integration
- [ ] Testing infrastructure

### Phase 4: Distribution (Week 4)
- [ ] Build configuration for all platforms
- [ ] Code signing setup
- [ ] Auto-update system integration
- [ ] Documentation and user guides
- [ ] Beta testing and feedback collection

## Benefits of Electron Architecture

1. **Native Performance**: Direct access to system resources and hardware
2. **Cross-Platform**: Single codebase for Windows, macOS, and Linux
3. **Rich Integration**: File system, menus, notifications, and system tray
4. **Hardware Access**: Serial ports, USB devices, and system information
5. **Professional Feel**: Native application experience with OS integration
6. **Offline Capability**: Full functionality without internet connection
7. **Security**: Sandboxed renderer with controlled API exposure
8. **Updatable**: Built-in auto-update system for seamless updates

This architecture provides a robust foundation for a professional CNC control application while maintaining the existing modular structure and adding native desktop capabilities.