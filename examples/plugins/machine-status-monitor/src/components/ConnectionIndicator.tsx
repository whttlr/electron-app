import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface ConnectionIndicatorProps {
  connected: boolean
  latency?: number
  quality?: 'excellent' | 'good' | 'fair' | 'poor'
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  connected,
  latency,
  quality
}) => {
  const [showDetails, setShowDetails] = React.useState(false)

  const getQualityFromLatency = (ms: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (ms < 10) return 'excellent'
    if (ms < 50) return 'good'
    if (ms < 100) return 'fair'
    return 'poor'
  }

  const actualQuality = quality || (latency ? getQualityFromLatency(latency) : 'good')

  return (
    <div className="connection-indicator">
      <motion.button
        className={clsx('connection-indicator__button', {
          'connection-indicator__button--connected': connected,
          'connection-indicator__button--disconnected': !connected
        })}
        onClick={() => setShowDetails(!showDetails)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="connection-indicator__icon">
          {connected ? (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path 
                fill="currentColor" 
                d="M1 9l2-2v8h16v-8l2 2V9c0-1.1-.9-2-2-2h-4.18C14.4 5.84 13.3 5 12 5s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v6h18v-6zM12 6.75c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM7 14h10v2H7v-2z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path 
                fill="currentColor" 
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"
              />
            </svg>
          )}
        </div>
        <span className="connection-indicator__text">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
        {connected && (
          <div className={clsx('connection-indicator__quality', `connection-indicator__quality--${actualQuality}`)}>
            <span className="quality-bar"></span>
            <span className="quality-bar"></span>
            <span className="quality-bar"></span>
            <span className="quality-bar"></span>
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="connection-details"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="connection-details__content">
              <h4>Connection Details</h4>
              <dl>
                <dt>Status:</dt>
                <dd className={connected ? 'text-green' : 'text-red'}>
                  {connected ? 'Connected' : 'Disconnected'}
                </dd>
                
                {connected && (
                  <>
                    <dt>Quality:</dt>
                    <dd className={`text-${getQualityColor(actualQuality)}`}>
                      {actualQuality.charAt(0).toUpperCase() + actualQuality.slice(1)}
                    </dd>
                    
                    {latency !== undefined && (
                      <>
                        <dt>Latency:</dt>
                        <dd>{latency}ms</dd>
                      </>
                    )}
                    
                    <dt>Protocol:</dt>
                    <dd>WebSocket</dd>
                    
                    <dt>Port:</dt>
                    <dd>/dev/ttyUSB0</dd>
                  </>
                )}
              </dl>
              
              {!connected && (
                <button className="btn btn--small btn--primary">
                  Reconnect
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getQualityColor(quality: string): string {
  switch (quality) {
    case 'excellent':
      return 'green'
    case 'good':
      return 'blue'
    case 'fair':
      return 'yellow'
    case 'poor':
      return 'red'
    default:
      return 'gray'
  }
}