import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { JogControls } from './JogControls';
import { useState } from 'react';

const meta: Meta<typeof JogControls> = {
  title: 'Design System/CNC Components/JogControls',
  component: JogControls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The JogControls component provides a comprehensive interface for manual machine positioning in CNC applications. 
It includes multi-axis controls, step size selection, and safety features.

## Features
- **Multi-Axis Control**: X, Y, and Z axis positioning
- **Variable Step Sizes**: Configurable jog distances
- **Safety Boundaries**: Respects machine working area limits
- **Accessibility**: Full keyboard navigation and screen reader support
- **Visual Feedback**: Clear position display and button states
- **Emergency Controls**: Integrated home and emergency stop functions

## Usage in CNC Applications
This component is essential for:
- Manual machine positioning
- Job setup and alignment
- Testing and calibration
- Emergency positioning
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      description: 'Current machine position',
      table: {
        type: { summary: 'Position3D' },
      },
    },
    onJog: {
      action: 'jog',
      description: 'Jog movement handler',
      table: {
        type: { summary: '(axis: Axis, direction: 1 | -1, distance: number) => void' },
      },
    },
    onHome: {
      action: 'home',
      description: 'Home positioning handler',
      table: {
        type: { summary: '(axes: Axis[]) => void' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether controls are disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    stepSizes: {
      control: 'object',
      description: 'Available jog step sizes in mm',
      table: {
        type: { summary: 'number[]' },
        defaultValue: { summary: '[0.1, 1, 10]' },
      },
    },
    maxJogDistance: {
      control: 'number',
      description: 'Maximum single jog distance',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1000' },
      },
    },
    workingArea: {
      control: 'object',
      description: 'Machine working area limits',
      table: {
        type: { summary: 'WorkingArea' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive component wrapper for stateful stories
const InteractiveJogControls = (props: any) => {
  const [position, setPosition] = useState(props.position || { x: 0, y: 0, z: 0 });
  
  const handleJog = (axis: 'X' | 'Y' | 'Z', direction: 1 | -1, distance: number) => {
    action('jog')(axis, direction, distance);
    
    setPosition(prev => ({
      ...prev,
      [axis.toLowerCase()]: prev[axis.toLowerCase() as keyof typeof prev] + (direction * distance),
    }));
  };
  
  const handleHome = (axes: Array<'X' | 'Y' | 'Z'>) => {
    action('home')(axes);
    
    setPosition(prev => {
      const newPosition = { ...prev };
      axes.forEach(axis => {
        newPosition[axis.toLowerCase() as keyof typeof newPosition] = 0;
      });
      return newPosition;
    });
  };
  
  return (
    <JogControls
      {...props}
      position={position}
      onJog={handleJog}
      onHome={handleHome}
    />
  );
};

// Basic Stories
export const Default: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 0, y: 0, z: 0 },
    disabled: false,
  },
};

export const WithPosition: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 150.5, y: 200.0, z: 25.0 },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Jog controls with a current machine position showing decimal precision.',
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 100, y: 100, z: 50 },
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state when machine is not connected or in an unsafe state.',
      },
    },
  },
};

// Step Size Variants
export const CustomStepSizes: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 0, y: 0, z: 0 },
    stepSizes: [0.01, 0.1, 1, 10, 100],
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom step sizes for fine control and rapid positioning.',
      },
    },
  },
};

export const PrecisionControl: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 0, y: 0, z: 0 },
    stepSizes: [0.001, 0.01, 0.1, 1],
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'High-precision step sizes for detailed work and fine adjustments.',
      },
    },
  },
};

// Working Area Constraints
export const WithWorkingArea: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 280, y: 280, z: 90 },
    stepSizes: [0.1, 1, 10],
    workingArea: {
      width: 300,
      height: 300,
      depth: 100,
      units: 'mm',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Jog controls near working area limits. Further movement in constrained directions will be prevented.',
      },
    },
  },
};

