/**
 * Masonry Layout Component
 * Pinterest-style masonry grid layout
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '../../shared/utils';
import { useResponsive } from './useResponsive';
import { ResponsiveColumns } from './breakpoints';

export interface MasonryLayoutProps {
  children: ReactNode[];
  columns?: ResponsiveColumns;
  gap?: number;
  className?: string;
}

export const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 16,
  className,
}) => {
  const { screens } = useResponsive();
  const [columnElements, setColumnElements] = useState<ReactNode[][]>([]);
  
  // Determine current column count
  const getCurrentColumns = () => {
    if (screens.lg && columns.lg) return columns.lg;
    if (screens.md && columns.md) return columns.md;
    if (screens.sm && columns.sm) return columns.sm;
    return columns.xs || 1;
  };
  
  const currentColumns = getCurrentColumns();
  
  // Distribute children across columns
  useEffect(() => {
    const cols: ReactNode[][] = Array.from({ length: currentColumns }, () => []);
    
    children.forEach((child, index) => {
      const columnIndex = index % currentColumns;
      cols[columnIndex].push(
        <div key={index} style={{ marginBottom: gap }}>
          {child}
        </div>
      );
    });
    
    setColumnElements(cols);
  }, [children, currentColumns, gap]);
  
  return (
    <div
      className={cn('flex', className)}
      style={{ gap }}
    >
      {columnElements.map((column, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col"
        >
          {column}
        </div>
      ))}
    </div>
  );
};