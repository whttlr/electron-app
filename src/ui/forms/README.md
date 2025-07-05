# UI Forms Module

## Purpose
The UI forms module provides specialized form components for CNC control applications. These forms handle machine configuration, user input validation, and data collection with CNC-specific requirements.

## Architecture
Forms are designed with:
- **Validation**: Real-time input validation with CNC-specific rules
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile Support**: Touch-optimized inputs and layouts
- **Type Safety**: TypeScript interfaces for all form data structures

## Key Components

### CNCForms
- **JogControls**: Manual machine positioning form
- **MachineSetup**: Machine configuration and calibration
- **WorkspaceConfiguration**: Working area setup and limits
- **ToolConfiguration**: Tool selection and parameters
- **SafetySettings**: Emergency stops and safety limits

### Form Features
- **Real-time Validation**: Immediate feedback on input errors
- **Auto-save**: Automatic saving of form state
- **Undo/Redo**: Form state history management
- **Conditional Fields**: Dynamic form fields based on selections
- **Batch Operations**: Multiple item configuration

## Usage
```typescript
import { JogControlsForm, MachineSetupForm } from '@/ui/forms';

// Forms include CNC-specific validation and behavior
<JogControlsForm 
  onSubmit={handleJogCommand}
  currentPosition={position}
  machineConstraints={constraints}
  validationRules={jogValidationRules}
/>
```

## Validation Rules
- **Coordinate Bounds**: Ensure jog commands stay within workspace limits
- **Feed Rate Limits**: Validate speed settings against machine capabilities
- **Tool Compatibility**: Check tool compatibility with operations
- **Safety Constraints**: Enforce safety limits and emergency protocols

## Configuration
Form behavior, validation rules, and defaults are configured in `config.ts`.

## Testing
- Unit tests for form validation logic
- Integration tests for form submission workflows
- Accessibility tests for keyboard navigation
- Mobile-specific tests for touch interactions