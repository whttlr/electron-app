import * as React from 'react';
import { X } from 'lucide-react';
import { Card, Button } from '@whttlr/ui-core';
import { cn } from './utils';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardContainer = React.forwardRef<HTMLDivElement, DashboardContainerProps>(
  ({ children, className }, ref) => (
      <div ref={ref} className={cn('min-h-screen bg-background text-foreground', className)}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </div>
  ),
);
DashboardContainer.displayName = 'DashboardContainer';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    children, cols = 3, gap = 'md', className,
  }, ref) => {
    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-12',
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-6',
      lg: 'gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', gridClasses[cols], gapClasses[gap], className)}
      >
        {children}
      </div>
    );
  },
);
Grid.displayName = 'Grid';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardGrid = React.forwardRef<HTMLDivElement, DashboardGridProps>(
  ({ children, className }, ref) => (
      <Grid ref={ref} cols={3} gap="lg" className={cn('auto-rows-fr', className)}>
        {children}
      </Grid>
  ),
);
DashboardGrid.displayName = 'DashboardGrid';

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({
    title, children, actions, className,
  }, ref) => (
      <Card ref={ref} className={cn('h-full', className)}>
        {(title || actions) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        )}
        <div className="p-4 flex-1">
          {children}
        </div>
      </Card>
  ),
);
DashboardCard.displayName = 'DashboardCard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({
    isOpen, onClose, title, children, position = 'right', width = 'md', className,
  }, ref) => {
    const widthClasses = {
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[28rem]',
    };

    const positionClasses = {
      left: 'left-0',
      right: 'right-0',
    };

    const translateClasses = {
      left: isOpen ? 'translate-x-0' : '-translate-x-full',
      right: isOpen ? 'translate-x-0' : 'translate-x-full',
    };

    // Handle escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle body scroll lock
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    return (
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          onClick={onClose}
        />

        {/* Sidebar */}
        <div
          ref={ref}
          className={cn(
            'fixed top-0 h-full bg-card border-l border-border z-50',
            'transition-transform duration-300 ease-in-out transform-gpu',
            widthClasses[width],
            positionClasses[position],
            translateClasses[position],
            className,
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </>
    );
  },
);
Sidebar.displayName = 'Sidebar';
