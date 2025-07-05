# Testing Documentation

> Comprehensive testing guide for the CNC Control Design System

## Table of Contents

- [Testing Overview](#testing-overview)
- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Accessibility Testing](#accessibility-testing)
- [Performance Testing](#performance-testing)
- [Visual Testing](#visual-testing)
- [Testing Utilities](#testing-utilities)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## Testing Overview

### Testing Philosophy

Our testing approach follows the **Testing Pyramid** principle:

```
    /\     E2E Tests (10%)
   /  \    Critical user workflows
  /____\   
 /      \  Integration Tests (20%)
/        \ Component interactions
----------
Unit Tests (70%)
Individual functions and components
```

### Quality Gates

- **Unit Tests**: 85%+ code coverage
- **Integration Tests**: All cross-component interactions
- **E2E Tests**: Critical user workflows
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <100ms interaction response times

### Testing Tools

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **axe-core**: Accessibility testing
- **Storybook**: Visual component testing
- **MSW**: API mocking

---

## Testing Strategy

### Test Categories

#### 1. **Unit Tests** (70% of tests)
- Component rendering
- Function logic
- Hook behavior
- Store actions
- Utility functions

#### 2. **Integration Tests** (20% of tests)
- Component interactions
- Store communication
- API integration
- Real-time sync
- User workflows

#### 3. **E2E Tests** (10% of tests)
- Critical user paths
- Cross-browser compatibility
- Full application workflows
- Real environment testing

### Coverage Requirements

```bash
# Coverage thresholds
{
  "branches": 85,
  "functions": 85,
  "lines": 85,
  "statements": 85
}
```

---

## Unit Testing

### Component Testing

#### Basic Component Tests
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    render(<Button variant="emergency">Emergency</Button>);
    const button = screen.getByText('Emergency');
    
    expect(button).toHaveClass('bg-red-600');
  });

  it('disables when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByText('Loading');
    
    expect(button).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});
```

#### CNC-Specific Component Tests
```typescript
// JogControls.test.tsx
import { renderWithProviders, storeHelpers } from '@/test-utils';
import { JogControls } from './JogControls';

describe('JogControls', () => {
  beforeEach(() => {
    storeHelpers.machine.setConnected(true);
    storeHelpers.machine.setPosition({ x: 0, y: 0, z: 0 });
  });

  it('renders position display correctly', () => {
    renderWithProviders(
      <JogControls
        position={{ x: 100.5, y: 200.0, z: 50.25 }}
        onJog={jest.fn()}
        onHome={jest.fn()}
      />
    );
    
    expect(screen.getByText('X: 100.5')).toBeInTheDocument();
    expect(screen.getByText('Y: 200.0')).toBeInTheDocument();
    expect(screen.getByText('Z: 50.25')).toBeInTheDocument();
  });

  it('calls onJog with correct parameters', async () => {
    const user = userEvent.setup();
    const onJog = jest.fn();
    
    renderWithProviders(
      <JogControls
        position={{ x: 0, y: 0, z: 0 }}
        onJog={onJog}
        onHome={jest.fn()}
      />
    );
    
    await user.click(screen.getByTestId('jog-x-plus'));
    
    expect(onJog).toHaveBeenCalledWith('X', 1, 1);
  });

  it('disables controls when machine is disconnected', () => {
    storeHelpers.machine.setConnected(false);
    
    renderWithProviders(
      <JogControls
        position={{ x: 0, y: 0, z: 0 }}
        onJog={jest.fn()}
        onHome={jest.fn()}
        disabled={true}
      />
    );
    
    expect(screen.getByTestId('jog-x-plus')).toBeDisabled();
    expect(screen.getByTestId('jog-y-plus')).toBeDisabled();
    expect(screen.getByTestId('jog-z-plus')).toBeDisabled();
  });

  it('prevents jogging beyond machine limits', async () => {
    const user = userEvent.setup();
    const onJog = jest.fn();
    
    renderWithProviders(
      <JogControls
        position={{ x: 299, y: 0, z: 0 }}
        onJog={onJog}
        onHome={jest.fn()}
        workingArea={{ width: 300, height: 300, depth: 100, units: 'mm' }}
      />
    );
    
    await user.click(screen.getByTestId('jog-x-plus'));
    
    // Should not call onJog because position would exceed limits
    expect(onJog).not.toHaveBeenCalled();
    expect(screen.getByText(/exceeds machine limits/i)).toBeInTheDocument();
  });
});
```

### Store Testing

#### Zustand Store Tests
```typescript
// machineStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMachineStore } from '../machineStore';

describe('Machine Store', () => {
  beforeEach(() => {
    useMachineStore.getState().reset();
  });

  it('updates position correctly', () => {
    const { result } = renderHook(() => useMachineStore());
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 200, z: 50 });
    });
    
    expect(result.current.machine.position).toEqual({ x: 100, y: 200, z: 50 });
  });

  it('manages connection state', () => {
    const { result } = renderHook(() => useMachineStore());
    
    act(() => {
      result.current.setConnection({ isConnected: true, port: '/dev/ttyUSB0' });
    });
    
    expect(result.current.connection.isConnected).toBe(true);
    expect(result.current.connection.port).toBe('/dev/ttyUSB0');
  });

  it('handles errors correctly', () => {
    const { result } = renderHook(() => useMachineStore());
    
    act(() => {
      result.current.addError({
        type: 'machine',
        severity: 'high',
        message: 'Motor overheated',
      });
    });
    
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toBe('Motor overheated');
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useMachineStore());
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 200, z: 50 });
    });
    
    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('machine-store') || '{}');
    expect(stored.state.machine.position).toEqual({ x: 100, y: 200, z: 50 });
  });
});
```

### Hook Testing

#### Custom Hook Tests
```typescript
// useMachinePosition.test.ts
import { renderHook } from '@testing-library/react';
import { useMachinePosition } from '../useMachinePosition';
import { storeHelpers } from '@/test-utils';

