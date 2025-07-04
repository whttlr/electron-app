import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Gauge,
  Thermometer,
  Timer,
} from 'lucide-react';
import { cn } from '../shared/utils';
import { StatusBadge } from '../shared/Badge';
import { Card, CardContent } from '../shared/Card';

export type MachineStatus = 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning'

export interface StatusIndicatorProps {
  status: MachineStatus
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const statusConfig = {
    connected: {
      icon: Wifi,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      label: label || 'Connected',
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
      label: label || 'Disconnected',
    },
    idle: {
      icon: Activity,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      label: label || 'Idle',
    },
    running: {
      icon: Zap,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      label: label || 'Running',
    },
    error: {
      icon: XCircle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
      label: label || 'Error',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      label: label || 'Warning',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
      config.bgColor,
      sizeClasses[size],
      className,
    )}>
      {showIcon && (
        <motion.div
          animate={status === 'running' ? { rotate: 360 } : {}}
          transition={status === 'running' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
        >
          <Icon className={cn(iconSizes[size], config.color)} />
        </motion.div>
      )}
      <span className={cn('font-medium', config.color)}>
        {config.label}
      </span>
    </div>
  );
};

export interface ConnectionStatusProps {
  isConnected: boolean
  port?: string
  baudRate?: number
  className?: string
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  port,
  baudRate,
  className,
}) => (
    <Card className={cn('overflow-hidden', className)}>
      <div className={cn(
        'px-4 py-2 border-b',
        isConnected ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200',
      )}>
        <div className="flex items-center justify-between">
          <StatusIndicator
            status={isConnected ? 'connected' : 'disconnected'}
            size="sm"
          />
          {isConnected && port && (
            <span className="text-xs text-muted-foreground font-mono">
              {port} @ {baudRate || 115200}
            </span>
          )}
        </div>
      </div>
    </Card>
);

export interface MetricDisplayProps {
  icon: React.ElementType
  label: string
  value: string | number
  unit?: string
  status?: 'normal' | 'warning' | 'danger'
  className?: string
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  status = 'normal',
  className,
}) => {
  const statusColors = {
    normal: 'text-foreground',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  };

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-muted/50', className)}>
      <div className={cn(
        'p-2 rounded-full',
        status === 'normal' && 'bg-primary-100 text-primary-600',
        status === 'warning' && 'bg-warning-100 text-warning-600',
        status === 'danger' && 'bg-danger-100 text-danger-600',
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-lg font-semibold font-mono', statusColors[status])}>
          {value}
          {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
};

export interface StatusDashboardProps {
  status: MachineStatus
  metrics?: {
    feedRate?: number
    spindleSpeed?: number
    temperature?: number
    runtime?: number
  }
  className?: string
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  status,
  metrics = {},
  className,
}) => {
  const formatRuntime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Machine Status</h3>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.feedRate !== undefined && (
          <MetricDisplay
            icon={Gauge}
            label="Feed Rate"
            value={metrics.feedRate}
            unit="mm/min"
            status={metrics.feedRate > 5000 ? 'warning' : 'normal'}
          />
        )}

        {metrics.spindleSpeed !== undefined && (
          <MetricDisplay
            icon={Activity}
            label="Spindle"
            value={metrics.spindleSpeed}
            unit="RPM"
            status={metrics.spindleSpeed > 20000 ? 'warning' : 'normal'}
          />
        )}

        {metrics.temperature !== undefined && (
          <MetricDisplay
            icon={Thermometer}
            label="Temperature"
            value={metrics.temperature.toFixed(1)}
            unit="°C"
            status={
              metrics.temperature > 80 ? 'danger'
                : metrics.temperature > 60 ? 'warning'
                  : 'normal'
            }
          />
        )}

        {metrics.runtime !== undefined && (
          <MetricDisplay
            icon={Timer}
            label="Runtime"
            value={formatRuntime(metrics.runtime)}
            status="normal"
          />
        )}
      </div>
    </div>
  );
};

export interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  onDismiss?: () => void
  className?: string
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  onDismiss,
  className,
}) => {
  const typeConfig = {
    info: {
      icon: Activity,
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-800',
      iconColor: 'text-primary-600',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-800',
      iconColor: 'text-success-600',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      textColor: 'text-warning-800',
      iconColor: 'text-warning-600',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200',
      textColor: 'text-danger-800',
      iconColor: 'text-danger-600',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg border',
          config.bgColor,
          config.borderColor,
          className,
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />
        <p className={cn('flex-1 text-sm font-medium', config.textColor)}>
          {message}
        </p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'p-1 rounded hover:bg-black/5 transition-colors',
              config.textColor,
            )}
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
