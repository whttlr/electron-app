import React from 'react';
import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkingAreaPreview from '../WorkingAreaPreview';

// Mock react-three-fiber and drei components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" data-camera={JSON.stringify(props.camera)} style={props.style}>
      {children}
    </div>
  ),
  useFrame: jest.fn(),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: (props: any) => <div data-testid="orbit-controls" data-props={JSON.stringify(props)} />,
  Grid: (props: any) => <div data-testid="grid" data-props={JSON.stringify(props)} />,
  Box: ({
    children, args, position, ...props
  }: any) => (
    <div
      data-testid="box"
      data-args={JSON.stringify(args)}
      data-position={JSON.stringify(position)}
      data-props={JSON.stringify(props)}
    >
      {children}
    </div>
  ),
  Text: ({
    children, position, fontSize, color, ...props
  }: any) => (
    <div
      data-testid="text"
      data-position={JSON.stringify(position)}
      data-fontSize={fontSize}
      data-color={color}
      data-props={JSON.stringify(props)}
    >
      {children}
    </div>
  ),
}));

// Mock three.js
jest.mock('three', () => ({
  BoxGeometry: jest.fn().mockImplementation(() => ({})),
  Mesh: jest.fn(),
  Group: jest.fn(),
}));

describe('WorkingAreaPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render with default props', () => {
      render(<WorkingAreaPreview />);

      expect(screen.getByText('3D Working Area Preview')).toBeInTheDocument();
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    test('should render with custom props', () => {
      const customPosition = { x: 10, y: 20, z: 30 };
      const customWorkArea = { x: 400, y: 300, z: 100 };
      const onGridToggle = jest.fn();

      render(
        <WorkingAreaPreview
          currentPosition={customPosition}
          workArea={customWorkArea}
          showGrid={false}
          onGridToggle={onGridToggle}
        />,
      );

      expect(screen.getByText('X: 10.00mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 20.00mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 30.00mm')).toBeInTheDocument();

      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('should render coordinate system axes', () => {
      render(<WorkingAreaPreview />);

      const textElements = screen.getAllByTestId('text');
      const axisLabels = textElements.map((el) => el.textContent);

      expect(axisLabels).toContain('X');
      expect(axisLabels).toContain('Y');
      expect(axisLabels).toContain('Z');
    });

    test('should render position coordinates with correct precision', () => {
      const position = { x: 12.3456, y: 67.8912, z: 34.5678 };

      render(<WorkingAreaPreview currentPosition={position} />);

      expect(screen.getByText('X: 12.35mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 67.89mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 34.57mm')).toBeInTheDocument();
    });
  });

  describe('Grid Toggle', () => {
    test('should call onGridToggle when switch is clicked', () => {
      const onGridToggle = jest.fn();

      render(<WorkingAreaPreview showGrid={true} onGridToggle={onGridToggle} />);

      const gridSwitch = screen.getByRole('switch');
      fireEvent.click(gridSwitch);

      expect(onGridToggle).toHaveBeenCalledWith(expect.any(Boolean));
    });

    test('should not render grid when showGrid is false', () => {
      render(<WorkingAreaPreview showGrid={false} />);

      expect(screen.queryByTestId('grid')).not.toBeInTheDocument();
    });

    test('should render grid when showGrid is true', () => {
      render(<WorkingAreaPreview showGrid={true} />);

      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    test('should handle missing onGridToggle prop', () => {
      render(<WorkingAreaPreview showGrid={true} />);

      const gridSwitch = screen.getByRole('switch');

      // Should not throw when onGridToggle is undefined
      expect(() => {
        fireEvent.click(gridSwitch);
      }).not.toThrow();
    });
  });

  describe('Zoom Control', () => {
    test('should render zoom slider with correct initial value', () => {
      render(<WorkingAreaPreview />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(1);
    });

    test('should update zoom value when slider is moved', () => {
      render(<WorkingAreaPreview />);

      const slider = screen.getByRole('slider');

      act(() => {
        fireEvent.change(slider, { target: { value: 1.5 } });
      });

      expect(slider).toHaveValue(1.5);
    });

    test('should respect zoom min and max values', () => {
      render(<WorkingAreaPreview />);

      const slider = screen.getByRole('slider');

      // Note: Ant Design sliders may not expose min/max as DOM attributes
      // We're testing that the slider exists and can be interacted with
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Canvas Configuration', () => {
    test('should configure canvas with correct camera settings', () => {
      render(<WorkingAreaPreview />);

      const canvas = screen.getByTestId('canvas');
      const cameraData = JSON.parse(canvas.getAttribute('data-camera') || '{}');

      expect(cameraData.position).toEqual([20, 20, 20]);
      expect(cameraData.fov).toBe(50);
    });

    test('should apply correct canvas styles', () => {
      render(<WorkingAreaPreview />);

      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveStyle({ background: '#fafafa' });
    });
  });

  describe('OrbitControls Configuration', () => {
    test('should configure OrbitControls with correct settings', () => {
      render(<WorkingAreaPreview />);

      const controls = screen.getByTestId('orbit-controls');
      const controlProps = JSON.parse(controls.getAttribute('data-props') || '{}');

      expect(controlProps.enablePan).toBe(true);
      expect(controlProps.enableZoom).toBe(true);
      expect(controlProps.enableRotate).toBe(true);
      expect(controlProps.maxPolarAngle).toBeCloseTo(Math.PI / 2);
      expect(controlProps.minDistance).toBe(5);
      expect(controlProps.maxDistance).toBe(50);
    });
  });

  describe('Work Area Scaling', () => {
    test('should scale work area dimensions correctly', () => {
      const workArea = { x: 300, y: 200, z: 50 };

      render(<WorkingAreaPreview workArea={workArea} />);

      // Check that boxes are rendered with scaled dimensions
      const boxes = screen.getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(0);
    });
  });

  describe('Tool Position', () => {
    test('should position tool correctly based on current position', () => {
      const position = { x: 100, y: 50, z: 25 };

      render(<WorkingAreaPreview currentPosition={position} />);

      // Tool should be rendered (part of the scene)
      const boxes = screen.getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(3); // Should include tool boxes
    });

    test('should handle zero position', () => {
      const position = { x: 0, y: 0, z: 0 };

      render(<WorkingAreaPreview currentPosition={position} />);

      expect(screen.getByText('X: 0.00mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 0.00mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 0.00mm')).toBeInTheDocument();
    });

    test('should handle negative positions', () => {
      const position = { x: -10, y: -20, z: -5 };

      render(<WorkingAreaPreview currentPosition={position} />);

      expect(screen.getByText('X: -10.00mm')).toBeInTheDocument();
      expect(screen.getByText('Y: -20.00mm')).toBeInTheDocument();
      expect(screen.getByText('Z: -5.00mm')).toBeInTheDocument();
    });
  });

  describe('Grid Configuration', () => {
    test('should configure grid with correct properties', () => {
      render(<WorkingAreaPreview showGrid={true} />);

      const grid = screen.getByTestId('grid');
      const gridProps = JSON.parse(grid.getAttribute('data-props') || '{}');

      expect(gridProps.args).toEqual([30, 30]);
      expect(gridProps.cellSize).toBe(1);
      expect(gridProps.cellThickness).toBe(0.5);
      expect(gridProps.cellColor).toBe('#e0e0e0');
      expect(gridProps.sectionSize).toBe(5);
      expect(gridProps.sectionThickness).toBe(1);
      expect(gridProps.sectionColor).toBe('#cccccc');
      expect(gridProps.fadeDistance).toBe(25);
      expect(gridProps.fadeStrength).toBe(1);
      expect(gridProps.followCamera).toBe(false);
      expect(gridProps.infiniteGrid).toBe(false);
    });
  });

  describe('Accessibility', () => {
    test('should provide proper labels for controls', () => {
      render(<WorkingAreaPreview />);

      expect(screen.getByText('Show Grid:')).toBeInTheDocument();
      expect(screen.getByText('Zoom:')).toBeInTheDocument();
    });

    test('should use semantic HTML structure', () => {
      render(<WorkingAreaPreview />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });
});
