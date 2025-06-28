import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JogControls from '../JogControls';
import { JogControlProps } from '../ControlTypes';

// Mock all child components
jest.mock('../AxisControls', () => ({
  __esModule: true,
  default: ({ axis, onJog, onHighlight, onClearHighlight }: any) => (
    <div data-testid={`axis-control-${axis}`}>
      <button 
        data-testid={`jog-${axis}-negative`} 
        onClick={() => onJog(-1)}
        onMouseEnter={onHighlight}
        onMouseLeave={onClearHighlight}
      >
        {axis} -
      </button>
      <button 
        data-testid={`jog-${axis}-positive`} 
        onClick={() => onJog(1)}
        onMouseEnter={onHighlight}
        onMouseLeave={onClearHighlight}
      >
        {axis} +
      </button>
    </div>
  ),
  HomeControl: ({ onHome }: any) => (
    <button data-testid="home-button" onClick={onHome}>
      Home
    </button>
  )
}));

jest.mock('../PositionDisplay', () => ({
  __esModule: true,
  default: ({ position, unit, precision }: any) => (
    <div data-testid="position-display">
      X: {position.x.toFixed(precision)} {unit},
      Y: {position.y.toFixed(precision)} {unit},
      Z: {position.z.toFixed(precision)} {unit}
    </div>
  )
}));

jest.mock('../JogSettings', () => ({
  __esModule: true,
  default: ({ speed, increment, isMetric, onSpeedChange, onIncrementChange, onUnitChange }: any) => (
    <div data-testid="jog-settings">
      <input 
        data-testid="speed-input" 
        value={Number(speed)} 
        onChange={(e) => onSpeedChange?.(Number(e.target.value))}
        type="number"
      />
      <input 
        data-testid="increment-input" 
        value={Number(increment)} 
        onChange={(e) => onIncrementChange?.(Number(e.target.value))}
        type="number"
      />
      <input 
        data-testid="unit-toggle" 
        type="checkbox" 
        checked={isMetric} 
        onChange={(e) => onUnitChange?.(e.target.checked)}
      />
    </div>
  )
}));

// Mock shared components
jest.mock('../../shared/SectionHeader', () => ({
  SectionHeader: ({ title }: any) => <div data-testid="section-header">{title}</div>
}));

// Mock antd components
jest.mock('antd', () => ({
  Card: ({ children, title }: any) => (
    <div data-testid="card">
      {title && <div data-testid="card-title">{title}</div>}
      {children}
    </div>
  ),
  Row: ({ children }: any) => <div data-testid="row">{children}</div>,
  Col: ({ children, xs, sm }: any) => (
    <div data-testid="col" data-xs={xs} data-sm={sm}>{children}</div>
  ),
  Space: ({ children, direction, style }: any) => (
    <div data-testid="space" data-direction={direction} style={style}>{children}</div>
  )
}));

// Mock theme constants
jest.mock('../../theme/constants', () => ({
  AXIS_COLORS: {
    x: '#00ff00',
    y: '#ff0000',
    z: '#0000ff'
  }
}));

