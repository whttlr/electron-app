# CNC Jog Controls - Project Architecture

## Overview
A React/TypeScript-based CNC jog controls application with a comprehensive UI-based plugin system, 3D visualization, self-contained module architecture, and Electron desktop integration.

## Project Structure

```
electron-app/
├── 📁 src/                          # Main application source code
│   ├── 📁 core/                     # Self-contained business logic modules
│   │   ├── 📁 machine/              # Machine control and state management
│   │   │   ├── __tests__/           # Module-specific tests
│   │   │   ├── __mocks__/           # Mock data for testing
│   │   │   ├── README.md            # Module documentation
│   │   │   └── index.ts             # Public API exports
│   │   ├── 📁 positioning/          # Position tracking and jog controls
│   │   ├── 📁 workspace/            # Working area and dimensions
│   │   └── 📁 visualization/        # 3D/2D rendering logic
│   │
│   ├── 📁 services/                 # Cross-cutting services
│   │   ├── 📁 plugin/               # Plugin management service
│   │   │   ├── PluginContext.tsx    # React context with advanced features
│   │   │   ├── __tests__/           # Comprehensive test suite
│   │   │   ├── __mocks__/           # Mock data for testing
│   │   │   ├── README.md            # Service documentation
│   │   │   └── index.ts             # Public API exports
│   │   ├── 📁 config/               # Configuration management
│   │   └── 📁 state/                # Application state management
│   │
│   ├── 📁 ui/                       # Feature-organized UI components
│   │   ├── 📁 controls/             # Jog control components
│   │   ├── 📁 visualization/        # Visualization components
│   │   │   ├── WorkingAreaPreview.tsx # 3D working area visualization
│   │   │   ├── MachineDisplay2D.tsx   # 2D working area visualization
│   │   │   └── index.ts             # Component exports
│   │   ├── 📁 plugin/               # Plugin UI components
│   │   │   ├── PluginRenderer.tsx   # Plugin integration component
│   │   │   └── index.ts             # Component exports
│   │   └── 📁 shared/               # Shared UI components
│   │
│   ├── 📁 views/                    # Application screens/pages
│   │   ├── 📁 Controls/             # CNC jog controls interface
│   │   ├── 📁 Dashboard/            # Main dashboard
│   │   ├── 📁 Plugin/               # Individual plugin view
│   │   ├── 📁 Plugins/              # Plugin management interface (UI-based)
│   │   └── 📁 Settings/             # Application settings
│   │
│   ├── 📁 utils/                    # Pure utility functions
│   │   ├── 📁 calculations/         # Mathematical utilities
│   │   ├── 📁 formatters/           # Data formatting utilities
│   │   └── 📁 helpers/              # General helper functions
│   │
│   ├── 📁 components/               # Legacy components (being phased out)
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # React application entry point
│   └── setupTests.ts                # Test configuration
│
├── 📁 config/                       # Configuration files
│   ├── api.json                     # API endpoints and settings
│   ├── app.json                     # Application metadata
│   ├── defaults.json                # Default values for all systems
│   ├── machine.json                 # Machine hardware configuration
│   ├── state.json                   # Default application state
│   ├── ui.json                      # UI theme and layout settings
│   └── visualization.json           # 3D/2D rendering settings
│
├── 📁 docs/                         # Project documentation
│   ├── 📁 architecture/             # Architecture documentation
│   ├── 📁 platform-deployment/      # Deployment guides
│   └── 📁 plugins/                  # Plugin development guides
│
├── 📁 e2e/                          # End-to-end tests
│   ├── 📁 fixtures/                 # Test fixtures
│   ├── 📁 pages/                    # Page object models
│   └── 📁 tests/                    # Test specifications
│
├── 📁 build-resources/              # Electron build resources
└── 📁 node_modules/                 # Dependencies
```

## Core Technologies

### Frontend Stack
- **React 18** - UI framework with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript with strict typing
- **Ant Design** - Professional UI component library
- **React Router** - Client-side routing and navigation
- **React Three Fiber** - 3D visualization with Three.js integration
- **@react-three/drei** - 3D helpers and utilities

