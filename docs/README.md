# CNC Jog Controls - Desktop Application

A professional Electron-based desktop application for CNC machine control with real-time jog controls, 3D visualization, and comprehensive machine management capabilities.

## 🚀 Features

### Core Functionality
- **Real-time CNC Control**: Direct serial communication with GRBL controllers
- **Interactive Jog Controls**: Precision movement control with customizable increments
- **3D Visualization**: Real-time machine position and working area preview
- **File Management**: G-code file loading, validation, and recent files tracking
- **Multi-language Support**: Internationalization with English and expandable language support

### Desktop Integration
- **Native Menus**: Full application menu with keyboard shortcuts
- **File Associations**: Automatic handling of .gcode, .nc, and .cnc files
- **System Tray**: Background operation with system tray integration
- **Auto Updates**: Seamless automatic updates via electron-updater
- **Performance Monitoring**: Real-time system performance tracking

### Safety & Security
- **Context Isolation**: Secure renderer-main process communication
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Recovery**: Automatic error handling and recovery procedures
- **Crash Reporting**: Detailed crash reporting for issue resolution

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Memory**: 4GB RAM
- **Storage**: 500MB available space
- **USB Port**: For serial communication with CNC controller

### Recommended Requirements
- **Operating System**: Windows 11, macOS 12+, or Linux (Ubuntu 20.04+)
- **Memory**: 8GB RAM
- **Storage**: 1GB available space
- **Display**: 1920x1080 or higher resolution

## 🛠 Installation

### Pre-built Releases
Download the latest release for your platform:
- **Windows**: `CNC-Jog-Controls-Setup.exe`
- **macOS**: `CNC-Jog-Controls.dmg`
- **Linux**: `CNC-Jog-Controls.AppImage`

### Development Setup
```bash
# Clone the repository
git clone https://github.com/jogger-cnc/jog-controls.git
cd jog-controls

# Install dependencies
npm install

# Start development server
npm run electron:dev
```

## 🏗 Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/electron/
├── main/                    # Main Electron process
│   ├── config/             # Configuration management
│   ├── services/           # Core services
│   │   ├── auto-updater/   # Automatic updates
│   │   ├── error-handler/  # Error handling & crash reporting
│   │   ├── file-manager/   # File operations
│   │   ├── performance-monitor/ # System monitoring
│   │   ├── preferences/    # User preferences
│   │   ├── serial-manager/ # Serial port communication
│   │   └── window-manager/ # Window management
│   └── main.ts            # Application entry point
├── preload/               # Preload scripts
└── __tests__/            # Test suites
```

### Key Components

#### SerialManager
Handles all serial port communication with CNC controllers:
- Automatic port detection
- Connection management with retry logic
- Command queuing and response handling
- Real-time status monitoring

#### WindowManager
Manages application windows and UI state:
- Window creation and lifecycle
- Multi-window support
- Window state persistence
- Theme and display preferences

#### PerformanceMonitor
Real-time system performance tracking:
- CPU and memory usage monitoring
- Threshold-based alerts
- Performance metrics logging
- System optimization recommendations

#### AutoUpdater
Seamless application updates:
- Background update checking
- User-friendly update notifications
- Automatic download and installation
- Rollback capabilities

## 🔌 Serial Communication

### Supported Controllers
- **GRBL v1.1+**: Full feature support
- **Marlin**: Basic compatibility
- **TinyG**: Limited support

### Connection Settings
- **Baud Rate**: 115200 (default), configurable
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None
- **Flow Control**: None

### Command Protocol
```typescript
// Send G-code command
await electronAPI.machine.sendCommand('G0 X10 Y10');

// Get machine status
const status = await electronAPI.machine.getStatus();

// Emergency stop
await electronAPI.machine.emergencyStop();
```

## 📁 File Management

### Supported File Types
- **.gcode**: Standard G-code files
- **.nc**: Numerical control files
- **.cnc**: CNC program files
- **.tap**: Tape files

### File Operations
```typescript
// Load G-code file
const file = await electronAPI.files.loadFile(filePath);

// Validate G-code
const validation = await electronAPI.files.validateGcode(content);

// Get recent files
const recentFiles = await electronAPI.files.getRecentFiles();
```

## ⚙️ Configuration

### Application Settings
Configuration files are stored in the user's application data directory:

- **Windows**: `%APPDATA%/CNC Jog Controls/`
- **macOS**: `~/Library/Application Support/CNC Jog Controls/`
- **Linux**: `~/.config/CNC Jog Controls/`

### Key Configuration Files
- `preferences.json`: User preferences and settings
- `machine-profiles.json`: Machine-specific configurations
- `recent-files.json`: Recently opened files list
- `window-state.json`: Window positions and sizes

### Environment Variables
```bash
# Development mode
NODE_ENV=development

