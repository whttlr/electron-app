# Cross-Platform Logic Sharing Strategy Plan

## Overview
Create a unified architecture that shares core business logic, state management, and services between Electron desktop app and React Native mobile app for CNC machine control.

## Current Architecture Analysis

### Existing Modular Structure (Strengths)
```
✅ Well-structured core modules:
├── core/machine/          # Machine control logic
├── core/positioning/      # Jog and position management
├── core/dimensions/       # Working area calculations
├── core/units/           # Metric/Imperial conversions
├── services/logger/      # Centralized logging
├── services/config/      # Configuration management
├── services/state/       # State management
└── services/events/      # Event bus communication

✅ Platform-agnostic business logic
✅ TypeScript with comprehensive type definitions
✅ Dependency injection ready
✅ Well-tested with 281 passing tests
```

### Platform-Specific Components (Need Abstraction)
```
⚠️ Platform-specific areas requiring abstraction:
├── Serial port communication (Node.js vs React Native)
├── File system operations (fs vs react-native-fs)
├── Hardware access (different APIs)
├── UI components (React DOM vs React Native)
├── Navigation (react-router vs react-navigation)
└── Storage (localStorage vs AsyncStorage)
```

## Cross-Platform Technology Options

### Option 1: Tauri + Capacitor (Recommended)
**Unified Rust + TypeScript architecture for true cross-platform development**

#### **Architecture Overview**
```
Shared Core (Rust + TypeScript)
├── Business Logic Layer (TypeScript)
│   ├── Machine Control
│   ├── Position Management
│   ├── Units & Conversions
│   └── State Management
├── Platform Bridge Layer (Rust)
│   ├── Serial Communication
│   ├── File Operations
│   ├── Hardware Access
│   └── System Integration
└── UI Layer (Platform-Specific)
    ├── Desktop (Tauri + React)
    ├── Mobile (Capacitor + React)
    └── Web (Pure React)
```

#### **Benefits**
- **Single Codebase**: 90%+ code sharing between platforms
- **Performance**: Native performance with minimal overhead
- **Security**: Rust's memory safety + sandboxed execution
- **Modern**: Latest web technologies with native capabilities
- **Bundle Size**: Significantly smaller than Electron (~10MB vs ~100MB)
- **Cross-Platform**: Windows, macOS, Linux, iOS, Android, Web

#### **Technology Stack**
```typescript
// Shared packages structure
packages/
├── core/                           # Platform-agnostic business logic
│   ├── machine/                    # Machine control (TypeScript)
│   ├── positioning/                # Position management
│   ├── units/                      # Unit conversions
│   ├── state/                      # State management (Zustand/Valtio)
│   └── types/                      # Shared TypeScript definitions
├── platform-bridge/               # Rust-based platform abstraction
│   ├── src/
│   │   ├── serial/                 # Serial port abstraction
│   │   ├── fs/                     # File system abstraction
│   │   ├── hardware/               # Hardware access abstraction
│   │   └── system/                 # System integration
│   └── bindings/                   # TypeScript bindings
├── ui-shared/                      # Shared UI components
│   ├── components/                 # Platform-agnostic components
│   ├── hooks/                      # Shared React hooks
│   ├── utils/                      # UI utilities
│   └── themes/                     # Design system
├── desktop/                        # Tauri desktop app
│   ├── src-tauri/                  # Rust backend
│   └── src/                        # React frontend
├── mobile/                         # Capacitor mobile app
│   ├── ios/                        # iOS project
│   ├── android/                    # Android project
│   └── src/                        # React frontend
└── web/                            # Pure web app (optional)
    └── src/                        # React frontend
```

### Option 2: Flutter + Rust (Alternative)
**Single UI framework with Rust backend for all platforms**

#### **Architecture**
```
Shared Backend (Rust)
├── Core Logic (Machine control, positioning, units)
├── Platform APIs (Serial, file system, hardware)
└── FFI Bindings (Flutter integration)

Flutter Frontend
├── Desktop (Windows, macOS, Linux)
├── Mobile (iOS, Android)
├── Web (Flutter Web)
└── Embedded (Potential future)
```

