/**
 * Stack Component
 * Flexible stack layout with spacing and dividers
 */

import React, { ReactNode } from 'react';
import { cn } from '../../shared/utils';
import { useResponsive } from './useResponsive';

export interface StackProps {
  children: ReactNode;
  spacing?: number | string;
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
  divider?: ReactNode;
  responsive?: {
    direction?: {
      xs?: 'vertical' | 'horizontal';
      md?: 'vertical' | 'horizontal';
    };
  };
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 16,
  direction = 'vertical',
  align = 'stretch',
  divider,
  responsive,
  className,
}) => {
  const { isMobile } = useResponsive();
  
  // Determine responsive direction
  const getDirection = () => {
    if (responsive?.direction) {
      if (isMobile && responsive.direction.xs) return responsive.direction.xs;
      if (!isMobile && responsive.direction.md) return responsive.direction.md;
    }
    return direction;
  };
  
  const currentDirection = getDirection();
  const childrenArray = React.Children.toArray(children);
  
  const stackClasses = cn(
    'flex',
    currentDirection === 'vertical' ? 'flex-col' : 'flex-row',
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
    },
    className
  );
  
  return (
    <div
      className={stackClasses}
      style={{
        gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
      }}
    >
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {divider && index < childrenArray.length - 1 && (
            <div className="flex-shrink-0">
              {divider}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};