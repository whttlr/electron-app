# Plugin Architecture Overview

This document provides a comprehensive overview of how the plugin system is organized, where components live, and how everything works together.

## 🏗️ System Architecture

### High-Level Overview

```
CNC Jog Controls Plugin Ecosystem
├── 🔧 Plugin Development Tools (CLI)
├── 📁 Plugin Storage Locations  
├── ⚙️ Plugin Management System
├── 🎨 UI Integration Layer
└── 📚 Documentation & Examples
```

## 📂 Directory Structure

### Complete Project Layout

```
electron-app/
├── docs/
│   └── plugins/                           # 📚 Plugin Documentation
│       ├── README.md                      # Main plugin development guide
│       ├── API-REFERENCE.md               # Complete API documentation
│       ├── GETTING-STARTED.md             # Quick start tutorial
│       ├── UI-PLACEMENT-GUIDE.md          # UI configuration guide
│       └── TROUBLESHOOTING.md             # Common issues and solutions
│
├── examples/
│   └── plugins/                           # 💡 Example Plugins
│       ├── machine-status-monitor/        # React/TypeScript example
│       └── gcode-snippets/                # Utility plugin example
│
├── tools/                                 # 🔧 CLI Development Tools
│   ├── plugin-cli/                        # Main plugin development CLI
│   │   ├── src/
│   │   │   ├── commands/                  # CLI command implementations
│   │   │   ├── templates/                 # Plugin templates
│   │   │   └── cli.ts                     # Main CLI entry point
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── marketplace-client/                # Plugin marketplace CLI
│   │   ├── src/
│   │   └── package.json
│   │
│   └── api-docs-generator/                # API documentation generator
│       ├── src/
│       └── package.json
│
├── scripts/                               # 🚀 Setup Scripts
│   ├── setup-dev-tools.sh                # Install CLI tools globally
│   ├── setup-dev-tools.bat               # Windows version
│   └── quick-start.sh                     # Simple JS plugin creation
│
├── src/                                   # 🏠 Main Application
│   ├── components/
│   │   ├── PluginContainer.tsx            # Plugin loading component
│   │   ├── PluginManager.tsx              # Plugin registry and management
│   │   └── DeveloperTools/                # Developer tools UI
│   │       ├── DeveloperToolsCard.tsx
│   │       └── DeveloperToolsModal.tsx
│   │
│   ├── plugins/                           # 🔌 Integrated Plugins
│   │   └── my-first-plugin/               # Example integrated plugin
│   │       ├── src/index.js
│   │       ├── package.json
│   │       └── README.md
│   │
│   ├── views/Dashboard/
│   │   └── DashboardView.tsx              # Main dashboard with plugin integration
│   │
│   └── core/plugins/                      # 🧠 Core Plugin System (Advanced)
│       ├── core/
│       │   ├── PluginManager.ts           # Enterprise plugin manager
│       │   ├── PluginLoader.ts            # Plugin loading logic
│       │   ├── SecurityManager.ts         # Plugin security
│       │   └── APIGateway.ts              # Plugin API gateway
│       ├── registry/
│       │   └── PluginRegistry.ts          # Plugin discovery and registration
│       └── types/
│           └── plugin-types.ts            # TypeScript type definitions
│
├── my-plugins/                            # 👤 User Plugin Workspace
│   └── [user-created-plugins]/            # Plugins created by users
│
├── create-plugin.sh                       # 🆕 Simple plugin creator
├── package.json                           # Main app dependencies
└── README.md                              # Project overview
```

## 🔄 Plugin Lifecycle & Data Flow

### 1. Plugin Development Workflow

```mermaid
graph TD
    A[Developer] --> B[Install CLI Tools]
    B --> C[Create Plugin]
    C --> D[Develop & Test]
    D --> E[Integrate to UI]
    E --> F[Deploy/Share]
    
    B1[./scripts/setup-dev-tools.sh] --> B
    B2[./scripts/quick-start.sh] --> B
    
    C1[cnc-plugin create my-plugin] --> C
    C2[./create-plugin.sh my-plugin] --> C
    
    D1[Edit src/index.js] --> D
    D2[Test in browser] --> D
    
    E1[Copy to src/plugins/] --> E
    E2[Auto-render on dashboard] --> E
```

### 2. Plugin Loading Process

```mermaid
graph LR
    A[Dashboard Loads] --> B[PluginManager]
    B --> C[Read Plugin Registry]
    C --> D[Filter by Screen/Placement]
    D --> E[Sort by Priority]
    E --> F[Render PluginContainer]
    F --> G[Load Plugin Code]
    G --> H[Initialize Plugin]
    H --> I[Mount UI]
```

## 🔧 Development Tools Distribution

### CLI Tools Installation

**Location**: `tools/` directory
**Installation**: Global npm linking
**Access**: Available as shell commands

```bash
# After running setup script, you get:
cnc-plugin create my-plugin    # Plugin development CLI
cnc-marketplace search tools   # Marketplace client  
cnc-api-docs generate src      # Documentation generator
```

### Setup Scripts

**Purpose**: Install development tools without npm publishing
**Location**: `scripts/` directory
**Types**:
- `setup-dev-tools.sh` - Full TypeScript CLI tools
- `quick-start.sh` - Simple JavaScript plugin creation

## 📁 Plugin Storage Locations

