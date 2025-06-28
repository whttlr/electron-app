import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SectionHeader } from '../SectionHeader';
import { SectionHeaderProps } from '../SharedTypes';

// Mock antd components
jest.mock('antd', () => ({
  Typography: {
    Title: ({ children, level, style }: any) => (
      <h1 data-testid="title" data-level={level} style={style}>
        {children}
      </h1>
    )
  },
  Space: ({ children, align, style }: any) => (
    <div data-testid="space" data-align={align} style={style}>
      {children}
    </div>
  ),
  Button: ({ icon, onClick, type, size, style }: any) => (
    <button 
      data-testid="help-button" 
      onClick={onClick}
      data-type={type}
      data-size={size}
      style={style}
    >
      {icon}
    </button>
  ),
  Popover: ({ title, content, children, trigger, placement }: any) => (
    <div data-testid="popover" data-title={title} data-trigger={trigger} data-placement={placement}>
      <div data-testid="popover-content" style={{ display: 'none' }}>
        {content}
      </div>
      {children}
    </div>
  )
}));

describe('SectionHeader', () => {
  const defaultProps: SectionHeaderProps = {
    title: 'Test Section',
    level: 4
  };

  describe('Rendering', () => {
    test('should render title with correct text', () => {
      render(<SectionHeader {...defaultProps} />);
      
      expect(screen.getByTestId('title')).toHaveTextContent('Test Section');
    });

    test('should render title with correct level', () => {
      render(<SectionHeader {...defaultProps} level={3} />);
      
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('data-level', '3');
    });

    test('should use default level when not specified', () => {
      render(<SectionHeader title="Test" />);
      
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('data-level', '4');
    });

    test('should render help button when help content is provided', () => {
      render(
        <SectionHeader 
          {...defaultProps} 
          helpContent={<div>Help content</div>}
        />
      );
      
      expect(screen.getByTestId('help-button')).toBeInTheDocument();
      expect(screen.getByTestId('popover')).toBeInTheDocument();
    });

    test('should not render help button when no help content', () => {
      render(<SectionHeader {...defaultProps} />);
      
      expect(screen.queryByTestId('help-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
    });

    test('should render extra content when provided', () => {
      const extraContent = <div data-testid="extra">Extra content</div>;
      render(<SectionHeader {...defaultProps} extra={extraContent} />);
      
      expect(screen.getByTestId('extra')).toBeInTheDocument();
    });

    test('should not render extra content when not provided', () => {
      render(<SectionHeader {...defaultProps} />);
      
      expect(screen.queryByTestId('extra')).not.toBeInTheDocument();
    });
  });

  describe('Help Functionality', () => {
    test('should use custom help title when provided', () => {
      render(
        <SectionHeader 
          {...defaultProps} 
          helpTitle="Custom Help Title"
          helpContent={<div>Help content</div>}
        />
      );
      
      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-title', 'Custom Help Title');
    });

    test('should use default help title when not provided', () => {
      render(
        <SectionHeader 
          {...defaultProps} 
          helpContent={<div>Help content</div>}
        />
      );
      
      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-title', 'Help');
    });

    test('should set correct popover props', () => {
      render(
        <SectionHeader 
          {...defaultProps} 
          helpContent={<div>Help content</div>}
        />
      );
      
      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-trigger', 'hover');
      expect(popover).toHaveAttribute('data-placement', 'right');
    });

    test('should render help content in popover', () => {
      const helpContent = <div data-testid="help-content">Detailed help information</div>;
      render(
        <SectionHeader 
          {...defaultProps} 
          helpContent={helpContent}
        />
      );
      
      expect(screen.getByTestId('help-content')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    test('should render correct space configuration', () => {
      render(<SectionHeader {...defaultProps} />);
      
      const spaces = screen.getAllByTestId('space');
      expect(spaces[0]).toHaveAttribute('data-align', 'center');
      expect(spaces[0]).toHaveStyle({
        width: '100%',
        justifyContent: 'space-between'
      });
    });

    test('should render title and help in same space when help is present', () => {
      render(
        <SectionHeader 
          {...defaultProps} 
          helpContent={<div>Help</div>}
        />
      );
      
      const spaces = screen.getAllByTestId('space');
      expect(spaces).toHaveLength(2); // Outer space and inner space for title+help
    });
  });

  describe('Styling', () => {
    test('should apply correct styles to title', () => {
      render(<SectionHeader {...defaultProps} />);
      
      const title = screen.getByTestId('title');
      expect(title).toHaveStyle({ margin: 0 });
    });

    test('should apply correct styles to help button', () => {
      render(
        <SectionHeader 
          {...defaultProps} 
          helpContent={<div>Help</div>}
        />
      );
      
      const helpButton = screen.getByTestId('help-button');
      expect(helpButton).toHaveAttribute('data-type', 'text');
      expect(helpButton).toHaveAttribute('data-size', 'small');
      expect(helpButton).toHaveStyle({ color: '#1890ff' });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty title', () => {
      render(<SectionHeader title="" />);
      
      const title = screen.getByTestId('title');
      expect(title).toHaveTextContent('');
    });

    test('should handle all props together', () => {
      const helpContent = <div>Help content</div>;
      const extraContent = <div data-testid="extra">Extra</div>;
      
      render(
        <SectionHeader 
          title="Full Test"
          level={2}
          helpTitle="Custom Help"
          helpContent={helpContent}
          extra={extraContent}
        />
      );
      
      expect(screen.getByTestId('title')).toHaveTextContent('Full Test');
      expect(screen.getByTestId('title')).toHaveAttribute('data-level', '2');
      expect(screen.getByTestId('help-button')).toBeInTheDocument();
      expect(screen.getByTestId('extra')).toBeInTheDocument();
    });
  });
});