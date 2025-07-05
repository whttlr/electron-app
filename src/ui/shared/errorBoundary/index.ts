/**
 * Error Boundary Module
 * 
 * Comprehensive error handling with recovery strategies,
 * error reporting, and user-friendly error displays.
 */

export * from './types';
export { ErrorRecovery } from './ErrorRecovery';
export { ErrorBoundary } from './ErrorBoundary';
export { MinimalErrorFallback, InlineErrorFallback } from './fallbacks';
export { withErrorBoundary } from './withErrorBoundary';
export { useErrorRecovery } from './useErrorRecovery';
export { AsyncErrorBoundary } from './AsyncErrorBoundary';

// Default export for backward compatibility
export { ErrorBoundary as default } from './ErrorBoundary';