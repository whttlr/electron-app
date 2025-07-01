# Plugin Anatomy

Understanding the structure and components of a CNC Jog Controls plugin is essential for effective plugin development. This guide provides a comprehensive breakdown of plugin architecture, file organization, and core concepts.

## Plugin Directory Structure

A well-structured plugin follows a standardized layout that promotes maintainability and ease of development:

```
my-cnc-plugin/
├── src/                           # Source code
│   ├── index.ts                   # Main plugin entry point
│   ├── manifest.json              # Plugin metadata and configuration
│   ├── components/                # React UI components
│   │   ├── MyPanel.tsx           # Main panel component
│   │   ├── SettingsDialog.tsx    # Settings/preferences dialog
│   │   ├── shared/               # Reusable components
│   │   │   ├── Button.tsx        # Custom button component
│   │   │   └── Icons.tsx         # Icon components
│   │   └── styles/               # Component styles
│   │       ├── Panel.css         # Panel-specific styles
│   │       └── globals.css       # Global plugin styles
│   ├── services/                 # Business logic services
│   │   ├── DataService.ts        # Data processing service
│   │   ├── ApiService.ts         # External API integration
│   │   └── StorageService.ts     # Data persistence service
│   ├── utils/                    # Utility functions
│   │   ├── formatting.ts         # Data formatting utilities
│   │   ├── validation.ts         # Input validation
│   │   └── constants.ts          # Plugin constants
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # Main type exports
│   │   ├── api.ts                # API-related types
│   │   └── ui.ts                 # UI component types
│   ├── assets/                   # Static assets
│   │   ├── icons/                # Plugin icons
│   │   │   ├── icon-16.png       # 16x16 icon
│   │   │   ├── icon-32.png       # 32x32 icon
│   │   │   └── icon-64.png       # 64x64 icon
│   │   ├── images/               # Images and graphics
│   │   └── fonts/                # Custom fonts (if needed)
│   ├── locales/                  # Internationalization
│   │   ├── en.json               # English translations
│   │   ├── es.json               # Spanish translations
│   │   └── fr.json               # French translations
│   └── config/                   # Configuration files
│       ├── schema.json           # Configuration schema
│       ├── defaults.json         # Default configuration values
│       └── validation.json       # Configuration validation rules
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── components/           # Component tests
│   │   ├── services/             # Service tests
│   │   └── utils/                # Utility tests
│   ├── integration/              # Integration tests
│   │   ├── api.test.ts           # API integration tests
│   │   └── workflow.test.ts      # Workflow integration tests
│   ├── e2e/                      # End-to-end tests
│   │   └── plugin.e2e.ts         # Full plugin E2E tests
│   ├── fixtures/                 # Test data and mocks
│   │   ├── mockData.ts           # Mock data sets
│   │   └── mockServices.ts       # Mock service implementations
│   └── setup/                    # Test configuration
│       ├── setupTests.ts         # Global test setup
│       └── testUtils.tsx         # Test utility functions
├── docs/                         # Plugin documentation
│   ├── README.md                 # Plugin overview and usage
│   ├── api.md                    # API documentation
│   ├── configuration.md          # Configuration guide
│   ├── troubleshooting.md        # Common issues and solutions
│   └── changelog.md              # Version history
├── build/                        # Build configuration
│   ├── webpack.config.js         # Webpack configuration
│   ├── babel.config.js           # Babel configuration
│   └── rollup.config.js          # Rollup configuration (alternative)
├── .github/                      # GitHub workflows (if using GitHub)
│   ├── workflows/                # CI/CD workflows
│   │   ├── test.yml              # Test automation
│   │   ├── build.yml             # Build automation
│   │   └── release.yml           # Release automation
│   └── ISSUE_TEMPLATE/           # Issue templates
├── dist/                         # Built/compiled output (generated)
├── coverage/                     # Test coverage reports (generated)
├── node_modules/                 # npm dependencies (generated)
├── package.json                  # npm package configuration
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest testing configuration
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── .gitignore                    # Git ignore rules
├── LICENSE                       # Plugin license
└── README.md                     # Repository documentation
```

## Core Files Breakdown

### 1. Main Entry Point (`src/index.ts`)

