/**
 * Work Coordinate System specific type definitions
 */

import { Position, WCSSystem } from './coordinate-types'

export interface WCSOffsets {
  G54: Position
  G55: Position
  G56: Position
  G57: Position
  G58: Position
  G59: Position
}

export interface WCSManagerState {
  activeWCS: WCSSystem
  offsets: WCSOffsets
}

export interface WCSOperation {
  type: 'set-active' | 'set-offset' | 'zero-current' | 'copy-offset' | 'reset'
  wcs: WCSSystem
  data?: {
    position?: Position
    fromWCS?: WCSSystem
  }
}

export interface WCSCalibrationPoint {
  id: string
  description: string
  machinePosition: Position
  expectedWorkPosition: Position
  wcs: WCSSystem
  timestamp: Date
}

export interface WCSCalibrationSession {
  id: string
  name: string
  points: WCSCalibrationPoint[]
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  completedAt?: Date
}

export const WCS_SYSTEMS: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']

export const DEFAULT_WCS_OFFSETS: WCSOffsets = {
  G54: { x: 0, y: 0, z: 0 },
  G55: { x: 0, y: 0, z: 0 },
  G56: { x: 0, y: 0, z: 0 },
  G57: { x: 0, y: 0, z: 0 },
  G58: { x: 0, y: 0, z: 0 },
  G59: { x: 0, y: 0, z: 0 }
}