# UI Testing Module

## Purpose
The UI testing module provides utilities, helpers, and tools for testing UI components in the CNC control application. This module includes mobile-specific testing utilities, visual regression testing, and specialized testing patterns for CNC interfaces.

## Architecture
Testing utilities are organized by testing type:
- **Mobile Testing**: Touch interaction testing and mobile-specific utilities
- **Visual Regression**: Screenshot comparison and visual testing
- **Component Testing**: React component testing helpers
- **Accessibility Testing**: A11y testing utilities and automated checks
- **Integration Testing**: Cross-component testing utilities

## Key Testing Utilities

### Mobile Testing (mobile-test-utils.ts)
- **Touch Event Simulation**: Simulate touch, swipe, and gesture events
- **Mobile Viewport Testing**: Test responsive behavior across devices
- **Orientation Testing**: Portrait and landscape orientation testing
- **Performance Testing**: Mobile performance and rendering optimization

### Visual Regression (visual-regression.ts)
- **Screenshot Capture**: Automated screenshot generation
- **Visual Comparison**: Pixel-perfect comparison of UI states
- **Baseline Management**: Manage and update visual baselines
- **Diff Generation**: Generate visual difference reports

### Component Testing Helpers
- **Render Utilities**: Enhanced React Testing Library utilities
- **Mock Providers**: Mock implementations of context providers
- **Event Simulation**: Simulate user interactions and events
- **State Management**: Test component state changes

### Accessibility Testing
- **A11y Audits**: Automated accessibility testing
- **Keyboard Navigation**: Test keyboard-only navigation
- **Screen Reader**: Test screen reader compatibility
- **Color Contrast**: Validate color contrast ratios

## Usage
```typescript
import { 
  renderWithProviders, 
  simulateTouchEvent, 
  captureScreenshot 
} from '@/ui/testing';

// Component testing with providers
test('renders jog controls correctly', () => {
  const { getByRole } = renderWithProviders(<JogControls />);
  expect(getByRole('button', { name: 'X+' })).toBeInTheDocument();
});

// Mobile touch testing
test('handles touch gestures', () => {
  const onSwipe = jest.fn();
  const { container } = renderWithProviders(<TouchControls onSwipe={onSwipe} />);
  
  simulateTouchEvent(container, 'swipe', { direction: 'left' });
  expect(onSwipe).toHaveBeenCalledWith('left');
});

// Visual regression testing
test('matches visual snapshot', async () => {
  const { container } = renderWithProviders(<Dashboard />);
  const screenshot = await captureScreenshot(container);
  expect(screenshot).toMatchImageSnapshot();
});
```

## Testing Patterns

### Component Testing
- **Provider Wrapping**: Test components with required providers
- **Props Testing**: Test component behavior with different props
- **State Testing**: Test component state management
- **Event Testing**: Test user interactions and callbacks

### Mobile Testing
- **Touch Events**: Test touch, swipe, pinch, and tap gestures
- **Viewport Sizes**: Test responsive behavior across screen sizes
- **Device Orientation**: Test portrait and landscape modes
- **Performance**: Test rendering performance on mobile devices

### Visual Testing
- **Snapshot Testing**: Capture and compare component snapshots
- **Cross-browser Testing**: Test visual consistency across browsers
- **Theme Testing**: Test component appearance with different themes
- **State Variations**: Test visual states (loading, error, success)

## Configuration
Testing behavior and settings are configured in `config.ts`.

## Testing
- Unit tests for testing utilities themselves
- Integration tests for testing patterns
- Performance tests for testing infrastructure
- Documentation tests for testing examples