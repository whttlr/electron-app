import * as React from 'react';
import { cn } from './utils';

interface CoordinateInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  units?: 'mm' | 'in';
  precision?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export const CoordinateInput = React.forwardRef<HTMLInputElement, CoordinateInputProps>(
  ({
    value, onChange, label, units = 'mm', precision = 3, min, max, disabled = false, className,
  }, ref) => {
    const [inputValue, setInputValue] = React.useState(value.toFixed(precision));

    React.useEffect(() => {
      setInputValue(value.toFixed(precision));
    }, [value, precision]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        if (min !== undefined && numValue < min) return;
        if (max !== undefined && numValue > max) return;
        onChange(numValue);
      }
    };

    const handleBlur = () => {
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue)) {
        setInputValue(value.toFixed(precision));
      } else {
        setInputValue(numValue.toFixed(precision));
        onChange(numValue);
      }
    };

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            min={min}
            max={max}
            step={10 ** -precision}
            className={cn(
              'w-full px-3 py-2 pr-12 text-right font-mono text-lg',
              'bg-background border border-border rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {units}
          </div>
        </div>
      </div>
    );
  },
);
CoordinateInput.displayName = 'CoordinateInput';

interface PrecisionInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  precision?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showStepButtons?: boolean;
  className?: string;
}

export const PrecisionInput = React.forwardRef<HTMLInputElement, PrecisionInputProps>(
  ({
    value,
    onChange,
    label,
    precision = 4,
    min,
    max,
    step = 10 ** -precision,
    disabled = false,
    showStepButtons = true,
    className,
  }, ref) => {
    const [inputValue, setInputValue] = React.useState(value.toFixed(precision));

    React.useEffect(() => {
      setInputValue(value.toFixed(precision));
    }, [value, precision]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        if (min !== undefined && numValue < min) return;
        if (max !== undefined && numValue > max) return;
        onChange(numValue);
      }
    };

    const handleBlur = () => {
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue)) {
        setInputValue(value.toFixed(precision));
      } else {
        setInputValue(numValue.toFixed(precision));
        onChange(numValue);
      }
    };

    const handleStepUp = () => {
      const newValue = value + step;
      if (max === undefined || newValue <= max) {
        onChange(newValue);
      }
    };

    const handleStepDown = () => {
      const newValue = value - step;
      if (min === undefined || newValue >= min) {
        onChange(newValue);
      }
    };

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex">
          <input
            ref={ref}
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              'flex-1 px-3 py-2 text-center font-mono',
              'bg-background border border-border',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              showStepButtons ? 'rounded-l-lg border-r-0' : 'rounded-lg',
            )}
          />
          {showStepButtons && (
            <div className="flex flex-col">
              <button
                type="button"
                onClick={handleStepUp}
                disabled={disabled || (max !== undefined && value >= max)}
                className={cn(
                  'px-2 py-1 text-xs bg-muted border border-border border-l-0 rounded-tr-lg',
                  'hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:bg-muted/80',
                )}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={handleStepDown}
                disabled={disabled || (min !== undefined && value <= min)}
                className={cn(
                  'px-2 py-1 text-xs bg-muted border border-border border-l-0 border-t-0 rounded-br-lg',
                  'hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:bg-muted/80',
                )}
              >
                ▼
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Step: {step} | Precision: {precision} decimal places
        </div>
      </div>
    );
  },
);
PrecisionInput.displayName = 'PrecisionInput';
