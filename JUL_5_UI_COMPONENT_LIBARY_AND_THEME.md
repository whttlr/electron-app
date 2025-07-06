# UI Component Library & Theme System Migration Plan
*July 5, 2025 - Strategic Plan for Extracting @whttlr/ui-library*

## Executive Summary

Based on analysis of the current CNC application architecture and the Design System Strategic Plan, this document outlines the extraction of a comprehensive UI component library that can be published as a standalone npm package. The current system contains a sophisticated multi-adapter UI architecture with 50+ components, comprehensive theming, and CNC-specific primitives that would provide significant value as a reusable library.

## Repository Information

**Target Repository**: https://github.com/whttlr/ui-library.git  
**Local Development Path**: `/Users/tylerhenry/Desktop/whttlr/ui-library`

The UI library repository is already established and ready for the migration process. All development and extraction work will be performed in the local clone at the specified path.

## ✅ Migration Progress Checklist

### Phase 1: Foundation Setup (COMPLETED ✅)
- [x] **Repository Setup**: Used existing repository and initialized monorepo structure
- [x] **Turborepo Configuration**: Set up for package management
- [x] **Build System**: Configured Vite/Rollup for component building
- [x] **CI/CD Setup**: GitHub Actions for testing, building, and publishing
- [x] **Package Structure**: Created 7 packages (core, theme, adapters, cnc, testing, icons, cli)
- [x] **TypeScript Configuration**: Shared config with proper exports
- [x] **Linting & Formatting**: ESLint, Prettier setup
- [x] **Testing Framework**: Jest configuration

### Phase 1: Design Tokens Migration (COMPLETED ✅)
- [x] **Color Tokens**: Extracted to `/packages/theme/src/tokens/colors.ts`
- [x] **Spacing Tokens**: Extracted to `/packages/theme/src/tokens/spacing.ts`
- [x] **Typography Tokens**: Extracted to `/packages/theme/src/tokens/typography.ts`
- [x] **Shadow Tokens**: Extracted to `/packages/theme/src/tokens/shadows.ts`
- [x] **Breakpoint Tokens**: Extracted to `/packages/theme/src/tokens/breakpoints.ts`
- [x] **Animation Tokens**: Extracted to `/packages/theme/src/tokens/animation.ts`
- [x] **CNC-Specific Tokens**: Preserved industrial/CNC color palette and variants
- [x] **Token Consolidation**: Created unified exports in `/packages/theme/src/tokens/index.ts`
- [x] **Theme Configuration**: Migrated theme config system to `/packages/theme/src/config.ts`
- [x] **CSS Utilities**: Migrated `cn` function and formatters to `/packages/theme/src/utils.ts`
- [x] **Dependencies**: Added clsx, tailwind-merge to theme package

### Phase 1: Core Primitive Components (COMPLETED ✅)
- [x] **Button Component**: Migrated with all variants (including CNC: emergency, success, warning)
- [x] **Card Component**: Migrated with CNC variants (StatusCard, DashboardCard)
- [x] **Badge Component**: Migrated with CNC variants (StatusBadge, PrecisionBadge)
- [x] **Alert Component**: Migrated with AlertBanner variant
- [x] **Input Component**: Migrated with CNC variants (CoordinateInput, PrecisionInput)
- [x] **Grid Component**: Migrated with CNC variants (DashboardGrid, ControlGrid, JogGrid)
- [x] **Container Component**: Migrated with CNC variants (ControlContainer, DashboardContainer)
- [x] **Package Dependencies**: Added @radix-ui/react-slot, class-variance-authority, framer-motion, recharts
- [x] **Import Updates**: Updated to use `@whttlr/ui-theme`
- [x] **Package Structure**: Created proper index files and exports

