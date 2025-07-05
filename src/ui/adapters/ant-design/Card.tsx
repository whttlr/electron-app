/**
 * Ant Design Card Adapter
 * 
 * Maps our stable CardProps interface to Ant Design's Card component.
 * This adapter allows us to use Ant Design while maintaining a consistent API
 * that can be swapped for other implementations in the future.
 */

import React from 'react';
import { Card as AntCard } from 'antd';
import { CardProps as AntCardProps } from 'antd/es/card';
import { cardVariants } from '../../theme/component-styles';
import { CardProps } from '../../interfaces';
import { cn } from '../../shared/utils';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps our variant types to Ant Design card configurations
 */
const variantToAntProps = {
  default: { size: 'default' as const },
  elevated: { size: 'default' as const },
  outlined: { size: 'default' as const },
  filled: { size: 'default' as const },
  cnc: { size: 'default' as const },
};

/**
 * Maps our size types to Ant Design sizes
 */
const sizeToAntSize: Record<NonNullable<CardProps['size']>, AntCardProps['size']> = {
  sm: 'small',
  md: 'default',
  lg: 'default', // We'll use CSS for this
  xl: 'default', // We'll use CSS for this
};

/**
 * Variants that need custom CSS styling beyond Ant Design
 */
const customStyledVariants: CardProps['variant'][] = [
  'elevated', 'outlined', 'filled', 'cnc'
];

// ============================================================================
// CARD ADAPTER COMPONENT
// ============================================================================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  variant = 'default',
  size = 'md',
  title,
  extra,
  bordered = true,
  hoverable = false,
  interactive = false,
  className,
  children,
  onClick,
  ...rest
}, ref) => {
  
  // Map our props to Ant Design props
  const antProps = variantToAntProps[variant || 'default'];
  const antSize = sizeToAntSize[size];
  const needsCustomStyling = customStyledVariants.includes(variant);
  
  // Generate CSS classes for custom styling
  const customClasses = needsCustomStyling ? cardVariants({
    variant,
    size,
    hoverable: hoverable ? true : false,
    interactive: interactive ? true : false,
  }) : '';
  
  // Combine our custom classes with any passed className
  const finalClassName = cn(
    needsCustomStyling && customClasses,
    className
  );
  
  return (
    <AntCard
      ref={ref}
      {...antProps}
      size={antSize}
      title={title}
      extra={extra}
      bordered={bordered}
      hoverable={hoverable}
      className={finalClassName}
      onClick={onClick}
      {...rest}
    >
      {children}
    </AntCard>
  );
});

Card.displayName = 'Card';

// ============================================================================
// SPECIALIZED CARD COMPONENTS
// ============================================================================

/**
 * Status card for displaying machine status information
 */
export const StatusCard = React.forwardRef<HTMLDivElement,
  Omit<CardProps, 'variant'> & {
    status: 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning';
    statusText?: string;
    statusValue?: string | number;
    pulse?: boolean;
  }
>(({
  status,
  statusText,
  statusValue,
  pulse = false,
  title,
  className,
  children,
  ...props
}, ref) => {
  
  const statusColors = {
    connected: 'border-green-500/30 bg-green-500/10',
    disconnected: 'border-red-500/30 bg-red-500/10',
    idle: 'border-amber-500/30 bg-amber-500/10',
    running: 'border-blue-500/30 bg-blue-500/10',
    error: 'border-red-600/30 bg-red-600/10',
    warning: 'border-amber-600/30 bg-amber-600/10',
  };
  
  const statusClass = statusColors[status] || statusColors.disconnected;
  
  return (
    <Card
      ref={ref}
      variant="cnc"
      className={cn(
        statusClass,
        pulse && 'animate-pulse',
        className
      )}
      title={title}
      {...props}
    >
      {statusText && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{statusText}</span>
          {statusValue && (
            <span className="text-lg font-bold font-mono">{statusValue}</span>
          )}
        </div>
      )}
      {children}
    </Card>
  );
});

StatusCard.displayName = 'StatusCard';

/**
 * Metric card for displaying numerical data
 */
export const MetricCard = React.forwardRef<HTMLDivElement,
  Omit<CardProps, 'variant'> & {
    metric: string | number;
    label: string;
    unit?: string;
    precision?: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string | number;
  }
>(({
  metric,
  label,
  unit,
  precision = 2,
  trend,
  trendValue,
  className,
  ...props
}, ref) => {
  
  const formatMetric = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toFixed(precision);
    }
    return value;
  };
  
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-secondary-400',
  };
  
  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };
  
  return (
    <Card
      ref={ref}
      variant="cnc"
      className={cn('text-center', className)}
      size="sm"
      {...props}
    >
      <div className="space-y-2">
        <div className="text-2xl font-bold font-mono">
          {formatMetric(metric)}
          {unit && <span className="text-sm text-secondary-400 ml-1">{unit}</span>}
        </div>
        <div className="text-sm text-secondary-400">{label}</div>
        {trend && (
          <div className={cn('text-xs flex items-center justify-center gap-1', trendColors[trend])}>
            <span>{trendIcons[trend]}</span>
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

/**
 * Control card for housing control interfaces
 */
export const ControlCard = React.forwardRef<HTMLDivElement,
  Omit<CardProps, 'variant'> & {
    controlType?: 'jog' | 'speed' | 'position' | 'general';
    disabled?: boolean;
  }
>(({
  controlType = 'general',
  disabled = false,
  className,
  children,
  ...props
}, ref) => {
  
  const controlClasses = {
    jog: 'border-blue-500/30 bg-blue-500/5',
    speed: 'border-green-500/30 bg-green-500/5', 
    position: 'border-purple-500/30 bg-purple-500/5',
    general: 'border-secondary-700/30 bg-secondary-800/5',
  };
  
  return (
    <Card
      ref={ref}
      variant="cnc"
      className={cn(
        controlClasses[controlType],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
});

ControlCard.displayName = 'ControlCard';

// ============================================================================
// EXPORTS
// ============================================================================

export default Card;
export type { CardProps } from '../../interfaces';
