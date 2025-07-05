# Development Guidelines

> Best practices and coding standards for the CNC Control Design System

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Component Development](#component-development)
- [Testing Guidelines](#testing-guidelines)
- [Performance Best Practices](#performance-best-practices)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Documentation Standards](#documentation-standards)
- [Code Review Process](#code-review-process)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Git 2.30+
- Visual Studio Code (recommended)
- Chrome/Edge for testing

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd electron-app

# Install dependencies
npm install

# Set up development environment
npm run dev:setup

# Start development server
npm start

# Start Storybook (for component development)
npm run storybook
```

### Required Extensions (VS Code)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "deque-systems.vscode-axe-linter",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## Development Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/component-name-feature
git checkout -b feature/jog-controls-validation

# Bug fixes
git checkout -b fix/issue-description
git checkout -b fix/tooltip-positioning

# Documentation
git checkout -b docs/section-name
git checkout -b docs/component-api
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>[optional scope]: <description>

# Examples
feat(components): add EmergencyButton component
fix(stores): resolve machine state sync issue
docs(api): update Button component documentation
test(integration): add job queue E2E tests
refactor(theme): migrate to CSS custom properties
perf(rendering): optimize 3D visualization performance
```

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   ```bash
   # Make changes
   npm run dev      # Start development server
   npm run test     # Run tests during development
   npm run lint     # Check code style
   ```

3. **Quality Checks**
   ```bash
   npm run test:coverage    # Ensure 85%+ coverage
   npm run test:a11y        # Check accessibility
   npm run build           # Verify build works
   ```

4. **Submit PR**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/your-feature-name
   ```

---

## Coding Standards

### TypeScript Guidelines

#### 1. Type Safety
```typescript
// ✅ Good: Explicit types
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'emergency';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
}

// ❌ Bad: Any types
interface ButtonProps {
  variant: any;
  size: any;
  disabled?: any;
  onClick: any;
}
```

#### 2. Interface Design
```typescript
// ✅ Good: Descriptive interfaces
interface MachinePosition {
  x: number;
  y: number;
  z: number;
  units: 'mm' | 'in';
  timestamp: Date;
}

// ❌ Bad: Vague interfaces
interface Position {
  x: number;
  y: number;
  z: number;
}
```

#### 3. Generic Types
```typescript
// ✅ Good: Reusable generics
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// ✅ Good: Constrained generics
interface Store<T extends Record<string, any>> {
  state: T;
  setState: (newState: Partial<T>) => void;
}
```

### React Guidelines

#### 1. Component Structure
```typescript
// ✅ Good: Consistent component structure
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// Types
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, disabled, loading, children, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }))}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### 2. Hooks Best Practices
```typescript
// ✅ Good: Custom hooks for reusable logic
function useMachinePosition() {
  const { machine } = useMachineStore();
  
  return {
    position: machine.position,
    isHomed: machine.isHomed,
    accuracy: machine.accuracy,
  };
}

// ✅ Good: Memoization for expensive calculations
const machineStats = useMemo(() => {
  return calculateMachineStats(machine.history);
}, [machine.history]);

// ✅ Good: Effect cleanup
useEffect(() => {
  const subscription = websocket.subscribe('machine-updates', handleUpdate);
  return () => subscription.unsubscribe();
}, []);
```

#### 3. State Management
```typescript
// ✅ Good: Zustand store structure
interface MachineStore {
  machine: MachineState;
  connection: ConnectionState;
  actions: {
    updatePosition: (position: Position3D) => void;
    setConnection: (connection: ConnectionState) => void;
    jog: (axis: Axis, distance: number) => void;
    home: (axes: Axis[]) => void;
  };
}

const useMachineStore = create<MachineStore>()((set, get) => ({
  machine: initialMachineState,
  connection: initialConnectionState,
  actions: {
    updatePosition: (position) => set((state) => ({
      machine: { ...state.machine, position }
    })),
    // ... other actions
  },
}));
```

### CSS/Styling Guidelines

#### 1. Tailwind CSS Usage
```typescript
// ✅ Good: Use design tokens
<div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">

// ✅ Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ✅ Good: State variants
<button className={cn(
  'px-4 py-2 rounded transition-colors',
  isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
)}>
```

#### 2. CSS Custom Properties
```css
/* ✅ Good: Semantic color tokens */
:root {
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a6a6a6;
  
  /* CNC-specific tokens */
  --color-emergency: #ff1744;
  --color-machine-idle: #4caf50;
  --color-machine-running: #2196f3;
}

/* ✅ Good: Component-specific variables */
.button {
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--color-primary-hover);
}
```

---

## Component Development

### Component Architecture

#### 1. Component Types
```typescript
// Base Interface Component (framework-agnostic)
interface BaseButtonProps {
  variant: 'primary' | 'secondary' | 'emergency';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Adapter Implementation (Ant Design)
export const Button = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ variant, size, disabled, loading, children, onClick }, ref) => {
    return (
      <AntButton
        ref={ref}
        type={mapVariantToAntType(variant)}
        size={mapSizeToAntSize(size)}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
      >
        {children}
      </AntButton>
    );
  }
);
```