describe('useMachinePosition', () => {
  it('returns current position', () => {
    storeHelpers.machine.setPosition({ x: 100, y: 200, z: 50 });
    
    const { result } = renderHook(() => useMachinePosition());
    
    expect(result.current.position).toEqual({ x: 100, y: 200, z: 50 });
  });

  it('calculates distance from origin', () => {
    storeHelpers.machine.setPosition({ x: 3, y: 4, z: 0 });
    
    const { result } = renderHook(() => useMachinePosition());
    
    expect(result.current.distanceFromOrigin).toBe(5); // 3-4-5 triangle
  });

  it('determines if position is within bounds', () => {
    storeHelpers.machine.setPosition({ x: 150, y: 150, z: 25 });
    
    const { result } = renderHook(() => 
      useMachinePosition({ 
        maxX: 300, 
        maxY: 300, 
        maxZ: 100 
      })
    );
    
    expect(result.current.isWithinBounds).toBe(true);
  });
});
```

---

## Integration Testing

### Component Integration

#### Multi-Component Interactions
```typescript
// ControlsPage.integration.test.tsx
import { renderWithProviders, storeHelpers, mockData } from '@/test-utils';
import { ControlsView } from '../ControlsView';

describe('Controls Page Integration', () => {
  beforeEach(() => {
    storeHelpers.machine.setConnected(true);
    storeHelpers.machine.setPosition({ x: 0, y: 0, z: 0 });
  });

  it('coordinates jog controls with position display', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<ControlsView />);
    
    // Initial position
    expect(screen.getByTestId('position-display')).toHaveTextContent('X: 0.0');
    
    // Jog X axis
    await user.click(screen.getByTestId('jog-x-plus'));
    
    // Position should update
    await waitFor(() => {
      expect(screen.getByTestId('position-display')).toHaveTextContent('X: 1.0');
    });
    
    // 3D visualization should update
    expect(screen.getByTestId('3d-visualization')).toHaveAttribute(
      'data-position-x', 
      '1'
    );
  });

  it('shows error when jog exceeds limits', async () => {
    const user = userEvent.setup();
    
    // Set position near limit
    storeHelpers.machine.setPosition({ x: 299, y: 0, z: 0 });
    
    renderWithProviders(<ControlsView />);
    
    // Try to jog beyond limit
    await user.click(screen.getByTestId('jog-x-plus'));
    
    // Should show error notification
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/exceeds machine limits/i);
    });
  });

  it('disables jog controls during homing', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<ControlsView />);
    
    // Start homing sequence
    await user.click(screen.getByTestId('home-all-button'));
    
    // Jog controls should be disabled
    expect(screen.getByTestId('jog-x-plus')).toBeDisabled();
    expect(screen.getByTestId('jog-y-plus')).toBeDisabled();
    expect(screen.getByTestId('jog-z-plus')).toBeDisabled();
    
    // Status should show homing
    expect(screen.getByTestId('machine-status')).toHaveTextContent('Homing');
  });
});
```

### Store Integration

#### Cross-Store Communication
```typescript
// store.integration.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMachineStore } from '../stores/machineStore';
import { useJobStore } from '../stores/jobStore';
import { useUIStore } from '../stores/uiStore';

