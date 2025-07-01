import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusCard } from './StatusCard'
import { PositionDisplay } from './PositionDisplay'
import { AlarmPanel } from './AlarmPanel'
import { PerformanceChart } from './PerformanceChart'
import { ConnectionIndicator } from './ConnectionIndicator'
import { useMachineStatus } from '../hooks/useMachineStatus'
import { useSettings } from '../hooks/useSettings'
import clsx from 'clsx'

export const MachineStatusMonitor: React.FC = () => {
  const { status, position, alarms, performance, isConnected } = useMachineStatus()
  const { settings, updateSetting } = useSettings()

  return (
    <div className="machine-status-monitor">
      <header className="monitor-header">
        <h1>Machine Status Monitor</h1>
        <ConnectionIndicator connected={isConnected} />
      </header>

      <div className="monitor-grid">
        {/* Main Status Section */}
        <motion.section
          className="status-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Machine Status</h2>
          <div className="status-cards">
            <StatusCard
              title="State"
              value={status.state}
              icon="state"
              color={getStateColor(status.state)}
            />
            <StatusCard
              title="Mode"
              value={status.mode}
              icon="mode"
              color="blue"
            />
            <StatusCard
              title="Feed Rate"
              value={`${status.feedRate}%`}
              icon="feed"
              color="green"
            />
            <StatusCard
              title="Spindle"
              value={status.spindleSpeed ? `${status.spindleSpeed} RPM` : 'OFF'}
              icon="spindle"
              color={status.spindleSpeed > 0 ? 'green' : 'gray'}
            />
          </div>
        </motion.section>

        {/* Position Display */}
        <motion.section
          className="position-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2>Current Position</h2>
          <PositionDisplay position={position} />
        </motion.section>

        {/* Alarms Section */}
        <AnimatePresence>
          {alarms.length > 0 && (
            <motion.section
              className="alarms-section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <h2>Active Alarms</h2>
              <AlarmPanel alarms={alarms} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Performance Metrics */}
        <motion.section
          className="performance-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2>Performance Metrics</h2>
          <PerformanceChart data={performance} />
        </motion.section>

        {/* Settings Panel */}
        {settings.showDebugInfo && (
          <motion.section
            className="debug-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Debug Information</h2>
            <div className="debug-info">
              <pre>{JSON.stringify({ status, position, alarms }, null, 2)}</pre>
            </div>
          </motion.section>
        )}
      </div>

      {/* Settings Toggle */}
      <div className="settings-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.showDebugInfo}
            onChange={(e) => updateSetting('showDebugInfo', e.target.checked)}
          />
          Show Debug Info
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.alarmNotifications}
            onChange={(e) => updateSetting('alarmNotifications', e.target.checked)}
          />
          Alarm Notifications
        </label>
        <label>
          Update Interval:
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={settings.updateInterval}
            onChange={(e) => updateSetting('updateInterval', parseInt(e.target.value))}
          />
          {settings.updateInterval}ms
        </label>
      </div>
    </div>
  )
}

function getStateColor(state: string): string {
  switch (state.toLowerCase()) {
    case 'idle':
      return 'green'
    case 'run':
      return 'blue'
    case 'hold':
      return 'yellow'
    case 'alarm':
      return 'red'
    case 'door':
      return 'orange'
    case 'check':
      return 'purple'
    case 'home':
      return 'teal'
    case 'sleep':
      return 'gray'
    default:
      return 'gray'
  }
}