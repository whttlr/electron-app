/**
 * Flex Container Component
 * Flexible layout container with responsive support
 */

import React, { ReactNode } from 'react';
import { cn } from '../../shared/utils';
import { useResponsive } from './useResponsive';

export interface FlexContainerProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
  gap?: number;
  responsive?: {
    direction?: {
      xs?: 'row' | 'col';
      md?: 'row' | 'col';
      lg?: 'row' | 'col';
    };
  };
  className?: string;
}

export const FlexContainer: React.FC<FlexContainerProps> = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 0,
  responsive,
  className,
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Determine responsive direction
  const getDirection = () => {
    if (responsive?.direction) {
      if (isMobile && responsive.direction.xs) return responsive.direction.xs;
      if (isTablet && responsive.direction.md) return responsive.direction.md;
      if (!isMobile && !isTablet && responsive.direction.lg) return responsive.direction.lg;
    }
    return direction;
  };
  
  const currentDirection = getDirection();
  
  const flexClasses = cn(
    'flex',
    // Direction
    currentDirection === 'col' ? 'flex-col' : 'flex-row',
    // Justify
    {
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
    },
    // Align
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
    },
    // Wrap
    wrap && 'flex-wrap',
    className
  );
  
  return (
    <div
      className={flexClasses}
      style={{
        gap: gap > 0 ? `${gap}px` : undefined,
      }}
    >
      {children}
    </div>
  );
};