#### 2. Component File Structure
```
src/ui/adapters/ant-design/Button/
├── Button.tsx              # Main component
├── Button.test.tsx         # Component tests
├── Button.stories.tsx      # Storybook stories
├── Button.types.ts         # TypeScript types
├── Button.styles.ts        # Styled components (if needed)
└── index.ts               # Exports
```

#### 3. Component Documentation
```typescript
/**
 * Button component for user interactions
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => {
    // Component implementation
  }
);
```

### CNC-Specific Components

#### 1. Machine Control Components
```typescript
// JogControls component
interface JogControlsProps {
  position: Position3D;
  onJog: (axis: Axis, direction: 1 | -1, distance: number) => void;
  onHome: (axes: Axis[]) => void;
  disabled?: boolean;
  stepSizes?: number[];
}

export const JogControls: React.FC<JogControlsProps> = ({
  position,
  onJog,
  onHome,
  disabled = false,
  stepSizes = [0.1, 1, 10],
}) => {
  // Implementation with accessibility features
  return (
    <div role="group" aria-label="Machine jog controls">
      {/* Axis controls */}
    </div>
  );
};
```

#### 2. Safety Components
```typescript
// EmergencyButton component
interface EmergencyButtonProps {
  onEmergencyStop: () => void;
  disabled?: boolean;
  size?: 'md' | 'lg' | 'xl';
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onEmergencyStop,
  disabled = false,
  size = 'lg',
}) => {
  return (
    <button
      className={cn(
        'emergency-button',
        emergencyButtonVariants({ size }),
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onEmergencyStop}
      disabled={disabled}
      aria-label="Emergency stop - immediately halt all machine movement"
    >
      EMERGENCY STOP
    </button>
  );
};
```

---

## Testing Guidelines

### Testing Strategy

#### 1. Unit Tests (Jest + React Testing Library)
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. Integration Tests
```typescript
// JogControls.integration.test.tsx
import { renderWithProviders } from '@/test-utils';
import { JogControls } from './JogControls';

describe('JogControls Integration', () => {
  it('updates machine position when jogging', async () => {
    const { user } = renderWithProviders(
      <JogControls
        position={{ x: 0, y: 0, z: 0 }}
        onJog={jest.fn()}
        onHome={jest.fn()}
      />
    );

    await user.click(screen.getByTestId('jog-x-plus'));
    
    // Verify store state change
    expect(useMachineStore.getState().machine.position.x).toBe(1);
  });
});
```

#### 3. E2E Tests (Playwright)
```typescript
// jog-controls.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Jog Controls', () => {
  test('should jog machine when controls are used', async ({ page }) => {
    await page.goto('/controls');
    
    await page.click('[data-testid="jog-x-plus"]');
    
    await expect(page.locator('[data-testid="position-x"]')).toHaveText('1.0');
  });
});
```

### Testing Utilities

```typescript
// test-utils/index.ts
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ConfigProvider>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </ConfigProvider>
    ),
    ...options,
  });
};

export const mockMachineStore = {
  reset: () => useMachineStore.getState().reset(),
  setPosition: (position: Position3D) => 
    useMachineStore.getState().updatePosition(position),
  setConnected: (connected: boolean) =>
    useMachineStore.getState().setConnection({ isConnected: connected }),
};
```

---

## Performance Best Practices

### React Performance

#### 1. Memoization
```typescript
// ✅ Good: Memoize expensive calculations
const processedData = useMemo(() => {
  return processLargeDataset(rawData);
}, [rawData]);

// ✅ Good: Memoize components
const MemoizedVisualization = React.memo(Visualization);

// ✅ Good: Memoize callbacks
const handleJog = useCallback((axis: Axis, distance: number) => {
  onJog(axis, distance);
}, [onJog]);
```

#### 2. Code Splitting
```typescript
// ✅ Good: Lazy load heavy components
const Visualization3D = React.lazy(() => import('./Visualization3D'));

// ✅ Good: Route-based code splitting
const ControlsView = React.lazy(() => import('../views/Controls/ControlsView'));
```

#### 3. Virtual Scrolling
```typescript
// ✅ Good: Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const JobList: React.FC<{ jobs: Job[] }> = ({ jobs }) => (
  <List
    height={400}
    itemCount={jobs.length}
    itemSize={60}
    itemData={jobs}
  >
    {JobItem}
  </List>
);
```

### Bundle Optimization

#### 1. Import Optimization
```typescript
// ✅ Good: Specific imports
import { Button } from '@/ui/components/Button';
import { debounce } from 'lodash-es';

// ❌ Bad: Full library imports
import * as _ from 'lodash';
import { Button, Input, Card } from 'antd';
```

#### 2. Tree Shaking
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
});
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### 1. Keyboard Navigation
```typescript
// ✅ Good: Full keyboard support
const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      {children}
    </div>
  );
};
```

