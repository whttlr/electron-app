import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from './Button';
import { Play, Pause, Square, Home, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a versatile interactive element designed for CNC control applications. 
It supports multiple variants, sizes, and states optimized for industrial environments.

## Features
- **High Contrast**: Optimized for workshop lighting conditions
- **Large Touch Targets**: Suitable for industrial touchscreen interfaces
- **Accessibility**: Full keyboard navigation and screen reader support
- **Safety States**: Emergency and warning variants for critical actions
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'emergency', 'success', 'warning', 'danger'],
      description: 'Button style variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Whether button shows loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether button takes full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button content',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    onClick: action('primary-clicked'),
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    onClick: action('secondary-clicked'),
  },
};

export const Emergency: Story = {
  args: {
    variant: 'emergency',
    children: 'EMERGENCY STOP',
    onClick: action('emergency-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Emergency button with high contrast red styling for critical safety actions.',
      },
    },
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="primary" size="sm" onClick={action('small-clicked')}>
        Small
      </Button>
      <Button variant="primary" size="md" onClick={action('medium-clicked')}>
        Medium
      </Button>
      <Button variant="primary" size="lg" onClick={action('large-clicked')}>
        Large
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button component in different sizes. Large size is recommended for touch interfaces.',
      },
    },
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <Button variant="primary" onClick={action('primary-clicked')}>
        Primary
      </Button>
      <Button variant="secondary" onClick={action('secondary-clicked')}>
        Secondary
      </Button>
      <Button variant="success" onClick={action('success-clicked')}>
        Success
      </Button>
      <Button variant="warning" onClick={action('warning-clicked')}>
        Warning
      </Button>
      <Button variant="danger" onClick={action('danger-clicked')}>
        Danger
      </Button>
      <Button variant="emergency" onClick={action('emergency-clicked')}>
        Emergency
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with semantic color coding for different action types.',
      },
    },
  },
};

// States
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Button variant="primary" onClick={action('normal-clicked')}>
        Normal State
      </Button>
      <Button variant="primary" disabled>
        Disabled State
      </Button>
      <Button variant="primary" loading onClick={action('loading-clicked')}>
        Loading State
      </Button>
      <Button variant="primary" fullWidth onClick={action('full-width-clicked')}>
        Full Width
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button states including disabled, loading, and full-width variants.',
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="success" icon={<Play size={16} />} onClick={action('play-clicked')}>
        Start Job
      </Button>
      <Button variant="warning" icon={<Pause size={16} />} onClick={action('pause-clicked')}>
        Pause
      </Button>
      <Button variant="danger" icon={<Square size={16} />} onClick={action('stop-clicked')}>
        Stop
      </Button>
      <Button variant="secondary" icon={<Home size={16} />} onClick={action('home-clicked')}>
        Home All
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons for common CNC control actions. Icons help with quick recognition.',
      },
    },
  },
};

// CNC Machine Controls
export const CNCControls: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Machine Control Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Machine Controls</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="success" size="lg" onClick={action('start-clicked')}>
            <Play size={20} className="mr-2" />
            Start
          </Button>
          <Button variant="warning" size="lg" onClick={action('pause-clicked')}>
            <Pause size={20} className="mr-2" />
            Pause
          </Button>
          <Button variant="danger" size="lg" onClick={action('stop-clicked')}>
            <Square size={20} className="mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Jog Controls */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Jog Controls</h3>
        <div className="grid grid-cols-3 gap-2 max-w-xs">
          <div></div>
          <Button variant="secondary" size="lg" onClick={action('y-plus-clicked')}>
            Y+
          </Button>
          <div></div>
          
          <Button variant="secondary" size="lg" onClick={action('x-minus-clicked')}>
            X-
          </Button>
          <Button variant="secondary" size="lg" onClick={action('home-clicked')}>
            <Home size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={action('x-plus-clicked')}>
            X+
          </Button>
          
          <div></div>
          <Button variant="secondary" size="lg" onClick={action('y-minus-clicked')}>
            Y-
          </Button>
          <div></div>
        </div>
      </div>

      {/* Emergency Stop */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Safety</h3>
        <Button 
          variant="emergency" 
          size="lg" 
          fullWidth 
          onClick={action('emergency-stop-clicked')}
          icon={<AlertTriangle size={24} />}
        >
          EMERGENCY STOP
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: `
Real-world example of button usage in a CNC control interface. This demonstrates:
- **Machine Controls**: Start, pause, and stop operations
- **Jog Controls**: Manual machine positioning
- **Emergency Stop**: Critical safety control with high visibility
        `,
      },
    },
  },
};

// Accessibility Example
export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Keyboard Navigation</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Use Tab to navigate, Enter or Space to activate
        </p>
        <div className="flex gap-3">
          <Button 
            variant="primary" 
            onClick={action('first-clicked')}
            aria-label="First action button"
          >
            First
          </Button>
          <Button 
            variant="secondary" 
            onClick={action('second-clicked')}
            aria-label="Second action button"
          >
            Second
          </Button>
          <Button 
            variant="success" 
            onClick={action('third-clicked')}
            aria-label="Third action button"
          >
            Third
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Screen Reader Support</h3>
        <Button 
          variant="emergency"
          onClick={action('emergency-clicked')}
          aria-label="Emergency stop - immediately halt all machine operations"
          aria-describedby="emergency-help"
        >
          EMERGENCY STOP
        </Button>
        <p id="emergency-help" className="text-gray-400 text-sm mt-2">
          This button will immediately stop all machine operations
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
Accessibility features demonstration:
- **Keyboard Navigation**: Full Tab, Enter, and Space key support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Clear visual focus indicators
- **Semantic Markup**: Proper button roles and states
        `,
      },
    },
  },
};

// Interactive Playground
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button Text',
    disabled: false,
    loading: false,
    fullWidth: false,
    onClick: action('playground-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all button properties and see real-time changes.',
      },
    },
  },
};