The main entry point defines your plugin class and exports it as the default export:

```typescript
import { Plugin, PluginContext } from '@cnc-jog-controls/plugin-api'
import { MyPanel } from './components/MyPanel'
import { DataService } from './services/DataService'
import { StorageService } from './services/StorageService'
import manifest from './manifest.json'

/**
 * Main Plugin Class
 * Handles plugin lifecycle and coordinates all plugin functionality
 */
export default class MyCNCPlugin extends Plugin {
  private dataService: DataService
  private storageService: StorageService
  private context: PluginContext | null = null

  constructor() {
    super()
    this.dataService = new DataService()
    this.storageService = new StorageService()
  }

  /**
   * Plugin Activation
   * Called when the plugin is loaded and activated
   */
  async onActivate(context: PluginContext): Promise<void> {
    this.context = context
    
    // Initialize services
    await this.dataService.initialize(context)
    await this.storageService.initialize(context)
    
    // Register UI components
    this.registerUIComponents(context)
    
    // Set up event listeners
    this.setupEventListeners(context)
    
    // Load plugin configuration
    await this.loadConfiguration(context)
    
    console.log(`${manifest.name} v${manifest.version} activated`)
  }

  /**
   * Plugin Deactivation
   * Called when the plugin is being unloaded
   */
  async onDeactivate(context: PluginContext): Promise<void> {
    // Clean up resources
    await this.cleanupResources()
    
    // Save current state
    await this.saveState(context)
    
    // Unregister components
    this.unregisterComponents(context)
    
    console.log(`${manifest.name} deactivated`)
  }

  /**
   * Configuration Update
   * Called when plugin configuration changes
   */
  async onConfigurationUpdate(config: any): Promise<void> {
    await this.dataService.updateConfiguration(config)
    await this.storageService.updateConfiguration(config)
  }

  /**
   * Register UI Components
   */
  private registerUIComponents(context: PluginContext): void {
    // Register main panel
    context.ui.registerPanel({
      id: 'my-plugin-panel',
      title: 'My Plugin',
      component: MyPanel,
      position: 'sidebar',
      icon: 'plugin-icon',
      defaultSize: { width: 300, height: 400 }
    })

    // Register menu items
    context.ui.registerMenuItem({
      id: 'my-plugin-menu',
      label: 'My Plugin',
      parent: 'plugins',
      action: () => context.ui.showPanel('my-plugin-panel')
    })
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(context: PluginContext): void {
    // Listen to machine events
    context.machine.on('statusChange', this.onMachineStatusChange.bind(this))
    context.machine.on('connectionChange', this.onConnectionChange.bind(this))
    
    // Listen to file events
    context.files.on('fileLoaded', this.onFileLoaded.bind(this))
    
    // Listen to custom events
    context.events.on('customEvent', this.onCustomEvent.bind(this))
  }

  // Event handlers...
  private onMachineStatusChange(status: any): void { /* ... */ }
  private onConnectionChange(connected: boolean): void { /* ... */ }
  private onFileLoaded(file: any): void { /* ... */ }
  private onCustomEvent(data: any): void { /* ... */ }

  // Helper methods...
  private async loadConfiguration(context: PluginContext): Promise<void> { /* ... */ }
  private async cleanupResources(): Promise<void> { /* ... */ }
  private async saveState(context: PluginContext): Promise<void> { /* ... */ }
  private unregisterComponents(context: PluginContext): void { /* ... */ }
}
```

### 2. Plugin Manifest (`src/manifest.json`)

The manifest file contains all plugin metadata and configuration:

