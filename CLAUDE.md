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
│   ├── 📁 core/                     # Core CNC functionality (self-contained modules)
│   │   ├── machine/                 # Machine state and control
│   │   │   ├── __tests__/           # Module-specific tests
│   │   │   ├── __mocks__/           # Mock data for testing
│   │   │   ├── README.md            # Module documentation
│   │   │   ├── config.ts            # Module configuration
│   │   │   └── index.ts             # Public API exports
│   │   ├── positioning/             # Position tracking and jog controls
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   ├── workspace/               # Working area and dimensions
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── visualization/           # 3D/2D rendering logic
│   │       ├── __tests__/
│   │       ├── __mocks__/
│   │       ├── README.md
│   │       ├── config.ts
│   │       └── index.ts
│   ├── 📁 services/                 # Cross-module services
│   │   ├── api/                     # API communication service
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   ├── config.ts
│   │   │   ├── index.ts
│   │   │   └── api-client.ts
│   │   ├── config/                  # Configuration management
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   └── index.ts
│   │   ├── plugin/                  # Plugin management service
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   ├── index.ts
│   │   │   └── PluginService.ts
│   │   ├── state/                   # Application state management
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   └── index.ts
│   │   └── update/                  # Update management and UI
│   │       ├── __tests__/
│   │       ├── __mocks__/
│   │       ├── README.md
│   │       ├── config.ts
│   │       ├── index.ts
│   │       ├── UpdateService.ts
│   │       ├── UpdateNotificationBadge.tsx
│   │       └── ReleaseNotesPopover.tsx
│   ├── 📁 ui/                       # User interface components
│   │   ├── controls/                # Jog control components
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   └── index.ts
│   │   ├── visualization/           # Visualization components
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   ├── index.ts
│   │   │   ├── WorkingAreaPreview.tsx
│   │   │   └── MachineDisplay2D.tsx
│   │   ├── plugin/                  # Plugin UI components
│   │   │   ├── __tests__/
│   │   │   ├── __mocks__/
│   │   │   ├── README.md
│   │   │   ├── index.ts
│   │   │   └── PluginRenderer.tsx
│   │   └── shared/                  # Shared UI components
│   │       ├── __tests__/
│   │       ├── __mocks__/
│   │       ├── README.md
│   │       └── index.ts
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
│   ├── 📁 electron/                 # Electron-specific code
│   │   ├── main/                    # Main process code
│   │   │   ├── main.ts              # Main process entry point
│   │   │   └── services/            # Main process services
│   │   │       └── embedded-api-server.ts
│   │   └── preload/                 # Preload scripts
│   │       └── preload.ts           # IPC bridge
│   ├── 📁 utils/                    # Pure utility functions
│   │   ├── calculations/
│   │   ├── formatters/
│   │   └── helpers/
│   ├── 📁 components/               # Legacy components (to be reorganized)
│   │   └── index.ts                 # Component exports
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
- **UI Library**: Custom design system and component library (primary UI source)
- **Ant Design**: Professional UI component library (fallback for complex components)
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
- **UI Library First**: ALWAYS use components from the UI Library as the primary source
- **Component Planning**: If a component doesn't exist in UI Library, plan to add it there
- **TypeScript Interfaces**: Use TypeScript interfaces for all props and data structures
- **React Patterns**: Follow React hooks patterns and best practices
- **Error Handling**: Implement proper error boundaries and loading states
- **Reusability**: Keep components focused and reusable
- **Ant Design Fallback**: Only use Ant Design for complex components not available in UI Library

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
- **File size limit**: 500 lines maximum per file
- **Single responsibility**: Each file/module has one clear purpose
- **Configuration centralization**: No hardcoded values in logic files
- **Import discipline**: Clear dependency boundaries between layers
- **Test co-location**: Tests live with the code they test

## UI Library Integration

### UI Library Priority System
**CRITICAL**: This application uses a custom UI Library as the primary source for all UI components.

#### Component Selection Priority Order:
1. **UI Library Components** (Primary) - Custom design system components
2. **Ant Design Components** (Fallback) - Only for complex components not in UI Library
3. **Custom Components** (Last Resort) - Only when neither above options are suitable

#### UI Library Usage Rules:
- **ALWAYS check UI Library first** before using any other component source
- **NEVER duplicate UI Library components** - use existing ones or extend them
- **Plan additions to UI Library** when creating new reusable components
- **Follow UI Library patterns** for consistency and maintainability
- **Document component usage** in UI Library when adding new components

### UI Library Development Workflow