### Phase 2: Complex Components Migration (COMPLETED ✅)
- [x] **Chart Components Foundation**: Migrated types, constants, utils, and MetricCard
- [x] **Chart Package Structure**: Created `/packages/core/src/complex/Charts/` with proper exports
- [x] **Chart Dependencies**: Added recharts and framer-motion dependencies
- [x] **All Chart Components**: LineChart, AreaChart, BarChart, PieChart, MachineDashboard
- [x] **Chart System Complete**: 6 chart components migrated with CNC-specific features
- [x] **Ant Design Dependencies Removed**: Replaced with native UI components
- [x] **Animated Components**: Extract animation system to ui-library repo
- [x] **Mobile Components**: Extract mobile system to ui-library repo

### Phase 2: Component Testing & Documentation (COMPLETED ✅)
- [x] **Component Testing**: Create test files for migrated components
- [x] **Component Documentation**: Add README files for each component
- [x] **Comprehensive Test Coverage**: Button, Card, Badge, and Chart component tests
- [x] **Detailed Documentation**: Usage examples, props tables, and accessibility guidelines
- [x] **CNC-Specific Examples**: Industrial use cases and specialized component variants

### Phase 3: CNC-Specific Components Migration (COMPLETED ✅)
- [x] **Control Components**: Extract CNC controls to ui-library repo
- [x] **CNC Forms**: Extract CNC forms to ui-library repo  
- [x] **Visualization Components**: Extract CNC visualization to ui-library repo
- [x] **CNC Validation**: Extract CNC validators
- [x] **Mobile CNC Components**: Extract touch-optimized and mobile CNC interfaces
- [x] **Complete CNC Package**: Set up @whttlr/ui-cnc with full industrial component suite

### Phase 4: Adapter System Migration (COMPLETED ✅)
- [x] **Multi-Library Support**: Extract adapter system to ui-library repo
- [x] **Provider System**: Extract providers to ui-library repo
- [x] **ComponentFactory and AdapterRegistry**: Create advanced factory system for component switching
- [x] **Comprehensive Type System**: Define complete TypeScript interfaces for all adapter types
- [x] **Package Structure**: Set up proper package.json and exports for @whttlr/ui-adapters

### Phase 5: Testing & Tooling (COMPLETED ✅)
- [x] **Testing Infrastructure**: Extract testing utilities to ui-library repo
- [x] **Comprehensive Test Utilities**: Migrate accessibility, mobile, visual regression, and performance testing
- [x] **Documentation Setup**: Storybook configuration with CNC-specific viewports and A11y integration
- [x] **CLI Tools**: Component generator with theme creation and migration utilities
- [x] **Testing Package Structure**: Set up @whttlr/ui-testing with proper exports and dependencies

### Phase 6: Main Application Migration (COMPLETED ✅)
- [x] **Dependency Setup**: Update package.json with new packages
- [x] **Import Migration**: Update component imports to use @whttlr/ui-* packages
- [x] **Theme Provider Setup**: Update App.tsx with new ThemeProvider and ComponentProvider
- [x] **Legacy Cleanup**: Remove extracted files and update exports
- [x] **Migration Documentation**: Create comprehensive migration guide
- [x] **Backward Compatibility**: Maintain compatibility during transition period

## Current Status: **MIGRATION COMPLETE** ✅

**ALL PHASES COMPLETED**: 
- ✅ Phase 1: Foundation Setup & Design Tokens Migration  
- ✅ Phase 2: Complex Components Migration (Charts, Animated, Mobile)
- ✅ Phase 3: CNC-Specific Components Migration
- ✅ Phase 4: Adapter System Migration  
- ✅ Phase 5: Testing & Tooling
- ✅ Phase 6: Main Application Migration

**Final Result**: Complete @whttlr/ui-library with 7 packages, 50+ components, comprehensive testing, documentation, and CLI tools.

## Current Architecture Analysis

### Existing UI Assets (In src/)
Our codebase contains a well-architected UI system with:

#### **Core Components** (47 identified components)
- **Primitives**: Button, Card, Badge, Alert, Input, Grid, Container
- **Complex**: Tables, Forms, Modals, Navigation, Charts (Area, Bar, Line, Pie)
- **CNC-Specific**: JogControls, CoordinateDisplay, StatusIndicators, EmergencyStop
- **Animated**: AnimatedCard, AnimatedProgress, ScrollReveal, FloatingActionButton
- **Mobile**: TouchButton, TouchJogControls, MobileNavigation, OrientationAdapter

