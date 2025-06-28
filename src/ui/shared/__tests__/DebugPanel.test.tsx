import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DebugPanel } from '../DebugPanel';
import { DebugPanelProps } from '../SharedTypes';

// Mock antd components
jest.mock('antd', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Row: ({ children, gutter }: any) => (
    <div data-testid="row" data-gutter={JSON.stringify(gutter)}>
      {children}
    </div>
  ),
  Col: ({ children, span }: any) => (
    <div data-testid="col" data-span={span}>
      {children}
    </div>
  ),
  Typography: {
    Text: ({ children, strong }: any) => (
      <span data-testid="text" data-strong={strong}>
        {children}
      </span>
    )
  },
  Button: ({ icon, onClick, type, style }: any) => (
    <button 
      data-testid="close-button" 
      onClick={onClick}
      data-type={type}
      style={style}
    >
      {icon}
    </button>
  ),
  Space: ({ children, direction, style }: any) => (
    <div data-testid="space" data-direction={direction} style={style}>
      {children}
    </div>
  ),
  Divider: ({ style }: any) => (
    <hr data-testid="divider" style={style} />
  )
}));

// Mock SectionHeader
jest.mock('../SectionHeader', () => ({
  SectionHeader: ({ title }: any) => (
    <div data-testid="section-header">{title}</div>
  )
}));

describe('DebugPanel', () => {
  const defaultProps: DebugPanelProps = {
    title: 'Debug Information',
    data: {
      simpleString: 'test value',
      number: 42.123,
      boolean: true,
      object: { nested: 'value', count: 5 },
      array: [1, 2, 3]
    },
    visible: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    test('should render when visible is true', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    test('should not render when visible is false', () => {
      render(<DebugPanel {...defaultProps} visible={false} />);
      
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    test('should render title', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByTestId('section-header')).toHaveTextContent('Debug Information');
    });

    test('should render close button', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('should render divider', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });
  });

  describe('Data Rendering', () => {
    test('should render simple string values', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByText('Simple String:')).toBeInTheDocument();
      expect(screen.getByText('test value')).toBeInTheDocument();
    });

    test('should render number values with correct precision', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByText('Number:')).toBeInTheDocument();
      expect(screen.getByText('42.123')).toBeInTheDocument();
    });

    test('should render boolean values', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByText('Boolean:')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
    });

    test('should render object values as formatted JSON', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByText('Object:')).toBeInTheDocument();
      
      // Check for formatted JSON structure
      const preElement = screen.getByText((content, element) => {
        return element?.tagName === 'PRE' && content.includes('"nested": "value"');
      });
      expect(preElement).toBeInTheDocument();
    });

    test('should render array values as formatted JSON', () => {
      render(<DebugPanel {...defaultProps} />);
      
      expect(screen.getByText('Array:')).toBeInTheDocument();
      
      const preElement = screen.getByText((content, element) => {
        return element?.tagName === 'PRE' && content.includes('[') && content.includes('1,') && content.includes('2,') && content.includes('3');
      });
      expect(preElement).toBeInTheDocument();
    });

    test('should handle null values', () => {
      const props = {
        ...defaultProps,
        data: { nullValue: null }
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByText('Null Value:')).toBeInTheDocument();
      expect(screen.getByText('null')).toBeInTheDocument();
    });

    test('should handle undefined values', () => {
      const props = {
        ...defaultProps,
        data: { undefinedValue: undefined }
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByText('Undefined Value:')).toBeInTheDocument();
      expect(screen.getByText('undefined')).toBeInTheDocument();
    });
  });

  describe('Key Formatting', () => {
    test('should format camelCase keys correctly', () => {
      const props = {
        ...defaultProps,
        data: { camelCaseKey: 'value' }
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByText('Camel Case Key:')).toBeInTheDocument();
    });

    test('should format keys with numbers', () => {
      const props = {
        ...defaultProps,
        data: { key123Value: 'value' }
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByText('Key123 Value:')).toBeInTheDocument();
    });

    test('should handle single word keys', () => {
      const props = {
        ...defaultProps,
        data: { position: 'value' }
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByText('Position:')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<DebugPanel {...defaultProps} onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByTestId('close-button'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    test('should apply correct styles to JSON pre elements', () => {
      render(<DebugPanel {...defaultProps} />);
      
      const preElements = screen.getAllByText((content, element) => {
        return element?.tagName === 'PRE';
      });
      
      preElements.forEach(pre => {
        expect(pre).toHaveStyle({
          background: '#f0f0f0',
          padding: '8px',
          borderRadius: '4px',
          overflowX: 'auto',
          fontSize: '12px',
          margin: 0
        });
      });
    });

    test('should apply correct styles to close button', () => {
      render(<DebugPanel {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      expect(closeButton).toHaveAttribute('data-type', 'text');
      expect(closeButton).toHaveStyle({ color: '#1890ff' });
    });

    test('should apply correct styles to divider', () => {
      render(<DebugPanel {...defaultProps} />);
      
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveStyle({ margin: '8px 0' });
    });
  });

  describe('Layout', () => {
    test('should render correct grid layout for data rows', () => {
      render(<DebugPanel {...defaultProps} />);
      
      const rows = screen.getAllByTestId('row');
      // Should have rows for each data entry
      expect(rows.length).toBeGreaterThan(0);
      
      const cols = screen.getAllByTestId('col');
      // Each row should have 2 columns (key and value)
      cols.forEach(col => {
        const span = col.getAttribute('data-span');
        expect(['8', '16']).toContain(span); // Label col: 8, Value col: 16
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty data object', () => {
      const props = {
        ...defaultProps,
        data: {}
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
      // Should not render any data rows
      expect(screen.queryByTestId('text')).not.toBeInTheDocument();
    });

    test('should handle deeply nested objects', () => {
      const props = {
        ...defaultProps,
        data: {
          deep: {
            nested: {
              object: {
                value: 'deeply nested'
              }
            }
          }
        }
      };
      render(<DebugPanel {...props} />);
      
      expect(screen.getByText('Deep:')).toBeInTheDocument();
      
      const preElement = screen.getByText((content, element) => {
        return element?.tagName === 'PRE' && content.includes('deeply nested');
      });
      expect(preElement).toBeInTheDocument();
    });
  });
});