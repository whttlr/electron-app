/**
 * Ant Design Badge Adapter
 * 
 * Maps our stable BadgeProps interface to Ant Design's Badge component.
 * This adapter allows us to use Ant Design while maintaining a consistent API
 * that can be swapped for other implementations in the future.
 */

import React from 'react';
import { Badge as AntBadge } from 'antd';
import { BadgeProps as AntBadgeProps } from 'antd/es/badge';
import { badgeVariants } from '../../theme/component-styles';
import { BadgeProps } from '../../interfaces';
import { cn } from '../../shared/utils';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps our variant types to Ant Design badge status
 */
const variantToAntStatus: Record<NonNullable<BadgeProps['variant']>, AntBadgeProps['status']> = {
  default: 'default',
  secondary: 'default',
  destructive: 'error',
  outline: 'default',
  // Status variants
  success: 'success',
  warning: 'warning',
  danger: 'error',
  info: 'processing',
  // CNC status specific
  connected: 'success',
  disconnected: 'error',
  running: 'processing',
  idle: 'warning',
};

/**
 * Maps our size types to Ant Design sizes
 */
const sizeToAntSize: Record<NonNullable<BadgeProps['size']>, AntBadgeProps['size']> = {
  sm: 'small',
  md: 'default',
  lg: 'default', // We'll use CSS for this
};

/**
 * Variants that need custom CSS styling beyond Ant Design
 */
const customStyledVariants: BadgeProps['variant'][] = [
  'success', 'warning', 'danger', 'info', 'connected', 'disconnected', 'running', 'idle'
];

// ============================================================================
// BADGE ADAPTER COMPONENT
// ============================================================================

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ 
  variant = 'default',
  size = 'md',
  shape = 'default',
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  color,
  className,
  children,
  onClick,
  ...rest
}, ref) => {
  
  // Map our props to Ant Design props
  const antStatus = variantToAntStatus[variant];
  const antSize = sizeToAntSize[size];
  const needsCustomStyling = customStyledVariants.includes(variant);
  
  // Generate CSS classes for custom styling
  const customClasses = needsCustomStyling ? badgeVariants({
    variant,
    size,
    shape,
    dot: dot ? true : false,
  }) : '';
  
  // Combine our custom classes with any passed className
  const finalClassName = cn(
    needsCustomStyling && customClasses,
    className
  );
  
  // Handle different badge types
  if (dot) {
    return (
      <AntBadge
        ref={ref}
        dot
        status={antStatus}
        size={antSize}
        className={finalClassName}
        onClick={onClick}
        {...rest}
      >
        {children}
      </AntBadge>
    );
  }
  
  if (count !== undefined) {
    return (
      <AntBadge
        ref={ref}
        count={count}
        overflowCount={maxCount}
        showZero={showZero}
        size={antSize}
        color={color}
        className={finalClassName}
        onClick={onClick}
        {...rest}
      >
        {children}
      </AntBadge>
    );
  }
  
  // Status badge (no count)
  return (
    <AntBadge
      ref={ref}
      status={antStatus}
      text={typeof children === 'string' ? children : undefined}
      size={antSize}
      color={color}
      className={finalClassName}
      onClick={onClick}
      {...rest}
    >
      {typeof children !== 'string' ? children : undefined}
    </AntBadge>
  );
});

Badge.displayName = 'Badge';

// ============================================================================
// SPECIALIZED BADGE COMPONENTS
// ============================================================================

/**
 * Status badge for machine states
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement,
  Omit<BadgeProps, 'variant'> & {
    status: 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning';
    text?: string;
    pulse?: boolean;
  }
>(({
  status,
  text,
  pulse = false,
  className,
  ...props
}, ref) => {
  
  const statusTexts = {
    connected: 'Connected',
    disconnected: 'Disconnected', 
    idle: 'Idle',
    running: 'Running',
    error: 'Error',
    warning: 'Warning',
  };
  
  return (
    <Badge
      ref={ref}
      variant={status}
      className={cn(
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {text || statusTexts[status]}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

/**
 * Count badge for notifications and counters
 */
export const CountBadge = React.forwardRef<HTMLSpanElement,
  Omit<BadgeProps, 'variant'> & {
    count: number;
    max?: number;
    showZero?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  }
>(({
  count,
  max = 99,
  showZero = false,
  variant = 'default',
  ...props
}, ref) => {
  
  return (
    <Badge
      ref={ref}
      variant={variant}
      count={count}
      maxCount={max}
      showZero={showZero}
      {...props}
    />
  );
});

CountBadge.displayName = 'CountBadge';

/**
 * Precision badge for measurement accuracy
 */
export const PrecisionBadge = React.forwardRef<HTMLSpanElement,
  Omit<BadgeProps, 'variant'> & {
    precision: 'high' | 'medium' | 'low';
    value?: string | number;
  }
>(({
  precision,
  value,
  className,
  ...props
}, ref) => {
  
  const precisionVariants = {
    high: 'success' as const,
    medium: 'warning' as const,
    low: 'danger' as const,
  };
  
  const precisionTexts = {
    high: 'High Precision',
    medium: 'Medium Precision',
    low: 'Low Precision',
  };
  
  return (
    <Badge
      ref={ref}
      variant={precisionVariants[precision]}
      className={cn('text-xs', className)}
      {...props}
    >
      {value || precisionTexts[precision]}
    </Badge>
  );
});

PrecisionBadge.displayName = 'PrecisionBadge';

/**
 * Axis badge for coordinate displays
 */
export const AxisBadge = React.forwardRef<HTMLSpanElement,
  Omit<BadgeProps, 'variant' | 'color'> & {
    axis: 'X' | 'Y' | 'Z';
    active?: boolean;
  }
>(({
  axis,
  active = false,
  className,
  ...props
}, ref) => {
  
  const axisColors = {
    X: '#ef4444', // Red
    Y: '#22c55e', // Green
    Z: '#3b82f6', // Blue
  };
  
  return (
    <Badge
      ref={ref}
      variant={active ? 'info' : 'outline'}
      color={axisColors[axis]}
      className={cn(
        'font-mono font-bold',
        active && 'animate-pulse',
        className
      )}
      {...props}
    >
      {axis}
    </Badge>
  );
});

AxisBadge.displayName = 'AxisBadge';

// ============================================================================
// EXPORTS
// ============================================================================

export default Badge;
export type { BadgeProps } from '../../interfaces';