### Build & Development
- **Vite** - Fast build tool and development server
- **Electron** - Cross-platform desktop application framework
- **Jest** - Testing framework with React Testing Library
- **Playwright** - End-to-end testing automation
- **ESLint** - Code linting and quality checks

### Plugin System (UI-Based)
- **Dynamic Module Loading** - Runtime plugin loading via ZIP upload
- **Dependency Resolution** - Automatic dependency detection and installation
- **Version Management** - Update checking and plugin versioning
- **Registry Integration** - Connect to multiple plugin registries
- **Visual Configuration** - Form-based plugin setup and management

## Architecture Patterns

### 1. Self-Contained Module Architecture

Each functional domain is organized as a self-contained module:

```typescript
// Module structure
src/core/machine/
├── __tests__/           # Module-specific tests
├── __mocks__/          # Mock data for testing
├── README.md           # Module documentation
├── config.ts           # Module configuration (optional)
├── index.ts            # Public API exports
└── MachineController.ts # Main implementation
```

**Principles:**
- **Everything related to a module stays in one location**
- **Clear public APIs** - Each module exports a clean API via `index.ts`
- **Configuration separation** - Module-specific config in `config.ts`
- **Dependency injection** - Modules receive dependencies rather than creating them
- **No cross-module imports** - Modules only import from `services/` or `utils/`

### 2. Layered Architecture

```
┌─────────────────────────────────────────────────┐
│                   Views Layer                    │ ← Application screens/pages
├─────────────────────────────────────────────────┤
│                    UI Layer                      │ ← Feature-organized components
├─────────────────────────────────────────────────┤
│                 Services Layer                   │ ← Cross-cutting services
├─────────────────────────────────────────────────┤
│                   Core Layer                     │ ← Business logic modules
├─────────────────────────────────────────────────┤
│                  Utils Layer                     │ ← Pure utility functions
└─────────────────────────────────────────────────┘
```

### 3. Plugin System Architecture

```typescript
// Enhanced plugin interface with advanced features
interface Plugin {
  // Basic identification
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive';
  type: 'utility' | 'visualization' | 'control' | 'productivity';
  
  // Version management
  availableVersions?: string[];
  latestVersion?: string;
  updateAvailable?: boolean;
  
  // Dependencies
  dependencies?: { [key: string]: string };
  
  // Installation metadata
  installedAt?: string;
  updatedAt?: string;
  source?: 'local' | 'marketplace' | 'registry';
  checksum?: string;
  
  // Registry sync
  registryId?: string;
  publisherId?: string;
  
  // Configuration
  config?: PluginConfig;
}
```

### 4. Context-Driven State Management

```typescript
// Enhanced plugin context with advanced operations
interface PluginContextType {
  // State
  plugins: Plugin[];
  registryConfig: RegistryConfig | null;
  
  // Version Management
  checkForUpdates: () => Promise<PluginUpdate[]>;
  updatePlugin: (pluginId: string, version?: string) => Promise<void>;
  updateAllPlugins: () => Promise<void>;
  
  // Registry Operations
  syncWithRegistry: () => Promise<void>;
  publishToRegistry: (pluginId: string) => Promise<void>;
  
  // Dependency Management
  checkDependencies: (plugin: Plugin) => Promise<boolean>;
  installDependencies: (plugin: Plugin) => Promise<void>;
  
  // Import/Export
  exportPlugins: () => Promise<string>;
  importPlugins: (data: string) => Promise<void>;
}
```

## Plugin Architecture (UI-Based System)

### Plugin Management Workflow
1. **Develop** - Create plugin directory with React components
2. **Package** - ZIP file with enhanced package.json manifest
3. **Upload** - Drag-and-drop or file selection through UI
4. **Dependencies** - Automatic dependency resolution with user confirmation
5. **Configure** - Visual placement, screen, and behavior configuration
6. **Deploy** - Automatic integration into target screens

