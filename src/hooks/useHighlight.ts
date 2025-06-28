import { useCallback } from 'react';
import { useHighlightedAxis, useMachineActions } from './useAppState';

export function useHighlight() {
  const highlightedAxis = useHighlightedAxis();
  const { setHighlightedAxis } = useMachineActions();
  
  const setHighlightAxis = useCallback((axis: 'x' | 'y' | 'z' | null) => {
    setHighlightedAxis(axis);
  }, [setHighlightedAxis]);
  
  const setHighlightPositionAxis = useCallback((axis: 'x' | 'y' | 'z' | null) => {
    setHighlightedAxis(axis);
  }, [setHighlightedAxis]);
  
  const setHighlightedGizmoAxis = useCallback((axis: 'x' | 'y' | 'z' | null) => {
    setHighlightedAxis(axis);
  }, [setHighlightedAxis]);
  
  return {
    highlightedAxis,
    setHighlightAxis,
    setHighlightPositionAxis,
    setHighlightedGizmoAxis
  };
}

// Alias for compatibility
export const useMockHighlight = useHighlight;