/**
 * Position-specific type definitions and utilities
 */

import { Position } from './coordinate-types'

export type Axis = 'x' | 'y' | 'z'

export interface AxisPosition {
  axis: Axis
  value: number
}

export interface PositionDelta {
  x: number
  y: number
  z: number
}

export interface PositionBounds {
  min: Position
  max: Position
  center: Position
}

export interface PositionFormatOptions {
  precision: number
  unit: 'mm' | 'inch'
  showUnit: boolean
  showSign: boolean
}

export interface PositionDisplayMode {
  mode: 'machine' | 'work' | 'both'
  precision: number
  showLabels: boolean
}

export interface PositionValidationOptions {
  bounds?: PositionBounds
  tolerance?: number
  allowNegative?: boolean
  maxValue?: number
}

export interface PositionComparisonResult {
  isEqual: boolean
  differences: PositionDelta
  maxDifference: number
  withinTolerance: boolean
}

export const ZERO_POSITION: Position = { x: 0, y: 0, z: 0 }

export const AXES: Axis[] = ['x', 'y', 'z']