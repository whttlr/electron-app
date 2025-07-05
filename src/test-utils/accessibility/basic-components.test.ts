/**
 * Basic Component Accessibility Tests
 * Tests for fundamental UI component accessibility
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from '../index';
import React from 'react';
import { Button, Input, Modal, Card, Alert, Tooltip, Progress } from 'antd';
import { setupA11yTests } from './setup';

expect.extend(toHaveNoViolations);

describe('Basic Component Accessibility', () => {
  beforeEach(() => {
    setupA11yTests();
  });

  it('should pass axe accessibility tests for buttons', async () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement(Button, { key: 'primary', type: 'primary' }, 'Primary Button'),
        React.createElement(Button, { key: 'default', type: 'default' }, 'Default Button'),
        React.createElement(Button, { key: 'dashed', type: 'dashed' }, 'Dashed Button'),
        React.createElement(Button, { key: 'link', type: 'link' }, 'Link Button'),
        React.createElement(Button, { key: 'disabled', disabled: true }, 'Disabled Button'),
        React.createElement(Button, { key: 'loading', loading: true }, 'Loading Button'),
      ])
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should pass axe accessibility tests for form inputs', async () => {
    const { container } = renderWithProviders(
      React.createElement('form', {}, [
        React.createElement('label', { key: 'email-label', htmlFor: 'email' }, 'Email'),
        React.createElement(Input, {
          key: 'email',
          id: 'email',
          type: 'email',
          placeholder: 'Enter your email',
          'aria-describedby': 'error-text'
        }),
        React.createElement('div', {
          key: 'error',
          id: 'error-text',
          role: 'alert',
          'aria-live': 'polite'
        }, 'Please enter a valid email address'),
      ])
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should pass axe accessibility tests for interactive components', async () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement(Card, {
          key: 'card',
          title: 'Accessible Card',
          extra: React.createElement('a', { href: '#' }, 'More')
        }, 'Card content with proper structure'),
        
        React.createElement(Alert, {
          key: 'alert',
          message: 'Important Information',
          description: 'This alert provides important information to users',
          type: 'info',
          showIcon: true,
          closable: true
        }),
        
        React.createElement(Tooltip, {
          key: 'tooltip',
          title: 'Helpful tooltip information'
        }, React.createElement('span', {}, 'Hover for tooltip')),
        
        React.createElement('div', { key: 'progress' }, [
          React.createElement('label', { htmlFor: 'progress-bar' }, 'Loading Progress'),
          React.createElement(Progress, {
            id: 'progress-bar',
            percent: 75,
            status: 'active',
            'aria-label': 'Loading progress: 75%'
          })
        ])
      ])
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper semantic structure', () => {
    const { container } = renderWithProviders(
      React.createElement('main', {}, [
        React.createElement('header', { key: 'header' }, [
          React.createElement('h1', {}, 'Page Title'),
          React.createElement('nav', { 'aria-label': 'Main navigation' }, [
            React.createElement('ul', {}, [
              React.createElement('li', { key: '1' }, React.createElement('a', { href: '/' }, 'Home')),
              React.createElement('li', { key: '2' }, React.createElement('a', { href: '/about' }, 'About')),
            ])
          ])
        ]),
        React.createElement('section', { key: 'content', 'aria-labelledby': 'section-title' }, [
          React.createElement('h2', { id: 'section-title' }, 'Main Content'),
          React.createElement('p', {}, 'This is the main content area.')
        ]),
        React.createElement('aside', { key: 'sidebar', 'aria-label': 'Sidebar content' }, [
          React.createElement('h3', {}, 'Related Information'),
          React.createElement('p', {}, 'Additional information and links.')
        ]),
        React.createElement('footer', { key: 'footer' }, [
          React.createElement('p', {}, '© 2024 CNC Control. All rights reserved.')
        ])
      ])
    );

    // Check for proper landmark elements
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(container.querySelector('section')).toBeInTheDocument();
    expect(container.querySelector('aside')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();

    // Check for proper heading hierarchy
    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');
    const h3 = container.querySelector('h3');
    
    expect(h1).toBeInTheDocument();
    expect(h2).toBeInTheDocument();
    expect(h3).toBeInTheDocument();
  });

  it('should handle loading states accessibly', async () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('div', {
          key: 'loading',
          'aria-live': 'polite',
          'aria-busy': 'true',
          role: 'status'
        }, 'Loading content...'),
        
        React.createElement(Button, {
          key: 'loading-button',
          loading: true,
          'aria-label': 'Processing request'
        }, 'Submit'),
        
        React.createElement('div', {
          key: 'spinner',
          role: 'progressbar',
          'aria-valuetext': 'Loading in progress',
          'aria-label': 'Content loading'
        }, 'Loading...')
      ])
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Check for proper loading indicators
    const loadingStatus = container.querySelector('[role="status"]');
    const progressBar = container.querySelector('[role="progressbar"]');
    
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
    expect(progressBar).toHaveAttribute('aria-label', 'Content loading');
  });
});