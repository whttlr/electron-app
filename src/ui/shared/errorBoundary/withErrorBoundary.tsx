/**
 * Error Boundary HOC
 * Higher-order component for wrapping components with error boundaries
 */

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorBoundaryProps } from './types';

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}