/**
 * Coordinate System Module - Public API
 */

// Main manager classes
export { CoordinateManager } from './managers/CoordinateManager'
export { WCSManager } from './managers/WCSManager'
export { CoordinateValidator } from './managers/CoordinateValidator'

// Type definitions
export type {
  Position,
  WCSSystem,
  CoordinateSnapshot,
  CoordinateSystemTypes,
  CoordinateRelationship,
  MachineBounds,
  ValidationResult,
  CoordinateError,
  PositionHistoryEntry,
  WCSProfile,
  CoordinateEventType,
  CoordinateEvents
} from './types/coordinate-types'

export type {
  WCSOffsets,
  WCSManagerState,
  WCSOperation,
  WCSCalibrationPoint,
  WCSCalibrationSession
} from './types/wcs-types'

export type {
  Axis,
  AxisPosition,
  PositionDelta,
  PositionBounds,
  PositionFormatOptions,
  PositionDisplayMode,
  PositionValidationOptions,
  PositionComparisonResult
} from './types/position-types'

// Utility functions
export {
  addPositions,
  subtractPositions,
  calculateDistance,
  calculateManhattanDistance,
  isPositionEqual,
  comparePositions,
  clampPosition,
  isPositionWithinBounds,
  scalePosition,
  roundPosition,
  clonePosition,
  isValidPosition,
  convertWorkDistanceToMachine,
  calculateCenter,
  calculateBounds
} from './utils/coordinate-math'

export {
  formatCoordinate,
  formatPosition,
  formatPositionCompact,
  formatPositionWithLabels,
  formatDualPosition,
  formatWCSOffset,
  formatAllWCSOffsets,
  formatPositionDifference,
  formatDistance,
  formatCoordinateForInput,
  parseCoordinateFromInput,
  parsePositionFromInputs,
  formatPositionForCSV,
  formatPositionForLog,
  createPositionDisplay,
  DEFAULT_FORMAT_OPTIONS
} from './utils/coordinate-formatting'

// Constants
export {
  WCS_SYSTEMS,
  DEFAULT_WCS_OFFSETS
} from './types/wcs-types'

export {
  ZERO_POSITION,
  AXES
} from './types/position-types'

// Configuration
import { coordinateConfig } from './config.js'
export { coordinateConfig }

// Factory function for creating coordinate manager with common setup
export function createCoordinateManager(options: {
  eventBus?: any
  logger?: any
  machineBounds?: MachineBounds
  safetyLimits?: MachineBounds
  initialPosition?: Position
  initialWCS?: WCSSystem
} = {}) {
  return new CoordinateManager({
    eventBus: options.eventBus,
    logger: options.logger,
    machineBounds: options.machineBounds,
    safetyLimits: options.safetyLimits,
    initialMachinePosition: options.initialPosition,
    initialActiveWCS: options.initialWCS
  })
}

// Utility for creating default machine bounds
export function createMachineBounds(
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number
): MachineBounds {
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  }
}

// Utility for creating position objects
export function createPosition(x: number, y: number, z: number): Position {
  return { x, y, z }
}