// Real-world Scenarios
export const WoodworkingSetup: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Woodworking CNC Setup</h3>
        <p className="text-gray-400 text-sm mb-4">
          300mm × 400mm working area, positioned for edge trimming operation
        </p>
        <InteractiveJogControls {...args} />
      </div>
    </div>
  ),
  args: {
    position: { x: 50, y: 50, z: 5 },
    stepSizes: [0.1, 1, 10, 25],
    workingArea: {
      width: 300,
      height: 400,
      depth: 50,
      units: 'mm',
    },
    disabled: false,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world woodworking scenario with appropriate working area and step sizes.',
      },
    },
  },
};

export const MetalMachiningSetup: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Metal Machining Setup</h3>
        <p className="text-gray-400 text-sm mb-4">
          Large working area with precision positioning for steel fabrication
        </p>
        <InteractiveJogControls {...args} />
      </div>
    </div>
  ),
  args: {
    position: { x: 100, y: 200, z: 25 },
    stepSizes: [0.01, 0.1, 1, 10, 50],
    workingArea: {
      width: 600,
      height: 800,
      depth: 200,
      units: 'mm',
    },
    disabled: false,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Metal machining setup with larger working area and precision step sizes.',
      },
    },
  },
};

// Accessibility and Safety
export const AccessibilityDemo: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Accessibility Features</h3>
        
        <div className="mb-4">
          <h4 className="text-md font-medium text-white mb-2">Keyboard Navigation</h4>
          <p className="text-gray-400 text-sm mb-3">
            Use Tab to navigate controls, Enter/Space to activate, Arrow keys for directional movement
          </p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-md font-medium text-white mb-2">Screen Reader Support</h4>
          <p className="text-gray-400 text-sm mb-3">
            All controls have descriptive labels and announce position changes
          </p>
        </div>
        
        <InteractiveJogControls {...args} />
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded">
          <p className="text-yellow-200 text-sm">
            <strong>Safety Note:</strong> All movements respect machine limits and safety boundaries
          </p>
        </div>
      </div>
    </div>
  ),
  args: {
    position: { x: 0, y: 0, z: 0 },
    stepSizes: [0.1, 1, 10],
    workingArea: {
      width: 300,
      height: 300,
      depth: 100,
      units: 'mm',
    },
    disabled: false,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: `
Accessibility and safety features demonstration:
- **Keyboard Navigation**: Full control via keyboard
- **Screen Reader Support**: Descriptive labels and live updates
- **Safety Boundaries**: Automatic limit enforcement
- **Visual Feedback**: Clear state indicators
        `,
      },
    },
  },
};

// Error States
export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-200 mb-2">Machine Error State</h3>
        <p className="text-red-300 text-sm mb-4">
          Connection lost - all controls disabled
        </p>
        <JogControls
          position={{ x: 150, y: 200, z: 25 }}
          onJog={action('jog-error')}
          onHome={action('home-error')}
          disabled={true}
          stepSizes={[0.1, 1, 10]}
        />
      </div>
      
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-200 mb-2">Boundary Warning</h3>
        <p className="text-yellow-300 text-sm mb-4">
          Position near working area limits - some movements restricted
        </p>
        <JogControls
          position={{ x: 295, y: 295, z: 95 }}
          onJog={action('jog-boundary')}
          onHome={action('home-boundary')}
          disabled={false}
          stepSizes={[0.1, 1, 10]}
          workingArea={{
            width: 300,
            height: 300,
            depth: 100,
            units: 'mm',
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Error states and boundary warnings that users may encounter during operation.',
      },
    },
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => <InteractiveJogControls {...args} />,
  args: {
    position: { x: 0, y: 0, z: 0 },
    disabled: false,
    stepSizes: [0.1, 1, 10],
    maxJogDistance: 1000,
    workingArea: {
      width: 300,
      height: 300,
      depth: 100,
      units: 'mm',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all jog control properties and see real-time position updates.',
      },
    },
  },
};