# Enable debug logging
DEBUG=cnc:*

# Custom config directory
CNC_CONFIG_DIR=/path/to/config
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Electron-specific tests
npm run electron:test
```

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing

## 📦 Building & Distribution

### Development Build
```bash
# Build for development
npm run build:all

# Package without installer
npm run electron:pack
```

### Production Build
```bash
# Build for all platforms
npm run electron:build

# Platform-specific builds
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

### Build Configuration
The build process is configured in `package.json` under the `build` section:

- **Code Signing**: Automatic signing for macOS and Windows
- **Notarization**: macOS notarization for App Store distribution
- **Auto Updates**: GitHub releases integration
- **File Associations**: Automatic G-code file handling

## 🔧 Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Python**: v3.7+ (for native dependencies)
- **Build Tools**: Platform-specific build tools

### Development Workflow
1. **Setup**: `npm install`
2. **Development**: `npm run electron:dev`
3. **Testing**: `npm test`
4. **Building**: `npm run electron:build`
5. **Distribution**: Release via GitHub

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks

## 📚 API Reference

### Electron API
The application exposes a secure API to the renderer process via context isolation:

```typescript
interface ElectronAPI {
  machine: {
    connect(port: string): Promise<void>;
    disconnect(): Promise<void>;
    sendCommand(command: string): Promise<string>;
    getStatus(): Promise<MachineStatus>;
    emergencyStop(): Promise<void>;
  };
  
  files: {
    loadFile(path?: string): Promise<GCodeFile>;
    saveFile(content: string, path?: string): Promise<string>;
    validateGcode(content: string): Promise<ValidationResult>;
    getRecentFiles(): Promise<RecentFile[]>;
  };
  
  preferences: {
    get<T>(key: string): Promise<T>;
    set(key: string, value: any): Promise<void>;
    reset(): Promise<void>;
  };
  
  app: {
    getVersion(): string;
    quit(): void;
    openDevTools(): void;
    checkForUpdates(): Promise<UpdateInfo>;
  };
}
```

### Event System
Real-time events are handled through IPC:

```typescript
// Listen for machine status updates
electronAPI.on('machine:status', (status) => {
  console.log('Machine status:', status);
});

// Listen for error events
electronAPI.on('error', (error) => {
  console.error('Application error:', error);
});
```

## 🛡️ Security

### Security Measures
- **Context Isolation**: Complete isolation between main and renderer processes
- **Sandboxing**: Renderer processes run in sandboxed environment
- **CSP**: Content Security Policy prevents code injection
- **Input Validation**: All user inputs are validated and sanitized

### Best Practices
- Regular security audits with `npm audit`
- Dependency updates and vulnerability monitoring
- Secure credential storage using system keychain
- Encrypted configuration for sensitive data

## 🔍 Troubleshooting

### Common Issues

#### Serial Port Connection Issues
```bash
# Check available ports
npm run list-ports

# Permission issues (Linux)
sudo usermod -a -G dialout $USER
# Log out and back in
```

#### Application Won't Start
```bash
# Clear application data
rm -rf ~/.config/CNC\ Jog\ Controls/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Performance Issues
- Close unnecessary applications
- Check system resources in Activity Monitor/Task Manager
- Enable hardware acceleration in preferences
- Update graphics drivers

### Debug Mode
Enable debug mode for detailed logging:

```bash
# Set environment variable
export DEBUG=cnc:*

