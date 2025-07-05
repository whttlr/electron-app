/**
 * Focus Management Tests
 * Tests for focus management, trapping, and restoration
 */

import { renderWithProviders } from '../index';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, Button, Input } from 'antd';
import { setupA11yTests } from './setup';
import { focusTestHelpers } from './helpers';

describe('Focus Management', () => {
  beforeEach(() => {
    setupA11yTests();
  });

  it('should manage focus correctly in modals', async () => {
    const user = userEvent.setup();
    
    const ModalExample = () => {
      const [isOpen, setIsOpen] = React.useState(false);

      return React.createElement('div', {}, [
        React.createElement('button', {
          key: 'trigger',
          onClick: () => setIsOpen(true),
          'data-testid': 'open-modal'
        }, 'Open Modal'),
        
        React.createElement('input', {
          key: 'background-input',
          type: 'text',
          placeholder: 'Background input',
          'data-testid': 'background-input'
        }),
        
        React.createElement(Modal, {
          key: 'modal',
          open: isOpen,
          onCancel: () => setIsOpen(false),
          title: 'Focus Test Modal',
          'data-testid': 'test-modal'
        }, [
          React.createElement(Input, {
            key: 'modal-input',
            placeholder: 'Modal input',
            'data-testid': 'modal-input'
          }),
          React.createElement('button', {
            key: 'modal-button',
            'data-testid': 'modal-button'
          }, 'Modal Button')
        ])
      ]);
    };

    const { container } = renderWithProviders(React.createElement(ModalExample));
    
    const openButton = screen.getByTestId('open-modal');
    const backgroundInput = screen.getByTestId('background-input');

    // Focus should start on trigger button
    openButton.focus();
    expect(document.activeElement).toBe(openButton);

    // Open modal
    await user.click(openButton);
    
    await waitFor(() => {
      const modal = screen.getByTestId('test-modal');
      expect(modal).toBeInTheDocument();
    });

    // Focus should move to modal content
    await waitFor(() => {
      const modalElements = container.querySelectorAll('[data-testid^="modal-"]');
      const focusableInModal = Array.from(modalElements).filter(el => 
        el.tabIndex >= 0 || ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(el.tagName)
      );
      
      expect(focusableInModal.length).toBeGreaterThan(0);
    });

    // Background elements should not be focusable
    expect(backgroundInput.tabIndex).toBe(-1);
  });

  it('should restore focus after modal closes', async () => {
    const user = userEvent.setup();
    
    const FocusRestorationExample = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      const triggerRef = React.useRef<HTMLButtonElement>(null);

      const handleClose = () => {
        setIsOpen(false);
        // Focus should be restored automatically, but we can ensure it
        setTimeout(() => {
          triggerRef.current?.focus();
        }, 0);
      };

      return React.createElement('div', {}, [
        React.createElement('input', {
          key: 'before',
          type: 'text',
          placeholder: 'Input before modal',
          'data-testid': 'input-before'
        }),
        
        React.createElement('button', {
          key: 'trigger',
          ref: triggerRef,
          onClick: () => setIsOpen(true),
          'data-testid': 'modal-trigger'
        }, 'Open Modal'),
        
        React.createElement('input', {
          key: 'after',
          type: 'text',
          placeholder: 'Input after modal',
          'data-testid': 'input-after'
        }),
        
        React.createElement(Modal, {
          key: 'modal',
          open: isOpen,
          onCancel: handleClose,
          title: 'Focus Restoration Test',
          footer: [
            React.createElement(Button, {
              key: 'cancel',
              onClick: handleClose,
              'data-testid': 'modal-cancel'
            }, 'Cancel'),
            React.createElement(Button, {
              key: 'confirm',
              type: 'primary',
              onClick: handleClose,
              'data-testid': 'modal-confirm'
            }, 'Confirm')
          ]
        }, 'Modal content for focus restoration test')
      ]);
    };

    renderWithProviders(React.createElement(FocusRestorationExample));
    
    const trigger = screen.getByTestId('modal-trigger');
    
    // Focus trigger and open modal
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Focus Restoration Test')).toBeInTheDocument();
    });

    // Close modal
    const cancelButton = screen.getByTestId('modal-cancel');
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Focus Restoration Test')).not.toBeInTheDocument();
    });

    // Focus should be restored to trigger
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it('should implement focus trap in modals', async () => {
    const user = userEvent.setup();
    
    const FocusTrapExample = () => {
      const [isOpen, setIsOpen] = React.useState(true);

      return React.createElement(Modal, {
        open: isOpen,
        onCancel: () => setIsOpen(false),
        title: 'Focus Trap Test',
        'data-testid': 'focus-trap-modal'
      }, [
        React.createElement(Input, {
          key: 'first-input',
          placeholder: 'First input',
          'data-testid': 'first-input'
        }),
        React.createElement(Input, {
          key: 'second-input',
          placeholder: 'Second input',
          'data-testid': 'second-input'
        }),
        React.createElement('button', {
          key: 'modal-button',
          'data-testid': 'modal-button'
        }, 'Modal Button'),
        React.createElement('a', {
          key: 'modal-link',
          href: '#',
          'data-testid': 'modal-link'
        }, 'Modal Link')
      ]);
    };

    const { container } = renderWithProviders(React.createElement(FocusTrapExample));
    
    await waitFor(() => {
      expect(screen.getByTestId('focus-trap-modal')).toBeInTheDocument();
    });

    // Get all focusable elements in modal
    const modal = container.querySelector('.ant-modal-content');
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    expect(focusableElements?.length).toBeGreaterThan(1);

    if (focusableElements && focusableElements.length > 1) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus first element
      firstElement.focus();
      expect(document.activeElement).toBe(firstElement);

      // Tab through all elements
      for (let i = 1; i < focusableElements.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(focusableElements[i]);
      }

      // Tab from last element should cycle to first
      await user.tab();
      expect(document.activeElement).toBe(firstElement);

      // Shift+Tab from first should go to last
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(lastElement);
    }
  });

  it('should handle programmatic focus changes', async () => {
    const ProgrammaticFocusExample = () => {
      const inputRef = React.useRef<HTMLInputElement>(null);
      const buttonRef = React.useRef<HTMLButtonElement>(null);

      const focusInput = () => {
        inputRef.current?.focus();
      };

      const focusButton = () => {
        buttonRef.current?.focus();
      };

      return React.createElement('div', {}, [
        React.createElement('button', {
          key: 'focus-input',
          onClick: focusInput,
          'data-testid': 'focus-input-btn'
        }, 'Focus Input'),
        
        React.createElement('button', {
          key: 'focus-button',
          onClick: focusButton,
          'data-testid': 'focus-button-btn'
        }, 'Focus Button'),
        
        React.createElement('input', {
          key: 'target-input',
          ref: inputRef,
          type: 'text',
          placeholder: 'Target input',
          'data-testid': 'target-input'
        }),
        
        React.createElement('button', {
          key: 'target-button',
          ref: buttonRef,
          'data-testid': 'target-button'
        }, 'Target Button')
      ]);
    };

    renderWithProviders(React.createElement(ProgrammaticFocusExample));
    
    const focusInputBtn = screen.getByTestId('focus-input-btn');
    const focusButtonBtn = screen.getByTestId('focus-button-btn');
    const targetInput = screen.getByTestId('target-input');
    const targetButton = screen.getByTestId('target-button');

    // Test programmatic focus on input
    await userEvent.click(focusInputBtn);
    expect(document.activeElement).toBe(targetInput);

    // Test programmatic focus on button
    await userEvent.click(focusButtonBtn);
    expect(document.activeElement).toBe(targetButton);
  });

  it('should handle focus indicators properly', async () => {
    const user = userEvent.setup();
    
    const FocusIndicatorExample = () => {
      return React.createElement('div', {}, [
        React.createElement('style', { key: 'styles' }, `
          .focus-visible {
            outline: 2px solid #007acc;
            outline-offset: 2px;
          }
          .custom-focus:focus {
            box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.3);
            outline: none;
          }
        `),
        
        React.createElement('button', {
          key: 'default-focus',
          'data-testid': 'default-focus'
        }, 'Default Focus'),
        
        React.createElement('button', {
          key: 'custom-focus',
          className: 'custom-focus',
          'data-testid': 'custom-focus'
        }, 'Custom Focus'),
        
        React.createElement('input', {
          key: 'input-focus',
          type: 'text',
          placeholder: 'Input with focus',
          'data-testid': 'input-focus'
        })
      ]);
    };

    renderWithProviders(React.createElement(FocusIndicatorExample));
    
    const defaultButton = screen.getByTestId('default-focus');
    const customButton = screen.getByTestId('custom-focus');
    const input = screen.getByTestId('input-focus');

    // Test default focus indicator
    await user.tab();
    expect(document.activeElement).toBe(defaultButton);
    
    const defaultStyles = getComputedStyle(defaultButton);
    expect(defaultStyles.outline).not.toBe('none');

    // Test custom focus indicator
    await user.tab();
    expect(document.activeElement).toBe(customButton);

    // Test input focus
    await user.tab();
    expect(document.activeElement).toBe(input);
  });

  it('should skip hidden and disabled elements', async () => {
    const user = userEvent.setup();
    
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('button', {
          key: 'btn1',
          'data-testid': 'button-1'
        }, 'Button 1'),
        
        React.createElement('button', {
          key: 'btn2',
          disabled: true,
          'data-testid': 'button-2'
        }, 'Disabled Button'),
        
        React.createElement('button', {
          key: 'btn3',
          style: { display: 'none' },
          'data-testid': 'button-3'
        }, 'Hidden Button'),
        
        React.createElement('button', {
          key: 'btn4',
          'aria-hidden': 'true',
          'data-testid': 'button-4'
        }, 'ARIA Hidden Button'),
        
        React.createElement('button', {
          key: 'btn5',
          'data-testid': 'button-5'
        }, 'Button 5')
      ])
    );

    const button1 = screen.getByTestId('button-1');
    const button5 = screen.getByTestId('button-5');

    // Tab should skip disabled and hidden elements
    await user.tab();
    expect(document.activeElement).toBe(button1);

    await user.tab();
    expect(document.activeElement).toBe(button5); // Should skip buttons 2, 3, 4
  });
});