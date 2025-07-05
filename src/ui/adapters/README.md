# UI Adapters Module

## Purpose
The UI adapters module provides abstraction layers between the application and various UI component libraries. This allows the application to switch between different UI frameworks (Ant Design, Headless UI, custom components) while maintaining consistent APIs.

## Architecture
This module follows the adapter pattern to provide:
- **Ant Design Adapter**: Wraps Ant Design components with consistent props and behavior
- **Headless UI Adapter**: Provides accessible, unstyled components
- **Custom Adapter**: Application-specific component implementations

## Components
- **Badge**: Status indicators and notification badges
- **Button**: Interactive buttons with consistent styling
- **Card**: Content containers with layouts
- **Form**: Form components with validation
- **Input**: Text input fields with validation
- **Modal**: Dialog and popup components
- **Select**: Dropdown selection components
- **Table**: Data display tables

## Usage
```typescript
import { Button, Card, Modal } from '@/ui/adapters';

// Components provide consistent APIs regardless of underlying library
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

## Configuration
Adapter selection and component defaults are configured in `config.ts`.

## Testing
- Unit tests for each adapter component
- Integration tests for adapter switching
- Accessibility tests for all components