# Or start with debug flag
npm run electron:dev --debug
```

### Log Files
Application logs are stored in:
- **Windows**: `%APPDATA%/CNC Jog Controls/logs/`
- **macOS**: `~/Library/Logs/CNC Jog Controls/`
- **Linux**: `~/.config/CNC Jog Controls/logs/`

---

# 📁 Architectural Documentation

This directory also contains comprehensive architectural plans and documentation for the CNC control system, organized into logical categories for easy navigation and maintenance.

## 📁 Documentation Structure

### 🏗️ [Architecture](./architecture/)
Fundamental system architecture and design patterns that define how the application is structured and organized.

- **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - Complete project architecture overview including React/TypeScript stack and self-contained modules ✅ **IMPLEMENTED**
- **[Cross-Platform Strategy Plan](./architecture/cross-platform-strategy-plan.md)** - Strategy for sharing logic between desktop and mobile apps using Tauri + Capacitor
- **[Coordinate System Management Plan](./architecture/coordinate-system-management-plan.md)** - Single source of truth for machine vs work coordinate systems

### 🔌 [Plugins](./plugins/)
Comprehensive plugin system documentation for extending application functionality with UI-based marketplace and registry management.

- **[PLUGIN-ARCHITECTURE-OVERVIEW.md](./plugins/PLUGIN-ARCHITECTURE-OVERVIEW.md)** - Complete plugin system architecture and capabilities ✅ **IMPLEMENTED**
- **[PLUGIN-INTEGRATION-GUIDE.md](./plugins/PLUGIN-INTEGRATION-GUIDE.md)** - Step-by-step guide for integrating plugins into the UI ✅ **IMPLEMENTED**  
- **[PLUGIN-UPLOAD-SYSTEM.md](./plugins/PLUGIN-UPLOAD-SYSTEM.md)** - Detailed technical documentation for the ZIP-based plugin upload system ✅ **IMPLEMENTED**
- **[UI-PLACEMENT-GUIDE.md](./plugins/UI-PLACEMENT-GUIDE.md)** - Guide for plugin UI placement options and configurations ✅ **IMPLEMENTED**
- **[Getting Started](./plugins/getting-started/)** - Plugin development tutorials and examples ✅ **IMPLEMENTED**
- **[API Reference](./plugins/api-reference/)** - Complete plugin API documentation ✅ **IMPLEMENTED**
- **[MARKETPLACE-INTEGRATION.md](./plugins/MARKETPLACE-INTEGRATION.md)** - UI-based marketplace with dependency resolution and registry publishing ✅ **IMPLEMENTED**

### ⚙️ [Core Systems](./core-systems/)
Essential system components that provide the foundational functionality for CNC machine control and operation.

- **[Security & Safety Framework Plan](./core-systems/security-safety-framework-plan.md)** - Comprehensive security and safety systems for CNC operations
- **[Data Management & Analytics Plan](./core-systems/data-management-analytics-plan.md)** - Data collection, analytics, and predictive maintenance systems
- **[Hardware Integration Expansion Plan](./core-systems/hardware-integration-expansion-plan.md)** - Extended hardware support including cameras, sensors, and safety systems
- **[Workflow Management Plan](./core-systems/workflow-management-plan.md)** - CAM integration, job queuing, and production scheduling

### 🚀 [Platform Deployment](./platform-deployment/)
Deployment strategies, distribution methods, and update systems for different target platforms.

- **[Raspberry Pi Distribution Plan](./platform-deployment/raspberry-pi-distribution-plan.md)** - Optimized deployment strategy for Raspberry Pi hardware
- **[Auto-Update System Plan](./platform-deployment/auto-update-system-plan.md)** - Automated update system with non-intrusive notifications ✅ **IMPLEMENTED**
- **[Release Notes System Plan](./platform-deployment/release-notes-system-plan.md)** - Comprehensive release notes and update communication system

### 👥 [User Experience](./user-experience/)
User-facing features that enhance usability, learning, and support for operators and engineers.

- **[Training & Support System Plan](./user-experience/training-support-system-plan.md)** - Interactive onboarding, context-sensitive help, and community support

### 🏢 [Enterprise Features](./enterprise-features/)
Advanced features designed for large-scale manufacturing environments and enterprise deployments.

- **[Multi-User & Enterprise Plan](./enterprise-features/multi-user-enterprise-plan.md)** - Multi-user collaboration, fleet management, and enterprise integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../build-resources/license.txt) file for details.

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## 📋 Changelog

### v0.1.0 (Current)
- ✅ Core Electron desktop application architecture
- ✅ Real-time CNC control via serial communication
- ✅ 3D visualization and jog controls
- ✅ File management and validation
- ✅ Auto-update system with electron-updater
- ✅ Performance monitoring and system optimization
- ✅ Comprehensive testing suite with Jest
- ✅ Cross-platform build configuration
- ✅ Security hardening with context isolation

## 🗺️ Roadmap

### v0.2.0 (Planned)
- [ ] Advanced G-code editor with syntax highlighting
- [ ] Tool path simulation and visualization
- [ ] Multiple machine profile support
- [ ] Plugin system for extensibility

### v0.3.0 (Future)
- [ ] Cloud synchronization for settings and files
- [ ] Remote monitoring and control capabilities
- [ ] Advanced diagnostics and maintenance tools
- [ ] Integrated CAM workflow support

---

**Built with ❤️ by the Jogger CNC Tools team**  
**Last Updated**: December 2024  
**Documentation Version**: 2.0  
**Architecture Status**: Implementation Complete - Phase 4 ✅