# UI Validation Module

## Purpose
The UI validation module provides comprehensive form validation capabilities specifically designed for CNC control applications. It includes real-time validation, CNC-specific validation rules, and accessible error handling.

## Architecture
Validation system is organized by validation type:
- **CNC Validation**: Machine-specific validation rules (coordinates, feed rates, tool parameters)
- **Form Validation**: General form validation utilities and hooks
- **Real-time Validation**: Live validation as users type or interact
- **Accessibility**: Screen reader friendly validation messages
- **Custom Validators**: Extensible validation rule system

## Key Features

### CNC-Specific Validation
- **Coordinate Validation**: Ensure coordinates are within machine limits
- **Feed Rate Validation**: Validate speed settings against machine capabilities
- **Tool Validation**: Check tool compatibility and parameters
- **Safety Validation**: Enforce safety limits and emergency protocols
- **G-code Validation**: Validate G-code syntax and commands

### Form Validation
- **Real-time Validation**: Immediate feedback as users interact
- **Field Dependencies**: Validate fields based on other field values
- **Conditional Validation**: Apply different rules based on form state
- **Async Validation**: Support for server-side validation
- **Batch Validation**: Validate multiple fields simultaneously

### Validation Rules
- **Required Fields**: Ensure mandatory fields are completed
- **Data Types**: Validate numeric, string, boolean, and custom types
- **Ranges**: Minimum and maximum value validation
- **Patterns**: Regular expression pattern matching
- **Custom Rules**: User-defined validation logic

## Usage
```typescript
import { 
  useFormValidation, 
  validateCoordinates, 
  validateFeedRate,
  createValidationSchema 
} from '@/ui/validation';

// CNC-specific validation
const coordinateValidation = validateCoordinates(
  { x: 100, y: 200, z: 50 },
  { x: { min: 0, max: 500 }, y: { min: 0, max: 500 }, z: { min: 0, max: 100 } }
);

// Form validation hook
const MyForm = () => {
  const { values, errors, validate, isValid } = useFormValidation({
    schema: createValidationSchema({
      coordinates: validateCoordinates,
      feedRate: validateFeedRate,
      toolNumber: (value) => value > 0 && value <= 20,
    }),
    initialValues: {
      coordinates: { x: 0, y: 0, z: 0 },
      feedRate: 1000,
      toolNumber: 1,
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <CoordinateInput 
        value={values.coordinates}
        onChange={(coords) => validate('coordinates', coords)}
        error={errors.coordinates}
      />
      <FeedRateInput 
        value={values.feedRate}
        onChange={(rate) => validate('feedRate', rate)}
        error={errors.feedRate}
      />
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
};
```

## Validation Rules

### CNC Coordinate Validation
```typescript
interface CoordinateValidationRules {
  x: { min: number; max: number };
  y: { min: number; max: number };
  z: { min: number; max: number };
  precision?: number;
  units?: 'mm' | 'inches';
}
```

### Feed Rate Validation
```typescript
interface FeedRateValidationRules {
  min: number;
  max: number;
  units: 'mm/min' | 'inches/min';
  machineType: 'mill' | 'lathe' | 'router';
}
```

### Tool Validation
```typescript
interface ToolValidationRules {
  toolNumber: { min: number; max: number };
  diameter: { min: number; max: number };
  length: { min: number; max: number };
  material: string[];
  compatibility: string[];
}
```

## Error Handling
- **Accessible Messages**: Screen reader friendly error descriptions
- **Multi-language Support**: Internationalized error messages
- **Contextual Help**: Helpful suggestions for fixing validation errors
- **Visual Indicators**: Clear visual feedback for validation states

## Configuration
Validation behavior and rules are configured in `config.ts`.

## Testing
- Unit tests for validation rule logic
- Integration tests for form validation workflows
- Accessibility tests for error message handling
- Performance tests for real-time validation