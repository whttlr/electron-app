/**
 * Responsive Grid Component
 * Grid system with responsive column configurations
 */

import React, { ReactNode } from 'react';
import { cn } from '../../shared/utils';
import { useResponsive } from './useResponsive';
import { ResponsiveColumns } from './breakpoints';

export interface ResponsiveGridProps {
  children: ReactNode;
  columns?: ResponsiveColumns;
  gap?: number | string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 16,
  className,
}) => {
  const { screens } = useResponsive();
  
  // Determine current column count based on screen size
  const getCurrentColumns = () => {
    if (screens.xxl && columns.xxl) return columns.xxl;
    if (screens.xl && columns.xl) return columns.xl;
    if (screens.lg && columns.lg) return columns.lg;
    if (screens.md && columns.md) return columns.md;
    if (screens.sm && columns.sm) return columns.sm;
    return columns.xs || 1;
  };
  
  const currentColumns = getCurrentColumns();
  
  return (
    <div
      className={cn('grid w-full', className)}
      style={{
        gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
      }}
    >
      {children}
    </div>
  );
};