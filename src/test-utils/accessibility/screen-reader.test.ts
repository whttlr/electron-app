/**
 * Screen Reader Support Tests
 * Tests for screen reader compatibility and announcements
 */

import { renderWithProviders } from '../index';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Alert, Progress, Spin } from 'antd';
import { setupA11yTests } from './setup';
import { screenReaderHelpers } from './helpers';

describe('Screen Reader Support', () => {
  beforeEach(() => {
    setupA11yTests();
  });

  it('should provide meaningful text for screen readers', () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('img', {
          key: 'logo',
          src: '/logo.png',
          alt: 'CNC Control Application Logo'
        }),
        
        React.createElement('button', {
          key: 'icon-button',
          'aria-label': 'Close dialog'
        }, '×'),
        
        React.createElement('div', {
          key: 'status',
          role: 'status',
          'aria-live': 'polite'
        }, 'Machine is currently running'),
        
        React.createElement('span', {
          key: 'sr-only',
          className: 'sr-only'
        }, 'This text is only for screen readers'),
        
        React.createElement(Progress, {
          key: 'progress',
          percent: 75,
          'aria-label': 'Job completion progress: 75%'
        })
      ])
    );

    const img = container.querySelector('img');
    const iconButton = container.querySelector('button');
    const statusDiv = container.querySelector('[role="status"]');
    const progress = container.querySelector('.ant-progress');

    expect(img).toHaveAttribute('alt', 'CNC Control Application Logo');
    expect(iconButton).toHaveAttribute('aria-label', 'Close dialog');
    expect(statusDiv).toHaveAttribute('aria-live', 'polite');
    expect(progress).toHaveAttribute('aria-label', 'Job completion progress: 75%');
  });

  it('should announce dynamic content changes', async () => {
    const LiveRegionExample = () => {
      const [message, setMessage] = React.useState('Initial status');
      const [messageType, setMessageType] = React.useState<'polite' | 'assertive'>('polite');

      return React.createElement('div', {}, [
        React.createElement('button', {
          key: 'update-polite',
          onClick: () => {
            setMessage('Status updated successfully');
            setMessageType('polite');
          },
          'data-testid': 'update-polite'
        }, 'Update Status (Polite)'),
        
        React.createElement('button', {
          key: 'update-assertive',
          onClick: () => {
            setMessage('Critical error occurred!');
            setMessageType('assertive');
          },
          'data-testid': 'update-assertive'
        }, 'Update Status (Assertive)'),
        
        React.createElement('div', {
          key: 'live-region',
          'aria-live': messageType,
          'aria-atomic': 'true',
          'data-testid': 'live-region'
        }, message)
      ]);
    };

    const { container } = renderWithProviders(React.createElement(LiveRegionExample));
    
    const updatePoliteButton = screen.getByTestId('update-polite');
    const updateAssertiveButton = screen.getByTestId('update-assertive');
    const liveRegion = screen.getByTestId('live-region');

    // Initial state
    expect(liveRegion).toHaveTextContent('Initial status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    // Update with polite announcement
    await userEvent.click(updatePoliteButton);
    
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent('Status updated successfully');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    // Update with assertive announcement
    await userEvent.click(updateAssertiveButton);
    
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent('Critical error occurred!');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    });
  });

  it('should provide context for complex interfaces', () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('table', {
          key: 'data-table',
          'aria-label': 'CNC Job Queue',
          'aria-describedby': 'table-description'
        }, [
          React.createElement('caption', { id: 'table-description' }, 
            'Table showing current CNC jobs with status and progress information'
          ),
          React.createElement('thead', {}, [
            React.createElement('tr', {}, [
              React.createElement('th', { scope: 'col' }, 'Job Name'),
              React.createElement('th', { scope: 'col' }, 'Status'),
              React.createElement('th', { scope: 'col' }, 'Progress'),
              React.createElement('th', { scope: 'col' }, 'Actions')
            ])
          ]),
          React.createElement('tbody', {}, [
            React.createElement('tr', {}, [
              React.createElement('td', {}, 'Part_001.gcode'),
              React.createElement('td', {}, React.createElement('span', { 
                'aria-label': 'Status: Running' 
              }, 'Running')),
              React.createElement('td', {}, React.createElement(Progress, {
                percent: 65,
                'aria-label': 'Progress: 65% complete'
              })),
              React.createElement('td', {}, [
                React.createElement('button', { 
                  'aria-label': 'Pause job Part_001.gcode' 
                }, 'Pause'),
                React.createElement('button', { 
                  'aria-label': 'Cancel job Part_001.gcode' 
                }, 'Cancel')
              ])
            ])
          ])
        ]),
        
        React.createElement('form', {
          key: 'job-form',
          'aria-labelledby': 'form-heading'
        }, [
          React.createElement('h3', { id: 'form-heading' }, 'Add New Job'),
          React.createElement('fieldset', {}, [
            React.createElement('legend', {}, 'Job Configuration'),
            React.createElement('label', { htmlFor: 'job-file' }, 'G-code File'),
            React.createElement('input', {
              id: 'job-file',
              type: 'file',
              accept: '.gcode,.nc',
              'aria-describedby': 'file-help'
            }),
            React.createElement('div', {
              id: 'file-help',
              className: 'help-text'
            }, 'Select a G-code file (.gcode or .nc format)')
          ])
        ])
      ])
    );

    const table = container.querySelector('table');
    const caption = container.querySelector('caption');
    const form = container.querySelector('form');
    const fieldset = container.querySelector('fieldset');
    const legend = container.querySelector('legend');

    expect(table).toHaveAttribute('aria-label', 'CNC Job Queue');
    expect(table).toHaveAttribute('aria-describedby', 'table-description');
    expect(caption).toHaveAttribute('id', 'table-description');
    
    expect(form).toHaveAttribute('aria-labelledby', 'form-heading');
    expect(fieldset).toBeInTheDocument();
    expect(legend).toHaveTextContent('Job Configuration');

    // Check for proper action button labels
    const pauseButton = container.querySelector('[aria-label="Pause job Part_001.gcode"]');
    const cancelButton = container.querySelector('[aria-label="Cancel job Part_001.gcode"]');
    
    expect(pauseButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('should handle loading states with screen reader announcements', async () => {
    const LoadingExample = () => {
      const [isLoading, setIsLoading] = React.useState(false);
      const [loadedContent, setLoadedContent] = React.useState('');

      const startLoading = async () => {
        setIsLoading(true);
        setLoadedContent('');
        
        // Simulate API call
        setTimeout(() => {
          setIsLoading(false);
          setLoadedContent('Content loaded successfully');
        }, 1000);
      };

      return React.createElement('div', {}, [
        React.createElement('button', {
          key: 'load-button',
          onClick: startLoading,
          disabled: isLoading,
          'data-testid': 'load-content'
        }, isLoading ? 'Loading...' : 'Load Content'),
        
        React.createElement('div', {
          key: 'status-region',
          role: 'status',
          'aria-live': 'polite',
          'aria-atomic': 'true',
          'data-testid': 'status-region'
        }, 
          isLoading 
            ? 'Loading content, please wait...' 
            : loadedContent
        ),
        
        isLoading && React.createElement(Spin, {
          key: 'spinner',
          'aria-label': 'Content loading in progress'
        }),
        
        React.createElement('div', {
          key: 'content-area',
          'aria-busy': isLoading,
          'data-testid': 'content-area'
        }, loadedContent || 'No content loaded')
      ]);
    };

    const { container } = renderWithProviders(React.createElement(LoadingExample));
    
    const loadButton = screen.getByTestId('load-content');
    const statusRegion = screen.getByTestId('status-region');
    const contentArea = screen.getByTestId('content-area');

    // Initial state
    expect(statusRegion).toHaveTextContent('');
    expect(contentArea).toHaveAttribute('aria-busy', 'false');

    // Start loading
    await userEvent.click(loadButton);

    expect(loadButton).toBeDisabled();
    expect(statusRegion).toHaveTextContent('Loading content, please wait...');
    expect(contentArea).toHaveAttribute('aria-busy', 'true');

    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toHaveAttribute('aria-label', 'Content loading in progress');

    // Wait for loading to complete
    await waitFor(() => {
      expect(statusRegion).toHaveTextContent('Content loaded successfully');
      expect(contentArea).toHaveAttribute('aria-busy', 'false');
    }, { timeout: 2000 });
  });

  it('should provide error announcements', async () => {
    const ErrorExample = () => {
      const [error, setError] = React.useState('');
      const [showAlert, setShowAlert] = React.useState(false);

      const triggerError = () => {
        setError('Connection to CNC machine failed');
        setShowAlert(true);
      };

      const clearError = () => {
        setError('');
        setShowAlert(false);
      };

      return React.createElement('div', {}, [
        React.createElement('button', {
          key: 'trigger-error',
          onClick: triggerError,
          'data-testid': 'trigger-error'
        }, 'Trigger Error'),
        
        React.createElement('button', {
          key: 'clear-error',
          onClick: clearError,
          'data-testid': 'clear-error'
        }, 'Clear Error'),
        
        error && React.createElement('div', {
          key: 'error-announcement',
          role: 'alert',
          'aria-live': 'assertive',
          'data-testid': 'error-announcement'
        }, error),
        
        showAlert && React.createElement(Alert, {
          key: 'error-alert',
          message: 'Error',
          description: error,
          type: 'error',
          showIcon: true,
          closable: true,
          onClose: clearError,
          'aria-label': `Error: ${error}`
        })
      ]);
    };

    const { container } = renderWithProviders(React.createElement(ErrorExample));
    
    const triggerButton = screen.getByTestId('trigger-error');
    const clearButton = screen.getByTestId('clear-error');

    // Trigger error
    await userEvent.click(triggerButton);

    await waitFor(() => {
      const errorAnnouncement = screen.getByTestId('error-announcement');
      expect(errorAnnouncement).toHaveAttribute('role', 'alert');
      expect(errorAnnouncement).toHaveAttribute('aria-live', 'assertive');
      expect(errorAnnouncement).toHaveTextContent('Connection to CNC machine failed');

      const errorAlert = container.querySelector('.ant-alert');
      expect(errorAlert).toHaveAttribute('aria-label', 'Error: Connection to CNC machine failed');
    });

    // Clear error
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByTestId('error-announcement')).not.toBeInTheDocument();
    });
  });

  it('should provide skip links for keyboard users', () => {
    const { container } = renderWithProviders(
      React.createElement('div', {}, [
        React.createElement('a', {
          key: 'skip-nav',
          href: '#main-content',
          className: 'skip-link',
          'data-testid': 'skip-to-main'
        }, 'Skip to main content'),
        
        React.createElement('a', {
          key: 'skip-controls',
          href: '#cnc-controls',
          className: 'skip-link',
          'data-testid': 'skip-to-controls'
        }, 'Skip to CNC controls'),
        
        React.createElement('header', { key: 'header' }, [
          React.createElement('nav', {}, 'Navigation menu with many links...')
        ]),
        
        React.createElement('main', {
          key: 'main',
          id: 'main-content',
          tabIndex: -1
        }, [
          React.createElement('h1', {}, 'Main Content Area'),
          React.createElement('section', {
            id: 'cnc-controls',
            tabIndex: -1
          }, 'CNC Control Interface')
        ])
      ])
    );

    const skipToMain = screen.getByTestId('skip-to-main');
    const skipToControls = screen.getByTestId('skip-to-controls');
    const mainContent = container.querySelector('#main-content');
    const cncControls = container.querySelector('#cnc-controls');

    expect(skipToMain).toHaveAttribute('href', '#main-content');
    expect(skipToControls).toHaveAttribute('href', '#cnc-controls');
    expect(mainContent).toHaveAttribute('tabindex', '-1');
    expect(cncControls).toHaveAttribute('tabindex', '-1');
  });
});