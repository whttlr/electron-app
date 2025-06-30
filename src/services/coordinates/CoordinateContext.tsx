/**
 * React Context for Coordinate System Management
 * Provides coordinate manager instance to the entire application
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CoordinateManager, createCoordinateManager, MachineBounds } from '../../core/coordinates'
import { EventBus } from '../events/EventBus'
import { LoggerService } from '../logger/LoggerService'

interface CoordinateContextValue {
  coordinateManager: CoordinateManager | null
  isReady: boolean
  error: string | null
}

const CoordinateContext = createContext<CoordinateContextValue>({
  coordinateManager: null,
  isReady: false,
  error: null
})

interface CoordinateProviderProps {
  children: ReactNode
  eventBus?: EventBus
  logger?: LoggerService
  machineBounds?: MachineBounds
  safetyLimits?: MachineBounds
  autoInitialize?: boolean
}

/**
 * Provides coordinate manager instance to child components
 */
export function CoordinateProvider({
  children,
  eventBus,
  logger,
  machineBounds,
  safetyLimits,
  autoInitialize = true
}: CoordinateProviderProps) {
  const [coordinateManager, setCoordinateManager] = useState<CoordinateManager | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoInitialize) return

    try {
      // Create coordinate manager
      const manager = createCoordinateManager({
        eventBus,
        logger,
        machineBounds,
        safetyLimits,
        initialPosition: { x: 0, y: 0, z: 0 },
        initialWCS: 'G54'
      })

      // Set up error handling
      manager.on('coordinates:error', (error) => {
        logger?.error('Coordinate system error', error)
        setError(error.message)
      })

      setCoordinateManager(manager)
      setIsReady(true)
      setError(null)

      logger?.info('Coordinate system initialized')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error initializing coordinate system'
      setError(errorMessage)
      logger?.error('Failed to initialize coordinate system', err)
    }

    return () => {
      if (coordinateManager) {
        coordinateManager.dispose()
      }
    }
  }, [autoInitialize, eventBus, logger, machineBounds, safetyLimits])

  const contextValue: CoordinateContextValue = {
    coordinateManager,
    isReady,
    error
  }

  return (
    <CoordinateContext.Provider value={contextValue}>
      {children}
    </CoordinateContext.Provider>
  )
}

/**
 * Hook to access coordinate manager from context
 */
export function useCoordinateManager(): CoordinateManager | null {
  const context = useContext(CoordinateContext)
  return context.coordinateManager
}

/**
 * Hook to access coordinate context state
 */
export function useCoordinateContext(): CoordinateContextValue {
  const context = useContext(CoordinateContext)
  if (!context) {
    throw new Error('useCoordinateContext must be used within a CoordinateProvider')
  }
  return context
}

/**
 * Hook with coordinate manager availability check
 */
export function useCoordinateManagerRequired(): CoordinateManager {
  const { coordinateManager, isReady, error } = useCoordinateContext()
  
  if (error) {
    throw new Error(`Coordinate system error: ${error}`)
  }
  
  if (!isReady || !coordinateManager) {
    throw new Error('Coordinate manager not ready')
  }
  
  return coordinateManager
}