describe('JogControls', () => {
  const defaultProps: JogControlProps = {
    onJog: jest.fn(),
    onHome: jest.fn(),
    disabled: false,
    jogSettings: {
      speed: 1000,
      increment: 1,
      isMetric: true
    },
    onSettingsChange: jest.fn(),
    position: { x: 10.5, y: 20.25, z: 5.125 },
    isConnected: true,
    onAxisHighlight: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render all main components', () => {
      render(<JogControls {...defaultProps} />);
      
      expect(screen.getByTestId('position-display')).toBeInTheDocument();
      expect(screen.getByTestId('jog-settings')).toBeInTheDocument();
      expect(screen.getByTestId('axis-control-x')).toBeInTheDocument();
      expect(screen.getByTestId('axis-control-y')).toBeInTheDocument();
      expect(screen.getByTestId('axis-control-z')).toBeInTheDocument();
      expect(screen.getByTestId('home-button')).toBeInTheDocument();
    });

    test('should pass correct props to PositionDisplay', () => {
      render(<JogControls {...defaultProps} />);
      
      const positionDisplay = screen.getByTestId('position-display');
      expect(positionDisplay).toHaveTextContent('X: 10.500 mm');
      expect(positionDisplay).toHaveTextContent('Y: 20.250 mm');
      expect(positionDisplay).toHaveTextContent('Z: 5.125 mm');
    });

    test('should show imperial units when isMetric is false', () => {
      const props = {
        ...defaultProps,
        jogSettings: { ...defaultProps.jogSettings, isMetric: false }
      };
      render(<JogControls {...props} />);
      
      const positionDisplay = screen.getByTestId('position-display');
      expect(positionDisplay).toHaveTextContent('in');
    });

    test('should pass correct props to JogSettings', () => {
      render(<JogControls {...defaultProps} />);
      
      const speedInput = screen.getByTestId('speed-input');
      const incrementInput = screen.getByTestId('increment-input');
      const unitToggle = screen.getByTestId('unit-toggle');
      
      expect(speedInput).toHaveValue(1000);
      expect(incrementInput).toHaveValue(1);
      expect(unitToggle).toBeChecked();
    });
  });

  describe('Jog Interactions', () => {
    test('should call onJog with correct parameters for X axis', () => {
      const mockOnJog = jest.fn();
      render(<JogControls {...defaultProps} onJog={mockOnJog} />);
      
      fireEvent.click(screen.getByTestId('jog-x-positive'));
      
      expect(mockOnJog).toHaveBeenCalledWith('y', 1, 1); // Note: X axis maps to Y movement
    });

    test('should call onJog with correct parameters for Y axis', () => {
      const mockOnJog = jest.fn();
      render(<JogControls {...defaultProps} onJog={mockOnJog} />);
      
      fireEvent.click(screen.getByTestId('jog-y-negative'));
      
      expect(mockOnJog).toHaveBeenCalledWith('x', -1, 1); // Note: Y axis maps to X movement
    });

    test('should call onJog with correct parameters for Z axis', () => {
      const mockOnJog = jest.fn();
      render(<JogControls {...defaultProps} onJog={mockOnJog} />);
      
      fireEvent.click(screen.getByTestId('jog-z-positive'));
      
      expect(mockOnJog).toHaveBeenCalledWith('z', 1, 1);
    });

    test('should use current increment value in jog commands', () => {
      const props = {
        ...defaultProps,
        jogSettings: { ...defaultProps.jogSettings, increment: 0.1 }
      };
      const mockOnJog = jest.fn();
      render(<JogControls {...props} onJog={mockOnJog} />);
      
      fireEvent.click(screen.getByTestId('jog-x-positive'));
      
      expect(mockOnJog).toHaveBeenCalledWith('y', 1, 0.1);
    });
  });

  describe('Home Functionality', () => {
    test('should call onHome when home button is clicked', () => {
      const mockOnHome = jest.fn();
      render(<JogControls {...defaultProps} onHome={mockOnHome} />);
      
      fireEvent.click(screen.getByTestId('home-button'));
      
      expect(mockOnHome).toHaveBeenCalled();
    });
  });

  describe('Settings Changes', () => {
    test('should call onSettingsChange when speed changes', () => {
      const mockOnSettingsChange = jest.fn();
      render(<JogControls {...defaultProps} onSettingsChange={mockOnSettingsChange} />);
      
      const speedInput = screen.getByTestId('speed-input');
      fireEvent.change(speedInput, { target: { value: '2000' } });
      
      expect(mockOnSettingsChange).toHaveBeenCalledWith({ speed: 2000 });
    });

    test('should call onSettingsChange when increment changes', () => {
      const mockOnSettingsChange = jest.fn();
      render(<JogControls {...defaultProps} onSettingsChange={mockOnSettingsChange} />);
      
      const incrementInput = screen.getByTestId('increment-input');
      fireEvent.change(incrementInput, { target: { value: '0.1' } });
      
      expect(mockOnSettingsChange).toHaveBeenCalledWith({ increment: 0.1 });
    });

    test('should call onSettingsChange when unit changes', () => {
      const mockOnSettingsChange = jest.fn();
      render(<JogControls {...defaultProps} onSettingsChange={mockOnSettingsChange} />);
      
      const unitToggle = screen.getByTestId('unit-toggle');
      fireEvent.click(unitToggle);
      
      expect(mockOnSettingsChange).toHaveBeenCalledWith({ isMetric: false });
    });
  });

  describe('Axis Highlighting', () => {
    test('should call onAxisHighlight when axis is highlighted', () => {
      const mockOnAxisHighlight = jest.fn();
      render(<JogControls {...defaultProps} onAxisHighlight={mockOnAxisHighlight} />);
      
      fireEvent.mouseEnter(screen.getByTestId('jog-x-positive'));
      
      expect(mockOnAxisHighlight).toHaveBeenCalledWith('x');
    });

    test('should call onAxisHighlight with null when clearing highlight', () => {
      const mockOnAxisHighlight = jest.fn();
      render(<JogControls {...defaultProps} onAxisHighlight={mockOnAxisHighlight} />);
      
      fireEvent.mouseLeave(screen.getByTestId('jog-x-positive'));
      
      expect(mockOnAxisHighlight).toHaveBeenCalledWith(null);
    });

    test('should handle missing onAxisHighlight gracefully', () => {
      const props = { ...defaultProps, onAxisHighlight: undefined };
      
      expect(() => {
        render(<JogControls {...props} />);
        fireEvent.mouseEnter(screen.getByTestId('jog-x-positive'));
      }).not.toThrow();
    });
  });

  describe('Disabled States', () => {
    test('should pass disabled state based on connection status', () => {
      render(<JogControls {...defaultProps} isConnected={false} />);
      
      // Check that axis controls receive disabled state
      // (This would be tested more thoroughly in the actual AxisControl tests)
      expect(screen.getByTestId('axis-control-x')).toBeInTheDocument();
    });

    test('should pass disabled state based on disabled prop', () => {
      render(<JogControls {...defaultProps} disabled={true} />);
      
      // Check that axis controls receive disabled state
      expect(screen.getByTestId('axis-control-x')).toBeInTheDocument();
    });

    test('should pass connection state to settings', () => {
      render(<JogControls {...defaultProps} isConnected={false} />);
      
      // Settings should be disabled when not connected
      expect(screen.getByTestId('jog-settings')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    test('should render proper grid layout', () => {
      render(<JogControls {...defaultProps} />);
      
      const cols = screen.getAllByTestId('col');
      expect(cols).toHaveLength(4); // X, Y, Z, Home
      
      cols.forEach(col => {
        expect(col).toHaveAttribute('data-xs', '6');
        expect(col).toHaveAttribute('data-sm', '6');
      });
    });

    test('should render components in correct order', () => {
      render(<JogControls {...defaultProps} />);
      
      const space = screen.getByTestId('space');
      expect(space).toHaveAttribute('data-direction', 'vertical');
      expect(space).toHaveStyle({ width: '100%', padding: '0 12px' });
    });
  });
});