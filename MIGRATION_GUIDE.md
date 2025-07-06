# UI Library Migration Guide

This document outlines the changes needed to migrate from embedded UI components to the new @whttlr/ui-library packages.

## Package Dependencies

Add these dependencies to your package.json:

```json
{
  "dependencies": {
    "@whttlr/ui-core": "file:../ui-library/packages/core",
    "@whttlr/ui-theme": "file:../ui-library/packages/theme", 
    "@whttlr/ui-adapters": "file:../ui-library/packages/adapters",
    "@whttlr/ui-cnc": "file:../ui-library/packages/cnc",
    "@whttlr/ui-testing": "file:../ui-library/packages/testing"
  }
}
```

## Import Changes

### Core Components
```typescript
// Before
import { Button, Card, Badge } from '../ui/shared';

// After  
import { Button, Card, Badge } from '@whttlr/ui-core';
```

### CNC Components
```typescript
// Before
import { JogControls, CoordinateDisplay } from '../ui/controls';
import { MachineSetupForm } from '../ui/forms';
import { WorkingAreaPreview } from '../ui/visualization';

// After
import { 
  JogControls, 
  CoordinateDisplay,
  MachineSetupForm,
  WorkingAreaPreview 
} from '@whttlr/ui-cnc';
```

### Theme and Providers
```typescript
// Before
import { CustomThemeProvider } from '../ui/shared/ThemeProvider';
import { ComponentProvider } from '../ui/providers';

// After
import { ThemeProvider } from '@whttlr/ui-theme';
import { ComponentProvider } from '@whttlr/ui-core';
```

### Testing Utilities
```typescript
// Before
import { renderWithProviders } from '../test-utils';

// After
import { renderWithProviders } from '@whttlr/ui-testing';
```

## Provider Setup

Update your App.tsx to use the new providers:

```typescript
// Before
<ComponentProvider implementation="ant-design">
  <CustomThemeProvider>
    <AppContent />
  </CustomThemeProvider>
</ComponentProvider>

// After
<ThemeProvider theme="cnc">
  <ComponentProvider adapter="ant-design">
    <AppContent />
  </ComponentProvider>
</ThemeProvider>
```

## Files to Remove

After migration, these files can be removed:

### UI Components
- `src/ui/shared/` (moved to @whttlr/ui-core)
- `src/ui/controls/` (moved to @whttlr/ui-cnc)
- `src/ui/forms/` (moved to @whttlr/ui-cnc)
- `src/ui/visualization/` (moved to @whttlr/ui-cnc)
- `src/ui/adapters/` (moved to @whttlr/ui-adapters)
- `src/ui/providers/` (moved to @whttlr/ui-core)
- `src/ui/testing/` (moved to @whttlr/ui-testing)

### Test Utilities
- `src/test-utils/` (moved to @whttlr/ui-testing)

## Component Export Updates

Update component index files to remove extracted components:

```typescript
// src/components/index.ts - Remove these exports
export { Button, Card, Badge } from '../ui/shared';
export { JogControls, CoordinateDisplay } from '../ui/controls';
// etc.
```

## CLI Commands

Generate new components using the CLI:

```bash
# Generate a new primitive component
npx @whttlr/ui-cli generate --name MyComponent --type primitive

# Generate a CNC component
npx @whttlr/ui-cli generate --name MyControl --type cnc

# Generate a custom theme
npx @whttlr/ui-cli theme --name my-theme --type dark
```

## Testing Updates

Update test imports:

```typescript
// Before
import { renderWithProviders, mockApiClient } from '../test-utils';

// After
import { renderWithProviders, mockApiClient } from '@whttlr/ui-testing';
```

## Storybook Integration

The UI library includes Storybook documentation at:
- http://localhost:6006 (when running `npm run storybook` in ui-library)

## Benefits

- **Smaller Bundle**: Removed duplicate UI code
- **Better Maintainability**: Centralized component library
- **Type Safety**: Comprehensive TypeScript support
- **Testing**: Dedicated testing utilities package
- **Documentation**: Storybook integration
- **CLI Tools**: Component generation and theming
- **Version Control**: Independent releases