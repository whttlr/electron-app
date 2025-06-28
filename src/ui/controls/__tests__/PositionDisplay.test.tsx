import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PositionDisplay from '../PositionDisplay';
import { PositionDisplayProps } from '../ControlTypes';

// Mock antd components
jest.mock('antd', () => ({
  Card: ({ children, title }: any) => (
    <div data-testid="card">
      {title && <div data-testid="card-title">{title}</div>}
      {children}
    </div>
  ),
  Row: ({ children, gutter, align }: any) => (
    <div data-testid="row" data-gutter={JSON.stringify(gutter)} data-align={align}>
      {children}
    </div>
  ),
  Col: ({ children, span }: any) => (
    <div data-testid="col" data-span={span}>
      {children}
    </div>
  ),
  Typography: {
    Text: ({ children, strong, style }: any) => (
      <span data-testid="text" data-strong={strong} style={style}>
        {children}
      </span>
    )
  }
}));

// Mock theme constants
jest.mock('../../theme/constants', () => ({
  AXIS_COLORS: {
    x: '#00ff00',
    y: '#ff0000',
    z: '#0000ff'
  }
}));

describe('PositionDisplay', () => {
  const defaultProps: PositionDisplayProps = {
    position: { x: 10.123, y: 20.456, z: 5.789 },
    unit: 'mm',
    precision: 3,
    showLabels: true,
    highlightedAxis: null
  };

  describe('Rendering', () => {
    test('should render position values with correct precision', () => {
      render(<PositionDisplay {...defaultProps} />);
      
      expect(screen.getByText('X: 10.123 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 20.456 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 5.789 mm')).toBeInTheDocument();
    });

    test('should render with custom precision', () => {
      render(<PositionDisplay {...defaultProps} precision={1} />);
      
      expect(screen.getByText('X: 10.1 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 20.5 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 5.8 mm')).toBeInTheDocument();
    });

    test('should render with different unit', () => {
      render(<PositionDisplay {...defaultProps} unit="in" />);
      
      expect(screen.getByText('X: 10.123 in')).toBeInTheDocument();
      expect(screen.getByText('Y: 20.456 in')).toBeInTheDocument();
      expect(screen.getByText('Z: 5.789 in')).toBeInTheDocument();
    });

    test('should show title when showLabels is true', () => {
      render(<PositionDisplay {...defaultProps} showLabels={true} />);
      
      expect(screen.getByTestId('card-title')).toHaveTextContent('Current Position');
    });

    test('should not show title when showLabels is false', () => {
      render(<PositionDisplay {...defaultProps} showLabels={false} />);
      
      expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
    });

    test('should handle zero values', () => {
      render(<PositionDisplay {...defaultProps} position={{ x: 0, y: 0, z: 0 }} />);
      
      expect(screen.getByText('X: 0.000 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 0.000 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 0.000 mm')).toBeInTheDocument();
    });

    test('should handle negative values', () => {
      render(<PositionDisplay {...defaultProps} position={{ x: -10.5, y: -20.25, z: -5.125 }} />);
      
      expect(screen.getByText('X: -10.500 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: -20.250 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: -5.125 mm')).toBeInTheDocument();
    });
  });

  describe('Axis Highlighting', () => {
    test('should highlight X axis when specified', () => {
      render(<PositionDisplay {...defaultProps} highlightedAxis="x" />);
      
      const texts = screen.getAllByTestId('text');
      const xText = texts.find(text => text.textContent?.includes('X:'));
      
      expect(xText).toHaveStyle({
        color: '#00ff00',
        fontWeight: 'bold'
      });
    });

    test('should highlight Y axis when specified', () => {
      render(<PositionDisplay {...defaultProps} highlightedAxis="y" />);
      
      const texts = screen.getAllByTestId('text');
      const yText = texts.find(text => text.textContent?.includes('Y:'));
      
      expect(yText).toHaveStyle({
        color: '#ff0000',
        fontWeight: 'bold'
      });
    });

    test('should highlight Z axis when specified', () => {
      render(<PositionDisplay {...defaultProps} highlightedAxis="z" />);
      
      const texts = screen.getAllByTestId('text');
      const zText = texts.find(text => text.textContent?.includes('Z:'));
      
      expect(zText).toHaveStyle({
        color: '#0000ff',
        fontWeight: 'bold'
      });
    });

    test('should not highlight any axis when highlightedAxis is null', () => {
      render(<PositionDisplay {...defaultProps} highlightedAxis={null} />);
      
      const texts = screen.getAllByTestId('text');
      texts.forEach(text => {
        expect(text).toHaveStyle({ fontWeight: 'normal' });
        expect(text).not.toHaveStyle({ color: '#00ff00' });
        expect(text).not.toHaveStyle({ color: '#ff0000' });
        expect(text).not.toHaveStyle({ color: '#0000ff' });
      });
    });
  });

  describe('Layout', () => {
    test('should render three columns', () => {
      render(<PositionDisplay {...defaultProps} />);
      
      const cols = screen.getAllByTestId('col');
      expect(cols).toHaveLength(3);
      
      cols.forEach(col => {
        expect(col).toHaveAttribute('data-span', '8');
      });
    });

    test('should render row with correct props', () => {
      render(<PositionDisplay {...defaultProps} />);
      
      const row = screen.getByTestId('row');
      expect(row).toHaveAttribute('data-gutter', '[16,8]');
      expect(row).toHaveAttribute('data-align', 'middle');
    });
  });

  describe('Precision Edge Cases', () => {
    test('should handle precision of 0', () => {
      render(<PositionDisplay {...defaultProps} precision={0} />);
      
      expect(screen.getByText('X: 10 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 20 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 6 mm')).toBeInTheDocument();
    });

    test('should handle high precision', () => {
      render(<PositionDisplay {...defaultProps} precision={5} />);
      
      expect(screen.getByText('X: 10.12300 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 20.45600 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 5.78900 mm')).toBeInTheDocument();
    });
  });
});