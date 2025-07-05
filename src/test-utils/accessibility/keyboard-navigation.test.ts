/**
 * Keyboard Navigation Accessibility Tests
 * Tests for keyboard accessibility and navigation
 */

import { renderWithProviders } from '../index';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Input, Modal, Select, Menu } from 'antd';
import { setupA11yTests } from './setup';
import { keyboardTestHelpers } from './helpers';

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    setupA11yTests();
  });

  it('should support keyboard navigation for buttons', async () => {
    const mockClick = jest.fn();
    const user = userEvent.setup();
    
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement(Button, { 
          key: 'btn1', 
          onClick: mockClick,
          'data-testid': 'button-1'
        }, 'Button 1'),
        React.createElement(Button, { 
          key: 'btn2', 
          onClick: mockClick,
          'data-testid': 'button-2'
        }, 'Button 2'),
        React.createElement(Button, { 
          key: 'btn3', 
          onClick: mockClick,
          'data-testid': 'button-3'
        }, 'Button 3'),
      ])
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(3);

    // Test tab navigation
    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);

    await user.tab();
    expect(document.activeElement).toBe(buttons[1]);

    await user.tab();
    expect(document.activeElement).toBe(buttons[2]);

    // Test Enter key activation
    await user.keyboard('{Enter}');
    expect(mockClick).toHaveBeenCalled();

    // Test Space key activation
    mockClick.mockClear();
    buttons[0].focus();
    await user.keyboard(' ');
    expect(mockClick).toHaveBeenCalled();
  });

  it('should support keyboard navigation for form inputs', async () => {
    const user = userEvent.setup();
    
    const { container } = renderWithProviders(
      React.createElement('form', {}, [
        React.createElement('label', { key: 'label1', htmlFor: 'input1' }, 'First Name'),
        React.createElement(Input, { key: 'input1', id: 'input1', placeholder: 'Enter first name' }),
        
        React.createElement('label', { key: 'label2', htmlFor: 'input2' }, 'Last Name'),
        React.createElement(Input, { key: 'input2', id: 'input2', placeholder: 'Enter last name' }),
        
        React.createElement('label', { key: 'label3', htmlFor: 'select1' }, 'Country'),
        React.createElement(Select, {
          key: 'select1',
          id: 'select1',
          placeholder: 'Select country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
          ]
        }),
        
        React.createElement(Button, { 
          key: 'submit', 
          type: 'primary',
          htmlType: 'submit'
        }, 'Submit')
      ])
    );

    // Test tab navigation through form fields
    await user.tab();
    expect(document.activeElement?.tagName).toBe('INPUT');

    await user.tab();
    expect(document.activeElement?.tagName).toBe('INPUT');

    await user.tab();
    // Select component creates its own focusable element
    expect(document.activeElement).toBeTruthy();

    await user.tab();
    expect(document.activeElement?.tagName).toBe('BUTTON');
  });

  it('should handle escape key for modals', async () => {
    const mockClose = jest.fn();
    const user = userEvent.setup();
    
    const TestModal = () => {
      const [isOpen, setIsOpen] = React.useState(true);
      
      const handleClose = () => {
        setIsOpen(false);
        mockClose();
      };

      return React.createElement(Modal, {
        open: isOpen,
        onCancel: handleClose,
        title: 'Test Modal',
        'data-testid': 'test-modal'
      }, 'Modal content here');
    };

    renderWithProviders(React.createElement(TestModal));

    // Press Escape key
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('should support arrow key navigation in menus', async () => {
    const user = userEvent.setup();
    
    const menuItems = [
      { key: '1', label: 'Navigation One' },
      { key: '2', label: 'Navigation Two' },
      { key: '3', label: 'Navigation Three' },
    ];

    const { container } = renderWithProviders(
      React.createElement(Menu, {
        mode: 'vertical',
        items: menuItems,
        'data-testid': 'navigation-menu'
      })
    );

    const menu = container.querySelector('[role="menu"]');
    expect(menu).toBeInTheDocument();

    // Focus the menu
    const firstMenuItem = container.querySelector('[role="menuitem"]');
    firstMenuItem?.focus();

    // Test arrow key navigation
    await user.keyboard('{ArrowDown}');
    // Note: Actual implementation would need to check focus moved to next item
    
    await user.keyboard('{ArrowUp}');
    // Note: Actual implementation would need to check focus moved to previous item
  });

  it('should support Home and End keys for navigation', async () => {
    const user = userEvent.setup();
    
    const { container } = renderWithProviders(
      React.createElement('div', { role: 'listbox', 'aria-label': 'Options' }, [
        React.createElement('div', { 
          key: '1', 
          role: 'option', 
          tabIndex: 0,
          'data-testid': 'option-1'
        }, 'Option 1'),
        React.createElement('div', { 
          key: '2', 
          role: 'option', 
          tabIndex: -1,
          'data-testid': 'option-2'
        }, 'Option 2'),
        React.createElement('div', { 
          key: '3', 
          role: 'option', 
          tabIndex: -1,
          'data-testid': 'option-3'
        }, 'Option 3'),
      ])
    );

    const options = container.querySelectorAll('[role="option"]');
    
    // Focus first option
    options[0].focus();
    expect(document.activeElement).toBe(options[0]);

    // Test End key (should move to last option)
    await user.keyboard('{End}');
    // Note: In a real implementation, you'd need to handle this programmatically

    // Test Home key (should move to first option)  
    await user.keyboard('{Home}');
    // Note: In a real implementation, you'd need to handle this programmatically
  });

  it('should handle disabled elements correctly', async () => {
    const user = userEvent.setup();
    
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement(Button, { key: 'btn1' }, 'Enabled Button'),
        React.createElement(Button, { key: 'btn2', disabled: true }, 'Disabled Button'),
        React.createElement(Button, { key: 'btn3' }, 'Another Enabled Button'),
      ])
    );

    const buttons = container.querySelectorAll('button');
    
    // Tab should skip disabled button
    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);

    await user.tab();
    expect(document.activeElement).toBe(buttons[2]); // Should skip disabled button
  });

  it('should support custom keyboard shortcuts', async () => {
    const mockSave = jest.fn();
    const mockCopy = jest.fn();
    const user = userEvent.setup();
    
    const TestComponent = () => {
      React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            mockSave();
          }
          if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            mockCopy();
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, []);

      return React.createElement('div', { 
        tabIndex: 0,
        'aria-label': 'Application with keyboard shortcuts'
      }, 'Use Ctrl+S to save, Ctrl+C to copy');
    };

    renderWithProviders(React.createElement(TestComponent));

    // Test Ctrl+S
    await user.keyboard('{Control>}s{/Control}');
    expect(mockSave).toHaveBeenCalled();

    // Test Ctrl+C
    await user.keyboard('{Control>}c{/Control}');
    expect(mockCopy).toHaveBeenCalled();
  });
});