#### **Multi-Adapter System**
- **Ant Design Adapter**: Complete component wrapper set
- **Headless UI Adapter**: Alternative primitive implementations
- **Custom Adapter**: Pure custom component implementations
- **Factory System**: Runtime component library switching

#### **Design System Foundation**
- **Design Tokens**: Comprehensive token system in `design-tokens.ts`
- **Theme System**: CSS variables, multiple theme support
- **Responsive System**: Breakpoints, mobile-first approach
- **Animation System**: Framer Motion integration with reusable variants

#### **Testing Infrastructure**
- **Component Testing**: React Testing Library setup
- **Visual Regression**: Screenshot comparison system
- **Accessibility Testing**: Axe-core integration
- **Performance Testing**: Render time measurement
- **Mobile Testing**: Touch simulation, viewport mocking

## Proposed @whttlr/ui-library Structure

### Repository Architecture
```
@whttlr/ui-library/
├── 📁 packages/
│   ├── 📁 core/                     # Core UI components
│   │   ├── 📁 src/
│   │   │   ├── 📁 primitives/       # Base components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   ├── Button.stories.tsx
│   │   │   │   │   ├── Button.module.css
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Card/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Alert/
│   │   │   │   ├── Input/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 complex/          # Complex components
│   │   │   │   ├── DataTable/
│   │   │   │   ├── Form/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Navigation/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 charts/           # Data visualization
│   │   │   │   ├── AreaChart/
│   │   │   │   ├── BarChart/
│   │   │   │   ├── LineChart/
│   │   │   │   ├── PieChart/
│   │   │   │   ├── MetricCard/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 animated/         # Animation components
│   │   │   │   ├── AnimatedCard/
│   │   │   │   ├── AnimatedProgress/
│   │   │   │   ├── ScrollReveal/
│   │   │   │   ├── FloatingActionButton/
│   │   │   │   ├── variants.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 mobile/           # Mobile-optimized components
│   │   │   │   ├── TouchButton/
│   │   │   │   ├── TouchControls/
│   │   │   │   ├── MobileNavigation/
│   │   │   │   ├── OrientationAdapter/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 providers/        # Context providers
│   │   │   │   ├── ThemeProvider/
│   │   │   │   ├── ComponentProvider/
│   │   │   │   ├── AccessibilityProvider/
│   │   │   │   ├── LayoutProvider/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 hooks/            # UI-related hooks
│   │   │   │   ├── useTheme.ts
│   │   │   │   ├── useBreakpoint.ts
│   │   │   │   ├── useAnimation.ts
│   │   │   │   ├── useAccessibility.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 utils/            # UI utilities
│   │   │   │   ├── className.ts
│   │   │   │   ├── responsive.ts
│   │   │   │   ├── animation.ts
│   │   │   │   ├── accessibility.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── 📁 theme/                    # Design system & tokens
│   │   ├── 📁 src/
│   │   │   ├── 📁 tokens/           # Design tokens
│   │   │   │   ├── colors.ts
│   │   │   │   ├── typography.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   ├── shadows.ts
│   │   │   │   ├── breakpoints.ts
│   │   │   │   ├── animation.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 themes/           # Theme variants
│   │   │   │   ├── light.ts
│   │   │   │   ├── dark.ts
│   │   │   │   ├── cnc.ts           # CNC-specific theme
│   │   │   │   ├── high-contrast.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 components/       # Component styles
│   │   │   │   ├── button.ts
│   │   │   │   ├── card.ts
│   │   │   │   ├── input.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 css/              # CSS utilities
│   │   │   │   ├── reset.css
│   │   │   │   ├── variables.css
│   │   │   │   ├── utilities.css
│   │   │   │   └── index.css
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── 📁 adapters/                 # Multi-library adapters
│   │   ├── 📁 src/
│   │   │   ├── 📁 ant-design/       # Ant Design adapter
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Card/
│   │   │   │   │   ├── Table/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── adapter.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 headless-ui/      # Headless UI adapter
│   │   │   │   ├── 📁 components/
│   │   │   │   ├── adapter.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 custom/           # Custom implementation
│   │   │   │   ├── 📁 components/
│   │   │   │   ├── adapter.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 factory/          # Adapter factory
│   │   │   │   ├── ComponentFactory.ts
│   │   │   │   ├── AdapterRegistry.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 types/            # Adapter types
│   │   │   │   ├── adapter.ts
│   │   │   │   ├── components.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── 📁 cnc/                      # CNC-specific components
│   │   ├── 📁 src/
│   │   │   ├── 📁 controls/         # CNC control components
│   │   │   │   ├── JogControls/
│   │   │   │   ├── CoordinateDisplay/
│   │   │   │   ├── EmergencyStop/
│   │   │   │   ├── StatusIndicators/
│   │   │   │   ├── ConnectionStatus/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 visualization/    # CNC visualization
│   │   │   │   ├── MachineDisplay2D/
│   │   │   │   ├── WorkingAreaPreview/
│   │   │   │   ├── ToolPath/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 forms/            # CNC-specific forms
│   │   │   │   ├── MachineSetupForm/
│   │   │   │   ├── JobSetupForm/
│   │   │   │   ├── ConnectionForm/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 validation/       # CNC validators
│   │   │   │   ├── coordinates.ts
│   │   │   │   ├── feedrates.ts
│   │   │   │   ├── machine-config.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── 📁 testing/                  # Testing utilities
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/       # Component test utilities
│   │   │   │   ├── TestProvider.tsx
│   │   │   │   ├── ComponentWrapper.tsx
│   │   │   │   ├── MockProvider.tsx
│   │   │   │   └── index.ts
│   │   │   ├── 📁 accessibility/    # A11y testing
│   │   │   │   ├── axe-helpers.ts
│   │   │   │   ├── keyboard-navigation.ts
│   │   │   │   ├── screen-reader.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 visual/           # Visual regression
│   │   │   │   ├── screenshot.ts
│   │   │   │   ├── baseline.ts
│   │   │   │   ├── comparison.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 mobile/           # Mobile testing
│   │   │   │   ├── touch-simulation.ts
│   │   │   │   ├── viewport-mocking.ts
│   │   │   │   ├── orientation.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 performance/      # Performance testing
│   │   │   │   ├── render-time.ts
│   │   │   │   ├── memory-usage.ts
│   │   │   │   ├── bundle-size.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 mocks/            # Mock data
│   │   │   │   ├── components.ts
│   │   │   │   ├── theme.ts
│   │   │   │   ├── cnc-data.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── 📁 icons/                    # Icon system
│   │   ├── 📁 src/
│   │   │   ├── 📁 cnc/              # CNC-specific icons
│   │   │   ├── 📁 common/           # Common icons
│   │   │   ├── 📁 components/       # Icon components
│   │   │   │   ├── Icon.tsx
│   │   │   │   ├── IconButton.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── 📁 cli/                      # Component CLI tools
│       ├── 📁 src/
│       │   ├── 📁 commands/
│       │   │   ├── generate.ts      # Component generator
│       │   │   ├── theme.ts         # Theme utilities
│       │   │   └── migrate.ts       # Migration helpers
│       │   ├── 📁 templates/        # Component templates
│       │   └── index.ts
│       ├── bin/
│       │   └── whttlr-ui
│       ├── package.json
│       └── README.md
│
├── 📁 apps/                         # Example applications
│   ├── 📁 storybook/                # Component documentation
│   │   ├── .storybook/
│   │   ├── stories/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── 📁 playground/               # Development playground
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── 📁 documentation/            # Documentation site
│       ├── src/
│       ├── package.json
│       └── README.md
│
├── 📁 tools/                        # Build and development tools
│   ├── 📁 build/                    # Build configuration
│   ├── 📁 eslint/                   # ESLint configuration
│   ├── 📁 typescript/               # TypeScript configuration
│   └── 📁 testing/                  # Testing configuration
│
├── 📁 docs/                         # Documentation
│   ├── 📁 guides/                   # Usage guides
│   ├── 📁 api/                      # API documentation
│   └── 📁 migration/                # Migration guides
│
├── package.json                     # Root package configuration
├── turbo.json                       # Turborepo configuration
├── tsconfig.json                    # TypeScript configuration
├── .eslintrc.js                     # ESLint configuration
├── .gitignore
└── README.md
```

