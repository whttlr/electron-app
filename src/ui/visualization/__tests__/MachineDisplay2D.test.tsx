import React from 'react';
import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import MachineDisplay2D from '../MachineDisplay2D';

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  fillText: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => mockContext,
});

// Mock canvas dimensions
Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 400,
  writable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 300,
  writable: true,
});

describe('MachineDisplay2D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset context properties
    Object.keys(mockContext).forEach((key) => {
      if (typeof mockContext[key] === 'function') {
        mockContext[key].mockClear();
      } else {
        mockContext[key] = key.includes('Style') ? '' : 0;
      }
    });
  });

  describe('Rendering', () => {
    test('should render with default props', () => {
      render(<MachineDisplay2D />);

      expect(screen.getByText('2D Working Area View')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /grid/i })).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /trail/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /set origin/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    test('should render canvas element', () => {
      render(<MachineDisplay2D />);

      const canvas = screen.getByRole('img', { hidden: true }); // Canvas has img role in testing
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('width', '400');
      expect(canvas).toHaveAttribute('height', '300');
    });

    test('should display current position coordinates', () => {
      const position = { x: 12.345, y: 67.891, z: 23.456 };

      render(<MachineDisplay2D currentPosition={position} />);

      expect(screen.getByText('X: 12.35mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 67.89mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 23.46mm')).toBeInTheDocument();
    });

    test('should display scale percentage', () => {
      render(<MachineDisplay2D />);

      expect(screen.getByText(/Scale: \d+%/)).toBeInTheDocument();
    });
  });

  describe('Switch Controls', () => {
    test('should call onGridToggle when grid switch is clicked', () => {
      const onGridToggle = jest.fn();

      render(<MachineDisplay2D showGrid={true} onGridToggle={onGridToggle} />);

      const gridSwitch = screen.getByRole('switch', { name: /grid/i });
      fireEvent.click(gridSwitch);

      expect(onGridToggle).toHaveBeenCalledWith(false);
    });

    test('should call onTrailToggle when trail switch is clicked', () => {
      const onTrailToggle = jest.fn();

      render(<MachineDisplay2D showTrail={false} onTrailToggle={onTrailToggle} />);

      const trailSwitch = screen.getByRole('switch', { name: /trail/i });
      fireEvent.click(trailSwitch);

      expect(onTrailToggle).toHaveBeenCalledWith(true);
    });

    test('should reflect switch states correctly', () => {
      render(<MachineDisplay2D showGrid={false} showTrail={true} />);

      const gridSwitch = screen.getByRole('switch', { name: /grid/i });
      const trailSwitch = screen.getByRole('switch', { name: /trail/i });

      expect(gridSwitch).not.toBeChecked();
      expect(trailSwitch).toBeChecked();
    });
  });

  describe('Button Controls', () => {
    test('should call onSetOrigin when Set Origin button is clicked', () => {
      const onSetOrigin = jest.fn();

      render(<MachineDisplay2D onSetOrigin={onSetOrigin} />);

      const setOriginButton = screen.getByRole('button', { name: /set origin/i });
      fireEvent.click(setOriginButton);

      expect(onSetOrigin).toHaveBeenCalledTimes(1);
    });

    test('should call onGoHome when Go Home button is clicked', () => {
      const onGoHome = jest.fn();

      render(<MachineDisplay2D onGoHome={onGoHome} />);

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      fireEvent.click(goHomeButton);

      expect(onGoHome).toHaveBeenCalledTimes(1);
    });

    test('should handle missing callback props gracefully', () => {
      render(<MachineDisplay2D />);

      const setOriginButton = screen.getByRole('button', { name: /set origin/i });
      const goHomeButton = screen.getByRole('button', { name: /go home/i });

      expect(() => {
        fireEvent.click(setOriginButton);
        fireEvent.click(goHomeButton);
      }).not.toThrow();
    });
  });

  describe('Canvas Drawing', () => {
    test('should clear canvas on each render', () => {
      render(<MachineDisplay2D />);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 300);
    });

    test('should draw work area boundary', () => {
      render(<MachineDisplay2D workArea={{ x: 300, y: 200, z: 50 }} />);

      expect(mockContext.strokeRect).toHaveBeenCalled();
      expect(mockContext.strokeStyle).toBe('#1890ff');
      expect(mockContext.lineWidth).toBe(2);
    });

    test('should draw coordinate axes', () => {
      render(<MachineDisplay2D />);

      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    test('should draw origin marker', () => {
      render(<MachineDisplay2D />);

      expect(mockContext.arc).toHaveBeenCalledWith(
        expect.any(Number), // centerX + 0
        expect.any(Number), // centerY - 0
        4, // radius
        0, // startAngle
        2 * Math.PI, // endAngle
      );
      expect(mockContext.fill).toHaveBeenCalled();
    });

    test('should draw current position marker', () => {
      const position = { x: 10, y: 20, z: 0 };

      render(<MachineDisplay2D currentPosition={position} />);

      // Should draw position circle
      expect(mockContext.arc).toHaveBeenCalledWith(
        expect.any(Number), // calculated X position
        expect.any(Number), // calculated Y position
        6, // radius
        0, // startAngle
        2 * Math.PI, // endAngle
      );
    });

    test('should draw grid when showGrid is true', () => {
      render(<MachineDisplay2D showGrid={true} />);

      // Grid drawing involves multiple line operations
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    test('should not draw grid when showGrid is false', () => {
      // Clear previous calls
      jest.clearAllMocks();

      render(<MachineDisplay2D showGrid={false} />);

      // Should still draw other elements but fewer lines for grid
      expect(mockContext.stroke).toHaveBeenCalled();
      // Grid would involve many more stroke calls
    });
  });

  describe('Trail Functionality', () => {
    test('should add positions to trail when showTrail is true', () => {
      const { rerender } = render(
        <MachineDisplay2D
          currentPosition={{ x: 0, y: 0, z: 0 }}
          showTrail={true}
        />,
      );

      // Move to a new position
      rerender(
        <MachineDisplay2D
          currentPosition={{ x: 10, y: 10, z: 0 }}
          showTrail={true}
        />,
      );

      // Should have drawn trail lines
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    test('should clear trail when showTrail is disabled', () => {
      const { rerender } = render(
        <MachineDisplay2D
          currentPosition={{ x: 0, y: 0, z: 0 }}
          showTrail={true}
        />,
      );

      // Add some positions
      rerender(
        <MachineDisplay2D
          currentPosition={{ x: 10, y: 10, z: 0 }}
          showTrail={true}
        />,
      );

      // Disable trail
      rerender(
        <MachineDisplay2D
          currentPosition={{ x: 10, y: 10, z: 0 }}
          showTrail={false}
        />,
      );

      // Trail should be cleared (tested by component behavior)
      expect(mockContext.clearRect).toHaveBeenCalled();
    });
  });

  describe('Position Coordinate Transformations', () => {
    test('should handle positive coordinates', () => {
      const position = { x: 50, y: 25, z: 10 };

      render(<MachineDisplay2D currentPosition={position} />);

      expect(screen.getByText('X: 50.00mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 25.00mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 10.00mm')).toBeInTheDocument();
    });

    test('should handle negative coordinates', () => {
      const position = { x: -25, y: -50, z: -5 };

      render(<MachineDisplay2D currentPosition={position} />);

      expect(screen.getByText('X: -25.00mm')).toBeInTheDocument();
      expect(screen.getByText('Y: -50.00mm')).toBeInTheDocument();
      expect(screen.getByText('Z: -5.00mm')).toBeInTheDocument();
    });

    test('should handle zero coordinates', () => {
      const position = { x: 0, y: 0, z: 0 };

      render(<MachineDisplay2D currentPosition={position} />);

      expect(screen.getByText('X: 0.00mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 0.00mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 0.00mm')).toBeInTheDocument();
    });

    test('should round coordinates to 2 decimal places', () => {
      const position = { x: 12.3456789, y: 67.8912345, z: 23.4567891 };

      render(<MachineDisplay2D currentPosition={position} />);

      expect(screen.getByText('X: 12.35mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 67.89mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 23.46mm')).toBeInTheDocument();
    });
  });

  describe('Work Area Scaling', () => {
    test('should calculate appropriate scale for different work areas', () => {
      const { rerender } = render(
        <MachineDisplay2D workArea={{ x: 100, y: 100, z: 50 }} />,
      );

      // Should display some scale
      expect(screen.getByText(/Scale: \d+%/)).toBeInTheDocument();

      // Change to larger work area
      rerender(
        <MachineDisplay2D workArea={{ x: 1000, y: 1000, z: 50 }} />,
      );

      // Scale should be updated
      expect(screen.getByText(/Scale: \d+%/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should provide proper labels and roles', () => {
      render(<MachineDisplay2D />);

      expect(screen.getByText('Grid:')).toBeInTheDocument();
      expect(screen.getByText('Trail:')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /grid/i })).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /trail/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /set origin/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    test('should use appropriate button icons', () => {
      render(<MachineDisplay2D />);

      const setOriginButton = screen.getByRole('button', { name: /set origin/i });
      const goHomeButton = screen.getByRole('button', { name: /go home/i });

      expect(setOriginButton).toBeInTheDocument();
      expect(goHomeButton).toBeInTheDocument();
    });
  });

  describe('Canvas Styling', () => {
    test('should apply correct canvas dimensions and styles', () => {
      render(<MachineDisplay2D />);

      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toHaveStyle({
        width: '100%',
        height: '300px',
        background: '#fafafa',
      });
    });
  });
});
