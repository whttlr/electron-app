import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import clsx from 'clsx'

interface Alarm {
  id: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  timestamp: Date
  acknowledged: boolean
}

interface AlarmPanelProps {
  alarms: Alarm[]
  onAcknowledge?: (alarmId: string) => void
  onClear?: (alarmId: string) => void
  onClearAll?: () => void
}

export const AlarmPanel: React.FC<AlarmPanelProps> = ({
  alarms,
  onAcknowledge,
  onClear,
  onClearAll
}) => {
  const sortedAlarms = [...alarms].sort((a, b) => {
    // Sort by severity first, then by timestamp
    const severityOrder = { error: 0, warning: 1, info: 2 }
    if (a.severity !== b.severity) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  return (
    <div className="alarm-panel">
      {alarms.length > 1 && onClearAll && (
        <div className="alarm-panel__actions">
          <button 
            className="btn btn--small btn--danger"
            onClick={onClearAll}
          >
            Clear All Alarms
          </button>
        </div>
      )}

      <div className="alarm-list">
        <AnimatePresence>
          {sortedAlarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              className={clsx('alarm-item', `alarm-item--${alarm.severity}`, {
                'alarm-item--acknowledged': alarm.acknowledged
              })}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="alarm-item__icon">
                {getAlarmIcon(alarm.severity)}
              </div>
              
              <div className="alarm-item__content">
                <div className="alarm-item__header">
                  <span className="alarm-item__code">{alarm.code}</span>
                  <span className="alarm-item__time">
                    {format(alarm.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
                <p className="alarm-item__message">{alarm.message}</p>
              </div>

              <div className="alarm-item__actions">
                {!alarm.acknowledged && onAcknowledge && (
                  <button
                    className="btn btn--icon"
                    onClick={() => onAcknowledge(alarm.id)}
                    title="Acknowledge alarm"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </button>
                )}
                {onClear && (
                  <button
                    className="btn btn--icon"
                    onClick={() => onClear(alarm.id)}
                    title="Clear alarm"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {alarms.length === 0 && (
        <div className="alarm-panel__empty">
          <svg viewBox="0 0 24 24" width="48" height="48" opacity="0.3">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p>No active alarms</p>
        </div>
      )}
    </div>
  )
}

function getAlarmIcon(severity: 'error' | 'warning' | 'info'): React.ReactNode {
  switch (severity) {
    case 'error':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      )
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      )
    case 'info':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      )
  }
}