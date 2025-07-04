import * as React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Home,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '../shared/Button';
import { JogGrid } from '../shared/Grid';
import { cn } from '../shared/utils';
import { InputNumber } from 'antd';

export interface JogControlsProps {
  onJog: (axis: 'X' | 'Y' | 'Z', direction: number) => void
  onHome?: () => void
  disabled?: boolean
  className?: string
}

export const JogControls: React.FC<JogControlsProps> = ({
  onJog,
  onHome,
  disabled = false,
  className,
}) => (
    <div className={cn('space-y-4', className)}>
      {/* XY Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground text-center">XY Movement</h3>
        <JogGrid>
          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('X', -1)}
            onMouseUp={() => onJog('Y', 1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowUpLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('Y', 1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('X', 1)}
            onMouseUp={() => onJog('Y', 1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('X', -1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="success"
            size="jog"
            disabled={disabled}
            onClick={onHome}
            className="hover:bg-green-700 active:bg-green-800 transition-colors duration-200"
          >
            <Home className="h-6 w-6" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('X', 1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('X', -1)}
            onMouseUp={() => onJog('Y', -1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowDownLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('Y', -1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('X', 1)}
            onMouseUp={() => onJog('Y', -1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <ArrowDownRight className="h-4 w-4" />
          </Button>
        </JogGrid>
      </div>

      {/* Z Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground text-center">Z Movement</h3>
        <div className="flex justify-center gap-4">
          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('Z', 1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="cnc"
            size="jog"
            disabled={disabled}
            onMouseDown={() => onJog('Z', -1)}
            className="hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
);

export interface JogSpeedControlProps {
  speed: number
  onSpeedChange: (speed: number) => void
  unit?: 'mm/min' | 'in/min'
  min?: number
  max?: number
  step?: number
  className?: string
}

export const JogSpeedControl: React.FC<JogSpeedControlProps> = ({
  speed,
  onSpeedChange,
  unit = 'mm/min',
  min = 1,
  max = 10000,
  step = 10,
  className,
}) => {
  const presets = [10, 50, 100, 500, 1000, 5000];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          Jog Speed
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="min-w-[100px] text-right">
            <span className="font-mono text-lg font-semibold">{speed}</span>
            <span className="text-sm text-muted-foreground ml-1">{unit}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={speed === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSpeedChange(preset)}
            className="min-w-[60px]"
          >
            {preset}
          </Button>
        ))}
      </div>
    </div>
  );
};

export interface JogDistanceControlProps {
  distance: number
  onDistanceChange: (distance: number) => void
  unit?: 'mm' | 'in'
  continuous?: boolean
  onContinuousChange?: (continuous: boolean) => void
  className?: string
}

export const JogDistanceControl: React.FC<JogDistanceControlProps> = ({
  distance,
  onDistanceChange,
  unit = 'mm',
  continuous = false,
  onContinuousChange,
  className,
}) => {
  const presets = [0.01, 0.1, 1, 10, 100];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Jog Distance
          </label>
          {onContinuousChange && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={continuous}
                onChange={(e) => onContinuousChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              Continuous
            </label>
          )}
        </div>

        {!continuous && (
          <>
            <div className="flex items-center gap-2">
              <InputNumber
                min={0.001}
                max={1000}
                step={0.001}
                value={distance}
                onChange={(value) => onDistanceChange(value as number)}
                className="flex-1 font-mono"
                style={{
                  backgroundColor: '#18181a',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              />
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  variant={distance === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onDistanceChange(preset)}
                  className="min-w-[50px]"
                >
                  {preset}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
