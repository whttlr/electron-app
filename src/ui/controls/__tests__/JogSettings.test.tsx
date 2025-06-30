import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JogSettings from '../JogSettings';
import { JogSettingsProps } from '../ControlTypes';

// Mock the jog controller
jest.mock('../../../core/positioning', () => ({
  jogController: {
    getAvailableIncrements: jest.fn(),
    getSpeedLimits: jest.fn()
  }
}));

// Mock antd components
jest.mock('antd', () => ({
  Card: ({ children, title }: any) => (
    <div data-testid="card">
      {title && <div data-testid="card-title">{title}</div>}
      {children}
    </div>
  ),
  Row: ({ children, gutter, style }: any) => (
    <div data-testid="row" style={style}>
      {children}
    </div>
  ),
  Col: ({ children, span }: any) => (
    <div data-testid="col" data-span={span}>
      {children}
    </div>
  ),
  InputNumber: ({ value, onChange, min, max, disabled, addonAfter, ...props }: any) => (
    <input
      data-testid="input-number"
      type="number"
      value={value}
      onChange={(e) => onChange?.(parseFloat(e.target.value))}
      min={min}
      max={max}
      disabled={disabled}
      data-addon-after={addonAfter}
      {...props}
    />
  ),
  Select: Object.assign(
    ({ value, onChange, children, disabled, ...props }: any) => (
      <select
        data-testid="select"
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
    ),
    {
      Option: ({ children, value }: any) => (
        <option value={value}>
          {children}
        </option>
      )
    }
  ),
  Switch: ({ checked, onChange, disabled, checkedChildren, unCheckedChildren, ...props }: any) => (
    <input
      data-testid="switch"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      data-checked-children={checkedChildren}
      data-unchecked-children={unCheckedChildren}
      {...props}
    />
  ),
  Space: ({ children, direction }: any) => (
    <div data-testid="space" data-direction={direction}>
      {children}
    </div>
  )
}));

// Get references to the mocked functions
const mockJogController = require('../../../core/positioning').jogController;