### Plugin Types & Placements
- **Dashboard Cards** - Integrated into main dashboard grid
- **Standalone Screens** - Full-screen applications with navigation
- **Modal Dialogs** - Popup interfaces for focused tasks
- **Sidebar Panels** - Compact side-mounted tools

### Advanced Plugin Features
- **Dependency Resolution** - Automatic detection and installation of plugin dependencies
- **Version Management** - Update checking, notifications, and bulk updates
- **Registry Integration** - Connect to multiple registries for plugin distribution
- **Import/Export** - Backup and restore plugin configurations
- **Security** - Checksum verification and permission-based access control

### UI-Based Plugin Management

The plugin system is fully integrated into the application UI through three main tabs:

#### Local Plugins Tab
- Plugin upload via drag-and-drop or file selection
- Update management with automatic checking
- Plugin configuration through visual forms
- Export/import functionality for backups

#### Marketplace Tab
- Browse community and verified plugins
- Search and filter by category, tags, or keywords
- Dependency visualization and conflict resolution
- One-click installation with progress tracking

#### Registry Tab
- Connect to public or private plugin registries
- Publish local plugins to registries
- Sync plugin lists with connected registries
- Secure authentication and credential management

## Data Flow

### Application Startup
```
main.tsx → App.tsx → PluginProvider → AppContent → Routes
```

### Plugin Management Flow
```
UI Upload → Dependency Check → Installation → Configuration → Integration
```

### Enhanced Plugin Integration
```
PluginContext → Dependency Resolution → Version Management → UI Integration
```

### 3D Visualization Pipeline
```
Position Data → React Three Fiber → Three.js Scene → WebGL Rendering
```

## Key Features

### 1. CNC Control Interface
- **Jog Controls** - Manual machine positioning (X/Y/Z axes)
- **Position Display** - Real-time coordinate tracking
- **Work Area Visualization** - 2D and 3D previews with interactive controls
- **Safety Features** - Emergency stop, limits, alarms

### 2. Advanced Plugin System
- **UI-Based Management** - Complete migration from CLI to integrated interface
- **Dependency Resolution** - Automatic dependency detection and installation
- **Version Management** - Update checking, notifications, and bulk updates
- **Registry Integration** - Connect to multiple registries for plugin distribution
- **Import/Export** - Backup and restore plugin configurations

### 3. 3D Visualization
- **Interactive Scene** - OrbitControls for navigation
- **Real-time Updates** - Position tracking and tool movement
- **Work Area Bounds** - Visual machine limits with grid display
- **Coordinate System** - X/Y/Z axis display with labels

### 4. Modern Development Experience
- **Self-Contained Modules** - Clean separation of concerns
- **Type Safety** - Full TypeScript support throughout
- **Hot Reload** - Instant development feedback with Vite
- **Testing Suite** - Comprehensive unit and E2E test coverage

## Configuration Management

### Centralized Configuration System
All application settings are externalized to JSON files in the `config/` directory:

- **Environment-specific** - Development vs production settings
- **Type-safe access** - TypeScript interfaces for all config sections
- **Runtime updates** - Dynamic configuration changes
- **Default values** - Comprehensive fallback system

### Configuration Files
- `app.json` - Application metadata and feature flags
- `machine.json` - CNC machine specifications and limits
- `ui.json` - Theme, layout, and interface preferences
- `api.json` - Endpoint URLs, timeouts, and API settings
- `defaults.json` - Default values for all systems
- `state.json` - Initial application state
- `visualization.json` - 3D/2D rendering parameters

## Development Guidelines

### 1. Module Development
- Follow self-contained module architecture
- Use `index.ts` for clean public API exports
- Include comprehensive tests and documentation
- Implement proper dependency injection

### 2. Plugin Development
- Create plugins as React components with TypeScript
- Follow established plugin interface and API patterns
- Include proper dependency declarations
- Test across different placements and screen sizes

### 3. Testing Strategy
- Unit tests co-located with modules (`__tests__/` directories)
- Integration tests for plugin system functionality
- E2E tests for critical user workflows with Playwright
- Visual regression testing for UI consistency

