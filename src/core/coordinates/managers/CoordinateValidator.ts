/**
 * Coordinate validation and safety checking
 */

import { Position, ValidationResult, MachineBounds, CoordinateError } from '../types/coordinate-types'
import { PositionValidationOptions } from '../types/position-types'
import { isValidPosition, isPositionWithinBounds } from '../utils/coordinate-math'

export class CoordinateValidator {
  private machineBounds?: MachineBounds
  private safetyLimits?: MachineBounds
  private logger?: any

  constructor(
    machineBounds?: MachineBounds,
    safetyLimits?: MachineBounds,
    logger?: any
  ) {
    this.machineBounds = machineBounds
    this.safetyLimits = safetyLimits
    this.logger = logger
  }

  // === BASIC VALIDATION ===

  /**
   * Validate a position for basic correctness
   */
  validatePosition(
    position: Position,
    options: PositionValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = []

    // Check for valid numbers
    if (!isValidPosition(position)) {
      errors.push('Position contains invalid numbers (NaN or infinite values)')
      return { isValid: false, errors }
    }

    // Check bounds if provided
    if (options.bounds) {
      if (!isPositionWithinBounds(position, options.bounds.min, options.bounds.max)) {
        errors.push(`Position is outside specified bounds`)
        this.addBoundsErrors(position, options.bounds, errors)
      }
    }

    // Check machine bounds
    if (this.machineBounds) {
      if (!isPositionWithinBounds(position, this.machineBounds.min, this.machineBounds.max)) {
        errors.push(`Position is outside machine bounds`)
        this.addBoundsErrors(position, this.machineBounds, errors)
      }
    }

    // Check safety limits
    if (this.safetyLimits) {
      if (!isPositionWithinBounds(position, this.safetyLimits.min, this.safetyLimits.max)) {
        errors.push(`Position exceeds safety limits`)
        this.addBoundsErrors(position, this.safetyLimits, errors)
      }
    }

    // Check negative values if not allowed
    if (options.allowNegative === false) {
      if (position.x < 0) errors.push(`X coordinate cannot be negative: ${position.x}`)
      if (position.y < 0) errors.push(`Y coordinate cannot be negative: ${position.y}`)
      if (position.z < 0) errors.push(`Z coordinate cannot be negative: ${position.z}`)
    }

    // Check maximum values
    if (options.maxValue !== undefined) {
      if (Math.abs(position.x) > options.maxValue) {
        errors.push(`X coordinate exceeds maximum value: ${position.x}`)
      }
      if (Math.abs(position.y) > options.maxValue) {
        errors.push(`Y coordinate exceeds maximum value: ${position.y}`)
      }
      if (Math.abs(position.z) > options.maxValue) {
        errors.push(`Z coordinate exceeds maximum value: ${position.z}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate WCS offset
   */
  validateWCSOffset(
    offset: Position,
    currentMachinePosition: Position,
    targetWCS: string
  ): ValidationResult {
    const errors: string[] = []

    // Validate the offset itself
    const offsetValidation = this.validatePosition(offset)
    if (!offsetValidation.isValid) {
      errors.push(`WCS offset is invalid: ${offsetValidation.errors.join(', ')}`)
    }

    // Calculate what the work position would be
    const calculatedWorkPosition = {
      x: currentMachinePosition.x - offset.x,
      y: currentMachinePosition.y - offset.y,
      z: currentMachinePosition.z - offset.z
    }

    // Validate the resulting work position
    const workValidation = this.validatePosition(calculatedWorkPosition)
    if (!workValidation.isValid) {
      errors.push(`WCS offset would result in invalid work position for ${targetWCS}`)
      errors.push(...workValidation.errors)
    }

    // Check if the offset makes sense (not extremely large)
    const MAX_REASONABLE_OFFSET = 10000 // 10 meters in mm
    if (
      Math.abs(offset.x) > MAX_REASONABLE_OFFSET ||
      Math.abs(offset.y) > MAX_REASONABLE_OFFSET ||
      Math.abs(offset.z) > MAX_REASONABLE_OFFSET
    ) {
      errors.push(`WCS offset seems unusually large - please verify`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate jog movement
   */
  validateJogMovement(
    currentPosition: Position,
    jogDistance: number,
    axis: 'x' | 'y' | 'z'
  ): ValidationResult {
    const errors: string[] = []

    // Check if jog distance is valid
    if (!isFinite(jogDistance) || isNaN(jogDistance)) {
      errors.push(`Invalid jog distance: ${jogDistance}`)
      return { isValid: false, errors }
    }

    // Calculate target position
    const targetPosition = { ...currentPosition }
    targetPosition[axis] += jogDistance

    // Validate target position
    const targetValidation = this.validatePosition(targetPosition)
    if (!targetValidation.isValid) {
      errors.push(`Jog movement would result in invalid position`)
      errors.push(...targetValidation.errors)
    }

    // Check for reasonable jog distances
    const MAX_JOG_DISTANCE = 1000 // 1 meter in mm
    if (Math.abs(jogDistance) > MAX_JOG_DISTANCE) {
      errors.push(`Jog distance is unusually large: ${jogDistance}mm`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate coordinate system conversion
   */
  validateCoordinateConversion(
    inputPosition: Position,
    outputPosition: Position,
    conversionType: 'machine-to-work' | 'work-to-machine',
    tolerance = 0.001
  ): ValidationResult {
    const errors: string[] = []

    // Validate input and output positions
    const inputValidation = this.validatePosition(inputPosition)
    const outputValidation = this.validatePosition(outputPosition)

    if (!inputValidation.isValid) {
      errors.push(`Input position invalid: ${inputValidation.errors.join(', ')}`)
    }

    if (!outputValidation.isValid) {
      errors.push(`Output position invalid: ${outputValidation.errors.join(', ')}`)
    }

    // Check for reasonable conversion (positions shouldn't be wildly different)
    const maxReasonableDifference = 50000 // 50 meters in mm
    const xDiff = Math.abs(inputPosition.x - outputPosition.x)
    const yDiff = Math.abs(inputPosition.y - outputPosition.y)
    const zDiff = Math.abs(inputPosition.z - outputPosition.z)

    if (xDiff > maxReasonableDifference) {
      errors.push(`Coordinate conversion X difference seems unreasonable: ${xDiff}mm`)
    }
    if (yDiff > maxReasonableDifference) {
      errors.push(`Coordinate conversion Y difference seems unreasonable: ${yDiff}mm`)
    }
    if (zDiff > maxReasonableDifference) {
      errors.push(`Coordinate conversion Z difference seems unreasonable: ${zDiff}mm`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // === SAFETY VALIDATION ===

  /**
   * Check if position is in safe operating zone
   */
  validateSafetyZone(position: Position): ValidationResult {
    if (!this.safetyLimits) {
      return { isValid: true, errors: [] }
    }

    const errors: string[] = []

    if (!isPositionWithinBounds(position, this.safetyLimits.min, this.safetyLimits.max)) {
      errors.push('Position is outside safe operating zone')
      this.addBoundsErrors(position, this.safetyLimits, errors, 'Safety limit')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate rapid movement for safety
   */
  validateRapidMovement(
    from: Position,
    to: Position,
    maxRapidDistance = 100
  ): ValidationResult {
    const errors: string[] = []

    // Calculate movement distance
    const distance = Math.sqrt(
      Math.pow(to.x - from.x, 2) +
      Math.pow(to.y - from.y, 2) +
      Math.pow(to.z - from.z, 2)
    )

    if (distance > maxRapidDistance) {
      errors.push(`Rapid movement distance (${distance.toFixed(2)}mm) exceeds safe limit`)
    }

    // Validate both positions
    const fromValidation = this.validateSafetyZone(from)
    const toValidation = this.validateSafetyZone(to)

    if (!fromValidation.isValid) {
      errors.push(`Start position unsafe: ${fromValidation.errors.join(', ')}`)
    }

    if (!toValidation.isValid) {
      errors.push(`End position unsafe: ${toValidation.errors.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // === CONFIGURATION ===

  /**
   * Update machine bounds
   */
  setMachineBounds(bounds: MachineBounds): void {
    this.machineBounds = bounds
  }

  /**
   * Update safety limits
   */
  setSafetyLimits(limits: MachineBounds): void {
    this.safetyLimits = limits
  }

  /**
   * Get current validation configuration
   */
  getConfiguration(): {
    machineBounds?: MachineBounds
    safetyLimits?: MachineBounds
  } {
    return {
      machineBounds: this.machineBounds,
      safetyLimits: this.safetyLimits
    }
  }

  // === ERROR CREATION ===

  /**
   * Create a coordinate error object
   */
  createError(
    type: CoordinateError['type'],
    message: string,
    details?: Record<string, any>
  ): CoordinateError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    }
  }

  // === UTILITY METHODS ===

  /**
   * Add specific bounds error messages
   */
  private addBoundsErrors(
    position: Position,
    bounds: MachineBounds,
    errors: string[],
    boundType = 'Bound'
  ): void {
    if (position.x < bounds.min.x) {
      errors.push(`X coordinate ${position.x} is below ${boundType.toLowerCase()} minimum ${bounds.min.x}`)
    }
    if (position.x > bounds.max.x) {
      errors.push(`X coordinate ${position.x} exceeds ${boundType.toLowerCase()} maximum ${bounds.max.x}`)
    }
    if (position.y < bounds.min.y) {
      errors.push(`Y coordinate ${position.y} is below ${boundType.toLowerCase()} minimum ${bounds.min.y}`)
    }
    if (position.y > bounds.max.y) {
      errors.push(`Y coordinate ${position.y} exceeds ${boundType.toLowerCase()} maximum ${bounds.max.y}`)
    }
    if (position.z < bounds.min.z) {
      errors.push(`Z coordinate ${position.z} is below ${boundType.toLowerCase()} minimum ${bounds.min.z}`)
    }
    if (position.z > bounds.max.z) {
      errors.push(`Z coordinate ${position.z} exceeds ${boundType.toLowerCase()} maximum ${bounds.max.z}`)
    }
  }

  /**
   * Log validation error if logger is available
   */
  private logError(error: CoordinateError): void {
    if (this.logger) {
      this.logger.error('Coordinate validation error', error)
    }
  }
}