#### **Benefits**
- **Single UI Framework**: Consistent UI across all platforms
- **Performance**: Compiled to native code
- **Dart Language**: Modern, type-safe language
- **Growing Ecosystem**: Rapidly expanding plugin ecosystem
- **Google Backing**: Strong corporate support

#### **Considerations**
- **Learning Curve**: New language (Dart) and framework
- **Web Performance**: Flutter Web still maturing
- **Ecosystem**: Smaller than React ecosystem

### Option 3: Expo + Electron (React Ecosystem)
**Maximize React ecosystem reuse with platform bridges**

#### **Architecture**
```
Shared Core (TypeScript)
├── Business Logic (React hooks + context)
├── State Management (Zustand/Redux Toolkit)
├── Services (Platform-abstracted)
└── UI Components (React + react-native-web)

Platform Implementations
├── Desktop (Electron + React)
├── Mobile (Expo + React Native)
└── Web (React + Vite)
```

#### **Benefits**
- **React Ecosystem**: Leverage existing React knowledge
- **Component Sharing**: High UI component reuse with react-native-web
- **Development Speed**: Familiar tools and patterns
- **Community**: Large ecosystem and community support

#### **Platform Abstraction Layer**
```typescript
// Platform service abstraction
interface PlatformServices {
  serial: SerialService
  filesystem: FileSystemService
  hardware: HardwareService
  storage: StorageService
  notifications: NotificationService
}

// Platform-specific implementations
class ElectronServices implements PlatformServices {
  serial = new ElectronSerialService()
  filesystem = new ElectronFileSystemService()
  // ...
}

class ReactNativeServices implements PlatformServices {
  serial = new ReactNativeSerialService()
  filesystem = new ReactNativeFileSystemService()
  // ...
}
```

## Recommended Architecture: Tauri + Capacitor

### 1. Shared Core Architecture

#### **Business Logic Layer (TypeScript)**
```typescript
// Shared core structure
@shared/core/
├── machine/
│   ├── __tests__/
│   ├── types.ts
│   ├── machine-controller.ts
│   ├── machine-state.ts
│   └── index.ts
├── positioning/
│   ├── __tests__/
│   ├── types.ts
│   ├── position-controller.ts
│   ├── jog-controller.ts
│   └── index.ts
├── units/
│   ├── __tests__/
│   ├── types.ts
│   ├── unit-converter.ts
│   └── index.ts
├── state/
│   ├── __tests__/
│   ├── stores/
│   │   ├── machine-store.ts
│   │   ├── ui-store.ts
│   │   └── settings-store.ts
│   ├── hooks/
│   │   ├── use-machine.ts
│   │   ├── use-positioning.ts
│   │   └── use-settings.ts
│   └── index.ts
└── services/
    ├── __tests__/
    ├── config-service.ts
    ├── logger-service.ts
    ├── event-service.ts
    └── index.ts
```

#### **Platform Bridge Layer (Rust)**
```rust
// Platform abstraction in Rust
// src-tauri/src/platform/mod.rs

pub trait SerialPort {
    async fn list_ports() -> Result<Vec<PortInfo>, Error>;
    async fn connect(&self, port: &str, baud: u32) -> Result<(), Error>;
    async fn write(&self, data: &[u8]) -> Result<usize, Error>;
    async fn read(&self) -> Result<Vec<u8>, Error>;
}

pub trait FileSystem {
    async fn read_file(&self, path: &str) -> Result<String, Error>;
    async fn write_file(&self, path: &str, content: &str) -> Result<(), Error>;
    async fn list_directory(&self, path: &str) -> Result<Vec<String>, Error>;
}

pub trait Hardware {
    async fn get_system_info() -> SystemInfo;
    async fn get_usb_devices() -> Vec<UsbDevice>;
    async fn monitor_hardware_changes() -> Receiver<HardwareEvent>;
}

// Platform-specific implementations
#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "ios")]
mod ios;
#[cfg(target_os = "android")]
mod android;
```

#### **TypeScript Bindings**
```typescript
// Generated TypeScript bindings for Rust functions
@shared/platform-bridge/
├── src/
│   ├── serial.ts          # Serial port operations
│   ├── filesystem.ts      # File system operations
│   ├── hardware.ts        # Hardware access
│   ├── system.ts          # System information
│   └── types.ts           # Shared type definitions
└── generated/             # Auto-generated from Rust
    ├── bindings.ts        # Tauri bindings
    └── capacitor.ts       # Capacitor plugin bindings
```