#### Local Development with UI Library
1. **Link UI Library Locally**:
   ```bash
   # In UI Library repository
   npm link
   
   # In electron-app repository
   npm link ui-library
   ```

2. **Development Commands**:
   ```bash
   # Start UI Library in watch mode
   cd path/to/ui-library
   npm run dev
   
   # Start electron-app with linked UI Library
   cd path/to/electron-app
   npm start
   ```

3. **Hot Reload Setup**:
   - UI Library changes automatically reflect in electron-app
   - Vite handles hot module replacement for both libraries
   - TypeScript types update in real-time

#### Adding Components to UI Library
1. **Component Creation**:
   ```bash
   # In UI Library repository
   npm run generate:component ComponentName
   ```

2. **Component Structure**:
   ```
   ui-library/src/components/ComponentName/
   ├── ComponentName.tsx          # Main component
   ├── ComponentName.stories.tsx  # Storybook stories
   ├── ComponentName.test.tsx     # Unit tests
   ├── ComponentName.module.css   # Component styles
   ├── index.ts                   # Exports
   └── README.md                  # Component documentation
   ```

3. **Development Process**:
   - Create component in UI Library with full TypeScript support
   - Add comprehensive Storybook stories for all variants
   - Write unit tests with React Testing Library
   - Document component API and usage examples
   - Test component in electron-app via npm link

#### UI Library Deployment Process

##### Development Deployment
1. **Version Management**:
   ```bash
   # Increment version (patch/minor/major)
   npm version patch
   ```

2. **Build and Test**:
   ```bash
   # Run full test suite
   npm test
   
   # Build library for distribution
   npm run build
   
   # Generate and validate TypeScript declarations
   npm run build:types
   ```

3. **Publish to Registry**:
   ```bash
   # Publish to npm registry
   npm publish
   
   # Or publish to private registry
   npm publish --registry https://your-private-registry.com
   ```

##### Production Deployment
1. **Release Preparation**:
   ```bash
   # Create release branch
   git checkout -b release/v1.2.3
   
   # Update CHANGELOG.md with new features/fixes
   # Update package.json version
   # Update documentation
   ```

2. **Quality Assurance**:
   ```bash
   # Run comprehensive test suite
   npm run test:coverage
   
   # Visual regression testing with Chromatic
   npm run chromatic
   
   # Accessibility testing
   npm run test:a11y
   
   # Performance testing
   npm run test:performance
   ```

3. **Release Process**:
   ```bash
   # Create production build
   npm run build:production
   
   # Create git tag
   git tag v1.2.3
   
   # Push to main branch
   git push origin main --tags
   
   # Publish to registry
   npm publish --tag latest
   ```

#### Integration in Electron App
1. **Install UI Library**:
   ```bash
   npm install ui-library@latest
   ```

2. **Import and Use Components**:
   ```typescript
   // Preferred: Import from UI Library
   import { Button, Card, Modal } from 'ui-library';
   
   // Fallback: Import from Ant Design (only if not in UI Library)
   import { DatePicker, Table } from 'antd';
   
   // Last Resort: Create custom component (plan to add to UI Library)
   import { CustomSpecializedComponent } from './components/CustomSpecializedComponent';
   ```

3. **Theme Integration**:
   ```typescript
   // Use UI Library theme provider
   import { ThemeProvider } from 'ui-library';
   
   function App() {
     return (
       <ThemeProvider theme="cnc-controls">
         <YourAppComponents />
       </ThemeProvider>
     );
   }
   ```

#### Component Migration Strategy
1. **Audit Existing Components**: Identify reusable components not in UI Library
2. **Prioritize by Usage**: Move most-used components to UI Library first
3. **Create Migration Plan**: Phase out Ant Design components in favor of UI Library
4. **Maintain Backward Compatibility**: Ensure smooth transition during migration

#### Storybook Documentation
- **Component Showcase**: All UI Library components documented in Storybook
- **Usage Examples**: Interactive examples for all component variants
- **Design Tokens**: Color palettes, typography, spacing documented
- **Accessibility Guidelines**: Screen reader support and keyboard navigation

#### Quality Standards for UI Library
- **100% TypeScript Coverage**: All components fully typed
- **95%+ Test Coverage**: Comprehensive unit and integration tests
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Performance Optimized**: Tree-shakeable, optimized bundle size
- **Design System Consistency**: Follows established design tokens

### UI Library Commands Reference
```bash
# Local Development
npm link ui-library              # Link local UI Library
npm start                        # Start with linked library

# UI Library Development
npm run dev                      # Start library in watch mode
npm run storybook               # Start Storybook development server
npm run test:watch              # Run tests in watch mode

# Building and Publishing
npm run build                    # Build library for production
npm run build:types             # Generate TypeScript declarations
npm run test:coverage           # Run tests with coverage report
npm publish                     # Publish to npm registry

# Quality Assurance
npm run lint                     # ESLint code analysis
npm run test:a11y               # Accessibility testing
npm run chromatic               # Visual regression testing
```

