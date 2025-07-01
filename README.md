# CNC Jog Controls - Electron App

A comprehensive CNC machine control application with an integrated UI-based plugin ecosystem.

## Features

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

## Quick Start

### 1. Install the Application

```bash
git clone <repository-url>
cd electron-app
npm install
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

## Plugin Development

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

## Architecture

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

## Building for Production

```bash
npm run build              # Build React application
npm run electron:build     # Build Electron application
```

## Testing

```bash
npm test                   # Run Jest unit tests
npm run test:e2e          # Run Playwright end-to-end tests
npm run lint              # Run ESLint code analysis
```

## Documentation

Comprehensive documentation is available in the `/docs/` directory:

- **[Architecture Overview](docs/architecture/ARCHITECTURE.md)** - System architecture and design patterns
- **[Plugin Development Guide](docs/plugins/)** - Complete plugin development documentation
- **[Marketplace Integration](docs/plugins/MARKETPLACE-INTEGRATION.md)** - UI-based marketplace features

## Recent Updates

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

### Security & Performance
- **Plugin Sandboxing**: Secure plugin execution environment
- **Checksum Verification**: Plugin integrity validation
- **Lazy Loading**: Performance optimization with progressive loading
- **Caching**: Intelligent caching for better responsiveness

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.