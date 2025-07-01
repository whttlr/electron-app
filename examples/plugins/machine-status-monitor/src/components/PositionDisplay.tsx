import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface Position {
  x: number
  y: number
  z: number
  a?: number
  b?: number
  c?: number
}

interface PositionDisplayProps {
  position: {
    work: Position
    machine: Position
    offset: Position
  }
  units?: 'mm' | 'inch'
}

export const PositionDisplay: React.FC<PositionDisplayProps> = ({
  position,
  units = 'mm'
}) => {
  const [coordinateSystem, setCoordinateSystem] = React.useState<'work' | 'machine'>('work')

  const formatValue = (value: number): string => {
    return value.toFixed(3)
  }

  const currentPosition = position[coordinateSystem]

  return (
    <div className="position-display">
      <div className="position-display__tabs">
        <button
          className={clsx('tab', { 'tab--active': coordinateSystem === 'work' })}
          onClick={() => setCoordinateSystem('work')}
        >
          Work Position
        </button>
        <button
          className={clsx('tab', { 'tab--active': coordinateSystem === 'machine' })}
          onClick={() => setCoordinateSystem('machine')}
        >
          Machine Position
        </button>
      </div>

      <div className="position-display__content">
        <motion.div
          key={coordinateSystem}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="position-grid"
        >
          <AxisDisplay axis="X" value={currentPosition.x} units={units} />
          <AxisDisplay axis="Y" value={currentPosition.y} units={units} />
          <AxisDisplay axis="Z" value={currentPosition.z} units={units} />
          
          {currentPosition.a !== undefined && (
            <AxisDisplay axis="A" value={currentPosition.a} units="deg" />
          )}
          {currentPosition.b !== undefined && (
            <AxisDisplay axis="B" value={currentPosition.b} units="deg" />
          )}
          {currentPosition.c !== undefined && (
            <AxisDisplay axis="C" value={currentPosition.c} units="deg" />
          )}
        </motion.div>

        <div className="position-display__offset">
          <h4>Work Offset (G54)</h4>
          <div className="offset-values">
            <span>X: {formatValue(position.offset.x)}</span>
            <span>Y: {formatValue(position.offset.y)}</span>
            <span>Z: {formatValue(position.offset.z)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AxisDisplayProps {
  axis: string
  value: number
  units: string
}

const AxisDisplay: React.FC<AxisDisplayProps> = ({ axis, value, units }) => {
  const isNegative = value < 0
  const displayValue = Math.abs(value).toFixed(3)

  return (
    <div className="axis-display">
      <div className="axis-display__label">{axis}</div>
      <div className={clsx('axis-display__value', {
        'axis-display__value--negative': isNegative
      })}>
        {isNegative && '-'}
        {displayValue}
      </div>
      <div className="axis-display__units">{units}</div>
    </div>
  )
}