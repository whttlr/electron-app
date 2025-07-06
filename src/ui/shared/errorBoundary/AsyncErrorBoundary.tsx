/**
 * Async Error Boundary
 * Extended error boundary that handles promise rejections
 */

import { ErrorBoundary } from './ErrorBoundary';

export class AsyncErrorBoundary extends ErrorBoundary {
  private asyncErrors: Error[] = [];

  componentDidMount(): void {
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = new Error(
      event.reason?.message || event.reason?.toString() || 'Unhandled promise rejection',
    );

    error.name = 'UnhandledPromiseRejection';
    (error as any).reason = event.reason;
    (error as any).promise = event.promise;

    this.asyncErrors.push(error);

    // Trigger error boundary
    this.setState({
      hasError: true,
      error,
      errorId: `async-error-${Date.now()}`,
      lastError: new Date(),
    });

    // Prevent default browser behavior
    event.preventDefault();
  };
}
