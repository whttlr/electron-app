/**
 * Coordinate display formatting utilities
 */

import { Position, PositionFormatOptions, PositionDisplayMode } from '../types/position-types'
import { WCSSystem } from '../types/coordinate-types'

/**
 * Default formatting options
 */
export const DEFAULT_FORMAT_OPTIONS: PositionFormatOptions = {
  precision: 3,
  unit: 'mm',
  showUnit: true,
  showSign: false
}

/**
 * Format a single coordinate value
 */
export function formatCoordinate(
  value: number, 
  options: Partial<PositionFormatOptions> = {}
): string {
  const opts = { ...DEFAULT_FORMAT_OPTIONS, ...options }
  
  let formatted = value.toFixed(opts.precision)
  
  if (opts.showSign && value >= 0) {
    formatted = '+' + formatted
  }
  
  if (opts.showUnit) {
    formatted += opts.unit
  }
  
  return formatted
}

/**
 * Format a position object
 */
export function formatPosition(
  position: Position, 
  options: Partial<PositionFormatOptions> = {}
): string {
  const opts = { ...DEFAULT_FORMAT_OPTIONS, ...options }
  
  const x = formatCoordinate(position.x, opts)
  const y = formatCoordinate(position.y, opts)
  const z = formatCoordinate(position.z, opts)
  
  return `X:${x} Y:${y} Z:${z}`
}

/**
 * Format position for compact display (e.g., status bar)
 */
export function formatPositionCompact(
  position: Position, 
  precision = 2
): string {
  return `X:${position.x.toFixed(precision)} Y:${position.y.toFixed(precision)} Z:${position.z.toFixed(precision)}`
}

/**
 * Format position with labels
 */
export function formatPositionWithLabels(
  position: Position,
  label: string,
  options: Partial<PositionFormatOptions> = {}
): string {
  const formatted = formatPosition(position, options)
  return `${label}: ${formatted}`
}

/**
 * Format dual position display (machine and work)
 */
export function formatDualPosition(
  machinePos: Position,
  workPos: Position,
  activeWCS: WCSSystem,
  options: Partial<PositionFormatOptions> = {}
): {
  machine: string
  work: string
  combined: string
} {
  const machine = formatPositionWithLabels(machinePos, 'Machine', options)
  const work = formatPositionWithLabels(workPos, activeWCS, options)
  const combined = `${machine} | ${work}`
  
  return { machine, work, combined }
}

/**
 * Format WCS offset display
 */
export function formatWCSOffset(
  wcs: WCSSystem,
  offset: Position,
  options: Partial<PositionFormatOptions> = {}
): string {
  return `${wcs} Offset: ${formatPosition(offset, options)}`
}

/**
 * Format all WCS offsets
 */
export function formatAllWCSOffsets(
  offsets: Record<WCSSystem, Position>,
  activeWCS: WCSSystem,
  options: Partial<PositionFormatOptions> = {}
): string[] {
  const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
  
  return wcsSystems.map(wcs => {
    const isActive = wcs === activeWCS
    const prefix = isActive ? '→ ' : '  '
    const suffix = isActive ? ' (Active)' : ''
    return `${prefix}${formatWCSOffset(wcs, offsets[wcs], options)}${suffix}`
  })
}

/**
 * Format position difference
 */
export function formatPositionDifference(
  from: Position,
  to: Position,
  options: Partial<PositionFormatOptions> = {}
): string {
  const diff = {
    x: to.x - from.x,
    y: to.y - from.y,
    z: to.z - from.z
  }
  
  return `Δ${formatPosition(diff, { ...options, showSign: true })}`
}

/**
 * Format distance between positions
 */
export function formatDistance(
  distance: number,
  unit: 'mm' | 'inch' = 'mm',
  precision = 3
): string {
  return `${distance.toFixed(precision)}${unit}`
}

/**
 * Format coordinate for input field (remove units, etc.)
 */
export function formatCoordinateForInput(value: number, precision = 3): string {
  return value.toFixed(precision)
}

/**
 * Parse coordinate from string input
 */
export function parseCoordinateFromInput(input: string): number | null {
  const trimmed = input.trim().replace(/[^\d\-\+\.]/g, '')
  const parsed = parseFloat(trimmed)
  return isNaN(parsed) ? null : parsed
}

/**
 * Parse position from input strings
 */
export function parsePositionFromInputs(
  xInput: string,
  yInput: string,
  zInput: string
): Position | null {
  const x = parseCoordinateFromInput(xInput)
  const y = parseCoordinateFromInput(yInput)
  const z = parseCoordinateFromInput(zInput)
  
  if (x === null || y === null || z === null) {
    return null
  }
  
  return { x, y, z }
}

/**
 * Format position for CSV export
 */
export function formatPositionForCSV(position: Position): string {
  return `${position.x},${position.y},${position.z}`
}

/**
 * Format position for logging
 */
export function formatPositionForLog(
  position: Position,
  context?: string
): string {
  const formatted = formatPosition(position, { precision: 4, showUnit: false })
  return context ? `${context}: ${formatted}` : formatted
}

/**
 * Create position display based on mode
 */
export function createPositionDisplay(
  machinePos: Position,
  workPos: Position,
  activeWCS: WCSSystem,
  mode: PositionDisplayMode
): {
  primary: string
  secondary?: string
  label: string
} {
  const opts: PositionFormatOptions = {
    precision: mode.precision,
    unit: 'mm',
    showUnit: true,
    showSign: false
  }
  
  switch (mode.mode) {
    case 'machine':
      return {
        primary: formatPosition(machinePos, opts),
        label: mode.showLabels ? 'Machine' : ''
      }
    
    case 'work':
      return {
        primary: formatPosition(workPos, opts),
        label: mode.showLabels ? activeWCS : ''
      }
    
    case 'both':
      return {
        primary: formatPosition(workPos, opts),
        secondary: formatPosition(machinePos, opts),
        label: mode.showLabels ? `${activeWCS} | Machine` : ''
      }
    
    default:
      return {
        primary: formatPosition(workPos, opts),
        label: mode.showLabels ? activeWCS : ''
      }
  }
}