```json
{
  "$schema": "https://cnc-jog-controls.com/schemas/plugin-manifest.json",
  "name": "my-cnc-plugin",
  "version": "1.2.3",
  "description": "A comprehensive CNC plugin for advanced machining operations",
  "longDescription": "This plugin provides advanced toolpath optimization, real-time monitoring, and custom G-code generation capabilities for professional CNC operations.",
  "author": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "url": "https://github.com/johndoe"
  },
  "contributors": [
    {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "UI Designer"
    }
  ],
  "license": "MIT",
  "keywords": [
    "cnc",
    "machining",
    "toolpath",
    "optimization",
    "gcode",
    "automation"
  ],
  "category": "productivity",
  "tags": ["advanced", "professional", "optimization"],
  "main": "dist/index.js",
  "icon": "assets/icons/icon-64.png",
  "screenshots": [
    "assets/screenshots/main-panel.png",
    "assets/screenshots/settings.png",
    "assets/screenshots/visualization.png"
  ],
  "permissions": [
    "machine:read",
    "machine:write",
    "machine:control",
    "file:read",
    "file:write",
    "ui:render",
    "ui:modify",
    "storage:read",
    "storage:write",
    "network:access"
  ],
  "api": {
    "version": "1.0",
    "compatibility": ">=1.0.0 <2.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lodash": "^4.17.21",
    "three": "^0.150.0"
  },
  "peerDependencies": {
    "@cnc-jog-controls/plugin-api": "^1.0.0"
  },
  "configuration": {
    "schema": "config/schema.json",
    "defaults": "config/defaults.json",
    "ui": "config/ui-schema.json"
  },
  "localization": {
    "defaultLocale": "en",
    "supportedLocales": ["en", "es", "fr", "de", "zh"],
    "fallbackLocale": "en"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/johndoe/my-cnc-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/johndoe/my-cnc-plugin/issues",
    "email": "support@example.com"
  },
  "homepage": "https://github.com/johndoe/my-cnc-plugin#readme",
  "funding": {
    "type": "opencollective",
    "url": "https://opencollective.com/my-cnc-plugin"
  },
  "build": {
    "target": "es2020",
    "format": "umd",
    "external": ["react", "react-dom"],
    "globals": {
      "react": "React",
      "react-dom": "ReactDOM"
    }
  },
  "testing": {
    "coverage": {
      "threshold": 80
    },
    "environments": ["jsdom", "node"]
  },
  "deployment": {
    "marketplace": true,
    "signing": {
      "required": true,
      "algorithm": "sha256"
    }
  }
}
```

### 3. Package Configuration (`package.json`)

Standard npm package configuration with plugin-specific scripts:

```json
{
  "name": "my-cnc-plugin",
  "version": "1.2.3",
  "description": "A comprehensive CNC plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist/",
    "src/manifest.json",
    "src/assets/",
    "src/locales/",
    "src/config/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "cnc-plugin dev",
    "build": "cnc-plugin build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write src/**/*.{ts,tsx,json}",
    "package": "cnc-plugin package",
    "publish": "cnc-plugin publish",
    "validate": "cnc-plugin validate",
    "clean": "rimraf dist coverage",
    "prepare": "npm run build",
    "prepack": "npm run build",
    "postinstall": "cnc-plugin postinstall"
  },
  "devDependencies": {
    "@cnc-jog-controls/plugin-cli": "^1.0.0",
    "@cnc-jog-controls/plugin-api": "^1.0.0",
    "@cnc-jog-controls/jest-preset": "^1.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/lodash": "^4.14.0",
    "@types/three": "^0.150.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.0.0",
    "prettier": "^2.8.0",
    "rimraf": "^4.0.0",
    "typescript": "^4.9.0"
  },
  "peerDependencies": {
    "@cnc-jog-controls/plugin-api": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "keywords": [
    "cnc",
    "cnc-jog-controls",
    "plugin",
    "machining",
    "gcode"
  ],
  "author": "John Doe <john.doe@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/johndoe/my-cnc-plugin.git"
  }
}
```

## Plugin Components Architecture

### 1. Services Layer

Services handle business logic and data management:

```typescript
// src/services/BaseService.ts
export abstract class BaseService {
  protected context: PluginContext | null = null
  protected config: any = {}

  async initialize(context: PluginContext): Promise<void> {
    this.context = context
    await this.loadConfiguration()
  }

  abstract async loadConfiguration(): Promise<void>
  abstract async cleanup(): Promise<void>
}

// src/services/DataService.ts
export class DataService extends BaseService {
  private cache: Map<string, any> = new Map()

  async processData(input: any): Promise<any> {
    // Data processing logic
  }

  async cacheData(key: string, data: any): Promise<void> {
    this.cache.set(key, data)
  }

  // Implementation of abstract methods...
}
```

