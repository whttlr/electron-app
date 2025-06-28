import { Position, MachineState } from '../../core/machine/MachineTypes';
import { JogSettings } from '../../core/positioning/PositionTypes';
import { UnitSystem } from '../../core/units/UnitTypes';

export interface AppState {
  machine: MachineState;
  jog: JogSettings;
  ui: UIState;
  system: SystemState;
}

export interface UIState {
  highlightedAxis: 'x' | 'y' | 'z' | null;
  showDebugPanel: boolean;
  activeTab: string;
  theme: 'light' | 'dark';
}

export interface SystemState {
  units: UnitSystem;
  initialized: boolean;
  lastError?: string;
}

export type StateSelector<T> = (state: AppState) => T;
export type StateListener<T = AppState> = (state: T, prevState?: T) => void;
export type StateUpdater<T> = (currentState: T) => T;

export interface StateSubscription {
  unsubscribe(): void;
}

export interface StateManagerConfig {
  enableDevtools: boolean;
  enableTimeTravel: boolean;
  maxHistorySize: number;
  initialState?: AppState;
}