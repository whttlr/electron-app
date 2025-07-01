# Claude Context for CNC Jog Controls Application

## Project Overview
A React/TypeScript-based CNC jog controls application with comprehensive plugin system, 3D visualization, and Electron desktop integration. Features real-time machine control, working area visualization, and extensible plugin architecture.

## Key Commands
- `npm start` - Start Vite development server
- `npm run build` - Build React application  
- `npm run electron:dev` - Start Electron development mode
- `npm run electron:build` - Build Electron application
- `npm test` - Run Jest test suite
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run lint` - Run ESLint code analysis

## Project Structure
**NOTE**: If any files are created, deleted, or moved, please update this architecture section to reflect the current project structure.

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
│   │   │   └── ControlsView.tsx     # Main controls screen
│   │   ├── Dashboard/               # Main dashboard
│   │   │   └── DashboardView.tsx    # Dashboard screen
│   │   ├── Plugin/                  # Individual plugin view
│   │   │   └── PluginView.tsx       # Generic plugin container
│   │   ├── Plugins/                 # Plugin management interface
│   │   │   └── PluginsView.tsx      # Plugin management screen
│   │   └── Settings/                # Application settings
│   │       └── SettingsView.tsx     # Settings screen
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
├── 📁 tools/                        # Development and build tools
│   └── 📁 api-docs-generator/       # API documentation generator
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
└── 📁 node_modules/                 # Dependencies
```

## Important Notes
- This is a React/TypeScript CNC control application with modern web technologies
- Features comprehensive plugin system with dynamic loading and configuration
- Includes 3D visualization using React Three Fiber and Three.js
- Built with Ant Design for professional UI components
- Supports desktop deployment via Electron

## Configuration
- Configuration files in `config/` directory (JSON format)
- Machine-specific settings in `config/machine.json`
- UI preferences in `config/ui.json`
- Plugin settings managed via UI with localStorage persistence

## Dependencies
- **React & TypeScript**: Modern UI framework with type safety
- **Ant Design**: Professional UI component library
- **React Three Fiber**: 3D visualization and working area preview
- **React Router**: Client-side routing and navigation
- **Vite**: Fast build tool and development server
- **Electron**: Cross-platform desktop application framework
- **Jest & Playwright**: Testing frameworks for unit and E2E tests

## Plugin System Architecture

### Plugin Types & Placements
- **Dashboard Cards**: Integrated into main dashboard grid
- **Standalone Screens**: Full-screen applications with navigation menu
- **Modal Dialogs**: Popup interfaces for focused tasks
- **Sidebar Panels**: Compact side-mounted tools

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
1. **Create**: Use plugin CLI to scaffold new plugin
2. **Develop**: Build using provided templates and APIs
3. **Package**: ZIP file with package.json manifest
4. **Upload**: Install via UI with configuration options
5. **Configure**: Set placement, screen, and behavior
6. **Deploy**: Automatic integration into target screens

## Core Features

### 1. CNC Control Interface
- **Jog Controls**: Manual machine positioning (X/Y/Z axes)
- **Position Display**: Real-time coordinate tracking  
- **3D Visualization**: Interactive working area preview with Three.js
- **2D Top-down View**: Precise coordinate system and tool tracking
- **Safety Features**: Connection status, emergency controls

### 2. Plugin System
- **Dynamic Loading**: Runtime plugin installation via ZIP upload
- **Multiple Placements**: Dashboard, standalone, modal, sidebar options
- **Configuration UI**: Visual plugin setup and management interface
- **Type Safety**: Full TypeScript support for plugin development
- **Menu Integration**: Automatic navigation menu updates for standalone plugins

### 3. Modern Development Experience
- **Hot Reload**: Instant development feedback with Vite
- **Type Checking**: Compile-time error detection with TypeScript
- **Component Library**: Professional UI with Ant Design
- **Testing Suite**: Unit tests with Jest, E2E tests with Playwright
- **UI-Based Plugin Development**: Streamlined plugin management through integrated UI

## Application Screens

### Dashboard (`/`)
- Overview cards for quick access to main features
- Integrated plugin cards (dashboard placement)
- Modal plugin access via clickable cards

### Controls (`/controls`)  
- Manual jog controls for X/Y/Z axes
- 3D working area visualization with tool tracking
- 2D top-down view with coordinate grid
- Position display and jog settings
- Plugin integration for control-related tools

### Plugins (`/plugins`)
- Plugin upload and installation interface
- Plugin management with enable/disable controls
- Configuration editor for placement and settings
- Plugin statistics and information display

### Settings (`/settings`)
- Machine configuration (work area, units, connection)
- UI preferences (theme, language, display options)
- Plugin settings integration for settings-screen plugins

### Dynamic Plugin Screens
- Standalone plugins create their own navigation menu items
- Custom routes (e.g., `/machine-monitor`, `/gcode-snippets`)
- Full-screen plugin interfaces with dedicated real estate