## UI Library Issue Resolution Process

### CRITICAL: Never Use CSS Overrides for UI Library Components

**When you encounter styling issues with UI library components, ALWAYS follow this process:**

#### 1. Identify the Root Cause
- **Check if the issue exists in UI Library Storybook**
- **If the issue is NOT in Storybook**: It's an integration problem, investigate CSS conflicts
- **If the issue IS in Storybook**: The problem is in the UI Library component itself

#### 2. Fix at the Source (UI Library)
```bash
# Navigate to UI Library repository
cd /path/to/ui-library

# Make component fixes in the appropriate file
# Example: packages/core/src/primitives/ComponentName/ComponentName.tsx

# Build the library
npm run build

# Test in Storybook
npm run storybook
```

#### 3. Common UI Library Component Fixes

**Button Height Issues:**
```typescript
// Fix container and button sizing
const containerStyles = {
  height: 'calc(100% - 2px)',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column'
};

const buttonStyles = {
  height: '50%',
  minHeight: 0,
  flex: 1,
  boxSizing: 'border-box'
};
```

**Duplicate Error Messages:**
```typescript
// Add conditional rendering control
interface ComponentProps {
  showError?: boolean; // Add this prop
}

// In component render
{error && showError && (
  <p>{error}</p>
)}
```

**Transform/Scale Issues:**
```typescript
// Replace transform scaling with opacity
onMouseDown={(e) => {
  e.currentTarget.style.opacity = '0.8';
}}
onMouseUp={(e) => {
  e.currentTarget.style.opacity = '1';
}}
```

#### 4. Build and Deploy Fixed Library
```bash
# Build the core package
npm run build --prefix /path/to/ui-library/packages/core

# Or build entire library
npm run build --prefix /path/to/ui-library

# Update electron app to use new version
cd /path/to/electron-app
rm -rf node_modules/@whttlr/ui-core
npm install
```

#### 5. Test Integration
```bash
# Start electron app
npm start

# Verify fixes work in the application
# Check all affected components and views
```

#### 6. Clean Up
```bash
# Remove any CSS override files
rm src/component-name-fixes.css

# Remove CSS imports from App.tsx
# Remove any temporary workarounds
```

### Why This Process is Critical

1. **Architectural Integrity**: Fixes at the source maintain clean architecture
2. **Consistency**: Ensures all applications using the UI Library benefit from fixes
3. **Maintainability**: Prevents technical debt accumulation
4. **Testing**: UI Library has proper testing infrastructure
5. **Documentation**: Changes are properly documented in Storybook

### When CSS Overrides Are Acceptable

**NEVER** use CSS overrides for UI Library components. The only acceptable scenario is:
- **Temporary emergency fixes** with a clear timeline for proper resolution
- **Must be accompanied by a GitHub issue** to fix at the source
- **Must include TODO comments** explaining the temporary nature

### Red Flags - When You're Doing It Wrong

- Creating files like `ui-library-fixes.css`
- Adding `!important` declarations to override UI Library styles
- Using attribute selectors like `div[style*="width: 100%"]`
- Justifying overrides as "quick fixes" or "integration-specific"

### Example: Proper Issue Resolution

**Issue**: NumberInput buttons are taller than input field

**❌ Wrong Approach:**
```css
/* ui-library-fixes.css */
div[style*="width: 100%"] button {
  height: 50% !important;
}
```

**✅ Correct Approach:**
```typescript
// In UI Library: NumberInput.tsx
const arrowButtonStyles = {
  height: '50%',
  minHeight: 0,
  flex: 1,
  boxSizing: 'border-box'
};
```

This approach ensures the fix is permanent, tested, and benefits all users of the UI Library.

## Recent Updates
- Migrated from Node.js CLI application to React/TypeScript desktop app
- Implemented comprehensive plugin system with dynamic loading
- Added 3D visualization using React Three Fiber
- **NEW**: Integrated custom UI Library as primary component source
- Established UI Library development and deployment workflows
- Created professional UI with design system consistency
- Established proper project architecture with clean separation of concerns
- Removed legacy CNC protocol code in favor of modern web technologies
- Cleaned up unused directories and files for better maintainability
- **NEW**: Defined strict self-contained module architecture for better organization and maintainability
- **NEW**: Defined UI Library integration standards and development workflows