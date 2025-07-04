import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'border-red-500 bg-red-500/10 text-red-300',
        success: 'border-green-500 bg-green-500/10 text-green-300',
        warning: 'border-amber-500 bg-amber-500/10 text-amber-300',
        info: 'border-blue-500 bg-blue-500/10 text-blue-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

// Banner-style alert for notifications
const AlertBanner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    onDismiss?: () => void;
    title?: string;
  }
>(({ className, type, message, onDismiss, title, ...props }, ref) => {
  const variantMap = {
    info: 'info',
    success: 'success', 
    warning: 'warning',
    error: 'destructive',
  } as const;

  const iconMap = {
    info: '🛈',
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  return (
    <Alert
      ref={ref}
      variant={variantMap[type]}
      className={cn('flex items-start justify-between gap-3', className)}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        <span className="text-lg">{iconMap[type]}</span>
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-foreground/60 hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-foreground/10 transition-colors"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </Alert>
  );
});
AlertBanner.displayName = 'AlertBanner';

export { Alert, AlertTitle, AlertDescription, AlertBanner, alertVariants };