/**
 * Error Boundary Types
 * Type definitions for error handling and recovery
 */

import type { ReactNode, ErrorInfo } from 'react';
import type { ErrorBoundaryState } from '../../../stores/types';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
  showDetails?: boolean;
  enableRecovery?: boolean;
  maxRetries?: number;
}

export interface ErrorBoundaryInternalState extends ErrorBoundaryState {
  errorId: string;
  errorDetails?: string;
  stackTrace?: string;
  componentStack?: string;
  browserInfo?: string;
}

export interface ErrorReport {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: {
    componentStack?: string;
  };
  metadata: {
    errorId: string;
    timestamp: string;
    url: string;
    userAgent: string;
    retryCount: number;
  };
}

export interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export interface ErrorRecoveryHook {
  error: Error | null;
  isRecovering: boolean;
  recover: (strategy?: string) => Promise<void>;
  throwError: (error: Error) => void;
  strategies: string[];
}