describe('Store Integration', () => {
  beforeEach(() => {
    useMachineStore.getState().reset();
    useJobStore.getState().reset();
    useUIStore.getState().reset();
  });

  it('pauses job when machine encounters error', () => {
    const machine = renderHook(() => useMachineStore());
    const job = renderHook(() => useJobStore());
    
    // Start a job
    act(() => {
      const jobId = job.result.current.addJob(mockData.job());
      job.result.current.startJob(jobId);
    });
    
    expect(job.result.current.currentJob?.status).toBe('running');
    
    // Machine encounters error
    act(() => {
      machine.result.current.addError({
        type: 'machine',
        severity: 'critical',
        message: 'Motor fault',
      });
    });
    
    // Job should be paused
    expect(job.result.current.currentJob?.status).toBe('paused');
  });

  it('updates UI loading state during machine operations', () => {
    const machine = renderHook(() => useMachineStore());
    const ui = renderHook(() => useUIStore());
    
    // Start homing sequence
    act(() => {
      machine.result.current.startHoming(['X', 'Y', 'Z']);
    });
    
    // UI should show loading
    expect(ui.result.current.loading.homing).toBe(true);
    expect(machine.result.current.machine.status).toBe('homing');
    
    // Complete homing
    act(() => {
      machine.result.current.completeHoming();
    });
    
    // Loading should clear
    expect(ui.result.current.loading.homing).toBe(false);
    expect(machine.result.current.machine.status).toBe('idle');
  });
});
```

---

## End-to-End Testing

### Critical User Workflows

#### Machine Control Workflow
```typescript
// machine-control.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Machine Control E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for application to load
    await page.waitForLoadState('networkidle');
  });

  test('complete machine setup and jog workflow', async ({ page }) => {
    // Navigate to controls
    await page.click('[data-testid="nav-controls"]');
    
    // Machine should start disconnected
    await expect(page.locator('[data-testid="connection-status"]'))
      .toHaveText('Disconnected');
    
    // Connect to machine
    await page.click('[data-testid="connect-button"]');
    await page.selectOption('[data-testid="port-select"]', '/dev/ttyUSB0');
    await page.click('[data-testid="confirm-connect"]');
    
    // Wait for connection
    await expect(page.locator('[data-testid="connection-status"]'))
      .toHaveText('Connected');
    
    // Home the machine
    await page.click('[data-testid="home-all-button"]');
    await expect(page.locator('[data-testid="machine-status"]'))
      .toHaveText('Homing');
    
    // Wait for homing to complete
    await expect(page.locator('[data-testid="machine-status"]'))
      .toHaveText('Idle');
    
    // Position should be at origin
    await expect(page.locator('[data-testid="position-x"]')).toHaveText('0.0');
    await expect(page.locator('[data-testid="position-y"]')).toHaveText('0.0');
    await expect(page.locator('[data-testid="position-z"]')).toHaveText('0.0');
    
    // Jog X axis
    await page.click('[data-testid="jog-x-plus"]');
    await expect(page.locator('[data-testid="position-x"]')).toHaveText('1.0');
    
    // Jog Y axis
    await page.click('[data-testid="jog-y-plus"]');
    await expect(page.locator('[data-testid="position-y"]')).toHaveText('1.0');
    
    // 3D visualization should update
    const visualization = page.locator('[data-testid="3d-visualization"]');
    await expect(visualization).toHaveAttribute('data-position-x', '1');
    await expect(visualization).toHaveAttribute('data-position-y', '1');
  });

  test('emergency stop workflow', async ({ page }) => {
    await page.goto('/controls');
    
    // Connect and start moving
    await page.click('[data-testid="connect-button"]');
    await page.click('[data-testid="jog-x-plus"]');
    
    // Hit emergency stop
    await page.click('[data-testid="emergency-stop"]');
    
    // Machine should stop immediately
    await expect(page.locator('[data-testid="machine-status"]'))
      .toHaveText('Emergency');
    
    // All controls should be disabled
    await expect(page.locator('[data-testid="jog-x-plus"]')).toBeDisabled();
    await expect(page.locator('[data-testid="jog-y-plus"]')).toBeDisabled();
    await expect(page.locator('[data-testid="jog-z-plus"]')).toBeDisabled();
    
    // Emergency alert should be visible
    await expect(page.locator('[role="alert"]'))
      .toHaveText(/emergency stop activated/i);
  });
});
```

#### Job Management Workflow
```typescript
// job-management.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Job Management E2E', () => {
  test('complete job lifecycle', async ({ page }) => {
    await page.goto('/jobs');
    
    // Add new job
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-name"]', 'Test Cutting Job');
    await page.fill('[data-testid="job-description"]', 'Test job for E2E testing');
    
    // Upload G-code file
    const fileInput = page.locator('[data-testid="gcode-upload"]');
    await fileInput.setInputFiles('./test-fixtures/test.gcode');
    
    // Set material properties
    await page.selectOption('[data-testid="material-type"]', 'Wood');
    await page.fill('[data-testid="material-thickness"]', '10');
    
    // Set tool settings
    await page.fill('[data-testid="spindle-speed"]', '1000');
    await page.fill('[data-testid="feed-rate"]', '500');
    
    // Save job
    await page.click('[data-testid="save-job"]');
    
    // Job should appear in queue
    await expect(page.locator('[data-testid="job-list"]'))
      .toContainText('Test Cutting Job');
    
    // Connect machine and start job
    await page.goto('/controls');
    await page.click('[data-testid="connect-button"]');
    await page.click('[data-testid="home-all-button"]');
    
    // Start the job
    await page.goto('/jobs');
    await page.click('[data-testid="start-job-button"]');
    
    // Confirm start
    await page.click('[data-testid="confirm-start"]');
    
    // Job should be running
    await expect(page.locator('[data-testid="job-status"]'))
      .toHaveText('Running');
    
    // Progress should update
    await expect(page.locator('[data-testid="job-progress"]'))
      .toHaveText(/\d+%/);
    
    // Can pause job
    await page.click('[data-testid="pause-job"]');
    await expect(page.locator('[data-testid="job-status"]'))
      .toHaveText('Paused');
    
    // Can resume job
    await page.click('[data-testid="resume-job"]');
    await expect(page.locator('[data-testid="job-status"]'))
      .toHaveText('Running');
    
    // Job completes
    await expect(page.locator('[data-testid="job-status"]'))
      .toHaveText('Completed', { timeout: 30000 });
    
    await expect(page.locator('[data-testid="job-progress"]'))
      .toHaveText('100%');
  });
});
```

---

## Accessibility Testing

### WCAG 2.1 AA Compliance

#### Automated Accessibility Tests
```typescript
// accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from '@/test-utils';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should pass axe accessibility tests for main navigation', async () => {
    const { container } = renderWithProviders(<MainNavigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should pass axe accessibility tests for jog controls', async () => {
    const { container } = renderWithProviders(
      <JogControls
        position={{ x: 0, y: 0, z: 0 }}
        onJog={jest.fn()}
        onHome={jest.fn()}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper focus management in modals', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal />);
    
    const openButton = screen.getByText('Open Settings');
    await user.click(openButton);
    
    // First focusable element in modal should receive focus
    const firstInput = screen.getByTestId('machine-name-input');
    expect(firstInput).toHaveFocus();
    
    // Escape should close modal and return focus
    await user.keyboard('{Escape}');
    expect(openButton).toHaveFocus();
  });
});
```

#### Keyboard Navigation Tests
```typescript
// keyboard-navigation.test.tsx
describe('Keyboard Navigation', () => {
  it('supports tab navigation through jog controls', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JogControls />);
    
    // Tab through controls
    await user.tab();
    expect(screen.getByTestId('jog-x-minus')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByTestId('jog-x-plus')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByTestId('jog-y-minus')).toHaveFocus();
    
    // Enter should activate control
    const handleJog = jest.fn();
    await user.keyboard('{Enter}');
    expect(handleJog).toHaveBeenCalled();
  });

  it('supports arrow key navigation in coordinate inputs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoordinateInputs />);
    
    const xInput = screen.getByTestId('x-coordinate');
    xInput.focus();
    
    // Arrow down should move to Y input
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('y-coordinate')).toHaveFocus();
    
    // Arrow down should move to Z input
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('z-coordinate')).toHaveFocus();
  });
});
```

### Screen Reader Testing

```typescript
// screen-reader.test.tsx
describe('Screen Reader Support', () => {
  it('announces position changes to screen readers', async () => {
    renderWithProviders(<PositionDisplay position={{ x: 100, y: 200, z: 50 }} />);
    
    const liveRegion = screen.getByLabelText(/current position/i);
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('X 100, Y 200, Z 50 millimeters');
  });

  it('announces errors with proper urgency', async () => {
    renderWithProviders(<ErrorDisplay error={{ message: 'Motor fault', severity: 'critical' }} />);
    
    const errorRegion = screen.getByRole('alert');
    expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
    expect(errorRegion).toHaveTextContent('Critical error: Motor fault');
  });
});
```

---

## Performance Testing

### Component Performance

#### Render Performance Tests
```typescript
// performance.test.tsx
import { performanceHelpers } from '@/test-utils';

