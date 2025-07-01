import { useState, useEffect, useContext } from 'react'
import { MachineStatusContext } from '../contexts/MachineStatusContext'
import { PluginAPI } from '@cnc-jog-controls/plugin-api'

export interface MachineStatus {
  state: string
  mode: string
  feedRate: number
  spindleSpeed: number
  coolant: boolean
  tool: number
}

export interface Position {
  x: number
  y: number
  z: number
  a?: number
  b?: number
  c?: number
}

export interface Alarm {
  id: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  timestamp: Date
  acknowledged: boolean
}

export interface PerformanceData {
  timestamp: number
  feedRate: number
  spindleLoad: number
  axisLoad: {
    x: number
    y: number
    z: number
  }
}

export const useMachineStatus = () => {
  const context = useContext(MachineStatusContext)
  
  if (!context) {
    throw new Error('useMachineStatus must be used within MachineStatusProvider')
  }

  const { api, updateInterval } = context

  const [status, setStatus] = useState<MachineStatus>({
    state: 'Idle',
    mode: 'Manual',
    feedRate: 100,
    spindleSpeed: 0,
    coolant: false,
    tool: 1
  })

  const [position, setPosition] = useState<{
    work: Position
    machine: Position
    offset: Position
  }>({
    work: { x: 0, y: 0, z: 0 },
    machine: { x: 0, y: 0, z: 0 },
    offset: { x: 0, y: 0, z: 0 }
  })

  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [performance, setPerformance] = useState<PerformanceData[]>([])
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Subscribe to machine status updates
    const handleStatusUpdate = (data: any) => {
      setStatus(prev => ({
        ...prev,
        ...data
      }))
    }

    const handlePositionUpdate = (data: any) => {
      setPosition(prev => ({
        ...prev,
        ...data
      }))
    }

    const handleAlarmUpdate = (data: any) => {
      if (data.type === 'add') {
        setAlarms(prev => [...prev, {
          ...data.alarm,
          timestamp: new Date(data.alarm.timestamp)
        }])
      } else if (data.type === 'clear') {
        setAlarms(prev => prev.filter(a => a.id !== data.alarmId))
      } else if (data.type === 'acknowledge') {
        setAlarms(prev => prev.map(a => 
          a.id === data.alarmId ? { ...a, acknowledged: true } : a
        ))
      }
    }

    const handlePerformanceUpdate = (data: any) => {
      setPerformance(prev => {
        const newData = [...prev, data]
        // Keep only last 100 data points
        return newData.slice(-100)
      })
    }

    const handleConnectionChange = (data: any) => {
      setIsConnected(data.connected)
    }

    // Register event listeners
    api.events.on('machine.status.update', handleStatusUpdate)
    api.events.on('machine.position.update', handlePositionUpdate)
    api.events.on('machine.alarm.update', handleAlarmUpdate)
    api.events.on('machine.performance.update', handlePerformanceUpdate)
    api.events.on('machine.connection.change', handleConnectionChange)

    // Set up polling interval for updates
    const interval = setInterval(() => {
      api.machine.requestStatus()
      api.machine.requestPosition()
    }, updateInterval)

    // Cleanup
    return () => {
      clearInterval(interval)
      api.events.off('machine.status.update', handleStatusUpdate)
      api.events.off('machine.position.update', handlePositionUpdate)
      api.events.off('machine.alarm.update', handleAlarmUpdate)
      api.events.off('machine.performance.update', handlePerformanceUpdate)
      api.events.off('machine.connection.change', handleConnectionChange)
    }
  }, [api, updateInterval])

  // Simulate data for demo purposes
  useEffect(() => {
    const demoInterval = setInterval(() => {
      // Simulate performance data
      const now = Date.now()
      const newPerformanceData: PerformanceData = {
        timestamp: now,
        feedRate: 80 + Math.random() * 40,
        spindleLoad: 30 + Math.random() * 50,
        axisLoad: {
          x: 20 + Math.random() * 30,
          y: 25 + Math.random() * 35,
          z: 15 + Math.random() * 40
        }
      }
      
      setPerformance(prev => {
        const newData = [...prev, newPerformanceData]
        return newData.slice(-100)
      })

      // Simulate position changes
      setPosition(prev => ({
        ...prev,
        work: {
          x: prev.work.x + (Math.random() - 0.5) * 0.1,
          y: prev.work.y + (Math.random() - 0.5) * 0.1,
          z: prev.work.z + (Math.random() - 0.5) * 0.05
        }
      }))
    }, 1000)

    return () => clearInterval(demoInterval)
  }, [])

  const acknowledgeAlarm = (alarmId: string) => {
    api.machine.acknowledgeAlarm(alarmId)
  }

  const clearAlarm = (alarmId: string) => {
    api.machine.clearAlarm(alarmId)
  }

  const clearAllAlarms = () => {
    alarms.forEach(alarm => {
      api.machine.clearAlarm(alarm.id)
    })
  }

  return {
    status,
    position,
    alarms,
    performance,
    isConnected,
    acknowledgeAlarm,
    clearAlarm,
    clearAllAlarms
  }
}