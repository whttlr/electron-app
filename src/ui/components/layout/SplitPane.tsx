/**
 * Split Pane Component
 * Resizable split layout with horizontal or vertical orientation
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '../../shared/utils';
import { useResponsive } from './useResponsive';

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  resizable?: boolean;
  vertical?: boolean;
  className?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  initialLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  resizable = true,
  vertical = false,
  className,
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const { isMobile } = useResponsive();
  
  // On mobile, stack vertically
  if (isMobile) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex-1 overflow-auto">{left}</div>
        <div className="flex-1 overflow-auto border-t border-border">{right}</div>
      </div>
    );
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    setIsDragging(true);
    e.preventDefault();
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !resizable) return;
    
    const container = document.getElementById('split-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const percentage = vertical
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;
    
    setLeftWidth(Math.min(Math.max(percentage, minLeftWidth), maxLeftWidth));
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  return (
    <div
      id="split-container"
      className={cn(
        'flex h-full',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {/* Left/Top Panel */}
      <div
        className="overflow-auto bg-card"
        style={{
          [vertical ? 'height' : 'width']: `${leftWidth}%`,
        }}
      >
        {left}
      </div>
      
      {/* Resizer */}
      {resizable && (
        <div
          className={cn(
            'bg-border hover:bg-primary/20 transition-colors',
            vertical ? 'h-1 cursor-row-resize' : 'w-1 cursor-col-resize',
            isDragging && 'bg-primary/30'
          )}
          onMouseDown={handleMouseDown}
        />
      )}
      
      {/* Right/Bottom Panel */}
      <div
        className="overflow-auto bg-card"
        style={{
          [vertical ? 'height' : 'width']: `${100 - leftWidth}%`,
        }}
      >
        {right}
      </div>
    </div>
  );
};