#### 2. ARIA Labels
```typescript
// ✅ Good: Descriptive ARIA labels
<button
  aria-label="Move X axis positive by 1mm"
  onClick={() => onJog('x', 1, 1)}
>
  X+
</button>

// ✅ Good: Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  Machine position: X{position.x} Y{position.y} Z{position.z}
</div>

// ✅ Good: Error announcements
<div role="alert" aria-live="assertive">
  {error && `Error: ${error.message}`}
</div>
```

#### 3. Color Contrast
```css
/* ✅ Good: High contrast colors */
.emergency-button {
  background-color: #ff1744; /* 4.5:1 contrast ratio minimum */
  color: #ffffff;
}

.text-secondary {
  color: #a6a6a6; /* 3:1 contrast ratio minimum for large text */
}
```

### Testing Accessibility

```typescript
// Accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should pass accessibility tests', async () => {
  const { container } = render(<Button>Test Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Documentation Standards

### Code Documentation

#### 1. JSDoc Comments
```typescript
/**
 * Updates machine position with validation and boundary checking
 * 
 * @param position - New position coordinates
 * @param validate - Whether to validate against machine limits
 * @returns Promise that resolves when position is updated
 * 
 * @throws {Error} When position exceeds machine boundaries
 * 
 * @example
 * ```typescript
 * await updatePosition({ x: 100, y: 200, z: 50 });
 * ```
 */
async function updatePosition(
  position: Position3D,
  validate: boolean = true
): Promise<void> {
  // Implementation
}
```

#### 2. README Structure
```markdown
# Component Name

Brief description of the component's purpose.

## Usage

```tsx
import { ComponentName } from '@/ui/components/ComponentName';

<ComponentName prop1="value1" prop2="value2" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Description of prop1 |
| prop2 | boolean | false | Description of prop2 |

## Examples

### Basic Usage
[Example code]

### Advanced Usage
[Example code]

## Accessibility

- Supports keyboard navigation
- ARIA labels provided
- Screen reader compatible

## Testing

[Testing examples and utilities]
```

---

## Code Review Process

### Review Checklist

#### 1. Code Quality
- [ ] Follows TypeScript best practices
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] Meaningful variable names
- [ ] Appropriate comments

#### 2. React Best Practices
- [ ] Proper hook usage
- [ ] Memoization where appropriate
- [ ] No unnecessary re-renders
- [ ] Proper cleanup in useEffect

#### 3. Testing
- [ ] Unit tests cover main functionality
- [ ] Integration tests for complex interactions
- [ ] Accessibility tests included
- [ ] 85%+ code coverage

#### 4. Performance
- [ ] No memory leaks
- [ ] Efficient algorithms
- [ ] Proper lazy loading
- [ ] Bundle size impact considered

#### 5. Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient

### Review Process

1. **Self Review**
   - Run all tests
   - Check code coverage
   - Test accessibility
   - Review performance impact

2. **Peer Review**
   - Code quality assessment
   - Design pattern validation
   - Performance review
   - Accessibility verification

3. **Final Review**
   - Integration testing
   - Documentation review
   - Breaking changes assessment
   - Deployment readiness

---

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors
```typescript
// Error: Type 'string' is not assignable to type 'number'
// Solution: Proper type assertion or conversion
const numericValue = Number(stringValue);

// Error: Object is possibly 'null' or 'undefined'
// Solution: Optional chaining or null checks
const result = data?.property?.value ?? defaultValue;
```

#### 2. React Warnings
```typescript
// Warning: Can't perform a React state update on an unmounted component
// Solution: Cleanup subscriptions
useEffect(() => {
  let mounted = true;
  
  fetchData().then(data => {
    if (mounted) {
      setData(data);
    }
  });
  
  return () => { mounted = false; };
}, []);
```

#### 3. Performance Issues
```typescript
// Issue: Unnecessary re-renders
// Solution: Memoization and dependency optimization
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]); // Only recompute when data changes
```

### Debugging Tools

#### 1. React DevTools
```typescript
// Add displayName for better debugging
Button.displayName = 'Button';

// Use React DevTools Profiler
const ProfiledComponent = React.memo(Component);
```

#### 2. Performance Monitoring
```typescript
// Performance measurement
const startTime = performance.now();
performExpensiveOperation();
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

### Getting Help

1. **Documentation**: Check component API docs
2. **Storybook**: View component examples
3. **Tests**: Look at test files for usage examples
4. **Team**: Ask in development chat
5. **Issues**: Create GitHub issue for bugs

---

## Tools and Resources

### Development Tools

- **VS Code**: Primary IDE with extensions
- **Chrome DevTools**: Browser debugging
- **React DevTools**: Component debugging
- **Storybook**: Component development
- **Jest**: Unit testing
- **Playwright**: E2E testing

### Useful Links

- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design Components](https://ant.design/components/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)

---

**Happy coding! 🚀**