## Development Guidelines

### Component Development
- Use TypeScript interfaces for all props and data structures
- Follow React hooks patterns and best practices
- Implement proper error boundaries and loading states
- Keep components focused and reusable

### Plugin Development
- Follow established plugin API interfaces
- Include comprehensive TypeScript types
- Test plugins in isolation before integration
- Document plugin functionality and configuration options

### 3D Visualization
- Use React Three Fiber for 3D scene management
- Optimize rendering performance with appropriate LOD
- Implement proper cleanup in useEffect hooks
- Sync 3D position updates with application state

### Testing Strategy
- Unit tests for components using React Testing Library
- Integration tests for plugin system functionality
- E2E tests for critical user workflows with Playwright
- Visual regression testing for UI consistency

## Strictly Enforced Architecture

### Self-Contained Module Structure
Each functional domain is organized as a self-contained module with all related files in a dedicated folder.

```
src/
├── core/                          # Core CNC functionality
│   ├── machine/                   # Machine state and control
│   │   ├── __tests__/            # Module-specific tests
│   │   ├── __mocks__/            # Mock data for testing
│   │   ├── README.md             # Module documentation
│   │   ├── config.ts             # Module configuration
│   │   ├── index.ts              # Public API exports
│   │   └── MachineController.ts  # Main implementation
│   │
│   ├── positioning/               # Position tracking and jog controls
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── PositionController.ts
│   │
│   ├── workspace/                 # Working area and dimensions
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── WorkspaceController.ts
│   │
│   └── visualization/             # 3D/2D rendering logic
│       ├── __tests__/
│       ├── __mocks__/
│       ├── README.md
│       ├── config.ts
│       ├── index.ts
│       └── VisualizationController.ts
│
├── services/                      # Cross-module services
│   ├── plugin/                    # Plugin management service
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── PluginService.ts
│   │
│   ├── config/                    # Configuration management
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── index.ts
│   │   └── ConfigService.ts
│   │
│   └── state/                     # Application state management
│       ├── __tests__/
│       ├── __mocks__/
│       ├── README.md
│       ├── index.ts
│       └── StateService.ts
│
├── ui/                            # User interface components
│   ├── controls/                  # Jog control components
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── JogControls.tsx
│   │
│   ├── visualization/             # Visualization components
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── WorkingAreaPreview.tsx
│   │   └── MachineDisplay2D.tsx
│   │
│   ├── plugin/                    # Plugin UI components
│   │   ├── __tests__/
│   │   ├── __mocks__/
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── PluginRenderer.tsx
│   │
│   └── shared/                    # Shared UI components
│       ├── __tests__/
│       ├── __mocks__/
│       ├── README.md
│       ├── config.ts
│       ├── index.ts
│       └── CommonComponents.tsx
│
├── views/                         # Application screens/pages
│   ├── Dashboard/
│   ├── Controls/
│   ├── Plugins/
│   └── Settings/
│
└── utils/                         # Pure utility functions
    ├── calculations/
    ├── formatters/
    └── helpers/
```

### Architecture Principles

#### Module Structure Elements
Each module folder must contain:
- `__tests__/`: All test files related to the module using Jest and React Testing Library
- `__mocks__/`: Mock data and service mocks for testing
- `README.md`: Documentation on module purpose, usage, and API
- `config.ts`: Module-specific configuration (optional)
- `index.ts`: Public API exports that define what's accessible from outside
- `ModuleName.tsx` or `ModuleName.ts`: Main implementation

#### Self-Containment Rules
- **Everything related to a module stays in one location**
- **Clear public APIs**: Each module exports a clean API via `index.ts`
- **Configuration separation**: Module-specific config in `config.ts`
- **Dependency injection**: Modules receive dependencies rather than creating them
- **No cross-module imports**: Modules only import from `services/` or `utils/`

#### Responsibility Clusters
- **Core**: Machine control functionality and business logic
- **Services**: Cross-module services and state management
- **UI**: User interface components organized by feature
- **Views**: Application screens and routing
- **Utils**: Pure utility functions without dependencies

### Architecture Enforcement
- **File size limit**: 300 lines maximum per file
- **Single responsibility**: Each file/module has one clear purpose
- **Configuration centralization**: No hardcoded values in logic files
- **Import discipline**: Clear dependency boundaries between layers
- **Test co-location**: Tests live with the code they test

## Recent Updates
- Migrated from Node.js CLI application to React/TypeScript desktop app
- Implemented comprehensive plugin system with dynamic loading
- Added 3D visualization using React Three Fiber
- Created professional UI with Ant Design components
- Established proper project architecture with clean separation of concerns
- Removed legacy CNC protocol code in favor of modern web technologies
- Cleaned up unused directories and files for better maintainability
- **NEW**: Defined strict self-contained module architecture for better organization and maintainability