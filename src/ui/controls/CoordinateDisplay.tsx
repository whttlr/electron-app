import * as React from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw, Copy, Lock, Unlock,
} from 'lucide-react';
import { cn } from '../shared/utils';
import { Card, CardContent } from '../shared/Card';
import { Badge, PrecisionBadge } from '../shared/Badge';
import { Button } from '../shared/Button';

export interface Coordinate {
  x: number
  y: number
  z: number
}

export interface CoordinateDisplayProps {
  workPosition: Coordinate
  machinePosition: Coordinate
  unit?: 'mm' | 'inch'
  precision?: 'high' | 'medium' | 'low'
  onZero?: (axis?: 'X' | 'Y' | 'Z') => void
  onCopy?: (position: Coordinate, type: 'work' | 'machine') => void
  className?: string
}

export const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({
  workPosition,
  machinePosition,
  unit = 'mm',
  precision = 'high',
  onZero,
  onCopy,
  className,
}) => {
  const [displayMode, setDisplayMode] = React.useState<'work' | 'machine'>('work');
  const [lockedAxes, setLockedAxes] = React.useState<Set<'X' | 'Y' | 'Z'>>(new Set());

  const formatCoordinate = (value: number): string => {
    const decimals = precision === 'high' ? 3 : precision === 'medium' ? 2 : 1;
    return value.toFixed(decimals);
  };

  const position = displayMode === 'work' ? workPosition : machinePosition;

  const toggleAxisLock = (axis: 'X' | 'Y' | 'Z') => {
    const newLocked = new Set(lockedAxes);
    if (newLocked.has(axis)) {
      newLocked.delete(axis);
    } else {
      newLocked.add(axis);
    }
    setLockedAxes(newLocked);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Position</h3>
            <PrecisionBadge precision={precision} />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={displayMode === 'work' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDisplayMode('work')}
              className="h-7 px-2 text-xs"
            >
              Work
            </Button>
            <Button
              variant={displayMode === 'machine' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDisplayMode('machine')}
              className="h-7 px-2 text-xs"
            >
              Machine
            </Button>
            {onCopy && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onCopy(position, displayMode)}
                className="h-7 w-7 ml-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {(['X', 'Y', 'Z'] as const).map((axis) => (
          <AxisDisplay
            key={axis}
            axis={axis}
            value={position[axis.toLowerCase() as keyof Coordinate]}
            unit={unit}
            locked={lockedAxes.has(axis)}
            onLockToggle={() => toggleAxisLock(axis)}
            onZero={onZero ? () => onZero(axis) : undefined}
            formatValue={formatCoordinate}
          />
        ))}

        {onZero && (
          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZero()}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Zero All Axes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AxisDisplayProps {
  axis: 'X' | 'Y' | 'Z'
  value: number
  unit: 'mm' | 'inch'
  locked: boolean
  onLockToggle?: () => void
  onZero?: () => void
  formatValue: (value: number) => string
}

const AxisDisplay: React.FC<AxisDisplayProps> = ({
  axis,
  value,
  unit,
  locked,
  onLockToggle,
  onZero,
  formatValue,
}) => {
  const axisColors = {
    X: 'text-red-600',
    Y: 'text-green-600',
    Z: 'text-blue-600',
  };

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn('text-2xl font-bold w-8', axisColors[axis])}>
        {axis}
      </div>

      <div className="flex-1 flex items-center gap-2">
        <div className={cn(
          'flex-1 font-mono text-xl font-semibold px-3 py-1 rounded-md border',
          locked ? 'bg-muted border-muted-foreground/20' : 'bg-background border-border',
          value < 0 && 'text-danger-600',
        )}>
          {value >= 0 && '+'}{formatValue(value)}
        </div>

        <span className="text-sm text-muted-foreground min-w-[30px]">
          {unit}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {onLockToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onLockToggle}
            className="h-8 w-8"
          >
            {locked ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Unlock className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}

        {onZero && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onZero}
            disabled={locked}
            className="h-8 px-2"
          >
            Zero
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export interface CompactCoordinateDisplayProps {
  position: Coordinate
  unit?: 'mm' | 'inch'
  precision?: number
  showLabels?: boolean
  className?: string
}

export const CompactCoordinateDisplay: React.FC<CompactCoordinateDisplayProps> = ({
  position,
  unit = 'mm',
  precision = 3,
  showLabels = true,
  className,
}) => {
  const formatValue = (value: number) => value.toFixed(precision);

  return (
    <div className={cn('flex items-center gap-4 font-mono', className)}>
      {(['X', 'Y', 'Z'] as const).map((axis) => {
        const axisColors = {
          X: 'text-red-600',
          Y: 'text-green-600',
          Z: 'text-blue-600',
        };

        return (
          <div key={axis} className="flex items-center gap-1">
            {showLabels && (
              <span className={cn('font-bold', axisColors[axis])}>
                {axis}:
              </span>
            )}
            <span className={cn(
              'font-semibold',
              position[axis.toLowerCase() as keyof Coordinate] < 0 && 'text-danger-600',
            )}>
              {formatValue(position[axis.toLowerCase() as keyof Coordinate])}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        );
      })}
    </div>
  );
};

export interface LiveCoordinateDisplayProps extends CoordinateDisplayProps {
  isConnected: boolean
  updateInterval?: number
}

export const LiveCoordinateDisplay: React.FC<LiveCoordinateDisplayProps> = ({
  isConnected,
  updateInterval = 100,
  ...props
}) => {
  const [lastUpdate, setLastUpdate] = React.useState(Date.now());

  React.useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isConnected, updateInterval]);

  return (
    <div className="relative">
      <CoordinateDisplay {...props} />

      {isConnected && (
        <motion.div
          className="absolute top-2 right-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-success-500 rounded-full" />
        </motion.div>
      )}

      {!isConnected && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Badge variant="danger">Disconnected</Badge>
        </div>
      )}
    </div>
  );
};
