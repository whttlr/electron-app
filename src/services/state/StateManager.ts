import { AppState, StateSelector, StateListener, StateUpdater, StateSubscription, StateManagerConfig } from './StateTypes';
import { eventBus } from '../events';
import { logger } from '../logger';
import machineConfig from '@config/machine.json';

export class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();
  private selectorListeners: Map<StateSelector<any>, Set<StateListener<any>>> = new Map();
  private config: StateManagerConfig;
  private history: AppState[] = [];

  constructor(config: Partial<StateManagerConfig> = {}) {
    this.config = {
      enableDevtools: false,
      enableTimeTravel: false,
      maxHistorySize: 50,
      ...config
    };

    this.state = config.initialState || this.createInitialState();
    
    if (this.config.enableTimeTravel) {
      this.history.push(this.deepClone(this.state));
    }
  }

  private createInitialState(): AppState {
    return {
      machine: {
        isConnected: false,
        position: { ...machineConfig.defaultPosition },
        dimensions: { ...machineConfig.defaultDimensions },
        isHoming: false,
        isMoving: false
      },
      jog: {
        speed: machineConfig.jogSettings.defaultSpeed,
        increment: 1,
        isMetric: true
      },
      ui: {
        highlightedAxis: null,
        showDebugPanel: false,
        activeTab: 'jog',
        theme: 'light'
      },
      system: {
        units: 'metric',
        initialized: false
      }
    };
  }

  // State Access
  getState(): AppState {
    return this.deepClone(this.state);
  }

  select<T>(selector: StateSelector<T>): T {
    return selector(this.state);
  }

  // State Updates
  setState(updater: StateUpdater<AppState>): void {
    const prevState = this.deepClone(this.state);
    const newState = updater(this.deepClone(this.state));
    
    if (this.hasStateChanged(prevState, newState)) {
      this.updateState(newState, prevState);
    }
  }

  updateMachine(updater: StateUpdater<AppState['machine']>): void {
    this.setState(state => ({
      ...state,
      machine: updater(state.machine)
    }));
  }

  updateJog(updater: StateUpdater<AppState['jog']>): void {
    this.setState(state => ({
      ...state,
      jog: updater(state.jog)
    }));
  }

  updateUI(updater: StateUpdater<AppState['ui']>): void {
    this.setState(state => ({
      ...state,
      ui: updater(state.ui)
    }));
  }

  updateSystem(updater: StateUpdater<AppState['system']>): void {
    this.setState(state => ({
      ...state,
      system: updater(state.system)
    }));
  }

  // Direct setters for common operations
  setConnected(connected: boolean): void {
    this.updateMachine(machine => ({ ...machine, isConnected: connected }));
  }

  setPosition(position: Partial<AppState['machine']['position']>): void {
    this.updateMachine(machine => ({
      ...machine,
      position: { ...machine.position, ...position }
    }));
  }

  setHighlightedAxis(axis: 'x' | 'y' | 'z' | null): void {
    this.updateUI(ui => ({ ...ui, highlightedAxis: axis }));
  }

  setJogSettings(settings: Partial<AppState['jog']>): void {
    this.updateJog(jog => ({ ...jog, ...settings }));
  }

  setUnits(units: AppState['system']['units']): void {
    this.updateSystem(system => ({ ...system, units }));
    
    // Update jog increment for new unit system
    const defaultIncrement = units === 'metric' ? 1 : 0.0625;
    this.setJogSettings({ increment: defaultIncrement });
  }

  // Subscriptions
  subscribe(listener: StateListener<AppState>): StateSubscription {
    this.listeners.add(listener);
    
    return {
      unsubscribe: () => {
        this.listeners.delete(listener);
      }
    };
  }

  subscribeToSelector<T>(
    selector: StateSelector<T>, 
    listener: StateListener<T>
  ): StateSubscription {
    if (!this.selectorListeners.has(selector)) {
      this.selectorListeners.set(selector, new Set());
    }
    
    this.selectorListeners.get(selector)!.add(listener);
    
    return {
      unsubscribe: () => {
        const listeners = this.selectorListeners.get(selector);
        if (listeners) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            this.selectorListeners.delete(selector);
          }
        }
      }
    };
  }

  // Time Travel (if enabled)
  undo(): void {
    if (!this.config.enableTimeTravel || this.history.length <= 1) {
      logger.warn('Cannot undo: no history available');
      return;
    }

    this.history.pop(); // Remove current state
    const previousState = this.history[this.history.length - 1];
    this.state = this.deepClone(previousState);
    
    this.notifyListeners(this.state);
    eventBus.emit('state:undo', { state: this.state });
  }

  getHistory(): AppState[] {
    return this.history.map(state => this.deepClone(state));
  }

  clearHistory(): void {
    this.history = [this.deepClone(this.state)];
  }

  // Reset
  reset(): void {
    const prevState = this.deepClone(this.state);
    this.state = this.createInitialState();
    
    if (this.config.enableTimeTravel) {
      this.history = [this.deepClone(this.state)];
    }

    this.notifyListeners(this.state, prevState);
    eventBus.emit('state:reset', { state: this.state });
  }

  // Private methods
  private updateState(newState: AppState, prevState: AppState): void {
    this.state = newState;

    if (this.config.enableTimeTravel) {
      this.history.push(this.deepClone(newState));
      
      if (this.history.length > this.config.maxHistorySize) {
        this.history = this.history.slice(-this.config.maxHistorySize);
      }
    }

    this.notifyListeners(newState, prevState);
    eventBus.emit('state:changed', { newState, prevState });
  }

  private notifyListeners(newState: AppState, prevState?: AppState): void {
    // Notify global listeners
    this.listeners.forEach(listener => {
      try {
        listener(newState, prevState);
      } catch (error) {
        logger.error('State listener error', { error });
      }
    });

    // Notify selector listeners
    this.selectorListeners.forEach((listeners, selector) => {
      try {
        const newValue = selector(newState);
        const prevValue = prevState ? selector(prevState) : undefined;
        
        if (this.hasValueChanged(prevValue, newValue)) {
          listeners.forEach(listener => {
            try {
              listener(newValue, prevValue);
            } catch (error) {
              logger.error('Selector listener error', { error });
            }
          });
        }
      } catch (error) {
        logger.error('Selector execution error', { error });
      }
    });
  }

  private hasStateChanged(prev: AppState, next: AppState): boolean {
    return JSON.stringify(prev) !== JSON.stringify(next);
  }

  private hasValueChanged(prev: any, next: any): boolean {
    return JSON.stringify(prev) !== JSON.stringify(next);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // Development helpers
  getStats() {
    return {
      listenerCount: this.listeners.size,
      selectorCount: this.selectorListeners.size,
      historySize: this.history.length,
      state: this.state
    };
  }
}