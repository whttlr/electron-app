# UI Demo Components

This directory contains the refactored UI demo components that were extracted from the original monolithic `UIDemoView.tsx` file to comply with the architecture's 500-line file limit.

## Architecture Compliance

The original `UIDemoView.tsx` was **3,328 lines** and violated the architecture's file size limit. It has been split into smaller, focused components:

### Completed Components

1. **BasicComponentsDemo** (~85 lines) - Buttons, badges, and status indicators
2. **NumberInputsDemo** (~95 lines) - Number inputs and CNC-specific input controls
3. **CNCControlsDemo** (~60 lines) - Jog controls and machine control components
4. **PositionStatusDemo** (~65 lines) - Position displays and status monitoring

### Remaining Components (To Be Created)

5. **FormsDemo** - Forms & Input Controls (large section)
6. **PopoverTooltipsDemo** - Popovers & Tooltips
7. **ProgressDemo** - Progress Indicators
8. **NotificationsDemo** - Notifications
9. **SafetyDemo** - Status & Safety controls
10. **AlertsDemo** - Alerts & Notifications
11. **LayoutDemo** - Layout & Interactive Cards
12. **TypographyDemo** - Typography
13. **DataTablesDemo** - Data Tables
14. **InteractiveDemo** - Interactive Components

## Progress

- ✅ **BasicComponentsDemo** - Extracted and implemented
- ✅ **NumberInputsDemo** - Extracted and implemented  
- ✅ **CNCControlsDemo** - Extracted and implemented
- ✅ **PositionStatusDemo** - Extracted and implemented
- 🔄 **Current Status**: ~305 lines removed from main file
- 🎯 **Goal**: Reduce main file from 3,328 to under 500 lines

## Structure

Each demo component:
- Is self-contained and focused on a specific UI area
- Accepts props for state and callbacks from the parent
- Follows the same styling and structure patterns
- Is under 100 lines each
- Has proper TypeScript typing

## Types

Shared types are defined in `types.ts`:
- `MachineStatus` - Machine state types
- `Position` - 3D position interface
- `UIDemoState` - Complete demo state
- `DemoRefs` - Ref object types
- `DemoActions` - Action callback types

## Usage

```tsx
import { BasicComponentsDemo, NumberInputsDemo } from './components';

// In component
<BasicComponentsDemo 
  basicButtonsRef={basicButtonsRef}
  statusBadgesRef={statusBadgesRef}
/>
<NumberInputsDemo />
```

## Next Steps

1. Continue extracting remaining sections from `UIDemoView.tsx`
2. Implement remaining demo components
3. Ensure all components are under the 500-line limit
4. Update component index exports
5. Verify full functionality is preserved