describe('Performance Tests', () => {
  it('should render large job list within performance budget', async () => {
    const jobs = Array.from({ length: 1000 }, (_, i) => mockData.job({ name: `Job ${i}` }));
    
    const { duration } = await performanceHelpers.measureRenderTime(() =>
      renderWithProviders(<JobList jobs={jobs} />)
    );
    
    // Should render 1000 jobs in under 100ms
    expect(duration).toBeLessThan(100);
  });

  it('should handle rapid position updates efficiently', async () => {
    const { result } = await performanceHelpers.stressTest(() => {
      storeHelpers.machine.setPosition({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 100,
      });
    }, 1000, 5000);
    
    expect(result.iterationsCompleted).toBe(1000);
    expect(result.duration).toBeLessThan(5000);
  });

  it('should not leak memory during continuous updates', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Simulate continuous position updates
    for (let i = 0; i < 1000; i++) {
      storeHelpers.machine.setPosition({ x: i, y: i, z: i });
    }
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### E2E Performance Tests

```typescript
// performance.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Performance E2E', () => {
  test('should load application within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should maintain 60fps during 3D visualization', async ({ page }) => {
    await page.goto('/controls');
    
    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).performanceMetrics = [];
      const observer = new PerformanceObserver((list) => {
        (window as any).performanceMetrics.push(...list.getEntries());
      });
      observer.observe({ entryTypes: ['measure'] });
    });
    
    // Perform rapid jog movements
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="jog-x-plus"]');
      await page.waitForTimeout(100);
    }
    
    // Check frame rate
    const metrics = await page.evaluate(() => (window as any).performanceMetrics);
    const frameTimes = metrics.filter((m: any) => m.name === 'frame');
    const averageFrameTime = frameTimes.reduce((sum: number, m: any) => sum + m.duration, 0) / frameTimes.length;
    
    // Should maintain ~60fps (16.67ms per frame)
    expect(averageFrameTime).toBeLessThan(20);
  });
});
```

---

## Visual Testing

### Storybook Visual Tests

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Emergency: Story = {
  args: {
    variant: 'emergency',
    children: 'EMERGENCY STOP',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="emergency">Emergency</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </div>
  ),
};
```

### Visual Regression Tests

```typescript
// visual-regression.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('should match jog controls visual design', async ({ page }) => {
    await page.goto('/controls');
    await page.waitForLoadState('networkidle');
    
    const jogControls = page.locator('[data-testid="jog-controls"]');
    await expect(jogControls).toHaveScreenshot('jog-controls.png');
  });

  test('should match 3D visualization appearance', async ({ page }) => {
    await page.goto('/controls');
    await page.waitForLoadState('networkidle');
    
    const visualization = page.locator('[data-testid="3d-visualization"]');
    await expect(visualization).toHaveScreenshot('3d-visualization.png');
  });

  test('should match dark theme appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dark-theme-dashboard.png');
  });
});
```

---

## Testing Utilities

### Custom Test Utilities

```typescript
// test-utils/cnc-helpers.ts
export const cncHelpers = {
  // Simulate machine connection
  connectMachine: async (page: Page) => {
    await page.click('[data-testid="connect-button"]');
    await page.selectOption('[data-testid="port-select"]', '/dev/ttyUSB0');
    await page.click('[data-testid="confirm-connect"]');
    await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")');
  },

  // Simulate homing sequence
  homeMachine: async (page: Page) => {
    await page.click('[data-testid="home-all-button"]');
    await page.waitForSelector('[data-testid="machine-status"]:has-text("Idle")');
  },

  // Jog to specific position
  jogToPosition: async (page: Page, position: { x: number; y: number; z: number }) => {
    for (let i = 0; i < position.x; i++) {
      await page.click('[data-testid="jog-x-plus"]');
    }
    for (let i = 0; i < position.y; i++) {
      await page.click('[data-testid="jog-y-plus"]');
    }
    for (let i = 0; i < position.z; i++) {
      await page.click('[data-testid="jog-z-plus"]');
    }
  },

  // Wait for job completion
  waitForJobCompletion: async (page: Page, timeout = 30000) => {
    await page.waitForSelector('[data-testid="job-status"]:has-text("Completed")', { timeout });
  },
};
```

### Mock Utilities

```typescript
// test-utils/mocks.ts
import { setupWorker, rest } from 'msw';

