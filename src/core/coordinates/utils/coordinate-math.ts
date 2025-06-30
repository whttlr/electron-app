/**
 * Mathematical operations for coordinate systems
 */

import { Position, PositionDelta, PositionComparisonResult } from '../types/position-types'

/**
 * Add two positions together
 */
export function addPositions(a: Position, b: Position): Position {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  }
}

/**
 * Subtract position b from position a
 */
export function subtractPositions(a: Position, b: Position): Position {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  }
}

/**
 * Calculate the distance between two positions
 */
export function calculateDistance(a: Position, b: Position): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate Manhattan distance between two positions
 */
export function calculateManhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)
}

/**
 * Check if two positions are equal within a tolerance
 */
export function isPositionEqual(a: Position, b: Position, tolerance = 0.001): boolean {
  return (
    Math.abs(a.x - b.x) <= tolerance &&
    Math.abs(a.y - b.y) <= tolerance &&
    Math.abs(a.z - b.z) <= tolerance
  )
}

/**
 * Compare two positions and return detailed comparison result
 */
export function comparePositions(a: Position, b: Position, tolerance = 0.001): PositionComparisonResult {
  const differences: PositionDelta = {
    x: Math.abs(a.x - b.x),
    y: Math.abs(a.y - b.y),
    z: Math.abs(a.z - b.z)
  }

  const maxDifference = Math.max(differences.x, differences.y, differences.z)
  const withinTolerance = maxDifference <= tolerance

  return {
    isEqual: withinTolerance,
    differences,
    maxDifference,
    withinTolerance
  }
}

/**
 * Clamp a position within bounds
 */
export function clampPosition(position: Position, min: Position, max: Position): Position {
  return {
    x: Math.max(min.x, Math.min(max.x, position.x)),
    y: Math.max(min.y, Math.min(max.y, position.y)),
    z: Math.max(min.z, Math.min(max.z, position.z))
  }
}

/**
 * Check if a position is within bounds
 */
export function isPositionWithinBounds(position: Position, min: Position, max: Position): boolean {
  return (
    position.x >= min.x && position.x <= max.x &&
    position.y >= min.y && position.y <= max.y &&
    position.z >= min.z && position.z <= max.z
  )
}

/**
 * Scale a position by a factor
 */
export function scalePosition(position: Position, scale: number): Position {
  return {
    x: position.x * scale,
    y: position.y * scale,
    z: position.z * scale
  }
}

/**
 * Round position values to specified decimal places
 */
export function roundPosition(position: Position, decimals = 3): Position {
  const factor = Math.pow(10, decimals)
  return {
    x: Math.round(position.x * factor) / factor,
    y: Math.round(position.y * factor) / factor,
    z: Math.round(position.z * factor) / factor
  }
}

/**
 * Create a copy of a position
 */
export function clonePosition(position: Position): Position {
  return {
    x: position.x,
    y: position.y,
    z: position.z
  }
}

/**
 * Check if position values are finite numbers
 */
export function isValidPosition(position: Position): boolean {
  return (
    isFinite(position.x) &&
    isFinite(position.y) &&
    isFinite(position.z) &&
    !isNaN(position.x) &&
    !isNaN(position.y) &&
    !isNaN(position.z)
  )
}

/**
 * Convert work distance to machine distance (for jogging)
 * In most cases this is a 1:1 conversion, but this function
 * provides a place for any future coordinate system transformations
 */
export function convertWorkDistanceToMachine(distance: number, axis: 'x' | 'y' | 'z'): number {
  // For now, distances are 1:1 between coordinate systems
  // This could be extended for scaled coordinate systems
  return distance
}

/**
 * Calculate center point between two positions
 */
export function calculateCenter(a: Position, b: Position): Position {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2
  }
}

/**
 * Find the minimum bounding box for an array of positions
 */
export function calculateBounds(positions: Position[]): { min: Position; max: Position } | null {
  if (positions.length === 0) return null

  const first = positions[0]
  let min = clonePosition(first)
  let max = clonePosition(first)

  for (let i = 1; i < positions.length; i++) {
    const pos = positions[i]
    min.x = Math.min(min.x, pos.x)
    min.y = Math.min(min.y, pos.y)
    min.z = Math.min(min.z, pos.z)
    max.x = Math.max(max.x, pos.x)
    max.y = Math.max(max.y, pos.y)
    max.z = Math.max(max.z, pos.z)
  }

  return { min, max }
}