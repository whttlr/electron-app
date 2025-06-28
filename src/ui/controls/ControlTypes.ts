import { Position } from '../../core/machine/MachineTypes';

export interface JogControlProps {
  onJog: (axis: keyof Position, direction: 1 | -1, distance: number) => void;
  onHome: () => void;
  disabled?: boolean;
  jogSettings: {
    speed: number;
    increment: number;
    isMetric: boolean;
  };
  onSettingsChange: (settings: Partial<JogControlProps['jogSettings']>) => void;
  position: Position;
  isConnected: boolean;
  onAxisHighlight?: (axis: keyof Position | null) => void;
}

export interface AxisControlProps {
  axis: keyof Position;
  label: string;
  color: string;
  onJog: (direction: 1 | -1) => void;
  disabled?: boolean;
  onHighlight?: () => void;
  onClearHighlight?: () => void;
}

export interface PositionDisplayProps {
  position: Position;
  unit: string;
  precision?: number;
  showLabels?: boolean;
  highlightedAxis?: keyof Position | null;
}

export interface JogSettingsProps {
  speed: number;
  increment: number;
  isMetric: boolean;
  onSpeedChange: (speed: number) => void;
  onIncrementChange: (increment: number) => void;
  onUnitChange: (isMetric: boolean) => void;
  disabled?: boolean;
  showDebug?: boolean;
  onDebugToggle?: () => void;
}