export const mockHandlers = [
  // Machine API endpoints
  rest.get('/api/machine/status', (req, res, ctx) => {
    return res(ctx.json({
      connected: true,
      position: { x: 0, y: 0, z: 0 },
      status: 'idle',
    }));
  }),

  rest.post('/api/machine/jog', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  rest.post('/api/machine/home', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Job API endpoints
  rest.get('/api/jobs', (req, res, ctx) => {
    return res(ctx.json({ jobs: [] }));
  }),

  rest.post('/api/jobs', (req, res, ctx) => {
    return res(ctx.json({ id: 'job-123', status: 'created' }));
  }),
];

export const mockWorker = setupWorker(...mockHandlers);
```

---

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-results
          path: test-results/

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility tests
        run: npm run test:a11y
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:a11y": "jest --testNamePattern='accessibility'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "jest --testNamePattern='performance'",
    "test:visual": "playwright test --project=visual-regression"
  }
}
```

---

## Best Practices

### General Testing Principles

1. **Write Tests First**: Follow TDD/BDD practices
2. **Test Behavior, Not Implementation**: Focus on user interactions
3. **Keep Tests Independent**: Each test should run in isolation
4. **Use Descriptive Test Names**: Make test purpose clear
5. **Mock External Dependencies**: Isolate units under test

### Component Testing Best Practices

1. **Test User Interactions**: Click, type, keyboard navigation
2. **Test Accessibility**: ARIA labels, keyboard support, screen readers
3. **Test Error States**: How components handle invalid props/state
4. **Test Loading States**: Async operations and loading indicators
5. **Test Responsive Behavior**: Different screen sizes and orientations

### E2E Testing Best Practices

1. **Test Critical User Paths**: Focus on core functionality
2. **Use Page Object Model**: Organize test code effectively
3. **Wait for Elements**: Use proper waiting strategies
4. **Test Data Management**: Clean state between tests
5. **Cross-Browser Testing**: Ensure compatibility

### Performance Testing Best Practices

1. **Set Performance Budgets**: Define acceptable thresholds
2. **Test Real Scenarios**: Use realistic data sizes
3. **Monitor Memory Usage**: Prevent memory leaks
4. **Test on Various Devices**: Different hardware capabilities
5. **Continuous Monitoring**: Track performance over time

---

## Troubleshooting

### Common Issues

#### Test Failures
```bash
# Clear Jest cache
npm run test -- --clearCache

# Update snapshots
npm run test -- --updateSnapshot

# Debug specific test
npm run test -- --testNamePattern="Button"
```

#### E2E Test Issues
```bash
# Run in headed mode for debugging
npx playwright test --headed

# Run with debugger
npx playwright test --debug

# Generate test code
npx playwright codegen localhost:3000
```

#### Performance Issues
```bash
# Profile tests
npm run test -- --detectOpenHandles

# Check memory usage
npm run test:performance -- --logHeapUsage
```

### Getting Help

1. **Check Documentation**: Component API docs and testing guides
2. **Review Examples**: Look at existing test files
3. **Use Debugging Tools**: Browser DevTools, React DevTools
4. **Ask the Team**: Development chat or GitHub discussions
5. **Create Issues**: Report bugs or request features

---

**Test with confidence! 🧪**