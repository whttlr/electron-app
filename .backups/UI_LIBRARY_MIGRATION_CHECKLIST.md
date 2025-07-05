# UI Library Migration Checklist
*Extracted from JUL_5_UI_COMPONENT_LIBARY_AND_THEME.md*

## Phase 1: Foundation Setup (Week 1-2)

### Repository Setup
- [ ] **Use existing repository**: `https://github.com/whttlr/ui-library.git` (already available)
- [ ] **Initialize monorepo**: Set up Turborepo for package management in `/Users/tylerhenry/Desktop/whttlr/ui-library`
- [ ] **Configure build system**: Vite for component building, Rollup for distribution
- [ ] **Set up CI/CD**: GitHub Actions for testing, building, and publishing

### Core Package Structure
- [ ] **Extract design tokens**:
  ```bash
  # Copy from current codebase to ui-library repo
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/shared/design-tokens.ts → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/theme/src/tokens/
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/theme/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/theme/src/
  ```

- [ ] **Set up component architecture**:
  ```bash
  # Create base component structure in ui-library repo
  /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/primitives/
  /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/complex/
  /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/animated/
  /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/mobile/
  ```

- [ ] **Configure TypeScript**:
  - [ ] Shared TypeScript configuration
  - [ ] Component prop type definitions
  - [ ] Theme type system
  - [ ] Export type declarations

## Phase 2: Core Component Migration (Week 3-4)

### Primitive Components
- [ ] **Button System**:
  - [ ] Extract from `src/ui/shared/Button.tsx`
  - [ ] Create variants: primary, secondary, danger, ghost
  - [ ] Add sizes: sm, md, lg
  - [ ] Add loading and disabled states

- [ ] **Card Components**:
  - [ ] Extract from `src/ui/shared/Card.tsx`
  - [ ] Create variants: default, outlined, elevated
  - [ ] Add padding options: none, sm, md, lg

- [ ] **Input System**:
  - [ ] Extract from `src/ui/shared/Input.tsx`
  - [ ] Create variants: default, filled, outlined
  - [ ] Add states: default, error, success, warning

- [ ] **Badge Components**:
  - [ ] Extract from `src/ui/shared/Badge.tsx`
  - [ ] Create variants and states

- [ ] **Alert Components**:
  - [ ] Extract from `src/ui/shared/Alert.tsx`
  - [ ] Create notification system

### Layout Components
- [ ] **Grid System**: Extract from `src/ui/shared/Grid.tsx`
- [ ] **Container**: Extract from `src/ui/shared/Container.tsx`
- [ ] **Sidebar**: Extract from `src/ui/shared/Sidebar.tsx`

## Phase 3: Complex Components Migration (Week 5-6)

### Chart Components
- [ ] **Extract chart system to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/components/charts/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/charts/
  ```
- [ ] **AreaChart**: Migrate and test
- [ ] **BarChart**: Migrate and test
- [ ] **LineChart**: Migrate and test
- [ ] **PieChart**: Migrate and test
- [ ] **MetricCard**: Migrate and test
- [ ] **DataVisualization**: Migrate unified component

### Animated Components
- [ ] **Extract animation system to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/components/animated/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/animated/
  ```
- [ ] **AnimatedCard**: Migrate and test
- [ ] **AnimatedProgress**: Migrate and test
- [ ] **ScrollReveal**: Migrate and test
- [ ] **FloatingActionButton**: Migrate and test
- [ ] **Animation variants**: Migrate variants.ts configuration

### Mobile Components
- [ ] **Extract mobile system to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/components/mobile/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/mobile/
  ```
- [ ] **TouchButton**: Migrate and test
- [ ] **TouchJogControls**: Migrate and test
- [ ] **MobileNavigation**: Migrate and test
- [ ] **OrientationAdapter**: Migrate and test

## Phase 4: CNC-Specific Components (Week 7-8)

### Control Components
- [ ] **Extract CNC controls to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/controls/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/controls/
  ```
- [ ] **JogControls**: Migrate and test
- [ ] **CoordinateDisplay**: Migrate and test
- [ ] **EmergencyStop**: Migrate and test
- [ ] **StatusIndicators**: Migrate and test
- [ ] **ConnectionStatus**: Migrate and test
- [ ] **MachineStatusMonitor**: Migrate and test

### CNC Forms
- [ ] **Extract CNC forms to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/forms/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/forms/
  ```
- [ ] **MachineSetupForm**: Migrate and test
- [ ] **JobSetupForm**: Migrate and test
- [ ] **ConnectionForm**: Migrate and test
- [ ] **CNCForms**: Migrate general CNC form components

### Visualization Components
- [ ] **Extract CNC visualization to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/visualization/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/visualization/
  ```
- [ ] **MachineDisplay2D**: Migrate and test
- [ ] **WorkingAreaPreview**: Migrate and test
- [ ] **ToolPath**: Migrate and test (if exists)

