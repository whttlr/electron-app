import * as React from 'react';
import { Card, Badge } from '@whttlr/ui-core';
import { cn } from './utils';

interface JogSpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const JogSpeedControl = React.forwardRef<HTMLDivElement, JogSpeedControlProps>(
  ({
    speed, onSpeedChange, min = 10, max = 1000, step = 10, disabled = false, className,
  }, ref) => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSpeedChange(Number(e.target.value));
    };

    const getSpeedLabel = () => {
      if (speed <= 50) return { text: 'Slow', variant: 'warning' as const };
      if (speed <= 200) return { text: 'Medium', variant: 'info' as const };
      if (speed <= 500) return { text: 'Fast', variant: 'success' as const };
      return { text: 'Very Fast', variant: 'danger' as const };
    };

    const speedLabel = getSpeedLabel();

    return (
      <Card ref={ref} className={cn('p-4', className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Jog Speed</h4>
            <Badge variant={speedLabel.variant} size="sm">
              {speedLabel.text}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{min} mm/min</span>
              <span className="font-mono font-bold">{speed} mm/min</span>
              <span className="text-muted-foreground">{max} mm/min</span>
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={speed}
              onChange={handleSliderChange}
              disabled={disabled}
              className={cn(
                'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider',
                'slider::-webkit-slider-thumb:appearance-none slider::-webkit-slider-thumb:h-4 slider::-webkit-slider-thumb:w-4',
                'slider::-webkit-slider-thumb:rounded-full slider::-webkit-slider-thumb:bg-primary',
                'slider::-webkit-slider-thumb:cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <button
              onClick={() => onSpeedChange(Math.max(min, speed - step * 5))}
              disabled={disabled || speed <= min}
              className="px-2 py-1 rounded bg-muted/50 hover:bg-muted disabled:opacity-50"
            >
              -50
            </button>
            <button
              onClick={() => onSpeedChange(Math.min(max, speed + step * 5))}
              disabled={disabled || speed >= max}
              className="px-2 py-1 rounded bg-muted/50 hover:bg-muted disabled:opacity-50"
            >
              +50
            </button>
          </div>
        </div>
      </Card>
    );
  },
);
JogSpeedControl.displayName = 'JogSpeedControl';

interface JogDistanceControlProps {
  distance: number;
  onDistanceChange: (distance: number) => void;
  presets?: number[];
  disabled?: boolean;
  className?: string;
}

export const JogDistanceControl = React.forwardRef<HTMLDivElement, JogDistanceControlProps>(
  ({
    distance, onDistanceChange, presets = [0.1, 1, 10, 100], disabled = false, className,
  }, ref) => (
      <Card ref={ref} className={cn('p-4', className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Jog Distance</h4>
            <span className="font-mono text-sm font-bold">{distance} mm</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => onDistanceChange(preset)}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg border transition-colors',
                  distance === preset
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                {preset} mm
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-distance" className="text-xs text-muted-foreground">
              Custom Distance:
            </label>
            <input
              id="custom-distance"
              type="number"
              value={distance}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              disabled={disabled}
              min="0.01"
              max="1000"
              step="0.01"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            />
          </div>
        </div>
      </Card>
  ),
);
JogDistanceControl.displayName = 'JogDistanceControl';
