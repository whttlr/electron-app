import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface StatusCardProps {
  title: string
  value: string | number
  icon: string
  color?: string
  onClick?: () => void
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  color = 'gray',
  onClick
}) => {
  return (
    <motion.div
      className={clsx('status-card', `status-card--${color}`, {
        'status-card--clickable': onClick
      })}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
    >
      <div className="status-card__icon">
        {getIcon(icon)}
      </div>
      <div className="status-card__content">
        <h3 className="status-card__title">{title}</h3>
        <p className="status-card__value">{value}</p>
      </div>
    </motion.div>
  )
}

function getIcon(type: string): React.ReactNode {
  switch (type) {
    case 'state':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'mode':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      )
    case 'feed':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )
    case 'spindle':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m6.36-15.36L15 7m-6 6l-3.36 3.36M23 12h-6m-6 0H1m15.36 6.36L13 15m-6-6L3.64 5.64M18.36 18.36L15 15m-6-6l-3.36-3.36" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}