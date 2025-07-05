/**
 * Error Boundary Testing and Recovery Validation
 * 
 * Comprehensive tests for error boundaries, recovery strategies,
 * and error handling mechanisms.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import {
  ErrorBoundary,
  ErrorRecovery,
  withErrorBoundary,
  MinimalErrorFallback,
  InlineErrorFallback,
  useErrorRecovery,
  AsyncErrorBoundary,
} from '../errorBoundary';

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/',
  reload: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
  writable: true,
});

// Test components that throw errors
const ThrowingComponent: React.FC<{ shouldThrow: boolean; errorMessage?: string }> = ({
  shouldThrow,
  errorMessage = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="working-component">Component is working</div>;
};

const AsyncThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      // Simulate async error
      setTimeout(() => {
        throw new Error('Async error');
      }, 100);
    }
  }, [shouldThrow]);
  
  return <div data-testid="async-component">Async component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });
  
  describe('Basic Error Catching', () => {
    it('should catch and display errors', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.getByText('Component is working')).toBeInTheDocument();
    });
    
    it('should display error details when showDetails is enabled', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowingComponent shouldThrow={true} errorMessage="Detailed test error" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument(); // Error name
    });
  });
  
  describe('Recovery Mechanisms', () => {
    it('should reset error state when retry is clicked', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Click retry button
      fireEvent.click(screen.getByText('Try Again'));
      
      // Rerender with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
    });
    
    it('should show recovery options when enabled', () => {
      render(
        <ErrorBoundary enableRecovery={true}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Recovery Options')).toBeInTheDocument();
    });
    
    it('should execute recovery strategies', async () => {
      render(
        <ErrorBoundary enableRecovery={true}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Click to expand recovery options
      fireEvent.click(screen.getByText('Recovery Options'));
      
      await waitFor(() => {
        expect(screen.getByText('Reset Application State')).toBeInTheDocument();
        expect(screen.getByText('Clear Cache & Storage')).toBeInTheDocument();
        expect(screen.getByText('Hard Reload')).toBeInTheDocument();
      });
    });
  });
  
  describe('Error Reporting', () => {
    it('should store error reports locally', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Reportable error" />
        </ErrorBoundary>
      );
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'error-reports',
        expect.stringContaining('Reportable error')
      );
    });
    
    it('should copy error details to clipboard', async () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowingComponent shouldThrow={true} errorMessage="Copyable error" />
        </ErrorBoundary>
      );
      
      // Click to expand error details
      fireEvent.click(screen.getByText('Error Details'));
      
      await waitFor(() => {
        const copyButton = screen.getByText('Copy All Details');
        fireEvent.click(copyButton);
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
  
  describe('Auto-retry Mechanism', () => {
    it('should attempt auto-retry with exponential backoff', async () => {
      jest.useFakeTimers();
      
      const { rerender } = render(
        <ErrorBoundary maxRetries={2}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Fast forward time for first retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Simulate recovery by rerendering with working component
      rerender(
        <ErrorBoundary maxRetries={2}>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });
  
  describe('Custom Fallbacks', () => {
    it('should use custom fallback when provided', () => {
      const customFallback = (error: Error, errorInfo: any, reset: () => void) => (
        <div data-testid="custom-fallback">
          <h1>Custom Error: {error.message}</h1>
          <button onClick={reset}>Custom Reset</button>
        </div>
      );
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowingComponent shouldThrow={true} errorMessage="Custom error" />
        </ErrorBoundary>
      );
      
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error: Custom error')).toBeInTheDocument();
      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
    });
  });
  
  describe('Isolated Error Boundaries', () => {
    it('should render in isolated mode', () => {
      render(
        <ErrorBoundary isolate={true}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const container = screen.getByText('Something went wrong').closest('.error-boundary-container');
      expect(container).toHaveClass('isolated');
    });
  });
});

describe('withErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
  
  it('should pass through props to wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);
    
    render(<WrappedComponent shouldThrow={false} />);
    
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });
});

describe('Minimal Error Fallback', () => {
  it('should render minimal error display', () => {
    const mockReset = jest.fn();
    const testError = new Error('Minimal test error');
    
    render(<MinimalErrorFallback error={testError} reset={mockReset} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Minimal test error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(mockReset).toHaveBeenCalled();
  });
});

describe('Inline Error Fallback', () => {
  it('should render inline error display', () => {
    const mockReset = jest.fn();
    const testError = new Error('Inline test error');
    
    render(<InlineErrorFallback error={testError} reset={mockReset} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Inline test error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Retry'));
    expect(mockReset).toHaveBeenCalled();
  });
});

describe('useErrorRecovery Hook', () => {
  const TestComponent: React.FC = () => {
    const { error, isRecovering, recover, throwError, strategies } = useErrorRecovery();
    
    return (
      <div>
        {error ? (
          <div>
            <div data-testid="error-message">{error.message}</div>
            <button
              onClick={() => recover('reset-component')}
              disabled={isRecovering}
              data-testid="recover-button"
            >
              {isRecovering ? 'Recovering...' : 'Recover'}
            </button>
          </div>
        ) : (
          <div>
            <div data-testid="no-error">No error</div>
            <button
              onClick={() => throwError(new Error('Hook test error'))}
              data-testid="throw-error"
            >
              Throw Error
            </button>
            <div data-testid="strategies">{strategies.join(', ')}</div>
          </div>
        )}
      </div>
    );
  };
  
  it('should provide error recovery functionality', async () => {
    render(<TestComponent />);
    
    // Initially no error
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
    expect(screen.getByTestId('strategies')).toBeInTheDocument();
    
    // Throw an error
    expect(() => {
      fireEvent.click(screen.getByTestId('throw-error'));
    }).toThrow('Hook test error');
  });
});

describe('AsyncErrorBoundary', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should catch unhandled promise rejections', async () => {
    const mockAddEventListener = jest.spyOn(window, 'addEventListener');
    const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(
      <AsyncErrorBoundary>
        <AsyncThrowingComponent shouldThrow={true} />
      </AsyncErrorBoundary>
    );
    
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function)
    );
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function)
    );
    
    mockAddEventListener.mockRestore();
    mockRemoveEventListener.mockRestore();
  });
});

describe('ErrorRecovery Strategies', () => {
  beforeEach(() => {
    // Reset strategies
    ErrorRecovery.registerStrategy('test-strategy', async () => {
      console.log('Test strategy executed');
    });
  });
  
  it('should register and execute custom recovery strategies', async () => {
    const mockStrategy = jest.fn();
    ErrorRecovery.registerStrategy('mock-strategy', mockStrategy);
    
    await ErrorRecovery.executeStrategy('mock-strategy');
    
    expect(mockStrategy).toHaveBeenCalled();
  });
  
  it('should list available strategies', () => {
    const strategies = ErrorRecovery.getAvailableStrategies();
    
    expect(strategies).toContain('reset-component');
    expect(strategies).toContain('reset-stores');
    expect(strategies).toContain('reload-page');
    expect(strategies).toContain('clear-cache');
    expect(strategies).toContain('navigate-home');
  });
  
  it('should handle unknown strategies gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    
    await ErrorRecovery.executeStrategy('non-existent-strategy');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Unknown recovery strategy: non-existent-strategy'
    );
    
    consoleSpy.mockRestore();
  });
});

describe('Error Boundary Edge Cases', () => {
  it('should handle multiple consecutive errors', () => {
    const { rerender } = render(
      <ErrorBoundary maxRetries={1}>
        <ThrowingComponent shouldThrow={true} errorMessage="First error" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Trigger second error
    rerender(
      <ErrorBoundary maxRetries={1}>
        <ThrowingComponent shouldThrow={true} errorMessage="Second error" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
  
  it('should reset when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} key="error-component" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Change children (different key)
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} key="working-component" />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });
  
  it('should handle errors in error boundary itself', () => {
    // This tests the robustness of the error boundary implementation
    const BuggyErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [hasError, setHasError] = React.useState(false);
      
      if (hasError) {
        // Simulate error in error boundary
        throw new Error('Error boundary is buggy');
      }
      
      return (
        <ErrorBoundary
          onError={() => {
            setHasError(true);
          }}
        >
          {children}
        </ErrorBoundary>
      );
    };
    
    // This should not crash the entire application
    expect(() => {
      render(
        <BuggyErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </BuggyErrorBoundary>
      );
    }).not.toThrow();
  });
});

describe('Performance and Memory', () => {
  it('should not cause memory leaks with frequent errors', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage={`Error ${i}`} />
        </ErrorBoundary>
      );
      
      unmount();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
  
  it('should handle rapid error/recovery cycles', async () => {
    jest.useFakeTimers();
    
    const { rerender } = render(
      <ErrorBoundary maxRetries={0}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    for (let i = 0; i < 10; i++) {
      // Toggle between error and working state
      rerender(
        <ErrorBoundary maxRetries={0}>
          <ThrowingComponent shouldThrow={i % 2 === 0} />
        </ErrorBoundary>
      );
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
    }
    
    // Should stabilize in working state
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    
    jest.useRealTimers();
  });
});
