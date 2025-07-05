# Storybook Documentation

> Interactive component documentation and development environment

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Writing Stories](#writing-stories)
- [Documentation Features](#documentation-features)
- [Accessibility Testing](#accessibility-testing)
- [Visual Testing](#visual-testing)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

---

## Overview

Storybook serves as our interactive component documentation and development environment. It provides:

- **Component Showcase**: Visual documentation of all design system components
- **Interactive Playground**: Live editing and testing of component properties
- **Accessibility Testing**: Built-in a11y validation and guidelines
- **Documentation**: Auto-generated docs from TypeScript interfaces
- **Design Tokens**: Visual display of colors, typography, and spacing
- **Use Cases**: Real-world examples and scenarios

### Features

- 🎨 **Dark Theme**: Optimized for CNC workshop environments
- ♿ **Accessibility**: Built-in axe-core testing and guidelines
- 📱 **Responsive**: Test components across different viewport sizes
- 🎮 **Interactive**: Live controls for all component properties
- 📖 **Auto-docs**: Generated from TypeScript interfaces
- 🧪 **Testing**: Visual regression and interaction testing

---

## Getting Started

### Installation

```bash
# Install Storybook dependencies
npm install --save-dev @storybook/react-vite
npm install --save-dev @storybook/addon-essentials
npm install --save-dev @storybook/addon-a11y
npm install --save-dev @storybook/addon-docs
```

### Running Storybook

```bash
# Start development server
npm run storybook

# Build static version
npm run build-storybook

# Serve built version
npx http-server storybook-static
```

### Configuration

Storybook is configured in the `.storybook` directory:

```
.storybook/
├── main.ts          # Main configuration
├── preview.ts       # Global decorators and parameters
└── theme.ts         # Custom theme configuration
```

---

## Writing Stories

### Basic Story Structure

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button component for user interactions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'emergency'],
      description: 'Button style variant',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

### Advanced Story Patterns

#### 1. Multiple Component States

```typescript
// All variants in one story
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="emergency">Emergency</Button>
      <Button variant="success">Success</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with semantic color coding.',
      },
    },
  },
};
```

#### 2. Interactive Component

```typescript
// Interactive story with state
const InteractiveExample = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="space-y-4">
      <div>Count: {count}</div>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
      <Button onClick={() => setCount(0)} variant="secondary">
        Reset
      </Button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};
```

#### 3. Real-world Scenarios

```typescript
// CNC control scenario
export const CNCControlExample: Story = {
  render: () => (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-white text-lg mb-4">Machine Controls</h3>
      <div className="grid grid-cols-3 gap-3">
        <Button variant="success" size="lg">
          <Play className="mr-2" />
          Start
        </Button>
        <Button variant="warning" size="lg">
          <Pause className="mr-2" />
          Pause
        </Button>
        <Button variant="danger" size="lg">
          <Square className="mr-2" />
          Stop
        </Button>
      </div>
      
      <div className="mt-6">
        <Button variant="emergency" size="lg" fullWidth>
          <AlertTriangle className="mr-2" />
          EMERGENCY STOP
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
};
```

### CNC-Specific Stories

#### JogControls Component

```typescript
// JogControls.stories.tsx
export const WoodworkingSetup: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-white mb-2">Woodworking Setup</h3>
        <p className="text-gray-400 text-sm mb-4">
          300mm × 400mm working area for edge trimming
        </p>
        
        <JogControls
          position={{ x: 50, y: 50, z: 5 }}
          stepSizes={[0.1, 1, 10, 25]}
          workingArea={{
            width: 300,
            height: 400,
            depth: 50,
            units: 'mm',
          }}
          onJog={action('jog')}
          onHome={action('home')}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};
```

---

## Documentation Features

### Auto-generated Documentation

Storybook automatically generates documentation from:

- **TypeScript interfaces**: Component props and types
- **JSDoc comments**: Detailed descriptions and examples
- **Default values**: Extracted from component defaults
- **Story descriptions**: Context and usage information

```typescript
/**
 * Primary button component for user interactions
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  ...props
}) => {
  // Component implementation
};
```

### Custom Documentation

```typescript
// Add custom documentation to stories
export const EmergencyButton: Story = {
  args: {
    variant: 'emergency',
    children: 'EMERGENCY STOP',
  },
  parameters: {
    docs: {
      description: {
        story: `
The emergency button is designed for critical safety situations in CNC operations. 
It features:

- **High Contrast**: Maximum visibility in workshop environments
- **Large Touch Target**: Easy to activate under stress
- **Immediate Action**: No confirmation required for true emergencies
- **Accessibility**: Screen reader compatible with clear labeling

## Safety Guidelines

- Position emergency buttons within easy reach
- Ensure clear line of sight to all operators
- Test emergency procedures regularly
- Train all operators on proper usage
        `,
      },
    },
  },
};
```

### Design Token Documentation

```typescript
// Design tokens story
export const DesignTokens: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Colors</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(designTokens.colors).map(([name, shades]) => (
            <div key={name} className="space-y-2">
              <h3 className="font-medium text-white capitalize">{name}</h3>
              {Object.entries(shades).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-sm">
                    <div className="text-white">{shade}</div>
                    <div className="text-gray-400">{color}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Typography</h2>
        {Object.entries(designTokens.typography).map(([name, styles]) => (
          <div key={name} className="mb-4">
            <h3 className="font-medium text-white mb-2">{name}</h3>
            <div 
              className="text-white"
              style={styles}
            >
              The quick brown fox jumps over the lazy dog
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {JSON.stringify(styles, null, 2)}
            </div>
          </div>
        ))}
      </section>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Visual representation of all design tokens used in the system.',
      },
    },
  },
};
```

---

## Accessibility Testing

### Built-in A11y Testing

Storybook includes automatic accessibility testing:

```typescript
// .storybook/preview.ts
export default {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Customize accessibility rules
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
        ],
      },
      options: {
        checks: { 
          'color-contrast': { 
            options: { noScroll: true } 
          } 
        },
        restoreScroll: true,
      },
    },
  },
};
```

### Accessibility Stories

```typescript
// Dedicated accessibility examples
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Keyboard Navigation
        </h3>
        <p className="text-gray-400 mb-4 text-sm">
          Use Tab to navigate, Enter/Space to activate
        </p>
        <div className="flex gap-3">
          <Button aria-label="First action">First</Button>
          <Button aria-label="Second action">Second</Button>
          <Button aria-label="Third action">Third</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Screen Reader Support
        </h3>
        <Button 
          variant="emergency"
          aria-label="Emergency stop - immediately halt all operations"
          aria-describedby="emergency-help"
        >
          EMERGENCY STOP
        </Button>
        <p id="emergency-help" className="text-gray-400 text-sm mt-2">
          This will immediately stop all machine operations
        </p>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'aria-labels', enabled: true },
        ],
      },
    },
  },
};
```

---

## Visual Testing

### Chromatic Integration

```bash
# Install Chromatic for visual testing
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<your-token>
```

### Responsive Testing

```typescript
// Test component across viewports
export const ResponsiveTest: Story = {
  render: () => <ResponsiveComponent />,
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1024px', height: '768px' } },
      },
    },
    chromatic: {
      viewports: [375, 768, 1024, 1440],
    },
  },
};
```

### Screenshot Testing

```typescript
// Configure screenshot testing
export const VisualRegression: Story = {
  render: () => <ComponentToTest />,
  parameters: {
    chromatic: {
      // Delay to ensure animations complete
      delay: 300,
      // Disable specific tests
      disable: false,
      // Pause animations
      pauseAnimationAtEnd: true,
    },
  },
};
```

---

## Deployment

### Static Build

```bash
# Build Storybook for deployment
npm run build-storybook

# Deploy to static hosting
# The built files will be in storybook-static/
```

### GitHub Pages

```yaml
# .github/workflows/storybook.yml
name: Deploy Storybook

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
```

### Netlify/Vercel

```bash
# Build command
npm run build-storybook

# Publish directory
storybook-static
```

---

## Best Practices

### Story Organization

1. **Hierarchical Structure**: Use clear title hierarchies
   ```typescript
   title: 'Design System/Components/Button'
   title: 'Design System/CNC Components/JogControls'
   title: 'Examples/Real World/Workshop Interface'
   ```

2. **Consistent Naming**: Use descriptive, consistent story names
   ```typescript
   export const Primary: Story = { /* */ };
   export const WithIcon: Story = { /* */ };
   export const LoadingState: Story = { /* */ };
   export const AccessibilityDemo: Story = { /* */ };
   ```

3. **Logical Grouping**: Group related functionality
   ```typescript
   // Basic variants
   export const Primary: Story = { /* */ };
   export const Secondary: Story = { /* */ };
   
   // States
   export const Disabled: Story = { /* */ };
   export const Loading: Story = { /* */ };
   
   // Real-world examples
   export const CNCControls: Story = { /* */ };
   ```

### Documentation Guidelines

1. **Clear Descriptions**: Write helpful component descriptions
2. **Usage Examples**: Show real-world usage patterns
3. **Code Examples**: Include copy-pasteable code snippets
4. **Accessibility Notes**: Document a11y features and requirements
5. **Design Guidelines**: Explain when and how to use components

### Performance Considerations

1. **Lazy Loading**: Use dynamic imports for heavy components
2. **Image Optimization**: Optimize images and assets
3. **Bundle Analysis**: Monitor bundle size growth
4. **Minimal Dependencies**: Avoid heavy addon dependencies

### Testing Integration

1. **Visual Testing**: Set up Chromatic or similar
2. **Interaction Testing**: Test user interactions
3. **Accessibility Testing**: Validate a11y in all stories
4. **Responsive Testing**: Test across viewport sizes

---

## Troubleshooting

### Common Issues

#### 1. Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build-storybook
```

#### 2. Addon Conflicts

```typescript
// Check addon compatibility in main.ts
addons: [
  '@storybook/addon-essentials',
  '@storybook/addon-a11y', // Ensure compatible versions
],
```

#### 3. Styling Issues

```typescript
// Import global styles in preview.ts
import '../src/index.css';
```

### Development Tips

1. **Hot Reload**: Storybook supports hot reloading for development
2. **Args Table**: Use proper TypeScript interfaces for auto-generated tables
3. **Controls**: Configure controls for better interactive experience
4. **Docs**: Use MDX for custom documentation pages

---

**Document beautifully! 📚**