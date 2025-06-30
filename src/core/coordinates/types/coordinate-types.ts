/**
 * Core coordinate system type definitions
 */

export interface Position {
  x: number
  y: number
  z: number
}

export type WCSSystem = 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59'

export interface CoordinateSnapshot {
  machine: Position
  work: Position
  activeWCS: WCSSystem
  wcsOffsets: Record<WCSSystem, Position>
  timestamp: Date
}

export interface CoordinateSystemTypes {
  machine: {
    description: 'Physical position relative to machine home'
    origin: 'Machine home position (typically limit switches)'
    immutable: true
    reference: 'Always available, never changes meaning'
  }
  work: {
    description: 'User-defined coordinate systems with custom origins'
    origin: 'User-set work piece zero or fixture location'
    systems: WCSSystem[]
    mutable: true
    reference: 'Changes based on active WCS and offset values'
  }
  display: {
    description: 'What user sees in UI (can be machine or work)'
    configurable: true
    userPreference: 'machine' | 'work' | 'both'
    context: 'May change based on operation mode'
  }
}

export interface CoordinateRelationship {
  machinePosition: Position
  workOffset: Position
  workPosition: Position
  activeWCS: WCSSystem
  wcsOffsets: Record<WCSSystem, Position>
}

export interface MachineBounds {
  min: Position
  max: Position
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface CoordinateError {
  type: 'validation' | 'conversion' | 'bounds' | 'communication'
  message: string
  details?: Record<string, any>
  timestamp: Date
}

export interface PositionHistoryEntry {
  timestamp: Date
  machine: Position
  work: Position
  activeWCS: WCSSystem
}

export interface WCSProfile {
  name: string
  description?: string
  offsets: Record<WCSSystem, Position>
  createdAt: Date
  updatedAt: Date
}

export type CoordinateEventType = 
  | 'coordinates:position-updated'
  | 'coordinates:machine-position'
  | 'coordinates:work-position'
  | 'coordinates:wcs-changed'
  | 'coordinates:error'
  | 'coordinates:validation-failed'

export interface CoordinateEvents {
  'coordinates:position-updated': CoordinateSnapshot
  'coordinates:machine-position': Position
  'coordinates:work-position': Position
  'coordinates:wcs-changed': {
    active: WCSSystem
    offsets: Record<WCSSystem, Position>
  }
  'coordinates:error': CoordinateError
  'coordinates:validation-failed': {
    position: Position
    errors: string[]
  }
}