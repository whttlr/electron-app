/**
 * Error Recovery Hook
 * React hook for error recovery functionality
 */

import React from 'react';
import { ErrorRecovery } from './ErrorRecovery';
import type { ErrorRecoveryHook } from './types';

export function useErrorRecovery(): ErrorRecoveryHook {
  const [error, setError] = React.useState<Error | null>(null);
  const [isRecovering, setIsRecovering] = React.useState(false);
  
  const recover = React.useCallback(async (strategy: string = 'reset-component') => {
    setIsRecovering(true);
    
    try {
      await ErrorRecovery.executeStrategy(strategy);
      setError(null);
    } catch (e) {
      console.error('Recovery failed:', e);
    } finally {
      setIsRecovering(false);
    }
  }, []);
  
  const throwError = React.useCallback((error: Error) => {
    setError(error);
    throw error;
  }, []);
  
  return {
    error,
    isRecovering,
    recover,
    throwError,
    strategies: ErrorRecovery.getAvailableStrategies(),
  };
}