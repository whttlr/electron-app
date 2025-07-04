import * as React from 'react';
import { cn } from './utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// CNC-specific card variants
const StatusCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    status?: 'connected' | 'disconnected' | 'idle' | 'running' | 'error'
  }
>(({ className, status = 'idle', ...props }, ref) => {
  const statusColors = {
    connected: 'border-success-500 bg-success-50 text-success-900',
    disconnected: 'border-danger-500 bg-danger-50 text-danger-900',
    idle: 'border-warning-500 bg-warning-50 text-warning-900',
    running: 'border-primary-500 bg-primary-50 text-primary-900',
    error: 'border-danger-600 bg-danger-100 text-danger-900',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border-2 shadow-cnc transition-all duration-200',
        statusColors[status],
        className,
      )}
      {...props}
    />
  );
});
StatusCard.displayName = 'StatusCard';

const DashboardCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean
  }
>(({ className, interactive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden',
      interactive && 'hover:shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:bg-card/80 hover:border-primary/50',
      className,
    )}
    {...props}
  />
));
DashboardCard.displayName = 'DashboardCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatusCard,
  DashboardCard,
};