describe('JogSettings', () => {
  const defaultProps: JogSettingsProps = {
    speed: 1000,
    increment: 1,
    isMetric: true,
    onSpeedChange: jest.fn(),
    onIncrementChange: jest.fn(),
    onUnitChange: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockJogController.getAvailableIncrements.mockReturnValue([
      { value: 0.001, label: '0.001 mm' },
      { value: 0.01, label: '0.01 mm' },
      { value: 0.1, label: '0.1 mm' },
      { value: 1, label: '1 mm' },
      { value: 10, label: '10 mm' }
    ]);
    
    mockJogController.getSpeedLimits.mockReturnValue({
      min: 1,
      max: 5000
    });
  });

  describe('Rendering', () => {
    test('should render settings title', () => {
      render(<JogSettings {...defaultProps} />);
      
      expect(screen.getByTestId('card-title')).toHaveTextContent('Settings');
    });

    test('should render speed input with current value', () => {
      render(<JogSettings {...defaultProps} speed={1500} />);
      
      const speedInput = screen.getByTestId('input-number');
      expect(speedInput).toHaveValue(1500);
    });

    test('should render increment select with current value', () => {
      render(<JogSettings {...defaultProps} increment={0.1} />);
      
      const incrementSelect = screen.getByTestId('select');
      expect(incrementSelect).toHaveValue('0.1');
    });

    test('should show metric units when isMetric is true', () => {
      render(<JogSettings {...defaultProps} isMetric={true} />);
      
      const speedInput = screen.getByTestId('input-number');
      expect(speedInput).toHaveAttribute('data-addon-after', 'mm/min');
    });

    test('should show imperial units when isMetric is false', () => {
      render(<JogSettings {...defaultProps} isMetric={false} />);
      
      const speedInput = screen.getByTestId('input-number');
      expect(speedInput).toHaveAttribute('data-addon-after', 'in/min');
    });

    test('should render debug toggle when onDebugToggle is provided', () => {
      const onDebugToggle = jest.fn();
      render(<JogSettings {...defaultProps} onDebugToggle={onDebugToggle} showDebug={false} />);
      
      expect(screen.getByTestId('switch')).toBeInTheDocument();
    });

    test('should not render debug toggle when onDebugToggle is not provided', () => {
      render(<JogSettings {...defaultProps} />);
      
      // Should only have the unit switch, not the debug switch
      const switches = screen.getAllByTestId('switch');
      expect(switches).toHaveLength(1);
      // The one switch should be the unit toggle
      expect(switches[0]).toHaveAttribute('data-checked-children', 'Metric');
    });
  });

  describe('Speed Control', () => {
    test('should call onSpeedChange when speed is changed', () => {
      const mockOnSpeedChange = jest.fn();
      render(<JogSettings {...defaultProps} onSpeedChange={mockOnSpeedChange} />);
      
      const speedInput = screen.getByTestId('input-number');
      fireEvent.change(speedInput, { target: { value: '2000' } });
      
      expect(mockOnSpeedChange).toHaveBeenCalledWith(2000);
    });

    test('should use speed limits from jog controller', () => {
      render(<JogSettings {...defaultProps} />);
      
      const speedInput = screen.getByTestId('input-number');
      expect(speedInput).toHaveAttribute('min', '1');
      expect(speedInput).toHaveAttribute('max', '5000');
    });

    test('should handle invalid speed input', () => {
      const mockOnSpeedChange = jest.fn();
      render(<JogSettings {...defaultProps} onSpeedChange={mockOnSpeedChange} />);
      
      const speedInput = screen.getByTestId('input-number');
      fireEvent.change(speedInput, { target: { value: '' } });
      
      expect(mockOnSpeedChange).toHaveBeenCalledWith(1); // Should use min value
    });
  });

  describe('Increment Control', () => {
    test('should call onIncrementChange when increment is changed', () => {
      const mockOnIncrementChange = jest.fn();
      render(<JogSettings {...defaultProps} onIncrementChange={mockOnIncrementChange} />);
      
      const incrementSelect = screen.getByTestId('select');
      fireEvent.change(incrementSelect, { target: { value: '0.1' } });
      
      expect(mockOnIncrementChange).toHaveBeenCalledWith(0.1);
    });

    test('should get increments from jog controller with metric system', () => {
      render(<JogSettings {...defaultProps} isMetric={true} />);
      
      expect(mockJogController.getAvailableIncrements).toHaveBeenCalled();
    });

    test('should get increments from jog controller with imperial system', () => {
      render(<JogSettings {...defaultProps} isMetric={false} />);
      
      expect(mockJogController.getAvailableIncrements).toHaveBeenCalled();
    });
  });

  describe('Unit Control', () => {
    test('should call onUnitChange when unit is changed', () => {
      const mockOnUnitChange = jest.fn();
      render(<JogSettings {...defaultProps} onUnitChange={mockOnUnitChange} />);
      
      const unitSwitch = screen.getByTestId('switch');
      fireEvent.click(unitSwitch);
      
      expect(mockOnUnitChange).toHaveBeenCalledWith(false);
    });

    test('should show metric when switch is checked', () => {
      render(<JogSettings {...defaultProps} isMetric={true} />);
      
      const unitSwitch = screen.getByTestId('switch');
      expect(unitSwitch).toBeChecked();
    });

    test('should show imperial when switch is unchecked', () => {
      render(<JogSettings {...defaultProps} isMetric={false} />);
      
      const unitSwitch = screen.getByTestId('switch');
      expect(unitSwitch).not.toBeChecked();
    });
  });

  describe('Debug Toggle', () => {
    test('should call onDebugToggle when debug is toggled', () => {
      const mockOnDebugToggle = jest.fn();
      render(<JogSettings {...defaultProps} onDebugToggle={mockOnDebugToggle} showDebug={false} />);
      
      // When debug toggle is present, there are two switches. Get the debug one (first one)
      const switches = screen.getAllByTestId('switch');
      const debugSwitch = switches.find(switch_ => switch_.getAttribute('data-checked-children') === 'Close');
      
      fireEvent.click(debugSwitch!);
      
      expect(mockOnDebugToggle).toHaveBeenCalled();
    });

    test('should show correct state for debug toggle', () => {
      render(<JogSettings {...defaultProps} onDebugToggle={jest.fn()} showDebug={true} />);
      
      const switches = screen.getAllByTestId('switch');
      const debugSwitch = switches.find(switch_ => switch_.getAttribute('data-checked-children') === 'Close');
      expect(debugSwitch).toBeChecked();
    });
  });

  describe('Disabled State', () => {
    test('should disable all inputs when disabled', () => {
      render(<JogSettings {...defaultProps} disabled={true} />);
      
      const speedInput = screen.getByTestId('input-number');
      const incrementSelect = screen.getByTestId('select');
      
      expect(speedInput).toBeDisabled();
      expect(incrementSelect).toBeDisabled();
    });

    test('should enable all inputs when not disabled', () => {
      render(<JogSettings {...defaultProps} disabled={false} />);
      
      const speedInput = screen.getByTestId('input-number');
      const incrementSelect = screen.getByTestId('select');
      
      expect(speedInput).not.toBeDisabled();
      expect(incrementSelect).not.toBeDisabled();
    });

    test('should disable debug toggle when disabled', () => {
      render(<JogSettings {...defaultProps} disabled={true} onDebugToggle={jest.fn()} />);
      
      const switches = screen.getAllByTestId('switch');
      const debugSwitch = switches.find(switch_ => switch_.getAttribute('data-checked-children') === 'Close');
      expect(debugSwitch).toBeDisabled();
    });
  });

  describe('Layout', () => {
    test('should adjust column spans when debug toggle is present', () => {
      render(<JogSettings {...defaultProps} onDebugToggle={jest.fn()} />);
      
      const cols = screen.getAllByTestId('col');
      // Should have 3 columns when debug is present: debug(6), speed(10), increment(8)
      expect(cols).toHaveLength(3);
    });

    test('should adjust column spans when debug toggle is not present', () => {
      render(<JogSettings {...defaultProps} />);
      
      const cols = screen.getAllByTestId('col');
      // Should have 3 columns when no debug: speed(8), increment(8), units(8)
      expect(cols).toHaveLength(3);
    });
  });
});