### 4. Performance Optimization
- Lazy load plugin components when possible
- Optimize 3D rendering with appropriate level of detail
- Use React.memo for expensive components
- Implement proper cleanup in useEffect hooks

## Architecture Enforcement

### File Size Limits
- **300 lines maximum** per file
- **Single responsibility** - Each file/module has one clear purpose

### Import Discipline
- **Clear dependency boundaries** between layers
- **No cross-module imports** - Use services or utils for shared functionality
- **Configuration centralization** - No hardcoded values in logic files

### Module Structure
Each module must contain:
- `__tests__/` - All test files for the module
- `__mocks__/` - Mock data and service mocks
- `README.md` - Module documentation and usage
- `index.ts` - Public API exports
- `config.ts` - Module-specific configuration (optional)

## Security & Performance

### Plugin Security
- **Checksum Verification** - All plugins verified with SHA-256 checksums
- **Permission System** - Granular permission control for plugin access
- **Dependency Validation** - Automatic dependency vulnerability checking
- **Sandboxed Execution** - Plugins run in isolated environments

### Performance Optimization
- **Lazy Loading** - Progressive plugin loading on demand
- **Caching Strategy** - Intelligent caching for plugin metadata and search results
- **Background Operations** - Non-blocking plugin installations and updates
- **Memory Management** - Proper cleanup and garbage collection

## Migration from CLI Tools

The architecture has been completely modernized to eliminate CLI tool dependencies:

### Deprecated Components (Removed)
- `tools/marketplace-client/` - CLI marketplace tool
- `tools/plugin-cli/` - CLI plugin development tool
- `my-plugins/` - Local plugin development directory
- `examples/plugins/` - Old example plugin directory

### Modern Replacements
- **UI-Based Plugin Management** - Complete visual interface
- **Integrated Development** - Plugin creation through documentation guides
- **Registry Integration** - Connect to multiple plugin sources
- **Visual Configuration** - Form-based plugin setup

## Future Roadmap

### Short Term
- **Enhanced 3D Visualization** - Advanced rendering and interaction features
- **Real Machine Integration** - GRBL protocol support for actual CNC machines
- **Advanced Plugin Analytics** - Usage statistics and performance metrics
- **Mobile-Responsive Interface** - Touch-friendly controls for tablets

### Long Term
- **Multi-Machine Support** - Fleet management and coordination
- **Cloud-Based Plugins** - Distributed plugin hosting and synchronization
- **AI-Powered Features** - Intelligent toolpath optimization and collision detection
- **Enterprise Features** - Role-based access control and audit logging

## Dependencies Overview

### Production Dependencies
```json
{
  "@react-three/fiber": "3D rendering engine",
  "@react-three/drei": "3D utilities and helpers",
  "antd": "Professional UI component library",
  "react": "UI framework with hooks",
  "react-router-dom": "Client-side routing",
  "three": "3D graphics library",
  "jszip": "Plugin packaging and extraction"
}
```

### Development Dependencies
```json
{
  "typescript": "Type checking and compilation",
  "vite": "Fast build tool and dev server",
  "jest": "Testing framework",
  "playwright": "End-to-end testing",
  "electron": "Desktop application framework"
}
```

## Conclusion

This architecture provides a robust foundation for a professional CNC control application with:

- **Modern React/TypeScript stack** with type safety throughout
- **Self-contained module architecture** for maintainability
- **UI-based plugin ecosystem** with advanced dependency management
- **Comprehensive testing** with unit and E2E coverage
- **Performance optimization** with lazy loading and caching
- **Security** with plugin sandboxing and verification
- **Extensibility** through the plugin system and registry integration

The architecture successfully balances simplicity for new developers with advanced features for enterprise deployment, positioning the application as a modern, extensible platform for CNC machine control and automation.

---

**Implementation Status**: ✅ Complete  
**Architecture Version**: 3.0  
**Last Updated**: January 2025