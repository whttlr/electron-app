# CNC-Core Integration Guide

## Overview

The CNC-Core library provides the fundamental machine control capabilities for the CNC Jog Controls application. This guide covers integration patterns, sharing mechanisms, API usage, and best practices for working with CNC-Core across different environments and team members.

## Table of Contents

1. [CNC-Core Architecture](#cnc-core-architecture)
2. [Installation & Setup](#installation--setup)
3. [Integration Patterns](#integration-patterns)
4. [Sharing CNC-Core](#sharing-cnc-core)
5. [Team Collaboration](#team-collaboration)
6. [Configuration Management](#configuration-management)
7. [Protocol Support](#protocol-support)
8. [Safety Systems](#safety-systems)
9. [Real-time Communication](#real-time-communication)
10. [Testing CNC-Core](#testing-cnc-core)
11. [Troubleshooting](#troubleshooting)
12. [Version Management](#version-management)

---

## CNC-Core Architecture

### Core Components

```typescript
// CNC-Core main architecture
interface CNCCore {
  // Machine control
  machine: MachineController;
  
  // Communication protocols
  protocols: ProtocolManager;
  
  // Safety systems
  safety: SafetyManager;
  
  // Position tracking
  positioning: PositionTracker;
  
  // G-code processing
  gcode: GCodeProcessor;
  
  // Event system
  events: EventManager;
}

// Main CNC-Core integration points
export class CNCCoreIntegration {
  private core: CNCCore;
  private config: CNCCoreConfig;
  private eventBridge: EventBridge;

  constructor(config: CNCCoreConfig) {
    this.config = config;
    this.core = new CNCCore(config);
    this.eventBridge = new EventBridge();
    this.setupIntegration();
  }

  private setupIntegration(): void {
    // Bridge CNC-Core events to application
    this.core.events.on('*', (event) => {
      this.eventBridge.emit(event.type, event.data);
    });

    // Setup safety monitoring
    this.core.safety.on('alert', (alert) => {
      this.handleSafetyAlert(alert);
    });

    // Configure position tracking
    this.core.positioning.on('update', (position) => {
      this.handlePositionUpdate(position);
    });
  }
}
```

### CNC-Core Package Structure

```
cnc-core/
├── src/
│   ├── controllers/          # Machine controllers
│   │   ├── MachineController.ts
│   │   ├── PositionController.ts
│   │   └── SafetyController.ts
│   ├── protocols/           # Communication protocols
│   │   ├── GRBL.ts
│   │   ├── Marlin.ts
│   │   └── CustomProtocol.ts
│   ├── safety/              # Safety systems
│   │   ├── SafetyManager.ts
│   │   ├── LimitSwitches.ts
│   │   └── EmergencyStop.ts
│   ├── gcode/               # G-code processing
│   │   ├── Parser.ts
│   │   ├── Validator.ts
│   │   └── Interpreter.ts
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript definitions
├── dist/                    # Compiled library
├── docs/                    # Documentation
├── examples/                # Usage examples
└── tests/                   # Test suite
```

---

## Installation & Setup

### Local Development Setup

#### 1. **Clone CNC-Core Repository**

```bash
# Clone the CNC-Core library
git clone https://github.com/your-org/cnc-core.git
cd cnc-core

# Install dependencies
npm install

# Build the library
npm run build

# Run tests to verify setup
npm test
```

#### 2. **Link for Local Development**

```bash
# In cnc-core directory
npm link

# In electron-app directory
cd /path/to/electron-app
npm link cnc-core

# Verify linking
npm ls cnc-core
```

#### 3. **Development Commands**

```bash
# CNC-Core development
npm run dev          # Start development build with watch
npm run build        # Build for production
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run docs         # Generate documentation

# Integration testing
npm run test:integration  # Test with real hardware
npm run test:simulation   # Test with simulator
```

### Package Installation

#### Published Package Installation

```bash
# Install from npm registry
npm install cnc-core@latest

# Install specific version
npm install cnc-core@1.2.3

# Install beta version
npm install cnc-core@beta

# Install from GitHub (for development versions)
npm install github:your-org/cnc-core#develop
```

#### Package.json Configuration

```json
{
  "dependencies": {
    "cnc-core": "^1.2.3"
  },
  "devDependencies": {
    "@types/cnc-core": "^1.2.3"
  },
  "peerDependencies": {
    "serialport": "^10.0.0",
    "ws": "^8.0.0"
  }
}
```

---

## Integration Patterns

### Basic Integration

```typescript
// src/services/cnc-core/index.ts
import { CNCCore, CNCCoreConfig } from 'cnc-core';
import { EventEmitter } from 'events';

export class CNCCoreService extends EventEmitter {
  private core: CNCCore;
  private isInitialized: boolean = false;

  constructor(private config: CNCCoreConfig) {
    super();
    this.core = new CNCCore(config);
    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    try {
      await this.core.initialize();
      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async connect(connectionConfig: ConnectionConfig): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CNC-Core not initialized');
    }

    await this.core.machine.connect(connectionConfig);
    this.emit('connected');
  }

  async jog(axis: Axis, distance: number, speed?: number): Promise<void> {
    this.validateConnection();
    
    const jogParams = {
      axis,
      distance,
      speed: speed || this.config.defaultSpeed
    };

    await this.core.machine.jog(jogParams);
  }

  async home(axes?: Axis[]): Promise<void> {
    this.validateConnection();
    await this.core.machine.home(axes);
  }

  async emergencyStop(): Promise<void> {
    await this.core.safety.emergencyStop();
    this.emit('emergencyStop');
  }

  getPosition(): Position {
    return this.core.positioning.getCurrentPosition();
  }

  private setupEventHandlers(): void {
    // Machine events
    this.core.machine.on('stateChange', (state) => {
      this.emit('machineStateChange', state);
    });

    // Position events
    this.core.positioning.on('positionUpdate', (position) => {
      this.emit('positionUpdate', position);
    });

    // Safety events
    this.core.safety.on('alert', (alert) => {
      this.emit('safetyAlert', alert);
    });

    // Error events
    this.core.on('error', (error) => {
      this.emit('error', error);
    });
  }

  private validateConnection(): void {
    if (!this.core.machine.isConnected()) {
      throw new Error('Machine not connected');
    }
  }
}
```

### Advanced Integration with React

```typescript
// src/hooks/useCNCCore.ts
import { useState, useEffect, useCallback } from 'react';
import { CNCCoreService } from '../services/cnc-core';
import { useApiClient } from './useApiClient';

export interface UseCNCCoreReturn {
  isConnected: boolean;
  isInitialized: boolean;
  position: Position | null;
  machineState: MachineState;
  connect: (config: ConnectionConfig) => Promise<void>;
  jog: (axis: Axis, distance: number, speed?: number) => Promise<void>;
  home: (axes?: Axis[]) => Promise<void>;
  emergencyStop: () => Promise<void>;
  error: Error | null;
}

export const useCNCCore = (): UseCNCCoreReturn => {
  const [cncService] = useState(() => new CNCCoreService(getCNCConfig()));
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [machineState, setMachineState] = useState<MachineState>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    // Initialize CNC-Core
    cncService.initialize()
      .then(() => setIsInitialized(true))
      .catch(setError);

    // Setup event listeners
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    const handlePositionUpdate = (newPosition: Position) => {
      setPosition(newPosition);
      // Sync with API
      apiClient.post('/machine/position', { body: newPosition });
    };
    const handleStateChange = (state: MachineState) => setMachineState(state);
    const handleError = (err: Error) => setError(err);

    cncService.on('connected', handleConnected);
    cncService.on('disconnected', handleDisconnected);
    cncService.on('positionUpdate', handlePositionUpdate);
    cncService.on('machineStateChange', handleStateChange);
    cncService.on('error', handleError);

    return () => {
      cncService.removeAllListeners();
    };
  }, [cncService, apiClient]);

  const connect = useCallback(async (config: ConnectionConfig) => {
    try {
      await cncService.connect(config);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [cncService]);

  const jog = useCallback(async (axis: Axis, distance: number, speed?: number) => {
    try {
      await cncService.jog(axis, distance, speed);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [cncService]);

  const home = useCallback(async (axes?: Axis[]) => {
    try {
      await cncService.home(axes);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [cncService]);

  const emergencyStop = useCallback(async () => {
    try {
      await cncService.emergencyStop();
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [cncService]);

  return {
    isConnected,
    isInitialized,
    position,
    machineState,
    connect,
    jog,
    home,
    emergencyStop,
    error
  };
};
```

---

## Sharing CNC-Core

### Team Development Setup

#### 1. **Shared Development Environment**

```bash
# Setup shared development environment
git clone https://github.com/your-org/cnc-core.git
cd cnc-core

# Install dependencies
npm install

# Setup pre-commit hooks
npm run setup-hooks

# Create development branch
git checkout -b feature/new-functionality

# Link for local development
npm link
```

#### 2. **Package Distribution**

```typescript
// scripts/publish-cnc-core.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function publishCNCCore() {
  // Read package.json
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log(`Publishing CNC-Core v${packageJson.version}`);
  
  // Run tests
  console.log('Running tests...');
  await execAsync('npm test');
  
  // Build library
  console.log('Building library...');
  await execAsync('npm run build');
  
  // Generate documentation
  console.log('Generating documentation...');
  await execAsync('npm run docs');
  
  // Publish to npm
  console.log('Publishing to npm...');
  await execAsync('npm publish');
  
  // Create GitHub release
  console.log('Creating GitHub release...');
  await execAsync(`gh release create v${packageJson.version} --title "Release v${packageJson.version}" --generate-notes`);
  
  console.log('CNC-Core published successfully!');
}

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

publishCNCCore().catch(console.error);
```

#### 3. **Version Synchronization**

```typescript
// src/services/cnc-core/version-sync.ts
export class CNCCoreVersionSync {
  private static instance: CNCCoreVersionSync;
  private currentVersion: string;
  private availableVersions: string[] = [];

  static getInstance(): CNCCoreVersionSync {
    if (!CNCCoreVersionSync.instance) {
      CNCCoreVersionSync.instance = new CNCCoreVersionSync();
    }
    return CNCCoreVersionSync.instance;
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    try {
      // Check npm registry for latest version
      const response = await fetch('https://registry.npmjs.org/cnc-core');
      const data = await response.json();
      
      this.availableVersions = Object.keys(data.versions);
      const latestVersion = data['dist-tags'].latest;
      
      return {
        currentVersion: this.currentVersion,
        latestVersion,
        hasUpdate: this.compareVersions(latestVersion, this.currentVersion) > 0,
        availableVersions: this.availableVersions
      };
    } catch (error) {
      console.error('Failed to check for CNC-Core updates:', error);
      throw error;
    }
  }

  async updateToVersion(version: string): Promise<void> {
    // This would typically require application restart
    console.log(`Updating CNC-Core to version ${version}`);
    
    // In a real scenario, this might:
    // 1. Download the new version
    // 2. Update package.json
    // 3. Restart the application
    
    throw new Error('CNC-Core updates require application restart');
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  }
}

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  availableVersions: string[];
}
```

### Development Workflow

#### 1. **Feature Development**

```bash
# Create feature branch
git checkout -b feature/improved-positioning

# Make changes to CNC-Core
# ... code changes ...

# Test changes
npm test
npm run test:integration

# Build and test in electron-app
npm run build
cd ../electron-app
npm link cnc-core
npm start

# Commit and push changes
git add .
git commit -m "Improve positioning accuracy"
git push origin feature/improved-positioning

# Create pull request
gh pr create --title "Improve positioning accuracy" --body "Enhanced positioning system with better accuracy"
```

#### 2. **Release Process**

```bash
# Switch to main branch
git checkout main
git pull origin main

# Update version
npm version minor # or patch/major

# Update CHANGELOG.md
# ... add release notes ...

# Commit version update
git add .
git commit -m "Release v1.3.0"

# Tag release
git tag v1.3.0

# Push changes and tags
git push origin main --tags

# Publish to npm
npm publish

# Update electron-app to use new version
cd ../electron-app
npm update cnc-core
```

---

## Team Collaboration

### Shared Configuration

```typescript
// shared-configs/cnc-core-configs.ts
export const teamConfigs = {
  development: {
    machine: {
      type: 'simulator',
      connectionString: 'simulator://localhost:3001',
      safetyEnabled: true,
      debugMode: true
    },
    positioning: {
      units: 'mm',
      precision: 3,
      homePosition: { x: 0, y: 0, z: 0 }
    }
  },
  
  testing: {
    machine: {
      type: 'grbl',
      connectionString: 'serial:///dev/ttyUSB0:115200',
      safetyEnabled: true,
      debugMode: false
    },
    positioning: {
      units: 'mm',
      precision: 3,
      homePosition: { x: 0, y: 0, z: 50 }
    }
  },
  
  production: {
    machine: {
      type: 'grbl',
      connectionString: process.env.MACHINE_CONNECTION,
      safetyEnabled: true,
      debugMode: false
    },
    positioning: {
      units: 'mm',
      precision: 3,
      homePosition: { x: 0, y: 0, z: 100 }
    }
  }
};

export function getCNCConfig(environment: keyof typeof teamConfigs = 'development') {
  return teamConfigs[environment];
}
```

### Team Documentation

```markdown
# CNC-Core Team Guidelines

## Development Environment

1. **Required Tools**:
   - Node.js 18+
   - npm 9+
   - Git 2.30+
   - Hardware simulator (for testing)

2. **Setup Process**:
   ```bash
   git clone https://github.com/your-org/cnc-core.git
   cd cnc-core
   npm install
   npm link
   npm test
   ```

3. **Testing Hardware**:
   - Simulator: Always available for development
   - Test bench: Available during business hours
   - Production hardware: Scheduled access only

## Contribution Workflow

1. **Create feature branch**: `git checkout -b feature/description`
2. **Write tests**: All new functionality must have tests
3. **Update documentation**: Update README and inline docs
4. **Test thoroughly**: Unit tests + integration tests
5. **Create pull request**: Include detailed description
6. **Code review**: At least 2 team members must approve
7. **Merge and deploy**: Merge to main triggers deployment

## Code Standards

- **TypeScript**: 100% type coverage required
- **Testing**: 95%+ code coverage required
- **Documentation**: All public APIs must be documented
- **Safety**: All machine operations must include safety checks
```

### Code Review Process

```typescript
// .github/pull_request_template.md
export const prTemplate = `
## CNC-Core Pull Request

### Description
Brief description of changes

### Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Hardware testing completed
- [ ] Simulator testing completed

### Safety Checklist
- [ ] Safety systems still functional
- [ ] Emergency stop tested
- [ ] Limit switches respected
- [ ] No unsafe machine movements

### Deployment
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)

### Reviewer Notes
<!-- Any specific areas that need attention -->
`;
```

---

## Configuration Management

### CNC-Core Configuration Structure

```typescript
// src/config/cnc-core-config.ts
export interface CNCCoreConfig {
  machine: MachineConfig;
  positioning: PositioningConfig;
  safety: SafetyConfig;
  communication: CommunicationConfig;
  debugging: DebuggingConfig;
}

export interface MachineConfig {
  type: 'grbl' | 'marlin' | 'simulator' | 'custom';
  connectionString: string;
  baudRate?: number;
  timeout: number;
  retryAttempts: number;
  safetyEnabled: boolean;
  enableSoftLimits: boolean;
  enableHardLimits: boolean;
}

export interface PositioningConfig {
  units: 'mm' | 'inches';
  precision: number;
  homePosition: Position;
  workspaceSize: Dimensions;
  maxSpeed: {
    x: number;
    y: number;
    z: number;
  };
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SafetyConfig {
  emergencyStopEnabled: boolean;
  limitSwitchesEnabled: boolean;
  collisionDetection: boolean;
  safetyZones: SafetyZone[];
  maxMovementSpeed: number;
  timeoutSettings: {
    movement: number;
    communication: number;
    safety: number;
  };
}

// Configuration loading
export class CNCCoreConfigLoader {
  static async loadConfig(environment: string): Promise<CNCCoreConfig> {
    // Load from multiple sources
    const baseConfig = await this.loadBaseConfig();
    const envConfig = await this.loadEnvironmentConfig(environment);
    const userConfig = await this.loadUserConfig();
    
    // Merge configurations (user > env > base)
    return this.mergeConfigs(baseConfig, envConfig, userConfig);
  }

  private static async loadBaseConfig(): Promise<Partial<CNCCoreConfig>> {
    // Load from embedded defaults
    return {
      machine: {
        type: 'simulator',
        connectionString: 'simulator://localhost',
        timeout: 5000,
        retryAttempts: 3,
        safetyEnabled: true,
        enableSoftLimits: true,
        enableHardLimits: true
      },
      positioning: {
        units: 'mm',
        precision: 3,
        homePosition: { x: 0, y: 0, z: 0 },
        workspaceSize: { width: 300, height: 300, depth: 100 }
      },
      safety: {
        emergencyStopEnabled: true,
        limitSwitchesEnabled: true,
        collisionDetection: true,
        safetyZones: [],
        maxMovementSpeed: 1000
      }
    };
  }

  private static async loadEnvironmentConfig(env: string): Promise<Partial<CNCCoreConfig>> {
    try {
      const configPath = `./config/cnc-core-${env}.json`;
      const configFile = await fs.readFile(configPath, 'utf8');
      return JSON.parse(configFile);
    } catch (error) {
      console.warn(`No environment config found for ${env}`);
      return {};
    }
  }

  private static async loadUserConfig(): Promise<Partial<CNCCoreConfig>> {
    try {
      // Load from user's home directory or app data
      const userConfigPath = path.join(os.homedir(), '.cnc-controls', 'cnc-core.json');
      const configFile = await fs.readFile(userConfigPath, 'utf8');
      return JSON.parse(configFile);
    } catch (error) {
      console.warn('No user config found');
      return {};
    }
  }

  private static mergeConfigs(...configs: Partial<CNCCoreConfig>[]): CNCCoreConfig {
    // Deep merge configuration objects
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {}) as CNCCoreConfig;
  }

  private static deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}
```

### Dynamic Configuration Updates

```typescript
// src/config/dynamic-config.ts
export class DynamicCNCConfig {
  private config: CNCCoreConfig;
  private watchers: Map<string, ConfigWatcher[]> = new Map();
  private fileWatcher: fs.FSWatcher | null = null;

  constructor(private configPath: string) {
    this.setupFileWatcher();
  }

  async reloadConfig(): Promise<void> {
    try {
      const newConfig = await CNCCoreConfigLoader.loadConfig(process.env.NODE_ENV || 'development');
      const changes = this.detectChanges(this.config, newConfig);
      
      this.config = newConfig;
      
      // Notify watchers of changes
      for (const [path, change] of changes) {
        const watchers = this.watchers.get(path) || [];
        watchers.forEach(watcher => watcher(change));
      }
    } catch (error) {
      console.error('Failed to reload CNC-Core config:', error);
    }
  }

  watchConfig(path: string, callback: ConfigWatcher): void {
    const watchers = this.watchers.get(path) || [];
    watchers.push(callback);
    this.watchers.set(path, watchers);
  }

  private setupFileWatcher(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }

    this.fileWatcher = fs.watch(this.configPath, (eventType, filename) => {
      if (eventType === 'change') {
        console.log('Config file changed, reloading...');
        this.reloadConfig();
      }
    });
  }

  private detectChanges(oldConfig: CNCCoreConfig, newConfig: CNCCoreConfig): Map<string, ConfigChange> {
    const changes = new Map<string, ConfigChange>();
    
    this.compareObjects('', oldConfig, newConfig, changes);
    
    return changes;
  }

  private compareObjects(basePath: string, oldObj: any, newObj: any, changes: Map<string, ConfigChange>): void {
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    
    for (const key of allKeys) {
      const path = basePath ? `${basePath}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];
      
      if (typeof oldValue === 'object' && typeof newValue === 'object') {
        this.compareObjects(path, oldValue, newValue, changes);
      } else if (oldValue !== newValue) {
        changes.set(path, {
          path,
          oldValue,
          newValue,
          changeType: oldValue === undefined ? 'added' : newValue === undefined ? 'removed' : 'modified'
        });
      }
    }
  }
}

export interface ConfigChange {
  path: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export type ConfigWatcher = (change: ConfigChange) => void;
```

---

## Protocol Support

### Protocol Implementation

```typescript
// src/protocols/protocol-manager.ts
export interface Protocol {
  name: string;
  version: string;
  connect(connectionString: string): Promise<void>;
  disconnect(): Promise<void>;
  sendCommand(command: string): Promise<string>;
  sendGCode(gcode: string): Promise<GCodeResult>;
  getStatus(): Promise<ProtocolStatus>;
  getPosition(): Promise<Position>;
  jog(axis: Axis, distance: number, speed: number): Promise<void>;
  home(axes?: Axis[]): Promise<void>;
  emergencyStop(): Promise<void>;
}

export class ProtocolManager {
  private protocols: Map<string, Protocol> = new Map();
  private activeProtocol: Protocol | null = null;

  constructor() {
    this.registerBuiltInProtocols();
  }

  registerProtocol(name: string, protocol: Protocol): void {
    this.protocols.set(name, protocol);
  }

  async activateProtocol(name: string, connectionString: string): Promise<void> {
    const protocol = this.protocols.get(name);
    if (!protocol) {
      throw new Error(`Protocol not found: ${name}`);
    }

    // Disconnect current protocol if active
    if (this.activeProtocol) {
      await this.activeProtocol.disconnect();
    }

    // Connect new protocol
    await protocol.connect(connectionString);
    this.activeProtocol = protocol;
  }

  getActiveProtocol(): Protocol | null {
    return this.activeProtocol;
  }

  getAvailableProtocols(): string[] {
    return Array.from(this.protocols.keys());
  }

  private registerBuiltInProtocols(): void {
    // GRBL Protocol
    this.registerProtocol('grbl', new GRBLProtocol());
    
    // Marlin Protocol
    this.registerProtocol('marlin', new MarlinProtocol());
    
    // Simulator Protocol
    this.registerProtocol('simulator', new SimulatorProtocol());
  }
}

// GRBL Protocol Implementation
export class GRBLProtocol implements Protocol {
  name = 'GRBL';
  version = '1.1';
  private connection: SerialPort | null = null;
  private responseBuffer: string = '';

  async connect(connectionString: string): Promise<void> {
    const [, port, baudRateStr] = connectionString.match(/serial:\/\/(.+):(\d+)/) || [];
    const baudRate = parseInt(baudRateStr) || 115200;

    this.connection = new SerialPort({
      path: port,
      baudRate,
      autoOpen: false
    });

    return new Promise((resolve, reject) => {
      this.connection!.open((error) => {
        if (error) {
          reject(error);
        } else {
          this.setupDataHandling();
          resolve();
        }
      });
    });
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connection?.isOpen) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, 5000);

      const responseHandler = (response: string) => {
        clearTimeout(timeout);
        resolve(response);
      };

      this.connection!.write(command + '\n', (error) => {
        if (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      // Wait for response (simplified)
      this.once('response', responseHandler);
    });
  }

  async sendGCode(gcode: string): Promise<GCodeResult> {
    const response = await this.sendCommand(gcode);
    
    return {
      command: gcode,
      response,
      success: response.includes('ok'),
      executionTime: Date.now() // Simplified
    };
  }

  async getPosition(): Promise<Position> {
    const response = await this.sendCommand('?');
    return this.parsePositionResponse(response);
  }

  async jog(axis: Axis, distance: number, speed: number): Promise<void> {
    const command = `$J=G91${axis.toUpperCase()}${distance}F${speed}`;
    await this.sendCommand(command);
  }

  async home(axes?: Axis[]): Promise<void> {
    if (axes && axes.length > 0) {
      const axesStr = axes.map(a => a.toUpperCase()).join('');
      await this.sendCommand(`$H${axesStr}`);
    } else {
      await this.sendCommand('$H');
    }
  }

  async emergencyStop(): Promise<void> {
    // Send reset command
    this.connection?.write('\x18'); // Ctrl-X
  }

  private setupDataHandling(): void {
    this.connection!.on('data', (data: Buffer) => {
      this.responseBuffer += data.toString();
      
      // Process complete lines
      const lines = this.responseBuffer.split('\n');
      this.responseBuffer = lines.pop() || '';
      
      lines.forEach(line => {
        if (line.trim()) {
          this.emit('response', line.trim());
        }
      });
    });
  }

  private parsePositionResponse(response: string): Position {
    // Parse GRBL status response (simplified)
    const match = response.match(/MPos:([-\d.]+),([-\d.]+),([-\d.]+)/);
    if (match) {
      return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2]),
        z: parseFloat(match[3]),
        units: 'mm',
        timestamp: new Date()
      };
    }
    throw new Error('Invalid position response');
  }
}
```

---

## Safety Systems

### Safety Manager Implementation

```typescript
// src/safety/safety-manager.ts
export class SafetyManager extends EventEmitter {
  private enabled: boolean = true;
  private emergencyStopActive: boolean = false;
  private safetyZones: SafetyZone[] = [];
  private limitSwitches: Map<string, boolean> = new Map();
  private watchdog: NodeJS.Timeout | null = null;

  constructor(private config: SafetyConfig) {
    super();
    this.setupSafetyZones(config.safetyZones);
    this.startWatchdog();
  }

  async emergencyStop(): Promise<void> {
    console.log('EMERGENCY STOP ACTIVATED');
    this.emergencyStopActive = true;
    
    // Emit emergency event
    this.emit('emergencyStop', {
      timestamp: new Date(),
      reason: 'Manual emergency stop'
    });

    // Stop all movement immediately
    await this.stopAllMovement();
    
    // Disable further movement
    this.enabled = false;
  }

  async resetEmergencyStop(): Promise<void> {
    if (!this.emergencyStopActive) {
      return;
    }

    console.log('Resetting emergency stop');
    this.emergencyStopActive = false;
    this.enabled = true;
    
    this.emit('emergencyReset', {
      timestamp: new Date()
    });
  }

  validateMovement(currentPos: Position, targetPos: Position): SafetyValidation {
    if (!this.enabled) {
      return {
        safe: false,
        reason: 'Safety system disabled',
        severity: 'critical'
      };
    }

    if (this.emergencyStopActive) {
      return {
        safe: false,
        reason: 'Emergency stop active',
        severity: 'critical'
      };
    }

    // Check limit switches
    const limitCheck = this.checkLimitSwitches(targetPos);
    if (!limitCheck.safe) {
      return limitCheck;
    }

    // Check safety zones
    const zoneCheck = this.checkSafetyZones(targetPos);
    if (!zoneCheck.safe) {
      return zoneCheck;
    }

    // Check movement speed
    const speedCheck = this.validateMovementSpeed(currentPos, targetPos);
    if (!speedCheck.safe) {
      return speedCheck;
    }

    return {
      safe: true,
      reason: 'Movement validated',
      severity: 'info'
    };
  }

  addSafetyZone(zone: SafetyZone): void {
    this.safetyZones.push(zone);
    this.emit('safetyZoneAdded', zone);
  }

  removeSafetyZone(zoneId: string): void {
    const index = this.safetyZones.findIndex(zone => zone.id === zoneId);
    if (index !== -1) {
      const removed = this.safetyZones.splice(index, 1)[0];
      this.emit('safetyZoneRemoved', removed);
    }
  }

  updateLimitSwitch(name: string, active: boolean): void {
    const wasActive = this.limitSwitches.get(name);
    this.limitSwitches.set(name, active);
    
    if (active && !wasActive) {
      this.emit('limitSwitchTriggered', {
        switch: name,
        timestamp: new Date()
      });
      
      // Auto emergency stop on limit switch
      this.emergencyStop();
    }
  }

  private checkLimitSwitches(position: Position): SafetyValidation {
    for (const [switchName, active] of this.limitSwitches) {
      if (active) {
        return {
          safe: false,
          reason: `Limit switch ${switchName} is active`,
          severity: 'critical'
        };
      }
    }

    return { safe: true, reason: 'Limit switches OK', severity: 'info' };
  }

  private checkSafetyZones(position: Position): SafetyValidation {
    for (const zone of this.safetyZones) {
      if (zone.type === 'forbidden' && this.isPositionInZone(position, zone)) {
        return {
          safe: false,
          reason: `Position would enter forbidden zone: ${zone.name}`,
          severity: 'warning'
        };
      }
    }

    return { safe: true, reason: 'Safety zones OK', severity: 'info' };
  }

  private validateMovementSpeed(from: Position, to: Position): SafetyValidation {
    const distance = Math.sqrt(
      Math.pow(to.x - from.x, 2) +
      Math.pow(to.y - from.y, 2) +
      Math.pow(to.z - from.z, 2)
    );

    if (distance > this.config.maxMovementSpeed) {
      return {
        safe: false,
        reason: `Movement distance ${distance}mm exceeds maximum ${this.config.maxMovementSpeed}mm`,
        severity: 'warning'
      };
    }

    return { safe: true, reason: 'Movement speed OK', severity: 'info' };
  }

  private isPositionInZone(position: Position, zone: SafetyZone): boolean {
    return (
      position.x >= zone.bounds.min.x && position.x <= zone.bounds.max.x &&
      position.y >= zone.bounds.min.y && position.y <= zone.bounds.max.y &&
      position.z >= zone.bounds.min.z && position.z <= zone.bounds.max.z
    );
  }

  private startWatchdog(): void {
    this.watchdog = setInterval(() => {
      // Check safety systems periodically
      this.performSafetyCheck();
    }, 1000); // Check every second
  }

  private performSafetyCheck(): void {
    // Emit heartbeat
    this.emit('safetyHeartbeat', {
      enabled: this.enabled,
      emergencyStopActive: this.emergencyStopActive,
      activeLimitSwitches: Array.from(this.limitSwitches.entries()).filter(([, active]) => active),
      timestamp: new Date()
    });
  }

  private async stopAllMovement(): Promise<void> {
    // This would interface with the active protocol to stop movement
    // Implementation depends on the specific machine protocol
    console.log('Stopping all machine movement');
  }

  private setupSafetyZones(zones: SafetyZone[]): void {
    this.safetyZones = [...zones];
  }
}

export interface SafetyZone {
  id: string;
  name: string;
  type: 'forbidden' | 'warning' | 'required';
  bounds: {
    min: Position;
    max: Position;
  };
  description?: string;
}

export interface SafetyValidation {
  safe: boolean;
  reason: string;
  severity: 'info' | 'warning' | 'critical';
}
```

---

## Real-time Communication

### Event System Integration

```typescript
// src/events/cnc-event-bridge.ts
export class CNCEventBridge extends EventEmitter {
  private cncCore: CNCCore;
  private webSocketClients: Set<WebSocket> = new Set();
  private eventHistory: CNCEvent[] = [];
  private maxHistorySize: number = 1000;

  constructor(cncCore: CNCCore) {
    super();
    this.cncCore = cncCore;
    this.setupCNCEventListeners();
  }

  addWebSocketClient(ws: WebSocket): void {
    this.webSocketClients.add(ws);
    
    // Send current state to new client
    this.sendCurrentState(ws);
    
    // Remove client when disconnected
    ws.on('close', () => {
      this.webSocketClients.delete(ws);
    });
  }

  private setupCNCEventListeners(): void {
    // Position updates
    this.cncCore.positioning.on('positionUpdate', (position: Position) => {
      const event: CNCEvent = {
        type: 'position_update',
        data: position,
        timestamp: new Date()
      };
      
      this.broadcastEvent(event);
      this.addToHistory(event);
    });

    // Machine state changes
    this.cncCore.machine.on('stateChange', (state: MachineState) => {
      const event: CNCEvent = {
        type: 'machine_state',
        data: { state },
        timestamp: new Date()
      };
      
      this.broadcastEvent(event);
      this.addToHistory(event);
    });

    // Safety events
    this.cncCore.safety.on('alert', (alert: SafetyAlert) => {
      const event: CNCEvent = {
        type: 'safety_alert',
        data: alert,
        timestamp: new Date(),
        priority: 'high'
      };
      
      this.broadcastEvent(event);
      this.addToHistory(event);
    });

    // G-code execution
    this.cncCore.gcode.on('commandExecuted', (result: GCodeResult) => {
      const event: CNCEvent = {
        type: 'gcode_executed',
        data: result,
        timestamp: new Date()
      };
      
      this.broadcastEvent(event);
      this.addToHistory(event);
    });

    // Error events
    this.cncCore.on('error', (error: Error) => {
      const event: CNCEvent = {
        type: 'error',
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        timestamp: new Date(),
        priority: 'high'
      };
      
      this.broadcastEvent(event);
      this.addToHistory(event);
    });
  }

  private broadcastEvent(event: CNCEvent): void {
    const message = JSON.stringify(event);
    
    this.webSocketClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
    
    // Also emit locally for application use
    this.emit(event.type, event.data);
  }

  private sendCurrentState(ws: WebSocket): void {
    if (ws.readyState !== WebSocket.OPEN) return;

    // Send current machine state
    const currentState: CNCEvent = {
      type: 'current_state',
      data: {
        position: this.cncCore.positioning.getCurrentPosition(),
        machineState: this.cncCore.machine.getCurrentState(),
        safetyStatus: this.cncCore.safety.getStatus(),
        isConnected: this.cncCore.machine.isConnected()
      },
      timestamp: new Date()
    };

    ws.send(JSON.stringify(currentState));
  }

  private addToHistory(event: CNCEvent): void {
    this.eventHistory.push(event);
    
    // Trim history if it gets too large
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize / 2);
    }
  }

  getEventHistory(filter?: EventHistoryFilter): CNCEvent[] {
    let filtered = this.eventHistory;
    
    if (filter?.types) {
      filtered = filtered.filter(event => filter.types!.includes(event.type));
    }
    
    if (filter?.since) {
      filtered = filtered.filter(event => event.timestamp >= filter.since!);
    }
    
    if (filter?.priority) {
      filtered = filtered.filter(event => event.priority === filter.priority);
    }
    
    return filtered.slice(-100); // Return last 100 events
  }
}

export interface CNCEvent {
  type: string;
  data: any;
  timestamp: Date;
  priority?: 'low' | 'normal' | 'high';
}

export interface EventHistoryFilter {
  types?: string[];
  since?: Date;
  priority?: 'low' | 'normal' | 'high';
}
```

---

## Testing CNC-Core

### Unit Testing

```typescript
// src/__tests__/cnc-core.test.ts
import { CNCCore } from '../index';
import { MockProtocol } from '../test-utils/mock-protocol';

describe('CNC-Core', () => {
  let cncCore: CNCCore;
  let mockProtocol: MockProtocol;

  beforeEach(() => {
    mockProtocol = new MockProtocol();
    cncCore = new CNCCore({
      machine: {
        type: 'mock',
        connectionString: 'mock://test',
        safetyEnabled: true
      }
    });
    
    // Inject mock protocol
    cncCore.protocolManager.registerProtocol('mock', mockProtocol);
  });

  afterEach(() => {
    cncCore.disconnect();
  });

  describe('Machine Control', () => {
    it('should connect to machine successfully', async () => {
      await cncCore.connect();
      expect(cncCore.machine.isConnected()).toBe(true);
    });

    it('should perform jog movement', async () => {
      await cncCore.connect();
      
      const initialPosition = cncCore.positioning.getCurrentPosition();
      await cncCore.machine.jog('x', 10, 100);
      
      const newPosition = cncCore.positioning.getCurrentPosition();
      expect(newPosition.x).toBe(initialPosition.x + 10);
    });

    it('should respect safety limits', async () => {
      await cncCore.connect();
      
      // Try to move beyond safety limits
      await expect(
        cncCore.machine.jog('x', 1000, 100)
      ).rejects.toThrow('Movement exceeds safety limits');
    });

    it('should handle emergency stop', async () => {
      await cncCore.connect();
      
      const emergencyPromise = new Promise(resolve => {
        cncCore.safety.once('emergencyStop', resolve);
      });
      
      await cncCore.safety.emergencyStop();
      await emergencyPromise;
      
      expect(cncCore.safety.isEmergencyActive()).toBe(true);
    });
  });

  describe('G-code Processing', () => {
    it('should parse G-code correctly', () => {
      const gcode = 'G0 X10 Y20 Z5';
      const parsed = cncCore.gcode.parse(gcode);
      
      expect(parsed.command).toBe('G0');
      expect(parsed.parameters).toEqual({ X: 10, Y: 20, Z: 5 });
    });

    it('should validate G-code before execution', () => {
      const invalidGcode = 'G999 X10'; // Invalid G-code
      const validation = cncCore.gcode.validate(invalidGcode);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Unknown G-code command: G999');
    });

    it('should execute valid G-code', async () => {
      await cncCore.connect();
      
      const result = await cncCore.gcode.execute('G0 X10 Y10');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('G0 X10 Y10');
    });
  });

  describe('Event System', () => {
    it('should emit position updates', (done) => {
      cncCore.positioning.on('positionUpdate', (position) => {
        expect(position).toHaveProperty('x');
        expect(position).toHaveProperty('y');
        expect(position).toHaveProperty('z');
        done();
      });
      
      // Simulate position update
      mockProtocol.simulatePositionUpdate({ x: 5, y: 5, z: 0 });
    });

    it('should emit safety alerts', (done) => {
      cncCore.safety.on('alert', (alert) => {
        expect(alert.type).toBe('limit_switch');
        expect(alert.severity).toBe('critical');
        done();
      });
      
      // Simulate limit switch trigger
      mockProtocol.simulateLimitSwitchTrigger('x_max');
    });
  });
});
```

### Integration Testing

```typescript
// src/__tests__/integration.test.ts
describe('CNC-Core Integration Tests', () => {
  let testHarness: TestHarness;

  beforeAll(async () => {
    testHarness = new TestHarness();
    await testHarness.setup();
  });

  afterAll(async () => {
    await testHarness.cleanup();
  });

  it('should complete full workflow', async () => {
    // Connect to test hardware
    await testHarness.connect();
    
    // Home the machine
    await testHarness.home();
    
    // Execute test G-code program
    const program = [
      'G0 X0 Y0 Z5',    // Move to start position
      'G1 X10 Y0 F100', // Linear move
      'G1 X10 Y10',     // Another move
      'G0 Z10',         // Lift up
      'G0 X0 Y0'        // Return home
    ];
    
    for (const line of program) {
      const result = await testHarness.executeGCode(line);
      expect(result.success).toBe(true);
    }
    
    // Verify final position
    const finalPosition = testHarness.getCurrentPosition();
    expect(finalPosition.x).toBeCloseTo(0, 1);
    expect(finalPosition.y).toBeCloseTo(0, 1);
  });

  it('should handle errors gracefully', async () => {
    await testHarness.connect();
    
    // Try to execute invalid G-code
    const result = await testHarness.executeGCode('G999 X10');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown command');
    
    // Machine should still be responsive
    expect(testHarness.isConnected()).toBe(true);
  });
});

class TestHarness {
  private cncCore: CNCCore;
  
  async setup(): Promise<void> {
    this.cncCore = new CNCCore({
      machine: {
        type: process.env.TEST_MACHINE_TYPE || 'simulator',
        connectionString: process.env.TEST_CONNECTION || 'simulator://localhost',
        safetyEnabled: true
      }
    });
  }
  
  async connect(): Promise<void> {
    await this.cncCore.connect();
  }
  
  async home(): Promise<void> {
    await this.cncCore.machine.home();
  }
  
  async executeGCode(gcode: string): Promise<GCodeResult> {
    return this.cncCore.gcode.execute(gcode);
  }
  
  getCurrentPosition(): Position {
    return this.cncCore.positioning.getCurrentPosition();
  }
  
  isConnected(): boolean {
    return this.cncCore.machine.isConnected();
  }
  
  async cleanup(): Promise<void> {
    if (this.cncCore.machine.isConnected()) {
      await this.cncCore.disconnect();
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. **Connection Problems**

```typescript
// Debug connection issues
const debugConnection = async (connectionString: string) => {
  console.log('Debugging connection:', connectionString);
  
  try {
    // Test basic connectivity
    const protocol = new GRBLProtocol();
    await protocol.connect(connectionString);
    
    console.log('✓ Basic connection successful');
    
    // Test command response
    const response = await protocol.sendCommand('?');
    console.log('✓ Command response:', response);
    
    // Test position query
    const position = await protocol.getPosition();
    console.log('✓ Position query:', position);
    
  } catch (error) {
    console.error('✗ Connection failed:', error);
    
    if (error.message.includes('ENOENT')) {
      console.log('Suggestion: Check if the device is connected and the port exists');
    } else if (error.message.includes('Access denied')) {
      console.log('Suggestion: Check permissions or if another application is using the port');
    } else if (error.message.includes('timeout')) {
      console.log('Suggestion: Check baud rate and cable connection');
    }
  }
};
```

#### 2. **Performance Issues**

```typescript
// Monitor CNC-Core performance
const performanceMonitor = {
  commandTimes: [] as number[],
  positionUpdateRate: 0,
  lastPositionUpdate: Date.now(),
  
  startMonitoring(cncCore: CNCCore) {
    // Monitor command execution time
    const originalSendCommand = cncCore.machine.sendCommand;
    cncCore.machine.sendCommand = async function(command: string) {
      const start = Date.now();
      const result = await originalSendCommand.call(this, command);
      const duration = Date.now() - start;
      
      performanceMonitor.commandTimes.push(duration);
      if (performanceMonitor.commandTimes.length > 100) {
        performanceMonitor.commandTimes.shift();
      }
      
      return result;
    };
    
    // Monitor position update rate
    cncCore.positioning.on('positionUpdate', () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - performanceMonitor.lastPositionUpdate;
      performanceMonitor.positionUpdateRate = 1000 / timeSinceLastUpdate;
      performanceMonitor.lastPositionUpdate = now;
    });
    
    // Report performance every 10 seconds
    setInterval(() => {
      const avgCommandTime = performanceMonitor.commandTimes.reduce((a, b) => a + b, 0) / performanceMonitor.commandTimes.length;
      console.log('Performance Report:', {
        averageCommandTime: avgCommandTime,
        positionUpdateRate: performanceMonitor.positionUpdateRate,
        commandCount: performanceMonitor.commandTimes.length
      });
    }, 10000);
  }
};
```

#### 3. **Memory Leaks**

```typescript
// Monitor memory usage
const memoryMonitor = {
  startMonitoring() {
    setInterval(() => {
      const usage = process.memoryUsage();
      console.log('Memory Usage:', {
        rss: (usage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        external: (usage.external / 1024 / 1024).toFixed(2) + ' MB'
      });
    }, 30000);
  }
};
```

---

## Version Management

### Version Compatibility

```typescript
// src/version/compatibility.ts
export class VersionCompatibility {
  private static readonly COMPATIBILITY_MATRIX: Record<string, string[]> = {
    '1.0.x': ['electron-app@1.0.x', 'electron-app@1.1.x'],
    '1.1.x': ['electron-app@1.1.x', 'electron-app@1.2.x'],
    '1.2.x': ['electron-app@1.2.x', 'electron-app@1.3.x']
  };

  static checkCompatibility(cncCoreVersion: string, electronAppVersion: string): CompatibilityResult {
    const cncMajorMinor = this.getMajorMinor(cncCoreVersion);
    const compatibleVersions = this.COMPATIBILITY_MATRIX[cncMajorMinor];
    
    if (!compatibleVersions) {
      return {
        compatible: false,
        reason: `Unknown CNC-Core version: ${cncCoreVersion}`,
        recommendation: 'Update to a supported version'
      };
    }
    
    const electronMajorMinor = this.getMajorMinor(electronAppVersion);
    const isCompatible = compatibleVersions.some(version => 
      version.includes(electronMajorMinor)
    );
    
    return {
      compatible: isCompatible,
      reason: isCompatible ? 'Versions are compatible' : 'Version mismatch detected',
      recommendation: isCompatible ? null : `Update electron-app to one of: ${compatibleVersions.join(', ')}`
    };
  }

  private static getMajorMinor(version: string): string {
    const parts = version.split('.');
    return `${parts[0]}.${parts[1]}.x`;
  }
}

export interface CompatibilityResult {
  compatible: boolean;
  reason: string;
  recommendation: string | null;
}
```

### Update Management

```typescript
// src/version/update-manager.ts
export class CNCCoreUpdateManager {
  async checkForUpdates(): Promise<UpdateInfo> {
    const currentVersion = require('../../package.json').version;
    
    try {
      const response = await fetch('https://registry.npmjs.org/cnc-core');
      const data = await response.json();
      const latestVersion = data['dist-tags'].latest;
      
      const hasUpdate = this.compareVersions(latestVersion, currentVersion) > 0;
      
      return {
        currentVersion,
        latestVersion,
        hasUpdate,
        updateAvailable: hasUpdate,
        releaseNotes: await this.fetchReleaseNotes(latestVersion)
      };
    } catch (error) {
      throw new Error(`Failed to check for updates: ${error.message}`);
    }
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  }

  private async fetchReleaseNotes(version: string): Promise<string> {
    try {
      const response = await fetch(`https://api.github.com/repos/your-org/cnc-core/releases/tags/v${version}`);
      const release = await response.json();
      return release.body || 'No release notes available';
    } catch (error) {
      return 'Release notes unavailable';
    }
  }
}

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateAvailable: boolean;
  releaseNotes: string;
}
```

This comprehensive CNC-Core integration guide provides everything needed to work with the CNC-Core library effectively, including setup, sharing, team collaboration, and troubleshooting. The documentation covers both basic usage and advanced integration patterns for complex scenarios.