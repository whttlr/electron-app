# CNC Jog Controls - Electron App

A comprehensive CNC machine control application with an integrated plugin development ecosystem.

## Features

### Core Application
- **Machine Position Controls**: 3D sliders for X, Y, Z axis positioning
- **Jog Controls**: Directional buttons for incremental movement
- **G-code Editor**: Syntax highlighting and real-time validation
- **Machine Status Monitoring**: Real-time position, status, and alarm monitoring
- **Workspace Management**: Project organization and file handling

### Plugin Development System
- **🔧 CLI Development Tools**: Create, develop, test, and build plugins
- **📚 Comprehensive Documentation**: Step-by-step guides and API reference
- **💻 Working Examples**: Production-ready example plugins
- **🏪 Marketplace Integration**: Discover and distribute plugins
- **📖 Auto-Generated API Docs**: TypeScript-based documentation

## Quick Start

### 1. Install the Application

```bash
git clone <repository-url>
cd electron-app
npm install
```

### 2. Set Up Plugin Development Tools

**macOS/Linux:**
```bash
./scripts/setup-dev-tools.sh
```

**Windows:**
```cmd
scripts\setup-dev-tools.bat
```

This installs three global CLI tools:
- `cnc-plugin` - Plugin development CLI
- `cnc-marketplace` - Marketplace client
- `cnc-api-docs` - API documentation generator

### 3. Run the Application

```bash
npm run electron:dev
```

The Electron app will start with the main dashboard accessible.

### 4. Create Your First Plugin

**Option A: Using CLI Tools (if setup successful):**
```bash
cnc-plugin create my-first-plugin
cd my-first-plugin
cnc-plugin dev  # Start development server with hot reload
```

**Option B: Quick Start (no compilation issues):**
```bash
./scripts/quick-start.sh            # Set up simple plugin creation
./create-plugin.sh my-first-plugin  # Create a JavaScript plugin
cd my-plugins/my-first-plugin
open src/index.js                   # Edit your plugin
```

## Plugin Development

### Available Commands

After running the setup script, you'll have access to these commands:

```bash
# Plugin Development
cnc-plugin create <name>          # Create a new plugin
cnc-plugin dev                    # Start development server
cnc-plugin build                  # Build for production
cnc-plugin test                   # Run tests
cnc-plugin validate              # Validate plugin

# Marketplace
cnc-marketplace search <query>    # Search for plugins
cnc-marketplace install <plugin>  # Install a plugin
cnc-marketplace publish          # Publish your plugin

# Documentation
cnc-api-docs generate <source>   # Generate API docs
cnc-api-docs serve <docs>        # Serve documentation
```

### Example Plugins

Explore working examples in the `examples/plugins/` directory:

- **Machine Status Monitor** - Real-time monitoring with charts
- **G-Code Snippets** - Snippet management with Monaco editor
- **3D Toolpath Visualizer** - Advanced 3D visualization (coming soon)

### Access from Dashboard

The plugin development tools are integrated into the main application:

1. **Dashboard Card**: Look for the "Developer Tools" card on the main dashboard
2. **Menu Access**: Go to `Tools > Plugin Development` in the application menu
3. **Keyboard Shortcut**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) to create a new plugin

### Plugin Integration

Multiple ways to integrate plugins into the UI:

#### Method 1: Upload System (Recommended)
1. **Create Plugin ZIP**: Zip your plugin directory 
2. **Upload via UI**: Dashboard → Developer Tools → "Upload Plugin"
3. **Configure Placement**: Set screen, size, priority, and menu integration
4. **Auto-Installation**: System handles extraction, validation, and configuration

#### Method 2: Manual Integration (Development)
1. **Plugin Container Component**: `src/components/PluginContainer.tsx` handles plugin loading
2. **Dashboard Integration**: Plugins appear as cards on the main dashboard
3. **Live Example**: Check the "My First Plugin" card to see your plugin in action
4. **Plugin Directory**: Plugins are copied to `src/plugins/` for integration

## 🛠️ CLI Setup Guide

### Step-by-Step Installation

**1. Run the Setup Script:**
```bash
# macOS/Linux
cd /Users/tylerhenry/Desktop/whttlr/electron-app
./scripts/setup-dev-tools.sh

# Windows
scripts\setup-dev-tools.bat
```

**2. Verify Installation:**
```bash
cnc-plugin --version
cnc-marketplace --version
cnc-api-docs --version
```

**3. Create Your First Plugin:**
```bash
cnc-plugin create my-awesome-plugin
cd my-awesome-plugin
cnc-plugin dev
```

### What the Setup Script Does

1. **✅ Builds all CLI tools** from TypeScript source
2. **🔗 Links them globally** so they're available as commands
3. **🧪 Tests the installation** to ensure everything works
4. **📋 Provides helpful usage information**

