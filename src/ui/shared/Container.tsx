import * as React from 'react';
import { cn } from './utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  center?: boolean
  padding?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className, size = 'xl', center = true, padding = true, ...props
  }, ref) => (
      <div
        ref={ref}
        className={cn(
          'w-full',
          center && 'mx-auto',
          padding && 'px-4 sm:px-6 lg:px-8',
          size === 'sm' && 'max-w-screen-sm',
          size === 'md' && 'max-w-screen-md',
          size === 'lg' && 'max-w-screen-lg',
          size === 'xl' && 'max-w-screen-xl',
          size === '2xl' && 'max-w-screen-2xl',
          size === 'full' && 'max-w-none',
          className,
        )}
        {...props}
      />
  ),
);
Container.displayName = 'Container';

// CNC-specific container variants
const ControlContainer = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, ...props }, ref) => (
      <Container
        ref={ref}
        size="full"
        className={cn(
          'bg-background border border-border rounded-lg shadow-cnc p-6',
          className,
        )}
        {...props}
      />
  ),
);
ControlContainer.displayName = 'ControlContainer';

const DashboardContainer = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, ...props }, ref) => (
      <Container
        ref={ref}
        size="2xl"
        className={cn(
          'min-h-screen py-8',
          className,
        )}
        {...props}
      />
  ),
);
DashboardContainer.displayName = 'DashboardContainer';

export { Container, ControlContainer, DashboardContainer };