### 2. UI Components Layer

React components for user interface:

```typescript
// src/components/BaseComponent.tsx
import React from 'react'
import { usePluginContext } from '@cnc-jog-controls/plugin-api'

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export const BaseComponent: React.FC<BaseComponentProps> = ({
  className = '',
  children
}) => {
  const context = usePluginContext()
  
  return (
    <div className={`plugin-component ${className}`}>
      {children}
    </div>
  )
}

// src/components/MyPanel.tsx
export const MyPanel: React.FC = () => {
  const context = usePluginContext()
  const [data, setData] = useState(null)

  useEffect(() => {
    // Component initialization
    loadData()
  }, [])

  const loadData = async () => {
    // Load data using context
  }

  return (
    <BaseComponent className="my-panel">
      {/* Panel content */}
    </BaseComponent>
  )
}
```

### 3. Utilities Layer

Helper functions and utilities:

```typescript
// src/utils/formatting.ts
export const formatNumber = (value: number, precision: number = 2): string => {
  return value.toFixed(precision)
}

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  return `${hours}:${minutes % 60}:${seconds % 60}`
}

// src/utils/validation.ts
export const validateGCode = (code: string): ValidationResult => {
  // G-code validation logic
}

export const validateCoordinate = (value: number): boolean => {
  return !isNaN(value) && isFinite(value)
}
```

## Plugin Lifecycle Hooks

Understanding the plugin lifecycle is crucial for proper resource management:

### 1. Lifecycle Phases

```typescript
export enum PluginLifecyclePhase {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  ACTIVATING = 'activating',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  ERROR = 'error'
}
```

### 2. Lifecycle Methods

```typescript
export abstract class Plugin {
  // Optional: Called before activation
  async onBeforeActivate?(context: PluginContext): Promise<void>
  
  // Required: Main activation method
  abstract async onActivate(context: PluginContext): Promise<void>
  
  // Optional: Called after successful activation
  async onAfterActivate?(context: PluginContext): Promise<void>
  
  // Optional: Called before deactivation
  async onBeforeDeactivate?(context: PluginContext): Promise<void>
  
  // Required: Main deactivation method
  abstract async onDeactivate(context: PluginContext): Promise<void>
  
  // Optional: Called after deactivation
  async onAfterDeactivate?(context: PluginContext): Promise<void>
  
  // Optional: Configuration change handler
  async onConfigurationUpdate?(config: any): Promise<void>
  
  // Optional: Error handler
  async onError?(error: Error, context: PluginContext): Promise<void>
  
  // Optional: Health check
  async onHealthCheck?(context: PluginContext): Promise<HealthStatus>
}
```

## Configuration Management

