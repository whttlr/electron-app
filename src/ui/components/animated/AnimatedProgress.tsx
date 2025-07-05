/**
 * Animated Progress Component
 * Progress indicator with smooth animations and various styles
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';

export interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
  striped = false,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  const colorClasses = {
    primary: 'from-primary to-primary/80',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
  };
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showPercentage && (
            <motion.span 
              className="text-sm font-mono text-secondary-400"
              key={percentage}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(displayValue)}%
            </motion.span>
          )}
        </div>
      )}
      
      <div className={cn(
        'relative overflow-hidden rounded-full bg-secondary-200',
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            'h-full bg-gradient-to-r rounded-full relative',
            colorClasses[color],
            striped && 'bg-stripes',
            animated && 'animate-pulse'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            delay: 0.1
          }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </motion.div>
      </div>
    </div>
  );
};