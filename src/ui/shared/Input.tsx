import * as React from 'react';
import { cn } from './utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helpText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className, type, error, label, helpText, startIcon, endIcon, ...props
  }, ref) => {
    const inputId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              error && 'border-danger-500 focus-visible:ring-danger-500',
              className,
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-600">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

// CNC-specific input variants
const CoordinateInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
      <Input
        ref={ref}
        type="number"
        step="0.001"
        className={cn(
          'font-mono text-center text-lg font-semibold',
          className,
        )}
        {...props}
      />
  ),
);
CoordinateInput.displayName = 'CoordinateInput';

const PrecisionInput = React.forwardRef<HTMLInputElement, InputProps & {
  precision?: number
}>(
  ({ className, precision = 3, ...props }, ref) => (
      <Input
        ref={ref}
        type="number"
        step={`0.${'0'.repeat(precision - 1)}1`}
        className={cn(
          'font-mono text-right',
          className,
        )}
        {...props}
      />
  ),
);
PrecisionInput.displayName = 'PrecisionInput';

export { Input, CoordinateInput, PrecisionInput };