### 1. User Development Workspace
```
my-plugins/                    # 👤 USER WORKSPACE
├── my-first-plugin/          # Created by user
├── my-custom-tool/           # Created by user
└── my-visualization/         # Created by user
```
- **Purpose**: Plugin development and testing
- **Created by**: `./create-plugin.sh` or CLI tools
- **Access**: Local file editing

### 2. Application Integration
```
src/plugins/                   # 🏠 INTEGRATED PLUGINS  
├── my-first-plugin/          # Copied from my-plugins/
├── system-monitor/           # Built-in plugin
└── debug-tools/              # Development plugin
```
- **Purpose**: Plugins integrated into the application
- **Created by**: Copying from my-plugins/ or built-in
- **Access**: Loaded by PluginContainer component

### 3. Example Plugins
```
examples/plugins/              # 💡 EXAMPLES & TEMPLATES
├── machine-status-monitor/   # Production-ready example
├── gcode-snippets/           # Utility example
└── 3d-toolpath-visualizer/   # Advanced example (coming soon)
```
- **Purpose**: Learning and reference
- **Created by**: Project maintainers
- **Access**: Copy and modify for your own plugins

## ⚙️ Plugin Management System

### Frontend Components

**PluginContainer** (`src/components/PluginContainer.tsx`)
- Loads and renders individual plugins
- Handles ES modules and CommonJS plugins
- Provides mock API for development
- Applies UI configuration (size, placement)

**PluginManager** (`src/components/PluginManager.tsx`)
- Maintains plugin registry
- Handles plugin enable/disable
- Renders plugins based on screen and placement
- Sorts plugins by priority

**DashboardView** (`src/views/Dashboard/DashboardView.tsx`)
- Main integration point
- Uses `renderPluginsForScreen()` for dynamic plugin placement
- Responsive grid layout with Ant Design

### Backend/Core System (Advanced)

**Enterprise Plugin Manager** (`src/core/plugins/core/PluginManager.ts`)
- Full-featured plugin orchestration
- Dependency resolution
- Security validation
- Health monitoring
- Event-driven architecture

## 🎨 UI Integration Layers

### 1. Simple Integration (Current)
```typescript
// Dashboard automatically renders plugins
{renderPluginsForScreen('main', 'dashboard')}
```

### 2. Manual Integration
```typescript
// Direct plugin placement
<PluginContainer 
  pluginPath="/src/plugins/my-plugin/src/index.js"
  pluginName="my-plugin"
  uiConfig={{ placement: 'dashboard', size: { width: 12 } }}
/>
```

### 3. Advanced Integration (Enterprise)
```typescript
// Full plugin manager with registry
<PluginManager 
  registry={pluginRegistry}
  securityLevel="high"
  sandboxed={true}
/>
```

## 📋 Plugin Configuration

### Plugin Manifest (package.json)
```json
{
  "name": "my-plugin",
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "utility",
    "displayName": "My Plugin",
    "permissions": ["machine.status.read"],
    "ui": {
      "placement": "dashboard",     // Where it appears
      "screen": "main",            // Which screen
      "size": { "width": 12 },     // Grid sizing
      "priority": 100              // Display order
    }
  }
}
```

### Plugin Implementation
```javascript
class MyPlugin {
  constructor(api) {
    this.api = api  // CNC Jog Controls API
  }
  
  async initialize() { /* Setup */ }
  async mount(container) { /* Render UI */ }
  async unmount() { /* Cleanup */ }
  async destroy() { /* Final cleanup */ }
}
```

## 🚀 Distribution Strategy

### Development Phase
1. **Local Development**: Use `my-plugins/` workspace
2. **Testing**: Copy to `src/plugins/` for integration testing
3. **Iteration**: Edit in place, refresh browser to test

### Sharing Phase
1. **GitHub**: Share plugin directory as repository
2. **Copy**: Others clone and copy to their workspace
3. **Integration**: Copy to `src/plugins/` to use

### Future: Marketplace Phase
1. **Publish**: Use `cnc-marketplace publish` 
2. **Discover**: Use `cnc-marketplace search`
3. **Install**: Use `cnc-marketplace install plugin-name`

## 🔍 Key Design Principles

### 1. **Developer Experience First**
- Simple plugin creation with `./create-plugin.sh`
- No complex build processes required
- Instant feedback and testing

### 2. **Multiple Complexity Levels**
- **Simple**: JavaScript plugins with basic API
- **Advanced**: TypeScript plugins with full tooling
- **Enterprise**: Full plugin manager with security

### 3. **Self-Contained Ecosystem**
- No external dependencies required
- All tools work offline
- Everything runs locally

### 4. **Future-Proof Architecture**
- Ready for marketplace integration
- Supports both simple and complex plugins
- Extensible UI placement system

## 📞 How Components Communicate

### Plugin ↔ Application
```javascript
// Plugin receives API object
const api = {
  events: { on, off, emit },      // Event system
  machine: { getStatus, sendCommand }, // Machine control
  logger: { info, error, debug }, // Logging
  storage: { get, set }           // Data persistence
}
```

### UI ↔ Plugin System
```typescript
// React components use plugin manager
import { renderPluginsForScreen } from '../components/PluginManager'

// Renders all plugins for a specific screen/placement
{renderPluginsForScreen('main', 'dashboard')}
```

### CLI ↔ Plugin System
```bash
# CLI tools operate on workspace and templates
cnc-plugin create my-plugin      # Creates in my-plugins/
./create-plugin.sh my-plugin     # Simple creation script
```

This architecture provides a complete, self-contained plugin ecosystem that grows with your needs - from simple scripts to enterprise-grade plugin management! 🎯