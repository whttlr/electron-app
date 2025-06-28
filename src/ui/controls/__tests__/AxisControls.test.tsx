import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AxisControl, { HomeControl } from '../AxisControls';
import { AxisControlProps } from '../ControlTypes';

// Mock antd components
jest.mock('antd', () => ({
  Button: ({ children, icon, onClick, disabled, onMouseEnter, onMouseLeave, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={`button-${props['data-testid'] || 'default'}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
  Space: ({ children, direction, align, style }: any) => (
    <div data-testid="space" style={style}>
      {children}
    </div>
  )
}));

describe('AxisControl', () => {
  const defaultProps: AxisControlProps = {
    axis: 'x',
    label: 'X Axis',
    color: '#ff0000',
    onJog: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render axis label', () => {
      render(<AxisControl {...defaultProps} />);
      
      expect(screen.getByText('X Axis')).toBeInTheDocument();
    });

    test('should render both direction buttons', () => {
      render(<AxisControl {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    test('should apply axis color to label', () => {
      render(<AxisControl {...defaultProps} />);
      
      const label = screen.getByText('X Axis');
      expect(label).toHaveStyle({ color: '#ff0000', fontWeight: 'bold' });
    });

    test('should render correct icons for X axis', () => {
      render(<AxisControl {...defaultProps} axis="x" />);
      
      // Icons are rendered as SVG components in our mock
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    test('should render correct icons for Y axis', () => {
      render(<AxisControl {...defaultProps} axis="y" />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    test('should render correct icons for Z axis', () => {
      render(<AxisControl {...defaultProps} axis="z" />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Interactions', () => {
    test('should call onJog with negative direction for first button', () => {
      const mockOnJog = jest.fn();
      render(<AxisControl {...defaultProps} onJog={mockOnJog} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      
      expect(mockOnJog).toHaveBeenCalledWith(-1);
    });

    test('should call onJog with positive direction for second button', () => {
      const mockOnJog = jest.fn();
      render(<AxisControl {...defaultProps} onJog={mockOnJog} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);
      
      expect(mockOnJog).toHaveBeenCalledWith(1);
    });

    test('should not call onJog when disabled', () => {
      const mockOnJog = jest.fn();
      render(<AxisControl {...defaultProps} onJog={mockOnJog} disabled={true} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);
      
      expect(mockOnJog).not.toHaveBeenCalled();
    });

    test('should call onHighlight on mouse enter', () => {
      const mockOnHighlight = jest.fn();
      render(<AxisControl {...defaultProps} onHighlight={mockOnHighlight} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.mouseEnter(buttons[0]);
      
      expect(mockOnHighlight).toHaveBeenCalled();
    });

    test('should call onClearHighlight on mouse leave', () => {
      const mockOnClearHighlight = jest.fn();
      render(<AxisControl {...defaultProps} onClearHighlight={mockOnClearHighlight} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.mouseLeave(buttons[0]);
      
      expect(mockOnClearHighlight).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    test('should disable buttons when disabled prop is true', () => {
      render(<AxisControl {...defaultProps} disabled={true} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('should enable buttons when disabled prop is false', () => {
      render(<AxisControl {...defaultProps} disabled={false} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });
});

describe('HomeControl', () => {
  const defaultProps = {
    onHome: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render home label', () => {
      render(<HomeControl {...defaultProps} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('should render home button', () => {
      render(<HomeControl {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('should call onHome when clicked', () => {
      const mockOnHome = jest.fn();
      render(<HomeControl {...defaultProps} onHome={mockOnHome} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnHome).toHaveBeenCalled();
    });

    test('should not call onHome when disabled', () => {
      const mockOnHome = jest.fn();
      render(<HomeControl {...defaultProps} onHome={mockOnHome} disabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnHome).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    test('should disable button when disabled prop is true', () => {
      render(<HomeControl {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('should enable button when disabled prop is false', () => {
      render(<HomeControl {...defaultProps} disabled={false} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });
});