### Alternative Installation Methods

#### Method 1: Manual Setup
```bash
# Plugin CLI
cd tools/plugin-cli
npm install && npm run build && npm link

# Marketplace Client
cd ../marketplace-client
npm install && npm run build && npm link

# API Docs Generator
cd ../api-docs-generator
npm install && npm run build && npm link
```

#### Method 2: Direct Usage (No Global Install)
```bash
# From the respective tool directories
cd tools/plugin-cli
npx ts-node src/cli.ts create my-plugin

cd ../marketplace-client
npx ts-node src/cli.ts search visualization

cd ../api-docs-generator
npx ts-node src/cli.ts generate src
```

#### Method 3: Quick Start JavaScript Plugins (Recommended)
```bash
# Simple, no-compilation plugin development
./scripts/quick-start.sh            # One-time setup
./create-plugin.sh my-awesome-plugin # Create new plugin
cd my-plugins/my-awesome-plugin
open src/index.js                   # Start editing

# Plugin will appear on dashboard automatically
npm run electron:dev                # Start app to see your plugin
```

### Key Benefits

- **🚀 No NPM Publishing Required** - Works immediately from local development
- **🔄 Live Updates** - Changes to CLI source code are reflected after rebuild
- **🛠️ Full Development Environment** - All tools work together seamlessly
- **📖 Integrated Documentation** - Everything accessible from the dashboard
- **💻 Self-Contained** - No external dependencies or internet required

### Troubleshooting

**Command Not Found Errors:**
1. Ensure Node.js 18+ is installed: `node --version`
2. Check that npm global bin is in your PATH: `npm config get prefix`
3. Re-run the setup script
4. Use `npx` as a fallback for direct usage

**Permission Errors on macOS/Linux:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Windows PowerShell Execution Policy:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Building for Production

```bash
npm run build
```

## Component Structure

```
src/
├── components/
│   ├── JogControls.tsx           # Main component (extracted)
│   ├── SectionHeader.tsx         # UI helper component
│   ├── MockWorkspaceControls.tsx # Simplified workspace controls
│   ├── MockWorkingAreaPreview.tsx # 3D preview placeholder
│   ├── PluginContainer.tsx       # Plugin loading component
│   └── DeveloperTools/           # Developer tools card and modal
├── plugins/
│   └── my-first-plugin/          # Example integrated plugin
│       ├── src/index.js          # Plugin implementation
│       ├── package.json          # Plugin manifest
│       └── README.md             # Plugin documentation
├── hooks/
│   ├── useMockMachine.ts         # Mock machine state management
│   └── useMockHighlight.ts       # Mock highlight context
├── views/Dashboard/
│   └── DashboardView.tsx         # Main dashboard with plugin integration
├── constants.ts                  # Colors and constants
├── App.tsx                       # Main app wrapper
└── main.tsx                      # React entry point
```

## Recent Updates

### Plugin Upload System (NEW!)

1. **ZIP Upload Interface**: Upload plugins directly from the UI with drag-and-drop
2. **Visual Configuration**: Configure placement, screen, size, and priority through forms
3. **Menu Integration**: Automatically add plugins to application menus with custom paths
4. **Auto-Installation**: System handles extraction, validation, and file placement
5. **Plugin Registry**: Centralized plugin management with enable/disable controls

### Plugin Integration System

1. **PluginContainer Component**: Added React component for loading and mounting plugins
2. **Dashboard Integration**: Plugins now appear as cards on the main dashboard
3. **Plugin Directory**: Created `src/plugins/` for storing integrated plugins
4. **Mock API**: Provides plugin development API for testing and integration
5. **Live Example**: "My First Plugin" demonstrates the complete integration workflow

### Quick Start Script

1. **JavaScript-based Plugins**: Bypass TypeScript compilation issues
2. **Simple Creation Tool**: `./create-plugin.sh` for instant plugin scaffolding  
3. **Working Template**: Generates functional plugins with UI and event handling
4. **No Build Step**: Direct integration without complex tooling

## Key Changes from Original

1. **Isolated State**: Replaced context dependencies with local mock hooks
2. **Simplified Dependencies**: Removed complex 3D components, replaced with placeholders
3. **Hardcoded Values**: Machine dimensions and settings are now hardcoded for simplicity
4. **Self-Contained**: No external API calls or WebSocket connections
5. **Plugin System**: Full plugin development and integration workflow

## Usage

The playground provides a fully functional jog control interface where you can:

- Move the machine position using the sliders
- Use directional buttons for precise movements
- Adjust jog speed and increment sizes
- Toggle debug information to see internal state
- Test all UI interactions without hardware

This makes it perfect for:
- UI development and testing
- Component integration testing
- Design iteration
- Demonstration purposes