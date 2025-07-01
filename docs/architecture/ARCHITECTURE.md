# CNC Jog Controls - Project Architecture

## Overview
A React/TypeScript-based CNC jog controls application with a comprehensive plugin system, 3D visualization, and Electron integration.

## Project Structure

```
electron-app/
├── 📁 src/                          # Main application source code
│   ├── 📁 components/               # Reusable UI components
│   │   ├── MachineDisplay2D.tsx     # 2D working area visualization
│   │   ├── PluginRenderer.tsx       # Plugin integration component
│   │   ├── WorkingAreaPreview.tsx   # 3D working area visualization
│   │   └── index.ts                 # Component exports
│   ├── 📁 contexts/                 # React context providers
│   │   └── PluginContext.tsx        # Plugin state management
│   ├── 📁 views/                    # Application screens/pages
│   │   ├── Controls/                # CNC jog controls interface
│   │   ├── Dashboard/               # Main dashboard
│   │   ├── Plugin/                  # Individual plugin view
│   │   ├── Plugins/                 # Plugin management interface
│   │   └── Settings/                # Application settings
│   ├── App.tsx                      # Main application component
│   ├── App.css                      # Application styles
│   ├── main.tsx                     # React application entry point
│   └── index.css                    # Global styles
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
├── 📁 examples/                     # Example plugins and demos
│   └── 📁 plugins/                  # Plugin examples
│       ├── gcode-snippets/          # G-code snippet manager
│       ├── machine-monitor/         # Basic machine monitor
│       └── machine-status-monitor/  # Advanced status monitor
│
├── 📁 tools/                        # Development and build tools
│   ├── 📁 api-docs-generator/       # API documentation generator
│   ├── 📁 marketplace-client/       # Plugin marketplace client
│   └── 📁 plugin-cli/               # Plugin development CLI
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
├── 📁 scripts/                      # Build and development scripts
├── 📁 build-resources/              # Electron build resources
├── 📁 my-plugins/                   # User-created plugins
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

### Plugin System
- **Dynamic Module Loading** - Runtime plugin loading via ZIP upload
- **localStorage Persistence** - Browser-based plugin storage
- **React Context API** - Plugin state management
- **Type-Safe Plugin API** - TypeScript interfaces for plugin development

## Architecture Patterns

### 1. Component-Based Architecture
```typescript
// Example component structure
interface ComponentProps {
  data: DataType;
  onAction: (action: ActionType) => void;
}

const Component: React.FC<ComponentProps> = ({ data, onAction }) => {
  // Component logic
};
```

### 2. Context-Driven State Management
```typescript
// Centralized state with React Context
const PluginContext = createContext<PluginContextType>();

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) throw new Error('usePlugins must be used within PluginProvider');
  return context;
};
```

### 3. Plugin Integration Pattern
```typescript
// Plugin rendering with placement-based logic
<PluginRenderer 
  screen="main" 
  placement="dashboard" 
/>
```

### 4. Configuration-Driven Development
```json
// Externalized configuration
{
  "machine": { "workArea": { "x": 300, "y": 200, "z": 50 } },
  "ui": { "theme": "light", "showGrid": true },
  "api": { "endpoints": { "machine": "/api/machine" } }
}
```

## Plugin Architecture

### Plugin Types & Placements
- **Dashboard Cards** - Integrated into main dashboard grid
- **Standalone Screens** - Full-screen applications with navigation
- **Modal Dialogs** - Popup interfaces for focused tasks
- **Sidebar Panels** - Compact side-mounted tools

### Plugin Configuration
```typescript
interface PluginConfig {
  placement: 'dashboard' | 'standalone' | 'modal' | 'sidebar';
  screen: 'main' | 'controls' | 'settings' | 'new';
  size: { width: number | 'auto', height: number | 'auto' };
  priority: number;
  autoStart: boolean;
  permissions: string[];
  // Standalone-specific
  menuTitle?: string;
  menuIcon?: string;
  routePath?: string;
}
```

### Plugin Development Workflow
1. **Create** - Use plugin CLI to scaffold new plugin
2. **Develop** - Build using provided templates and APIs
3. **Package** - ZIP file with package.json manifest
4. **Upload** - Install via UI with configuration options
5. **Configure** - Set placement, screen, and behavior
6. **Deploy** - Automatic integration into target screens

## Data Flow

### Application Startup
```
main.tsx → App.tsx → PluginProvider → AppContent → Routes
```

### Plugin Integration
```
PluginContext → PluginRenderer → Dynamic Component Loading → UI Integration
```

### 3D Visualization Pipeline
```
Position Data → React Three Fiber → Three.js Scene → WebGL Rendering
```

## Key Features

### 1. CNC Control Interface
- **Jog Controls** - Manual machine positioning (X/Y/Z axes)
- **Position Display** - Real-time coordinate tracking
- **Work Area Visualization** - 2D and 3D previews
- **Safety Features** - Emergency stop, limits, alarms

### 2. Plugin System
- **Dynamic Loading** - Runtime plugin installation
- **Multiple Placements** - Dashboard, standalone, modal, sidebar
- **Configuration UI** - Visual plugin setup and management
- **Type Safety** - Full TypeScript support for plugins

### 3. 3D Visualization
- **Interactive Scene** - OrbitControls for navigation
- **Real-time Updates** - Position tracking and tool movement
- **Work Area Bounds** - Visual machine limits
- **Coordinate System** - X/Y/Z axis display with labels

### 4. Modern Development Experience
- **Hot Reload** - Instant development feedback
- **Type Checking** - Compile-time error detection
- **Testing Suite** - Unit and E2E test coverage
- **Plugin CLI** - Streamlined plugin development

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

### 1. Code Organization
- Keep components focused and reusable
- Use TypeScript interfaces for all data structures
- Implement proper error boundaries and loading states
- Follow React hooks patterns and best practices

### 2. Plugin Development
- Follow the established plugin API interfaces
- Include comprehensive TypeScript types
- Test plugins in isolation before integration
- Document plugin functionality and configuration options

### 3. Testing Strategy
- Unit tests for all components and utilities
- Integration tests for plugin system
- E2E tests for critical user workflows
- Visual regression testing for UI consistency

### 4. Performance Optimization
- Lazy load plugin components when possible
- Optimize 3D rendering with appropriate LOD
- Use React.memo for expensive components
- Implement proper cleanup in useEffect hooks

## Future Roadmap

### Short Term
- Enhanced plugin marketplace integration
- Advanced CNC features (toolpath preview, G-code editor)
- Improved 3D visualization performance
- Mobile-responsive interface

### Long Term
- Real machine integration with GRBL protocol
- Multi-machine support and fleet management
- Cloud-based plugin distribution
- Advanced simulation and collision detection

## Dependencies Overview

### Production Dependencies
```json
{
  "@react-three/fiber": "3D rendering",
  "@react-three/drei": "3D utilities",
  "antd": "UI components",
  "react": "UI framework",
  "react-router-dom": "Routing",
  "three": "3D graphics",
  "jszip": "Plugin packaging"
}
```

### Development Dependencies
```json
{
  "typescript": "Type checking",
  "vite": "Build tool",
  "jest": "Testing",
  "playwright": "E2E testing",
  "electron": "Desktop app"
}
```

This architecture provides a solid foundation for a professional CNC control application with extensibility, maintainability, and modern development practices.