## Migration Strategy

### Phase 1: Foundation Setup (Week 1-2)

#### **Repository Setup**
1. **Use existing repository**: `https://github.com/whttlr/ui-library.git` (already available)
2. **Initialize monorepo**: Set up Turborepo for package management in `/Users/tylerhenry/Desktop/whttlr/ui-library`
3. **Configure build system**: Vite for component building, Rollup for distribution
4. **Set up CI/CD**: GitHub Actions for testing, building, and publishing

#### **Core Package Structure**
1. **Extract design tokens**:
   ```bash
   # Copy from current codebase to ui-library repo
   /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/shared/design-tokens.ts → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/theme/src/tokens/
   /Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/theme/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/theme/src/
   ```

2. **Set up component architecture**:
   ```bash
   # Create base component structure in ui-library repo
   /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/primitives/
   /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/complex/
   /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/animated/
   /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/mobile/
   ```

3. **Configure TypeScript**:
   - Shared TypeScript configuration
   - Component prop type definitions
   - Theme type system
   - Export type declarations

### Phase 2: Core Component Migration (Week 3-4)

#### **Primitive Components**
1. **Button System**:
   ```typescript
   // Extract from src/ui/shared/Button.tsx
   interface ButtonProps {
     variant: 'primary' | 'secondary' | 'danger' | 'ghost'
     size: 'sm' | 'md' | 'lg'
     loading?: boolean
     disabled?: boolean
     icon?: ReactNode
     // ... existing props
   }
   ```

