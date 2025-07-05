/**
 * Accessibility Test Mocks and Data
 * Mock components and test data for accessibility testing
 */

import React from 'react';

export const mockA11yComponents = {
  AccessibleButton: ({ children, ...props }: any) => React.createElement(
    'button',
    {
      'aria-label': 'Accessible button',
      ...props
    },
    children
  ),

  AccessibleInput: ({ label, error, ...props }: any) => React.createElement(
    'div',
    {},
    React.createElement('label', { htmlFor: 'input-id' }, label),
    React.createElement('input', { 
      id: 'input-id',
      'aria-invalid': !!error,
      'aria-describedby': error ? 'error-id' : undefined,
      ...props 
    }),
    error && React.createElement('div', { 
      id: 'error-id', 
      role: 'alert',
      'aria-live': 'polite'
    }, error)
  ),

  AccessibleModal: ({ isOpen, onClose, children, ...props }: any) => {
    if (!isOpen) return null;
    
    return React.createElement(
      'div',
      {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
        ...props
      },
      React.createElement('h2', { id: 'modal-title' }, 'Modal Title'),
      children,
      React.createElement('button', { onClick: onClose }, 'Close')
    );
  },

  SkipLink: ({ href, children }: any) => React.createElement(
    'a',
    {
      href,
      className: 'skip-link',
      style: {
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }
    },
    children
  ),

  LiveRegion: ({ children, politeness = 'polite' }: any) => React.createElement(
    'div',
    {
      'aria-live': politeness,
      'aria-atomic': 'true',
      style: {
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }
    },
    children
  )
};

export const a11yTestData = {
  sampleForm: {
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'Enter your email'
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        required: true,
        placeholder: 'Enter your password'
      },
      {
        id: 'confirm-password',
        type: 'password',
        label: 'Confirm Password',
        required: true,
        placeholder: 'Confirm your password'
      }
    ]
  },

  navigationMenu: {
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'controls', label: 'CNC Controls', href: '/controls' },
      { id: 'jobs', label: 'Jobs', href: '/jobs' },
      { id: 'settings', label: 'Settings', href: '/settings' }
    ]
  },

  colorContrastPairs: [
    { background: '#ffffff', text: '#000000', ratio: 21 }, // Perfect contrast
    { background: '#ffffff', text: '#767676', ratio: 4.54 }, // WCAG AA minimum
    { background: '#ffffff', text: '#959595', ratio: 3.0 }, // WCAG AA large text
    { background: '#000000', text: '#ffffff', ratio: 21 }, // Perfect contrast
    { background: '#333333', text: '#ffffff', ratio: 12.63 }
  ],

  ariaExamples: {
    button: {
      'aria-label': 'Close dialog',
      'aria-expanded': 'false',
      'aria-pressed': 'false'
    },
    input: {
      'aria-label': 'Search products',
      'aria-required': 'true',
      'aria-invalid': 'false',
      'aria-describedby': 'search-help'
    },
    navigation: {
      'role': 'navigation',
      'aria-label': 'Main navigation'
    },
    dialog: {
      'role': 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'dialog-title',
      'aria-describedby': 'dialog-description'
    }
  },

  keyboardShortcuts: {
    'Escape': 'Close modal or dialog',
    'Enter': 'Activate button or submit form',
    'Space': 'Activate button or toggle checkbox',
    'Tab': 'Move to next focusable element',
    'Shift+Tab': 'Move to previous focusable element',
    'Arrow Keys': 'Navigate within component (menus, tabs, etc.)',
    'Home': 'Move to first item',
    'End': 'Move to last item'
  },

  screenReaderText: {
    loading: 'Loading content, please wait',
    error: 'Error: Unable to load content',
    success: 'Content loaded successfully',
    navigation: 'Navigation menu, use arrow keys to navigate',
    form: 'Form fields, use tab to navigate between fields',
    table: 'Data table with sortable columns',
    chart: 'Chart showing performance data over time'
  }
};