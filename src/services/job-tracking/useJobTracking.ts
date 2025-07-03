/**
 * React Hook for Job Tracking
 * 
 * Provides easy access to job tracking functionality in React components
 */

import { useState, useEffect, useCallback } from 'react'
import { jobTrackingService, type ExtendedCncJob, type CncJob } from './index'

export interface UseJobTrackingReturn {
  // Current job state
  currentJob: ExtendedCncJob | null
  
  // Job history
  jobHistory: ExtendedCncJob[]
  isLoading: boolean
  error: string | null
  
  // Statistics
  statistics: {
    total: number
    completed: number
    failed: number
    running: number
    avgDuration: number
  }
  
  // Actions
  startJob: (jobData: { job_name: string; gcode_file?: string; machine_config_id?: string }) => Promise<ExtendedCncJob>
  pauseJob: () => Promise<void>
  resumeJob: () => Promise<void>
  completeJob: (status?: 'completed' | 'failed' | 'cancelled') => Promise<void>
  updateProgress: (progress: number) => void
  logPosition: (x: number, y: number, z: number) => void
  refreshHistory: () => Promise<void>
  refreshStatistics: () => Promise<void>
}

export function useJobTracking(): UseJobTrackingReturn {
  const [currentJob, setCurrentJob] = useState<ExtendedCncJob | null>(null)
  const [jobHistory, setJobHistory] = useState<ExtendedCncJob[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    avgDuration: 0
  })

  // Load initial data
  useEffect(() => {
    refreshHistory()
    refreshStatistics()
    
    // Get current job if any
    const current = jobTrackingService.getCurrentJob()
    setCurrentJob(current)
  }, [])

  // Refresh job history
  const refreshHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const history = await jobTrackingService.getJobHistory(50)
      setJobHistory(history)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job history'
      setError(errorMessage)
      console.error('Failed to refresh job history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh statistics
  const refreshStatistics = useCallback(async () => {
    try {
      const stats = await jobTrackingService.getJobStatistics()
      setStatistics(stats)
    } catch (err) {
      console.error('Failed to refresh statistics:', err)
    }
  }, [])

  // Start a new job
  const startJob = useCallback(async (jobData: { 
    job_name: string; 
    gcode_file?: string; 
    machine_config_id?: string 
  }): Promise<ExtendedCncJob> => {
    try {
      setError(null)
      const newJob = await jobTrackingService.startJob(jobData)
      setCurrentJob(newJob)
      
      // Refresh history and stats
      refreshHistory()
      refreshStatistics()
      
      return newJob
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start job'
      setError(errorMessage)
      throw err
    }
  }, [refreshHistory, refreshStatistics])

  // Pause current job
  const pauseJob = useCallback(async () => {
    try {
      setError(null)
      const updatedJob = await jobTrackingService.pauseCurrentJob()
      setCurrentJob(updatedJob)
      refreshHistory()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause job'
      setError(errorMessage)
      throw err
    }
  }, [refreshHistory])

  // Resume current job
  const resumeJob = useCallback(async () => {
    try {
      setError(null)
      const updatedJob = await jobTrackingService.resumeCurrentJob()
      setCurrentJob(updatedJob)
      refreshHistory()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume job'
      setError(errorMessage)
      throw err
    }
  }, [refreshHistory])

  // Complete current job
  const completeJob = useCallback(async (status: 'completed' | 'failed' | 'cancelled' = 'completed') => {
    try {
      setError(null)
      await jobTrackingService.completeCurrentJob(status)
      setCurrentJob(null)
      
      // Refresh history and stats
      refreshHistory()
      refreshStatistics()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete job'
      setError(errorMessage)
      throw err
    }
  }, [refreshHistory, refreshStatistics])

  // Update job progress
  const updateProgress = useCallback((progress: number) => {
    jobTrackingService.updateProgress(progress)
    
    // Update local state
    setCurrentJob(prev => prev ? { ...prev, progress } : null)
  }, [])

  // Log machine position
  const logPosition = useCallback((x: number, y: number, z: number) => {
    jobTrackingService.logPosition(x, y, z)
    
    // Update current job with latest position in local state
    setCurrentJob(prev => {
      if (!prev) return null
      
      const updatedPositionLog = [...(prev.position_log || []), {
        timestamp: new Date().toISOString(),
        x,
        y,
        z
      }]
      
      return {
        ...prev,
        position_log: updatedPositionLog
      }
    })
  }, [])

  return {
    // State
    currentJob,
    jobHistory,
    isLoading,
    error,
    statistics,
    
    // Actions
    startJob,
    pauseJob,
    resumeJob,
    completeJob,
    updateProgress,
    logPosition,
    refreshHistory,
    refreshStatistics
  }
}