2. **Card Components**:
   ```typescript
   // Extract from src/ui/shared/Card.tsx
   interface CardProps {
     variant: 'default' | 'outlined' | 'elevated'
     padding: 'none' | 'sm' | 'md' | 'lg'
     // ... existing props
   }
   ```

3. **Input System**:
   ```typescript
   // Extract from src/ui/shared/Input.tsx
   interface InputProps {
     variant: 'default' | 'filled' | 'outlined'
     state: 'default' | 'error' | 'success' | 'warning'
     // ... existing props
   }
   ```

#### **Layout Components**
1. **Grid System**: Extract from `src/ui/shared/Grid.tsx`
2. **Container**: Extract from `src/ui/shared/Container.tsx`
3. **Sidebar**: Extract from `src/ui/shared/Sidebar.tsx`

### Phase 3: Complex Components Migration (Week 5-6)

#### **Chart Components**
```bash
# Extract chart system to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/components/charts/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/charts/
```

#### **Animated Components**
```bash
# Extract animation system to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/components/animated/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/animated/
```

#### **Mobile Components**
```bash
# Extract mobile system to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/components/mobile/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/mobile/
```

### Phase 4: CNC-Specific Components (Week 7-8)

#### **Control Components**
```bash
# Extract CNC controls to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/controls/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/controls/
```

#### **CNC Forms**
```bash
# Extract CNC forms to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/forms/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/forms/
```

#### **Visualization Components**
```bash
# Extract CNC visualization to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/visualization/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/cnc/src/visualization/
```

### Phase 5: Adapter System Migration (Week 9-10)

#### **Multi-Library Support**
```bash
# Extract adapter system to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/adapters/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/adapters/src/
```

#### **Provider System**
```bash
# Extract providers to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/providers/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/core/src/providers/
```

### Phase 6: Testing & Tooling (Week 11-12)

#### **Testing Infrastructure**
```bash
# Extract testing utilities to ui-library repo
/Users/tylerhenry/Desktop/whttlr/electron-app/src/ui/testing/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/testing/src/
/Users/tylerhenry/Desktop/whttlr/electron-app/src/test-utils/ → /Users/tylerhenry/Desktop/whttlr/ui-library/packages/testing/src/
```

