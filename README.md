# CNC Jog Controls - Electron App

[![Build and Release](https://github.com/whttlr/electron-app/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/whttlr/electron-app/actions/workflows/build-and-release.yml)
[![Documentation](https://github.com/whttlr/electron-app/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/whttlr/electron-app/actions/workflows/deploy-docs.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/whttlr/electron-app)](https://github.com/whttlr/electron-app/releases/latest)

A comprehensive CNC machine control application with an integrated UI-based plugin ecosystem.

## 📑 Table of Contents

- [📥 Quick Download](#-quick-download)
- [🎯 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🔧 Plugin Development](#-plugin-development)
- [🏗️ Architecture](#️-architecture)
- [🚀 Automated Build & Release System](#-automated-build--release-system)
- [🧪 Testing](#-testing)
- [📚 Documentation System](#-documentation-system)
- [🔄 Recent Updates](#-recent-updates)
- [🤝 Contributing](#-contributing)

## 📥 Quick Download

**[Download Latest Release](https://whttlr.github.io/electron-app/download)** | **[View Documentation](https://whttlr.github.io/electron-app/)**

- **macOS**: Universal Binary (Intel + Apple Silicon) - `.dmg`
- **Windows**: Windows 10+ - `.exe` installer  
- **Linux**: Portable AppImage - `.AppImage`

*All downloads are automatically built and tested with every release.*

## 🎯 Features

### Core Application
- **Machine Position Controls**: 3D sliders for X, Y, Z axis positioning
- **Jog Controls**: Directional buttons for incremental movement
- **G-code Editor**: Syntax highlighting and real-time validation
- **Machine Status Monitoring**: Real-time position, status, and alarm monitoring
- **Workspace Management**: Project organization and file handling

### Plugin System
- **🔧 UI-Based Development**: Create, manage, and configure plugins through the integrated interface
- **📚 Comprehensive Documentation**: Step-by-step guides and API reference in `/docs/plugins/`
- **🏪 Marketplace Integration**: Discover, install, and publish plugins with dependency resolution
- **🔄 Version Management**: Automatic update checking and plugin version control
- **🔐 Registry Support**: Connect to multiple plugin registries for enterprise deployment

## 🚀 Quick Start

### 1. Install the Application

```bash
git clone <repository-url>
cd electron-app
npm install

# Initialize the database (first time only)
npx prisma migrate dev --name init
```

### 2. Run the Application

```bash
npm run electron:dev
```

The Electron app will start with the main dashboard accessible.

### 3. Explore the Plugin System

1. **Navigate to Plugins**: Click the "Plugins" tab in the main interface
2. **Browse Marketplace**: Explore available plugins in the Marketplace tab
3. **Install Plugins**: Click "Install" on any plugin to add it to your system
4. **Configure Plugins**: Use the "Configure" button to set placement and settings

## 🔧 Plugin Development

### UI-Based Plugin Management

The plugin system is now fully integrated into the main application UI:

#### Local Plugins Tab
- **Upload Plugins**: Drag-and-drop ZIP files or click to select
- **Manage Installed**: Enable/disable, configure, and remove plugins
- **Check Updates**: Automatic update detection with bulk update capabilities
- **Export/Import**: Backup and restore plugin configurations

#### Marketplace Tab
- **Discover Plugins**: Browse community and verified plugins
- **Search & Filter**: Find plugins by category, tags, or keywords
- **Dependency Resolution**: Automatic handling of plugin dependencies
- **Installation**: One-click installation with progress tracking

#### Registry Tab
- **Connect to Registries**: Configure connections to public or private registries
- **Publish Plugins**: Upload your local plugins to registries
- **Sync**: Keep your plugin list synchronized with connected registries

### Plugin Development Workflow

#### 1. Create a Plugin
Create a new directory with this structure:
```
my-awesome-plugin/
├── package.json          # Plugin manifest with dependencies
├── README.md            # Documentation
├── icon.png             # Plugin icon (optional)
├── src/
│   ├── index.tsx        # Main React component
│   └── components/      # Additional components
└── assets/              # Static assets
```

#### 2. Plugin Manifest (package.json)
```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome CNC plugin",
  "main": "src/index.tsx",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "keywords": ["cnc", "machine-control", "productivity"],
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "productivity",
    "placement": "dashboard",
    "permissions": ["machine.read", "file.read"],
    "displayName": "My Awesome Plugin",
    "icon": "icon.png",
    "dependencies": {
      "other-plugin": "^1.2.0"
    }
  }
}
```

#### 3. Plugin Component (src/index.tsx)
```tsx
import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';

const { Title, Text } = Typography;

interface MyPluginProps {
  machineStatus?: any;
  onMachineCommand?: (command: string) => void;
}

const MyAwesomePlugin: React.FC<MyPluginProps> = ({ 
  machineStatus, 
  onMachineCommand 
}) => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <Card title="My Awesome Plugin" size="small">
      <Title level={5}>Machine Status</Title>
      <Text type="secondary">
        Status: {machineStatus?.connected ? 'Connected' : 'Disconnected'}
      </Text>
      <Button 
        type="primary" 
        onClick={() => setIsRunning(!isRunning)}
      >
        {isRunning ? 'Stop' : 'Start'}
      </Button>
    </Card>
  );
};

export default MyAwesomePlugin;
```

#### 4. Package and Upload
1. **Create ZIP**: Zip your plugin directory
2. **Upload**: Go to Plugins tab → Local Plugins → Upload Plugin
3. **Configure**: Set placement, screen, and other settings
4. **Test**: Your plugin will appear in the configured location

### Plugin Categories

- **`visualization`** - 3D viewers, charts, graphs, display components
- **`control`** - Machine control interfaces, jog controls, manual operations  
- **`productivity`** - Workflow tools, calculators, code generators, utilities
- **`utility`** - General purpose tools, file management, system utilities

### Plugin Placements

- **`dashboard`** - Small card on the main dashboard
- **`standalone`** - Full-screen application with navigation menu item
- **`modal`** - Popup dialog for focused tasks
- **`sidebar`** - Side panel for tool palettes

## 🏗️ Architecture

### Project Structure
```
electron-app/
├── src/                          # Main application source
│   ├── components/               # Reusable UI components
│   ├── views/                    # Application screens
│   │   ├── Dashboard/            # Main dashboard
│   │   ├── Controls/             # CNC controls
│   │   ├── Plugins/              # Plugin management UI
│   │   └── Settings/             # Application settings
│   ├── services/                 # Service layer
│   │   └── plugin/               # Plugin management service
│   ├── core/                     # Core business logic
│   ├── ui/                       # UI components by feature
│   └── utils/                    # Utility functions
├── config/                       # Configuration files
├── docs/                         # Documentation
│   └── plugins/                  # Plugin development guides
└── build-resources/              # Electron build resources
```

### Self-Contained Modules

The application follows a self-contained module architecture where each functional domain is organized with:
- `index.ts` - Public API exports
- `config.ts` - Module configuration
- `__tests__/` - Module-specific tests
- `__mocks__/` - Mock data for testing
- `README.md` - Module documentation

## UI-Based Plugin System

The plugin system is fully integrated into the main application UI, providing a seamless experience for plugin development, management, and distribution.

### Key Features

- **Visual Feedback**: Real-time progress and status indicators
- **Dependency Management**: Automatic resolution with user confirmation
- **Configuration**: Form-based setup with visual interface
- **Integration**: Seamless workflow within the main application
- **Security**: Secure credential storage and validation

## Database Schema Updates

When making changes to the database schema:

```bash
# Generate and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma client (after schema changes)
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## 🚀 Automated Build & Release System

### CI/CD Pipeline

The project features a comprehensive GitHub Actions pipeline that automatically builds, tests, and releases the application:

#### **Automated Builds**
Every push to `main` triggers:
- **Multi-platform builds**: macOS (Universal), Windows, Linux
- **Quality assurance**: Linting, unit tests, build verification
- **Automatic releases**: Version tagging and GitHub releases
- **Documentation updates**: Auto-updated download links

#### **Release Types**

**Beta Releases** (Automatic)
- Triggered on every push to `main`
- Version format: `v0.1.0-beta.abc1234`
- Pre-release flag enabled
- Available immediately for testing

**Stable Releases** (Manual)
- Triggered via GitHub Actions "Run workflow"
- Version format: `v0.1.0`
- Full release with changelog
- Promoted to "Latest Release"

#### **Build Artifacts**

| Platform | File Type | Download | Compatibility |
|----------|-----------|----------|---------------|
| **macOS** | `.dmg` | Universal Binary | Intel + Apple Silicon, macOS 10.15+ |
| **Windows** | `.exe` | NSIS Installer | Windows 10+, 64-bit |
| **Linux** | `.AppImage` | Portable | Most distributions, 64-bit |

#### **Download Distribution**

**Documentation Site**: [whttlr.github.io/electron-app/download](https://whttlr.github.io/electron-app/download)
- Platform-specific download buttons
- System requirements and installation guides
- Automatically updated with latest releases

**Direct Download Links** (Latest Release):
```
macOS:    https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls.dmg
Windows:  https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls-Setup.exe
Linux:    https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls.AppImage
```

### **GitHub Actions Workflows**

#### Build and Release (`.github/workflows/build-and-release.yml`)
```yaml
Triggers:
  - Push to main (excludes docs)
  - Pull requests to main
  - Manual workflow dispatch

Jobs:
  1. Test: Lint, unit tests, build verification
  2. Build: Multi-platform Electron builds
  3. Release: GitHub release creation
  4. Update-docs: Documentation updates
```

#### Documentation Deployment (`.github/workflows/deploy-docs.yml`)
```yaml
Triggers:
  - Push to main (docs changes)
  - Manual workflow dispatch

Deploys: Docusaurus site to GitHub Pages
```

### **Setting Up CI/CD**

For new repositories or forks:

1. **Enable GitHub Actions**:
   ```
   Repository Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN
   ```

2. **Enable GitHub Pages**:
   ```
   Repository Settings → Pages
   - Source: "GitHub Actions"
   ```

3. **First Release**:
   - Push to main branch
   - Workflow automatically creates first release
   - Documentation site deploys

### **Local Development Builds**

For development and testing:

```bash
# Development build
npm run build              # Build React application
npm run electron:build     # Build Electron application

# Platform-specific builds
npm run electron:build:mac    # macOS only
npm run electron:build:win    # Windows only  
npm run electron:build:linux  # Linux only

# Documentation
npm run docs:start         # Start docs dev server
npm run docs:build         # Build documentation
```

### **Release Management**

#### **Creating a Stable Release**
1. Go to **Actions** tab in GitHub
2. Select **"Build and Release Electron App"** workflow
3. Click **"Run workflow"**
4. Choose **"release"** from dropdown
5. Workflow creates stable release with full changelog

#### **Version Bumping**
Update version in `package.json` before stable releases:
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0  
npm version major  # 1.0.0 → 2.0.0
```

#### **Release Notes**
- Auto-generated from commit messages
- Includes "What's Changed" section
- Download instructions for each platform
- Links to full changelog

### **Monitoring Builds**

**Build Status**: [github.com/whttlr/electron-app/actions](https://github.com/whttlr/electron-app/actions)
- Real-time build progress
- Build logs and artifacts
- Test results and coverage

**Release History**: [github.com/whttlr/electron-app/releases](https://github.com/whttlr/electron-app/releases)
- All releases and pre-releases
- Download statistics
- Release notes and changelogs

## 🧪 Testing

```bash
npm test                   # Run Jest unit tests
npm run test:e2e          # Run Playwright end-to-end tests
npm run lint              # Run ESLint code analysis
```

## 📚 Documentation System

### **Live Documentation Site**

**[whttlr.github.io/electron-app](https://whttlr.github.io/electron-app/)** - Full documentation with search and navigation

#### **Documentation Structure**
- **Getting Started**: Installation, first run, basic controls
- **Features**: Detailed feature documentation and guides
- **Architecture**: System design and technical details
- **Development**: Contributing and development setup
- **Download**: Latest releases and installation

#### **Cross-Referenced Documentation**
- **Main App Docs**: Application features and user guides
- **Plugin Registry**: [whttlr.github.io/plugin-registry](https://whttlr.github.io/plugin-registry/) - Plugin development and marketplace

### **Documentation Development**

```bash
# Local documentation development
npm run docs:install      # Install Docusaurus dependencies
npm run docs:start        # Start development server (localhost:3000)
npm run docs:build        # Build for production
npm run docs:serve        # Preview production build
```

#### **Auto-Deployment**
- Documentation automatically deploys on push to `main`
- Download page updates with latest release links
- Cross-links maintained with plugin registry

### **Available Documentation**

**Local Documentation** (`/docs/` directory):
- **[Architecture Overview](docs/architecture/ARCHITECTURE.md)** - System architecture and design patterns
- **[Plugin Development Guide](docs/plugins/)** - Complete plugin development documentation
- **[Marketplace Integration](docs/plugins/MARKETPLACE-INTEGRATION.md)** - UI-based marketplace features

**Online Documentation** (Generated):
- **User Guides**: Installation, configuration, troubleshooting
- **Feature Documentation**: Controls, visualization, plugins
- **Developer Docs**: Architecture, contributing, API reference
- **Download Center**: Platform-specific downloads with instructions

## 🔄 Recent Updates

### Plugin System Overhaul
- **UI-Based Management**: Complete migration from CLI to integrated UI
- **Dependency Resolution**: Automatic dependency detection and installation
- **Version Management**: Update checking, notifications, and bulk updates
- **Registry Integration**: Connect to multiple registries for plugin distribution
- **Import/Export**: Backup and restore plugin configurations

### Modern Architecture
- **Self-Contained Modules**: Clean separation of concerns with modular architecture
- **TypeScript**: Full type safety throughout the application
- **React 18**: Modern React with hooks and context patterns
- **Ant Design**: Professional UI component library
- **Testing**: Comprehensive test suite with Jest and Playwright

### Automated CI/CD Pipeline
- **Multi-Platform Builds**: Automatic macOS, Windows, Linux builds
- **Quality Assurance**: Automated testing, linting, and verification
- **Release Management**: Beta and stable releases with auto-generated changelogs
- **Documentation Deployment**: Auto-updating docs with download links
- **Distribution**: Direct download links and GitHub releases integration

### Security & Performance
- **Plugin Sandboxing**: Secure plugin execution environment
- **Checksum Verification**: Plugin integrity validation
- **Lazy Loading**: Performance optimization with progressive loading
- **Caching**: Intelligent caching for better responsiveness

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.