### 1. Configuration Schema (`src/config/schema.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "My CNC Plugin Configuration",
  "description": "Configuration schema for My CNC Plugin",
  "properties": {
    "general": {
      "type": "object",
      "title": "General Settings",
      "properties": {
        "enabled": {
          "type": "boolean",
          "title": "Enable Plugin",
          "description": "Enable or disable the plugin",
          "default": true
        },
        "autoStart": {
          "type": "boolean",
          "title": "Auto Start",
          "description": "Automatically start the plugin on application startup",
          "default": false
        }
      }
    },
    "machining": {
      "type": "object",
      "title": "Machining Settings",
      "properties": {
        "units": {
          "type": "string",
          "title": "Default Units",
          "description": "Default measurement units",
          "enum": ["mm", "inch"],
          "default": "mm"
        },
        "precision": {
          "type": "number",
          "title": "Display Precision",
          "description": "Number of decimal places for measurements",
          "minimum": 0,
          "maximum": 6,
          "default": 3
        },
        "safeHeight": {
          "type": "number",
          "title": "Safe Height",
          "description": "Safe Z height for tool changes",
          "minimum": 0,
          "default": 10
        }
      }
    },
    "ui": {
      "type": "object",
      "title": "User Interface",
      "properties": {
        "theme": {
          "type": "string",
          "title": "Theme",
          "description": "UI theme preference",
          "enum": ["light", "dark", "auto"],
          "default": "auto"
        },
        "panelPosition": {
          "type": "string",
          "title": "Panel Position",
          "description": "Default panel position",
          "enum": ["left", "right", "bottom"],
          "default": "right"
        }
      }
    }
  },
  "required": ["general", "machining", "ui"]
}
```

### 2. Default Configuration (`src/config/defaults.json`)

```json
{
  "general": {
    "enabled": true,
    "autoStart": false,
    "logLevel": "info"
  },
  "machining": {
    "units": "mm",
    "precision": 3,
    "safeHeight": 10,
    "feedRate": 1000,
    "spindleSpeed": 12000
  },
  "ui": {
    "theme": "auto",
    "panelPosition": "right",
    "showTooltips": true,
    "animationsEnabled": true
  },
  "advanced": {
    "cacheEnabled": true,
    "maxCacheSize": 100,
    "autoSave": true,
    "autoSaveInterval": 30000
  }
}
```

## Internationalization Structure

### 1. Locale Files (`src/locales/en.json`)

```json
{
  "plugin": {
    "name": "My CNC Plugin",
    "description": "A comprehensive CNC plugin for advanced operations"
  },
  "ui": {
    "panels": {
      "main": "Main Panel",
      "settings": "Settings",
      "help": "Help"
    },
    "buttons": {
      "start": "Start",
      "stop": "Stop",
      "pause": "Pause",
      "reset": "Reset",
      "save": "Save",
      "cancel": "Cancel"
    },
    "labels": {
      "position": "Position",
      "speed": "Speed",
      "status": "Status",
      "progress": "Progress"
    }
  },
  "messages": {
    "success": {
      "connected": "Successfully connected to machine",
      "saved": "Configuration saved successfully",
      "completed": "Operation completed successfully"
    },
    "errors": {
      "connection": "Failed to connect to machine",
      "validation": "Invalid input provided",
      "operation": "Operation failed: {{error}}"
    },
    "warnings": {
      "unsaved": "You have unsaved changes",
      "performance": "Performance may be affected"
    }
  },
  "tooltips": {
    "start": "Start the machining operation",
    "emergency": "Emergency stop - stops all machine movement immediately",
    "home": "Move machine to home position"
  }
}
```

## Type Definitions

### 1. Main Types (`src/types/index.ts`)

```typescript
// Re-export all types
export * from './api'
export * from './ui'
export * from './config'

// Plugin-specific types
export interface PluginState {
  isActive: boolean
  isConnected: boolean
  currentOperation: string | null
  progress: number
  errors: string[]
}

export interface MachinePosition {
  x: number
  y: number
  z: number
  units: 'mm' | 'inch'
}

export interface ToolpathData {
  id: string
  name: string
  commands: GCodeCommand[]
  estimatedTime: number
  material: string
}

export interface GCodeCommand {
  line: number
  command: string
  parameters: Record<string, number>
  comment?: string
}
```

## Build and Distribution

### 1. Build Configuration (`webpack.config.js`)

```javascript
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'MyCNCPlugin',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@cnc-jog-controls/plugin-api': 'CNCPluginAPI'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/locales', to: 'locales' },
        { from: 'src/config', to: 'config' }
      ]
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
}
```

## Testing Structure

### 1. Test Setup (`tests/setup/setupTests.ts`)

```typescript
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for testing environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock plugin API
jest.mock('@cnc-jog-controls/plugin-api', () => ({
  usePluginContext: () => ({
    machine: {
      getStatus: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    },
    ui: {
      registerPanel: jest.fn(),
      showNotification: jest.fn()
    },
    storage: {
      get: jest.fn(),
      set: jest.fn()
    }
  })
}))

// Global test configuration
beforeEach(() => {
  jest.clearAllMocks()
})
```

## Next Steps

Now that you understand plugin anatomy:

1. **[Create Your First Plugin](./first-plugin.md)** - Put this knowledge into practice
2. **[Explore Plugin Types](../guides/plugin-types.md)** - Learn about different plugin categories
3. **[Study API Reference](../api-reference/)** - Understand available APIs
4. **[Review Examples](../examples/)** - See real implementations

Understanding plugin anatomy is the foundation for creating well-structured, maintainable, and extensible CNC plugins. Use this guide as a reference throughout your plugin development journey! 🚀