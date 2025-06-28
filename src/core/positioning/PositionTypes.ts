import { Position } from '../machine/MachineTypes';

export interface JogSettings {
  speed: number;
  increment: number;
  isMetric: boolean;
}

export interface PositionBounds {
  min: Position;
  max: Position;
}

export interface JogCommand {
  axis: keyof Position;
  distance: number;
  speed?: number;
}

export interface PositionValidation {
  isValid: boolean;
  errors?: string[];
}

export interface ScaledPosition {
  machine: Position;
  display: Position;
}