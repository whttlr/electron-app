import { MachineDimensions, Position } from '../machine/MachineTypes';

export interface WorkingArea {
  dimensions: MachineDimensions;
  origin: Position;
  bounds: {
    min: Position;
    max: Position;
  };
}

export interface ViewportDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface DisplayArea {
  scale: number;
  offset: Position;
  rotation: number;
}

export interface DimensionCalculation {
  area: number;
  volume: number;
  diagonal: number;
  perimeter: number;
}