### 2. Shared UI Components

#### **Component Architecture**
```typescript
// Shared UI components with platform adaptation
@shared/ui/
├── components/
│   ├── machine/
│   │   ├── __tests__/
│   │   ├── MachineStatus.tsx
│   │   ├── PositionDisplay.tsx
│   │   ├── JogControls.tsx
│   │   └── index.ts
│   ├── controls/
│   │   ├── __tests__/
│   │   ├── Button.tsx
│   │   ├── Slider.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── __tests__/
│   │   ├── Grid.tsx
│   │   ├── Panel.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   └── visualization/
│       ├── __tests__/
│       ├── WorkingArea.tsx
│       ├── MachinePreview.tsx
│       └── index.ts
├── hooks/
│   ├── __tests__/
│   ├── useResponsive.ts
│   ├── usePlatform.ts
│   ├── useKeyboard.ts
│   └── index.ts
├── utils/
│   ├── __tests__/
│   ├── platform.ts
│   ├── responsive.ts
│   ├── accessibility.ts
│   └── index.ts
└── themes/
    ├── base.ts
    ├── desktop.ts
    ├── mobile.ts
    └── index.ts
```

#### **Platform Adaptation Strategy**
```typescript
// Platform-aware components
interface PlatformProps {
  platform: 'desktop' | 'mobile' | 'web'
  orientation?: 'portrait' | 'landscape'
  screenSize: 'small' | 'medium' | 'large'
}

const JogControls: React.FC<JogControlsProps & PlatformProps> = ({
  platform,
  orientation,
  screenSize,
  ...props
}) => {
  const layout = useMemo(() => {
    if (platform === 'mobile') {
      return orientation === 'portrait' ? 'vertical' : 'horizontal'
    }
    return 'grid'
  }, [platform, orientation])

  const buttonSize = useMemo(() => {
    if (platform === 'mobile') return 'large'
    if (screenSize === 'small') return 'medium'
    return 'small'
  }, [platform, screenSize])

  return (
    <JogControlsContainer layout={layout}>
      {/* Platform-adapted controls */}
    </JogControlsContainer>
  )
}
```

### 3. State Management Strategy

#### **Unified State with Platform Bridges**
```typescript
// Shared state management with Zustand
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface MachineState {
  // State
  isConnected: boolean
  position: Position
  dimensions: Dimensions
  isMoving: boolean
  isHoming: boolean
  
  // Actions (platform-agnostic)
  connect: (port: string) => Promise<void>
  disconnect: () => Promise<void>
  jog: (axis: Axis, distance: number) => Promise<void>
  home: () => Promise<void>
  
  // Platform services (injected)
  services: PlatformServices
}

export const useMachineStore = create<MachineState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      isConnected: false,
      position: { x: 0, y: 0, z: 0 },
      dimensions: { width: 100, height: 100, depth: 50 },
      isMoving: false,
      isHoming: false,
      
      // Platform-agnostic actions
      connect: async (port: string) => {
        const { services } = get()
        try {
          await services.serial.connect(port)
          set((state) => {
            state.isConnected = true
          })
        } catch (error) {
          throw new Error(`Failed to connect: ${error}`)
        }
      },
      
      jog: async (axis: Axis, distance: number) => {
        const { services, isConnected } = get()
        if (!isConnected) throw new Error('Machine not connected')
        
        set((state) => {
          state.isMoving = true
        })
        
        try {
          await services.serial.sendCommand(`G91 G01 ${axis}${distance}`)
          // Update position based on response
        } finally {
          set((state) => {
            state.isMoving = false
          })
        }
      },
      
      // Services injected at initialization
      services: null as any, // Injected by platform
    }))
  )
)
```

### 4. Platform-Specific Implementations

#### **Desktop App (Tauri)**
```
desktop/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── platform/
│   │   │   ├── serial.rs        # Native serial port access
│   │   │   ├── filesystem.rs    # Native file operations
│   │   │   └── hardware.rs      # Hardware enumeration
│   │   └── commands/
│   │       ├── machine.rs       # Machine control commands
│   │       ├── file.rs          # File operation commands
│   │       └── system.rs        # System commands
│   ├── tauri.conf.json
│   └── Cargo.toml
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── desktop/             # Desktop-specific components
│   │   └── shared/              # Symlink to @shared/ui
│   ├── services/
│   │   └── tauri-services.ts    # Tauri service implementations
│   └── hooks/
│       └── use-tauri.ts         # Tauri-specific hooks
└── package.json
```

