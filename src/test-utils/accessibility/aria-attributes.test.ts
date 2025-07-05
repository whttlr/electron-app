/**
 * ARIA Attributes and Roles Tests
 * Tests for proper ARIA implementation and semantic markup
 */

import { renderWithProviders } from '../index';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Input, Switch, Checkbox, Radio } from 'antd';
import { setupA11yTests } from './setup';
import { screenReaderHelpers } from './helpers';

describe('ARIA Attributes and Roles', () => {
  beforeEach(() => {
    setupA11yTests();
  });

  it('should have proper ARIA labels and descriptions', () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('label', { 
          key: 'label',
          htmlFor: 'email-input' 
        }, 'Email Address'),
        React.createElement(Input, {
          key: 'input',
          id: 'email-input',
          type: 'email',
          placeholder: 'Enter your email',
          'aria-describedby': 'help-text'
        }),
        React.createElement('div', {
          key: 'help',
          id: 'help-text',
          className: 'help-text'
        }, 'We will use this email to send you updates'),
        React.createElement(Button, {
          key: 'button',
          'aria-label': 'Submit email address form'
        }, 'Submit')
      ])
    );

    const input = container.querySelector('#email-input');
    const button = container.querySelector('button');
    const helpText = container.querySelector('#help-text');

    expect(input).toHaveAttribute('aria-describedby', 'help-text');
    expect(button).toHaveAttribute('aria-label', 'Submit email address form');
    expect(helpText).toBeInTheDocument();
  });

  it('should handle dynamic ARIA state changes', async () => {
    const user = userEvent.setup();
    
    const ExpandableSection = () => {
      const [isExpanded, setIsExpanded] = React.useState(false);
      
      return React.createElement('div', {}, [
        React.createElement('button', {
          key: 'toggle',
          'aria-expanded': isExpanded,
          'aria-controls': 'expandable-content',
          onClick: () => setIsExpanded(!isExpanded),
          'data-testid': 'toggle-button'
        }, `${isExpanded ? 'Collapse' : 'Expand'} Section`),
        
        React.createElement('div', {
          key: 'content',
          id: 'expandable-content',
          'aria-hidden': !isExpanded,
          style: { display: isExpanded ? 'block' : 'none' }
        }, 'This content can be expanded or collapsed')
      ]);
    };

    const { container } = renderWithProviders(React.createElement(ExpandableSection));
    
    const toggleButton = screen.getByTestId('toggle-button');
    const content = container.querySelector('#expandable-content');

    // Initial state
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('aria-hidden', 'true');

    // Click to expand
    await user.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('aria-hidden', 'false');

    // Click to collapse
    await user.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('should use proper roles for custom components', () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('div', {
          key: 'tablist',
          role: 'tablist',
          'aria-label': 'Main navigation tabs'
        }, [
          React.createElement('button', {
            key: 'tab1',
            role: 'tab',
            'aria-selected': 'true',
            'aria-controls': 'panel1',
            id: 'tab1'
          }, 'Tab 1'),
          React.createElement('button', {
            key: 'tab2',
            role: 'tab',
            'aria-selected': 'false',
            'aria-controls': 'panel2',
            id: 'tab2'
          }, 'Tab 2')
        ]),
        
        React.createElement('div', {
          key: 'panel1',
          role: 'tabpanel',
          'aria-labelledby': 'tab1',
          id: 'panel1'
        }, 'Content for tab 1'),
        
        React.createElement('div', {
          key: 'panel2',
          role: 'tabpanel',
          'aria-labelledby': 'tab2',
          id: 'panel2',
          'aria-hidden': 'true',
          style: { display: 'none' }
        }, 'Content for tab 2')
      ])
    );

    const tablist = container.querySelector('[role="tablist"]');
    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');

    expect(tablist).toHaveAttribute('aria-label', 'Main navigation tabs');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(panels[0]).toHaveAttribute('aria-labelledby', 'tab1');
    expect(panels[1]).toHaveAttribute('aria-labelledby', 'tab2');
  });

  it('should handle form validation with ARIA', async () => {
    const user = userEvent.setup();
    
    const ValidationForm = () => {
      const [email, setEmail] = React.useState('');
      const [error, setError] = React.useState('');
      
      const validateEmail = (value: string) => {
        if (!value.includes('@')) {
          setError('Please enter a valid email address');
        } else {
          setError('');
        }
      };

      return React.createElement('form', {}, [
        React.createElement('label', { 
          key: 'label',
          htmlFor: 'email' 
        }, 'Email Address'),
        React.createElement(Input, {
          key: 'input',
          id: 'email',
          type: 'email',
          value: email,
          onChange: (e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          },
          'aria-invalid': !!error,
          'aria-describedby': error ? 'email-error' : undefined,
          'data-testid': 'email-input'
        }),
        error && React.createElement('div', {
          key: 'error',
          id: 'email-error',
          role: 'alert',
          'aria-live': 'polite'
        }, error)
      ]);
    };

    const { container } = renderWithProviders(React.createElement(ValidationForm));
    
    const emailInput = screen.getByTestId('email-input');

    // Initial state - no error
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(container.querySelector('#email-error')).not.toBeInTheDocument();

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      
      const errorElement = container.querySelector('#email-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });

    // Enter valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@email.com');
    
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(container.querySelector('#email-error')).not.toBeInTheDocument();
    });
  });

  it('should handle interactive widget states', async () => {
    const user = userEvent.setup();
    
    const InteractiveWidgets = () => {
      const [switchChecked, setSwitchChecked] = React.useState(false);
      const [checkboxChecked, setCheckboxChecked] = React.useState(false);
      const [radioValue, setRadioValue] = React.useState('option1');

      return React.createElement('div', {}, [
        React.createElement('div', { key: 'switch-group' }, [
          React.createElement('label', { htmlFor: 'toggle-switch' }, 'Enable notifications'),
          React.createElement(Switch, {
            id: 'toggle-switch',
            checked: switchChecked,
            onChange: setSwitchChecked,
            'aria-label': 'Toggle notifications',
            'data-testid': 'notification-switch'
          })
        ]),
        
        React.createElement('div', { key: 'checkbox-group' }, [
          React.createElement(Checkbox, {
            checked: checkboxChecked,
            onChange: (e) => setCheckboxChecked(e.target.checked),
            'data-testid': 'terms-checkbox'
          }, 'I agree to the terms and conditions')
        ]),
        
        React.createElement(Radio.Group, {
          key: 'radio-group',
          value: radioValue,
          onChange: (e) => setRadioValue(e.target.value),
          'aria-label': 'Choose payment method'
        }, [
          React.createElement(Radio, { key: 'r1', value: 'option1' }, 'Credit Card'),
          React.createElement(Radio, { key: 'r2', value: 'option2' }, 'PayPal'),
          React.createElement(Radio, { key: 'r3', value: 'option3' }, 'Bank Transfer')
        ])
      ]);
    };

    const { container } = renderWithProviders(React.createElement(InteractiveWidgets));
    
    const notificationSwitch = screen.getByTestId('notification-switch');
    const termsCheckbox = screen.getByTestId('terms-checkbox');
    const radioGroup = container.querySelector('[role="radiogroup"]');

    // Test switch ARIA states
    expect(notificationSwitch).toHaveAttribute('role', 'switch');
    expect(notificationSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(notificationSwitch);
    expect(notificationSwitch).toHaveAttribute('aria-checked', 'true');

    // Test checkbox ARIA states
    expect(termsCheckbox).toHaveAttribute('aria-checked', 'false');
    
    await user.click(termsCheckbox);
    expect(termsCheckbox).toHaveAttribute('aria-checked', 'true');

    // Test radio group ARIA
    expect(radioGroup).toHaveAttribute('aria-label', 'Choose payment method');
    
    const radioButtons = container.querySelectorAll('[role="radio"]');
    expect(radioButtons[0]).toHaveAttribute('aria-checked', 'true');
    expect(radioButtons[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('should provide proper landmark navigation', () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('header', { 
          key: 'header',
          role: 'banner' 
        }, [
          React.createElement('h1', {}, 'CNC Control Application'),
          React.createElement('nav', { 
            'aria-label': 'Main navigation',
            role: 'navigation'
          }, [
            React.createElement('ul', {}, [
              React.createElement('li', { key: '1' }, React.createElement('a', { href: '/' }, 'Home')),
              React.createElement('li', { key: '2' }, React.createElement('a', { href: '/controls' }, 'Controls'))
            ])
          ])
        ]),
        
        React.createElement('main', { 
          key: 'main',
          role: 'main',
          'aria-labelledby': 'main-heading'
        }, [
          React.createElement('h2', { id: 'main-heading' }, 'Machine Controls'),
          React.createElement('section', { 
            'aria-labelledby': 'status-heading'
          }, [
            React.createElement('h3', { id: 'status-heading' }, 'Machine Status'),
            React.createElement('p', {}, 'Current status information')
          ])
        ]),
        
        React.createElement('aside', { 
          key: 'sidebar',
          role: 'complementary',
          'aria-label': 'Additional information'
        }, [
          React.createElement('h3', {}, 'Quick Actions'),
          React.createElement('ul', {}, [
            React.createElement('li', { key: '1' }, 'Emergency Stop'),
            React.createElement('li', { key: '2' }, 'Home Machine')
          ])
        ]),
        
        React.createElement('footer', { 
          key: 'footer',
          role: 'contentinfo'
        }, [
          React.createElement('p', {}, '© 2024 CNC Control')
        ])
      ])
    );

    // Check for proper landmark roles
    expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
    expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
    expect(container.querySelector('[role="main"]')).toBeInTheDocument();
    expect(container.querySelector('[role="complementary"]')).toBeInTheDocument();
    expect(container.querySelector('[role="contentinfo"]')).toBeInTheDocument();

    // Check for proper labeling
    const nav = container.querySelector('[role="navigation"]');
    const main = container.querySelector('[role="main"]');
    const aside = container.querySelector('[role="complementary"]');

    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    expect(main).toHaveAttribute('aria-labelledby', 'main-heading');
    expect(aside).toHaveAttribute('aria-label', 'Additional information');
  });
});