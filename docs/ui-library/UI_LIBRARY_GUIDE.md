# UI Library Development Guide

## Overview

The UI Library is the foundational design system for the CNC Jog Controls application. It provides consistent, reusable components with built-in themes, accessibility features, and TypeScript support. This guide covers development, integration, and deployment workflows.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development Setup](#local-development-setup)
3. [Component Development](#component-development)
4. [Theme System](#theme-system)
5. [Testing Components](#testing-components)
6. [Storybook Integration](#storybook-integration)
7. [Publishing & Deployment](#publishing--deployment)
8. [Integration with Electron App](#integration-with-electron-app)
9. [Migration from Ant Design](#migration-from-ant-design)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Design System Structure

```
ui-library/
├── src/
│   ├── components/           # React components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Card/
│   │   └── Modal/
│   ├── themes/              # Design tokens and themes
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   ├── cnc-controls/    # CNC-specific theme
│   │   └── base/            # Base theme
│   ├── hooks/               # Reusable React hooks
│   ├── utils/               # Utility functions
│   └── index.ts             # Main exports
├── dist/                    # Built library
├── storybook/               # Storybook configuration
└── package.json
```

### Component Priority System

1. **UI Library Components** (Primary) - Always use first
2. **Ant Design Components** (Fallback) - Complex components only
3. **Custom Components** (Last Resort) - Plan to add to UI Library

### Design Principles

- **Consistency**: All components follow the same design language
- **Accessibility**: WCAG 2.1 AA compliance built-in
- **Performance**: Tree-shakeable and optimized
- **Flexibility**: Customizable through themes and props
- **Developer Experience**: Full TypeScript support

---

## Local Development Setup

### Prerequisites

```bash
# Required tools
node >= 18.0.0
npm >= 9.0.0
git >= 2.0.0
```

### Initial Setup

1. **Clone UI Library Repository**:
   ```bash
   git clone https://github.com/your-org/ui-library.git
   cd ui-library
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Link for Local Development**:
   ```bash
   # In ui-library directory
   npm link
   
   # In electron-app directory
   cd /path/to/electron-app
   npm link ui-library
   ```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Start Storybook for component development
npm run storybook

# Run tests in watch mode
npm run test:watch

# Build library for production
npm run build

# Generate TypeScript declarations
npm run build:types

# Run linting
npm run lint

# Run accessibility tests
npm run test:a11y
```

### Hot Reload Configuration

The UI Library supports hot module replacement when linked locally:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  plugins: [
    react(),
    // Enable HMR for linked packages
    {
      name: 'hmr-linked-packages',
      handleHotUpdate({ file, server }) {
        if (file.includes('ui-library')) {
          server.ws.send({
            type: 'full-reload'
          });
        }
      }
    }
  ]
});
```

---

## Component Development

### Component Creation Workflow

1. **Generate Component Scaffold**:
   ```bash
   npm run generate:component ComponentName
   ```

2. **Component Structure**:
   ```typescript
   // Button.tsx
   import React from 'react';
   import { cn } from '../../utils/cn';
   import styles from './Button.module.css';
   
   export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary' | 'danger';
     size?: 'small' | 'medium' | 'large';
     loading?: boolean;
     icon?: React.ReactNode;
   }
   
   export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
     ({ className, variant = 'primary', size = 'medium', loading, icon, children, ...props }, ref) => {
       return (
         <button
           ref={ref}
           className={cn(
             styles.button,
             styles[variant],
             styles[size],
             loading && styles.loading,
             className
           )}
           disabled={loading || props.disabled}
           {...props}
         >
           {loading && <span className={styles.spinner} />}
           {icon && <span className={styles.icon}>{icon}</span>}
           {children}
         </button>
       );
     }
   );
   
   Button.displayName = 'Button';
   ```

3. **CSS Module Styles**:
   ```css
   /* Button.module.css */
   .button {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     gap: var(--spacing-xs);
     padding: var(--spacing-sm) var(--spacing-md);
     border: none;
     border-radius: var(--border-radius-md);
     font-family: var(--font-family-base);
     font-size: var(--font-size-base);
     font-weight: var(--font-weight-medium);
     transition: all 0.2s ease-in-out;
     cursor: pointer;
     user-select: none;
   }
   
   .button:focus-visible {
     outline: 2px solid var(--color-focus);
     outline-offset: 2px;
   }
   
   .primary {
     background-color: var(--color-primary);
     color: var(--color-primary-foreground);
   }
   
   .primary:hover {
     background-color: var(--color-primary-hover);
   }
   
   .small {
     padding: var(--spacing-xs) var(--spacing-sm);
     font-size: var(--font-size-sm);
   }
   
   .large {
     padding: var(--spacing-md) var(--spacing-lg);
     font-size: var(--font-size-lg);
   }
   
   .loading {
     opacity: 0.7;
     cursor: not-allowed;
   }
   
   .spinner {
     width: 1em;
     height: 1em;
     border: 2px solid transparent;
     border-top: 2px solid currentColor;
     border-radius: 50%;
     animation: spin 1s linear infinite;
   }
   
   @keyframes spin {
     to { transform: rotate(360deg); }
   }
   ```

4. **Export from Index**:
   ```typescript
   // index.ts
   export { Button } from './Button';
   export type { ButtonProps } from './Button';
   ```

### Component Standards

#### TypeScript Requirements
- **100% type coverage** with strict TypeScript
- **Generic interfaces** for reusable components
- **Proper ref forwarding** for DOM access
- **Comprehensive prop types** with JSDoc comments

#### Accessibility Standards
- **ARIA attributes** for screen readers
- **Keyboard navigation** support
- **Focus management** with visible focus indicators
- **Semantic HTML** elements where appropriate

#### Performance Considerations
- **React.memo** for components that re-render frequently
- **useMemo/useCallback** for expensive calculations
- **Tree-shakeable exports** for optimal bundle size
- **CSS-in-JS alternatives** avoided for performance

---

## Theme System

### Design Tokens

The theme system is built on design tokens that define the visual language:

```typescript
// themes/tokens/colors.ts
export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    900: '#0c4a6e'
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a'
  },
  
  // CNC-specific colors
  cnc: {
    emergency: '#dc2626',
    warning: '#f59e0b',
    active: '#10b981',
    idle: '#6b7280'
  }
} as const;

// themes/tokens/spacing.ts
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// themes/tokens/typography.ts
export const typography = {
  fontFamily: {
    base: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const;
```

### Theme Configuration

```typescript
// themes/cnc-controls/index.ts
import { colors, spacing, typography } from '../tokens';

export const cncControlsTheme = {
  colors: {
    ...colors,
    // CNC-specific color mappings
    background: colors.slate[50],
    foreground: colors.slate[900],
    primary: colors.blue[600],
    primaryForeground: colors.white,
    secondary: colors.slate[100],
    secondaryForeground: colors.slate[900],
    
    // Machine status colors
    machineIdle: colors.cnc.idle,
    machineActive: colors.cnc.active,
    machineEmergency: colors.cnc.emergency,
    machineWarning: colors.cnc.warning
  },
  spacing,
  typography,
  
  // Component-specific overrides
  components: {
    Button: {
      borderRadius: spacing.md,
      padding: {
        small: `${spacing.xs} ${spacing.sm}`,
        medium: `${spacing.sm} ${spacing.md}`,
        large: `${spacing.md} ${spacing.lg}`
      }
    }
  }
} as const;

export type CncControlsTheme = typeof cncControlsTheme;
```

### Theme Provider

```typescript
// themes/ThemeProvider.tsx
import React, { createContext, useContext } from 'react';
import { CncControlsTheme, cncControlsTheme } from './cnc-controls';

interface ThemeContextValue {
  theme: CncControlsTheme;
  setTheme: (theme: CncControlsTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: CncControlsTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme = cncControlsTheme 
}) => {
  const [currentTheme, setCurrentTheme] = React.useState(theme);

  // Apply CSS custom properties
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply spacing variables
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply typography variables
    Object.entries(currentTheme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

---

## Testing Components

### Testing Strategy

```typescript
// Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';
import { ThemeProvider } from '../../themes/ThemeProvider';

expect.extend(toHaveNoViolations);

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Button', () => {
  it('renders with correct text', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    renderWithTheme(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loading');
  });

  it('applies correct variant classes', () => {
    renderWithTheme(<Button variant="danger">Delete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('danger');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithTheme(<Button ref={ref}>Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Button>Accessible Button</Button>);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run accessibility tests
npm run test:a11y

# Run visual regression tests
npm run test:visual
```

---

## Storybook Integration

### Story Configuration

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ThemeProvider } from '../../themes/ThemeProvider';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and states.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    loading: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button'
  }
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button'
  }
};

export const WithIcon: Story = {
  args: {
    icon: <span>⚡</span>,
    children: 'With Icon'
  }
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  )
};
```

### Storybook Commands

```bash
# Start Storybook development server
npm run storybook

# Build Storybook for production
npm run build-storybook

# Run Storybook tests
npm run test-storybook

# Generate component documentation
npm run storybook:docs
```

---

## Publishing & Deployment

### Version Management

```bash
# Update version (patch/minor/major)
npm version patch
npm version minor
npm version major

# Pre-release versions
npm version prerelease --preid=beta
npm version prerelease --preid=alpha
```

### Build Process

```bash
# Build library for production
npm run build

# Verify build output
npm run build:verify

# Generate TypeScript declarations
npm run build:types

# Bundle analysis
npm run analyze
```

### Publishing Workflow

1. **Pre-publish Checks**:
   ```bash
   # Run full test suite
   npm run test:coverage
   
   # Check TypeScript types
   npm run type-check
   
   # Lint code
   npm run lint
   
   # Build library
   npm run build
   
   # Run accessibility tests
   npm run test:a11y
   ```

2. **Publish to Registry**:
   ```bash
   # Publish to npm
   npm publish
   
   # Publish to private registry
   npm publish --registry https://npm.your-company.com
   
   # Publish beta version
   npm publish --tag beta
   ```

3. **Post-publish Tasks**:
   ```bash
   # Create GitHub release
   gh release create v1.2.3 --title "Release v1.2.3" --notes "Release notes"
   
   # Update documentation
   npm run docs:update
   
   # Deploy Storybook
   npm run storybook:deploy
   ```

### Automated Publishing

```yaml
# .github/workflows/publish.yml
name: Publish UI Library

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Build library
        run: npm run build
        
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          
      - name: Deploy Storybook
        run: npm run storybook:deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Integration with Electron App

### Installation

```bash
# Install published version
npm install ui-library@latest

# Install specific version
npm install ui-library@1.2.3

# Install beta version
npm install ui-library@beta
```

### Usage in Electron App

```typescript
// App.tsx
import React from 'react';
import { ThemeProvider } from 'ui-library';
import { Button, Card, Modal } from 'ui-library';
import 'ui-library/dist/styles.css';

function App() {
  return (
    <ThemeProvider theme="cnc-controls">
      <div className="app">
        <Card>
          <h1>CNC Controls</h1>
          <Button variant="primary">
            Start Machine
          </Button>
        </Card>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### Component Import Examples

```typescript
// Individual component imports (recommended)
import { Button } from 'ui-library';
import { Card } from 'ui-library';
import { Modal } from 'ui-library';

// Bulk imports (use sparingly)
import { Button, Card, Modal } from 'ui-library';

// Type imports
import type { ButtonProps, CardProps } from 'ui-library';
```

### Theme Customization

```typescript
// Custom theme configuration
import { createTheme } from 'ui-library';

const customTheme = createTheme({
  colors: {
    primary: '#007acc',
    secondary: '#6c757d',
    // CNC-specific colors
    machineActive: '#28a745',
    machineIdle: '#6c757d'
  },
  spacing: {
    // Custom spacing values
  }
});

// Use custom theme
<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

---

## Migration from Ant Design

### Migration Strategy

1. **Audit Current Components**:
   ```bash
   # Find all Ant Design imports
   grep -r "from 'antd'" src/
   
   # Generate migration report
   npm run migration:audit
   ```

2. **Priority-based Migration**:
   - **High Priority**: Frequently used components (Button, Input, Card)
   - **Medium Priority**: Layout components (Grid, Space)
   - **Low Priority**: Complex components (DatePicker, Table)

3. **Component Mapping**:
   ```typescript
   // Before (Ant Design)
   import { Button, Card, Input } from 'antd';
   
   // After (UI Library)
   import { Button, Card, Input } from 'ui-library';
   ```

### Migration Examples

#### Button Migration

```typescript
// Before: Ant Design Button
import { Button } from 'antd';

<Button type="primary" size="large" loading={isLoading}>
  Submit
</Button>

// After: UI Library Button
import { Button } from 'ui-library';

<Button variant="primary" size="large" loading={isLoading}>
  Submit
</Button>
```

#### Card Migration

```typescript
// Before: Ant Design Card
import { Card } from 'antd';

<Card title="Machine Status" extra={<Button>Refresh</Button>}>
  <p>Status content</p>
</Card>

// After: UI Library Card
import { Card, Button } from 'ui-library';

<Card>
  <Card.Header>
    <Card.Title>Machine Status</Card.Title>
    <Card.Extra>
      <Button>Refresh</Button>
    </Card.Extra>
  </Card.Header>
  <Card.Content>
    <p>Status content</p>
  </Card.Content>
</Card>
```

### Migration Tools

```bash
# Run migration codemod
npm run migration:antd-to-ui-library

# Validate migration
npm run migration:validate

# Update import statements
npm run migration:fix-imports
```

---

## Troubleshooting

### Common Issues

#### 1. **TypeScript Errors After Update**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
npm run build:types

# Update TypeScript version
npm update typescript @types/react @types/react-dom
```

#### 2. **Styles Not Loading**

```typescript
// Ensure CSS is imported
import 'ui-library/dist/styles.css';

// Or use CSS-in-JS
import { createGlobalStyle } from 'styled-components';
import { uiLibraryStyles } from 'ui-library/dist/styles';
```

#### 3. **Theme Not Applied**

```typescript
// Verify ThemeProvider wraps the entire app
function App() {
  return (
    <ThemeProvider theme="cnc-controls">
      {/* All components must be inside ThemeProvider */}
      <YourComponents />
    </ThemeProvider>
  );
}
```

#### 4. **Hot Reload Not Working**

```bash
# Re-link the library
npm unlink ui-library
npm link ui-library

# Restart development server
npm start
```

#### 5. **Bundle Size Issues**

```typescript
// Use tree-shakeable imports
import { Button } from 'ui-library/components/Button';

// Avoid barrel imports
import * as UI from 'ui-library'; // ❌ Don't do this
```

### Debug Commands

```bash
# Check linked packages
npm ls --link

# Verify package installation
npm list ui-library

# Check for peer dependency issues
npm ls --peer

# Bundle analysis
npm run analyze
```

### Getting Help

- **GitHub Issues**: [ui-library/issues](https://github.com/your-org/ui-library/issues)
- **Storybook Documentation**: [ui-library.storybook.io](https://ui-library.storybook.io)
- **Team Chat**: #ui-library-support
- **Migration Guide**: [Migration Documentation](./MIGRATION_GUIDE.md)

---

## Best Practices

### Component Development
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Build complex components from simpler ones
- **Accessibility First**: Design with all users in mind
- **Performance**: Use React.memo and useMemo appropriately

### Theme Development
- **Consistent Tokens**: Use design tokens for all values
- **Semantic Naming**: Use purpose-based names, not appearance-based
- **Responsive Design**: Support all screen sizes and devices
- **Dark Mode**: Plan for multiple color schemes

### Testing
- **Test Behavior**: Test what users interact with, not implementation details
- **Accessibility**: Include accessibility tests for all components
- **Visual Regression**: Catch unintended visual changes
- **Performance**: Monitor bundle size and render performance

This comprehensive guide provides everything needed to work with the UI Library effectively. Regular updates ensure it stays current with the latest practices and capabilities.