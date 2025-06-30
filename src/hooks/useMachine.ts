import { useCallback } from 'react';
import { 
  useMachineState, 
  useJogSettings, 
  useIsConnected,
  useMachineActions,
  useJogActions
} from './useAppState';
import { machineController } from '../core/machine';
import { jogController } from '../core/positioning';
import { dimensionsController } from '../core/dimensions';

// Bridge hook that provides the same API as the old useMockMachine
export function useMachine() {
  const machineState = useMachineState();
  const isConnected = useIsConnected();
  const jogSettings = useJogSettings();
  const { setPosition } = useMachineActions();
  const { setSpeed, setMetric, setIncrement } = useJogActions();
  
  // Actions
  const jogMachine = useCallback(async (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    if (!isConnected) return;
    
    try {
      await jogController.jog(axis, direction);
      // Position will be updated through state manager
    } catch (error) {
      console.error('Jog error:', error);
    }
  }, [isConnected]);
  
  const home = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      await machineController.home();
      // Position will be updated to 0,0,0 through state manager
    } catch (error) {
      console.error('Home error:', error);
    }
  }, [isConnected]);
  
  const jog = useCallback((axis: 'x' | 'y' | 'z', direction: 1 | -1, distance: number) => {
    if (!isConnected) return;
    
    const currentPosition = machineState.position;
    const newPosition = { ...currentPosition };
    newPosition[axis] += direction * distance;
    
    // Apply bounds checking
    const bounded = dimensionsController.clampToWorkingArea(newPosition);
    setPosition(bounded);
  }, [isConnected, machineState.position, setPosition]);
  
  return {
    // State
    isConnected,
    toolPosition: machineState.position,
    position: machineState.position,
    isMetric: jogSettings.isMetric,
    jogSpeed: jogSettings.speed,
    jogDistance: jogSettings.increment,
    dimensions: machineState.dimensions,
    isHoming: machineState.isHoming,
    isMoving: machineState.isMoving,
    
    // Actions
    jogMachine,
    home,
    jog,
    setIsMetric: setMetric,
    setJogSpeed: setSpeed,
    setJogDistance: setIncrement,
    
    // Legacy compatibility
    setHighlightAxis: () => {}, // Handled by UI state now
    setHighlightPositionAxis: () => {}, // Handled by UI state now
    setHighlightedGizmoAxis: () => {} // Handled by UI state now
  };
}

// Alias for compatibility
export const useMockMachine = useMachine;