#### **Documentation Setup**
1. **Storybook configuration**: Component documentation and examples
2. **API documentation**: Auto-generated from TypeScript definitions
3. **Usage guides**: Migration and implementation guides

## Package Distribution Strategy

### NPM Package Structure
```json
{
  "@whttlr/ui-core": "Base components and primitives",
  "@whttlr/ui-theme": "Design system and tokens",
  "@whttlr/ui-adapters": "Multi-library adapter system",
  "@whttlr/ui-cnc": "CNC-specific components",
  "@whttlr/ui-testing": "Testing utilities",
  "@whttlr/ui-icons": "Icon system",
  "@whttlr/ui-cli": "Component CLI tools"
}
```

### Installation Options
```bash
# Full installation
npm install @whttlr/ui-core @whttlr/ui-theme @whttlr/ui-adapters

# CNC-specific installation
npm install @whttlr/ui-cnc @whttlr/ui-core @whttlr/ui-theme

# Testing utilities
npm install -D @whttlr/ui-testing

# Development tools
npm install -g @whttlr/ui-cli
```

## Main Application Migration

### Phase 1: Dependency Setup
```json
// package.json
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
```typescript
// Before
import { Button } from '../ui/shared/Button'
import { JogControls } from '../ui/controls/JogControls'

// After
import { Button } from '@whttlr/ui-core'
import { JogControls } from '@whttlr/ui-cnc'
```

### Phase 3: Theme Provider Setup
```typescript
// App.tsx
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
1. **Remove extracted files** from main application
2. **Update component exports** in `src/components/index.ts`
3. **Update test imports** to use new packages
4. **Remove redundant dependencies**

## Benefits Analysis

### **For Main Application**
- **Reduced bundle size**: Remove unused components
- **Faster builds**: Smaller codebase
- **Better maintainability**: Clear separation of concerns
- **Easier updates**: Semantic versioning for UI components

### **For UI Library**
- **Reusability**: Can be used in other CNC projects
- **Community contribution**: Open source component library
- **Better testing**: Isolated testing environment
- **Documentation**: Storybook-driven development

### **For Team**
- **Specialized development**: UI team can focus on components
- **Version control**: Independent release cycles
- **Better collaboration**: Clear component APIs

## Timeline & Resource Requirements

### **Development Timeline**: 12 weeks
- **Phase 1-2** (4 weeks): Foundation and core components
- **Phase 3-4** (4 weeks): Complex and CNC components  
- **Phase 5-6** (4 weeks): Adapters, testing, and documentation

### **Resource Requirements**
- **2 Frontend developers**: Full-time for migration
- **1 DevOps engineer**: Part-time for CI/CD setup
- **1 Designer**: Part-time for documentation and examples

### **Success Metrics**
- **Bundle size reduction**: 30-40% in main application
- **Build time improvement**: 25-35% faster builds
- **Test coverage**: 90%+ for extracted components
- **Documentation coverage**: 100% component API documentation

## Risk Mitigation

### **Technical Risks**
1. **Breaking changes**: Maintain backward compatibility during transition
2. **Dependency conflicts**: Careful peer dependency management
3. **Bundle duplication**: Proper externalization configuration

### **Mitigation Strategies**
1. **Gradual migration**: Phase-by-phase component extraction
2. **Extensive testing**: Comprehensive test suite before each release
3. **Documentation**: Clear migration guides and examples
4. **Rollback plan**: Ability to revert to embedded components

## Conclusion

The extraction of @whttlr/ui-library represents a strategic evolution of the current UI architecture. The existing codebase contains a sophisticated, well-architected component system that would provide significant value as a standalone library. The proposed migration plan balances ambitious goals with practical implementation, ensuring minimal disruption to current development while establishing a foundation for long-term growth and reusability.

The multi-adapter architecture, comprehensive testing infrastructure, and CNC-specific components make this library unique in the market and position it as a valuable open-source contribution to the CNC software community.