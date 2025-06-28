import { useState, useEffect, useCallback } from 'react';
import { stateManager } from '../services';
import { AppState, StateSelector } from '../services/state/StateTypes';
import { Position } from '../core/positioning/PositionTypes';
import { JogSettings } from '../core/positioning/JogTypes';

// Full state hook
export function useAppState(): AppState {
  const [state, setState] = useState(() => stateManager.getState());
  
  useEffect(() => {
    const subscription = stateManager.subscribe(setState);
    return subscription.unsubscribe;
  }, []);
  
  return state;
}

// Machine state hooks
export function useMachineState() {
  const [state, setState] = useState(() => 
    stateManager.select(state => state.machine)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.machine,
      setState
    );
    return subscription.unsubscribe;
  }, []);
  
  return state;
}

export function useMachinePosition(): Position {
  const [position, setPosition] = useState(() => 
    stateManager.select(state => state.machine.position)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.machine.position,
      setPosition
    );
    return subscription.unsubscribe;
  }, []);
  
  return position;
}

export function useIsConnected(): boolean {
  const [isConnected, setIsConnected] = useState(() =>
    stateManager.select(state => state.machine.isConnected)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.machine.isConnected,
      setIsConnected
    );
    return subscription.unsubscribe;
  }, []);
  
  return isConnected;
}

// Jog state hooks
export function useJogSettings(): JogSettings & { isMetric: boolean } {
  const [settings, setSettings] = useState(() => 
    stateManager.select(state => state.jog)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.jog,
      setSettings
    );
    return subscription.unsubscribe;
  }, []);
  
  return settings;
}

// UI state hooks
export function useHighlightedAxis(): 'x' | 'y' | 'z' | null {
  const [axis, setAxis] = useState(() =>
    stateManager.select(state => state.ui.highlightedAxis)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.ui.highlightedAxis,
      setAxis
    );
    return subscription.unsubscribe;
  }, []);
  
  return axis;
}

export function useShowDebugPanel(): boolean {
  const [show, setShow] = useState(() =>
    stateManager.select(state => state.ui.showDebugPanel)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.ui.showDebugPanel,
      setShow
    );
    return subscription.unsubscribe;
  }, []);
  
  return show;
}

// System state hooks
export function useUnits(): 'metric' | 'imperial' {
  const [units, setUnits] = useState(() =>
    stateManager.select(state => state.system.units)
  );
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(
      state => state.system.units,
      setUnits
    );
    return subscription.unsubscribe;
  }, []);
  
  return units;
}

// Action hooks
export function useMachineActions() {
  return {
    setConnected: useCallback((connected: boolean) => {
      stateManager.setConnected(connected);
    }, []),
    
    setPosition: useCallback((position: Partial<Position>) => {
      stateManager.setPosition(position);
    }, []),
    
    setHighlightedAxis: useCallback((axis: 'x' | 'y' | 'z' | null) => {
      stateManager.setHighlightedAxis(axis);
    }, [])
  };
}

export function useJogActions() {
  return {
    setJogSettings: useCallback((settings: Partial<JogSettings>) => {
      stateManager.setJogSettings(settings);
    }, []),
    
    setSpeed: useCallback((speed: number) => {
      stateManager.setJogSettings({ speed });
    }, []),
    
    setIncrement: useCallback((increment: number) => {
      stateManager.setJogSettings({ increment });
    }, []),
    
    setMetric: useCallback((isMetric: boolean) => {
      stateManager.setJogSettings({ isMetric });
      stateManager.setUnits(isMetric ? 'metric' : 'imperial');
    }, [])
  };
}

export function useUIActions() {
  return {
    toggleDebugPanel: useCallback(() => {
      stateManager.updateUI(ui => ({
        ...ui,
        showDebugPanel: !ui.showDebugPanel
      }));
    }, []),
    
    setActiveTab: useCallback((tab: string) => {
      stateManager.updateUI(ui => ({ ...ui, activeTab: tab }));
    }, [])
  };
}

// Custom selector hook
export function useSelector<T>(selector: StateSelector<T>): T {
  const [value, setValue] = useState(() => stateManager.select(selector));
  
  useEffect(() => {
    const subscription = stateManager.subscribeToSelector(selector, setValue);
    return subscription.unsubscribe;
  }, [selector]);
  
  return value;
}