#### **Mobile App (Capacitor)**
```
mobile/
├── ios/                         # iOS project
├── android/                     # Android project
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── mobile/              # Mobile-specific components
│   │   └── shared/              # Symlink to @shared/ui
│   ├── services/
│   │   └── capacitor-services.ts # Capacitor service implementations
│   ├── plugins/
│   │   ├── serial/              # Custom serial plugin
│   │   ├── filesystem/          # File system plugin
│   │   └── hardware/            # Hardware access plugin
│   └── hooks/
│       └── use-capacitor.ts     # Capacitor-specific hooks
├── capacitor.config.ts
└── package.json
```

### 5. Development Workflow

#### **Monorepo Structure with Nx/Rush**
```
cnc-control-suite/
├── apps/
│   ├── desktop/                 # Tauri desktop app
│   ├── mobile/                  # Capacitor mobile app
│   └── web/                     # Pure web app (optional)
├── packages/
│   ├── core/                    # Business logic
│   ├── ui-shared/               # Shared UI components
│   ├── platform-bridge/        # Platform abstraction
│   ├── test-utils/              # Shared testing utilities
│   └── eslint-config/           # Shared ESLint config
├── tools/
│   ├── build-scripts/           # Build automation
│   ├── code-generation/         # Rust->TS binding generation
│   └── deployment/              # Deployment scripts
├── docs/
│   ├── architecture/            # Architecture documentation
│   ├── development/             # Development guides
│   └── deployment/              # Deployment guides
├── nx.json                      # Nx configuration
├── package.json                 # Root package.json
└── tsconfig.base.json           # Base TypeScript config
```

#### **Development Scripts**
```json
{
  "scripts": {
    "dev:desktop": "nx serve desktop",
    "dev:mobile": "nx serve mobile",
    "dev:web": "nx serve web",
    "dev:all": "nx run-many --target=serve --all",
    
    "build:desktop": "nx build desktop",
    "build:mobile": "nx build mobile",
    "build:web": "nx build web",
    "build:all": "nx run-many --target=build --all",
    
    "test:unit": "nx run-many --target=test --all",
    "test:e2e": "nx run-many --target=e2e --all",
    "test:integration": "nx test integration",
    
    "lint": "nx run-many --target=lint --all",
    "type-check": "nx run-many --target=type-check --all",
    
    "generate:bindings": "node tools/generate-bindings.js",
    "sync:packages": "nx run-many --target=sync --all"
  }
}
```

### 6. Testing Strategy

#### **Shared Testing Infrastructure**
```typescript
// Shared test utilities
@shared/test-utils/
├── mocks/
│   ├── platform-services.ts    # Mock platform services
│   ├── machine-responses.ts    # Mock machine responses
│   └── hardware-events.ts      # Mock hardware events
├── fixtures/
│   ├── gcode-samples.ts        # Sample G-code files
│   ├── machine-configs.ts      # Machine configurations
│   └── test-data.ts           # Test data sets
├── helpers/
│   ├── render-utils.ts         # React testing utilities
│   ├── async-utils.ts          # Async testing helpers
│   └── platform-utils.ts       # Platform-specific test helpers
└── setup/
    ├── jest.config.js          # Shared Jest configuration
    ├── test-setup.ts           # Global test setup
    └── msw-setup.ts            # Mock Service Worker setup
```

#### **Cross-Platform Testing**
```typescript
// Platform-agnostic tests
describe('MachineController', () => {
  describe('across platforms', () => {
    const platforms = ['desktop', 'mobile', 'web'] as const
    
    platforms.forEach(platform => {
      describe(`on ${platform}`, () => {
        let services: PlatformServices
        
        beforeEach(() => {
          services = createMockServices(platform)
        })
        
        test('should connect to machine', async () => {
          const controller = new MachineController(services)
          await controller.connect('/dev/ttyUSB0')
          expect(controller.isConnected()).toBe(true)
        })
        
        test('should handle jog commands', async () => {
          const controller = new MachineController(services)
          await controller.connect('/dev/ttyUSB0')
          await controller.jog('x', 10)
          expect(controller.getPosition().x).toBe(10)
        })
      })
    })
  })
})
```

