/**
 * Floating Action Button Component
 * FAB with hover animations, badges, and positioning options
 */

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../shared/utils';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  tooltip?: string;
  disabled?: boolean;
  badge?: number;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  position = 'bottom-right',
  size = 'md',
  color = 'primary',
  tooltip,
  disabled = false,
  badge,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg',
  };
  
  const colorClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  
  const fabVariants: Variants = {
    initial: {
      scale: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    hover: {
      scale: 1.1,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };
  
  return (
    <motion.button
      className={cn(
        'fixed z-50 rounded-full flex items-center justify-center',
        'focus:outline-none focus:ring-4 focus:ring-primary/20',
        'transition-colors duration-200',
        positionClasses[position],
        sizeClasses[size],
        colorClasses[color],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      variants={fabVariants}
      initial="initial"
      animate={isHovered && !disabled ? 'hover' : 'initial'}
      whileTap={!disabled ? 'tap' : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={!disabled ? onClick : undefined}
      title={tooltip}
    >
      {icon}
      
      {badge && badge > 0 && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {badge > 99 ? '99+' : badge}
        </motion.div>
      )}
    </motion.button>
  );
};