### CNC Validation
- [ ] **Extract CNC validation**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/validation/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/validation/
  ```
- [ ] **Coordinate validation**: Migrate and test
- [ ] **Feed rate validation**: Migrate and test
- [ ] **Machine config validation**: Migrate and test
- [ ] **Connection parameter validation**: Migrate and test
- [ ] **File format validation**: Migrate and test

## Phase 5: Adapter System Migration (Week 9-10)

### Multi-Library Support
- [ ] **Extract adapter system to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/adapters/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/adapters/src/
  ```
- [ ] **Ant Design Adapter**: Migrate complete component wrapper set
- [ ] **Headless UI Adapter**: Migrate alternative primitive implementations
- [ ] **Custom Adapter**: Migrate pure custom component implementations
- [ ] **Factory System**: Migrate runtime component library switching
- [ ] **Adapter Registry**: Migrate adapter management system
- [ ] **Component Factory**: Migrate factory functions

### Provider System
- [ ] **Extract providers to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/providers/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/providers/
  ```
- [ ] **ThemeProvider**: Migrate theme management
- [ ] **ComponentProvider**: Migrate component library abstraction
- [ ] **AccessibilityProvider**: Migrate A11y features
- [ ] **LayoutProvider**: Migrate layout management
- [ ] **PluginProvider**: Migrate plugin system integration

## Phase 6: Testing & Tooling (Week 11-12)

### Testing Infrastructure
- [ ] **Extract testing utilities to ui-library repo**:
  ```bash
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/testing/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/testing/src/
  /Users/tylerhenry/Desktop/whttlr/electron-app/src/test-utils/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/testing/src/
  ```
- [ ] **Component Testing**: Migrate React Testing Library setup
- [ ] **Visual Regression**: Migrate screenshot comparison system
- [ ] **Accessibility Testing**: Migrate Axe-core integration
- [ ] **Performance Testing**: Migrate render time measurement
- [ ] **Mobile Testing**: Migrate touch simulation, viewport mocking
- [ ] **Mock Data**: Migrate component and theme mocks

### Documentation Setup
- [ ] **Storybook configuration**: Component documentation and examples
- [ ] **API documentation**: Auto-generated from TypeScript definitions
- [ ] **Usage guides**: Migration and implementation guides
- [ ] **Component examples**: Live examples for each component
- [ ] **Theme documentation**: Design token documentation

### CLI Tools
- [ ] **Component generator**: Create CLI for scaffolding new components
- [ ] **Theme utilities**: CLI tools for theme management
- [ ] **Migration helpers**: Tools to assist in migration process

## Main Application Migration

### Phase 1: Dependency Setup
- [ ] **Update package.json**:
  ```json
  {
    "dependencies": {
      "@whttlr/ui-core": "^1.0.0",
      "@whttlr/ui-theme": "^1.0.0",
      "@whttlr/ui-adapters": "^1.0.0",
      "@whttlr/ui-cnc": "^1.0.0"
    }
  }
  ```

### Phase 2: Import Migration
- [ ] **Update component imports**:
  ```typescript
  // Before
  import { Button } from '../ui/shared/Button'
  import { JogControls } from '../ui/controls/JogControls'

  // After
  import { Button } from '@whttlr/ui-core'
  import { JogControls } from '@whttlr/ui-cnc'
  ```

### Phase 3: Theme Provider Setup
- [ ] **Update App.tsx**:
  ```typescript
  import { ThemeProvider } from '@whttlr/ui-theme'
  import { ComponentProvider } from '@whttlr/ui-adapters'

  function App() {
    return (
      <ThemeProvider theme="cnc">
        <ComponentProvider adapter="ant-design">
          {/* App content */}
        </ComponentProvider>
      </ThemeProvider>
    )
  }
  ```

### Phase 4: Legacy Cleanup
- [ ] **Remove extracted files** from main application
- [ ] **Update component exports** in `src/components/index.ts`
- [ ] **Update test imports** to use new packages
- [ ] **Remove redundant dependencies**
- [ ] **Update build configuration**
- [ ] **Test full application functionality**

## Package Publishing

### NPM Package Setup
- [ ] **@whttlr/ui-core**: Base components and primitives
- [ ] **@whttlr/ui-theme**: Design system and tokens
- [ ] **@whttlr/ui-adapters**: Multi-library adapter system
- [ ] **@whttlr/ui-cnc**: CNC-specific components
- [ ] **@whttlr/ui-testing**: Testing utilities
- [ ] **@whttlr/ui-icons**: Icon system
- [ ] **@whttlr/ui-cli**: Component CLI tools

### Release Process
- [ ] **Set up semantic versioning**
- [ ] **Configure automated publishing**
- [ ] **Create release workflow**
- [ ] **Set up package distribution**

## Success Metrics Validation
- [ ] **Bundle size reduction**: Measure 30-40% reduction in main application
- [ ] **Build time improvement**: Measure 25-35% faster builds
- [ ] **Test coverage**: Achieve 90%+ for extracted components
- [ ] **Documentation coverage**: Achieve 100% component API documentation
- [ ] **Performance validation**: Ensure no regression in app performance
- [ ] **Accessibility validation**: Maintain or improve A11y scores