### 7. Deployment Strategy

#### **Automated Build and Release**
```yaml
# GitHub Actions workflow
name: Cross-Platform Build and Release

on:
  push:
    tags: ['v*']

jobs:
  build-desktop:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Build Desktop App
        run: npm run build:desktop
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3

  build-mobile:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Setup iOS
        run: |
          cd mobile
          npx cap sync ios
          xcodebuild -workspace ios/App/App.xcworkspace -scheme App archive
      - name: Setup Android
        run: |
          cd mobile
          npx cap sync android
          cd android && ./gradlew assembleRelease
      - name: Upload Mobile Artifacts
        uses: actions/upload-artifact@v3

  release:
    needs: [build-desktop, build-mobile]
    runs-on: ubuntu-latest
    steps:
      - name: Create Release
        uses: ncipollo/release-action@v1
      - name: Upload to App Stores
        run: npm run deploy:stores
```

## Migration Strategy from Current Electron App

### Phase 1: Extract Shared Core (2-3 weeks)
```typescript
// 1. Move existing core modules to shared packages
Current: src/core/* → @shared/core/*
Current: src/services/* → @shared/services/*
Current: src/types/* → @shared/types/*

// 2. Add platform abstraction layer
Create: @shared/platform-bridge/
Implement: Platform service interfaces
Create: Mock implementations for testing

// 3. Update existing Electron app to use shared core
Refactor: Electron-specific services to implement platform interfaces
Update: Import paths to use shared packages
Test: Ensure all existing functionality works
```

### Phase 2: Implement Tauri Desktop (3-4 weeks)
```rust
// 1. Create Tauri project structure
Initialize: New Tauri project
Setup: Rust workspace with shared core
Implement: Platform services in Rust

// 2. Port UI to shared components
Convert: Existing React components to shared UI
Implement: Tauri-specific service bindings
Test: Feature parity with Electron version

// 3. Migration testing
Compare: Performance vs Electron
Test: All features work identically
Validate: Bundle size improvements
```

### Phase 3: Develop Mobile App (4-5 weeks)
```typescript
// 1. Create Capacitor project
Initialize: Capacitor with React
Setup: Platform plugins for mobile
Implement: Mobile-specific services

// 2. Adapt UI for mobile
Design: Mobile-friendly layouts
Implement: Touch interactions
Add: Mobile-specific features (camera, GPS)

// 3. Platform integration
Implement: Serial communication via USB/Bluetooth
Add: File sharing and cloud sync
Test: Cross-platform state synchronization
```

### Phase 4: Integration and Polish (2-3 weeks)
```typescript
// 1. Cross-platform features
Implement: State synchronization
Add: Cloud backup and sync
Test: Multi-device workflows

// 2. Performance optimization
Profile: Bundle sizes and load times
Optimize: Platform-specific performance
Implement: Progressive loading

// 3. Release preparation
Setup: CI/CD for all platforms
Test: End-to-end platform testing
Prepare: App store submissions
```

## Benefits Summary

### Technical Benefits
- **95% Code Sharing**: Business logic, state management, and UI components
- **Performance**: Native performance on all platforms
- **Bundle Size**: 90% smaller than Electron (10MB vs 100MB)
- **Security**: Rust's memory safety + modern web security
- **Maintainability**: Single codebase for all platforms

### Business Benefits
- **Faster Development**: Write once, deploy everywhere
- **Consistent UX**: Identical functionality across platforms
- **Lower Costs**: Single development team for all platforms
- **Market Reach**: Desktop, mobile, and web users
- **Future-Proof**: Modern technology stack

### User Benefits
- **Native Performance**: Fast, responsive apps on all devices
- **Consistent Experience**: Same features and UI across platforms
- **Offline Capability**: Full functionality without internet
- **Modern UI**: Latest design patterns and interactions
- **Cross-Device Sync**: Seamless workflow between devices

This architecture provides a robust foundation for true cross-platform CNC control applications while maximizing code reuse and maintaining native performance on all target platforms.