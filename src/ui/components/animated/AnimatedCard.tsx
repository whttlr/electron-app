/**
 * Animated Card Component
 * Card component with hover, click, and glow animations
 */

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Card } from '../../adapters/ant-design/Card';

export interface AnimatedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'click' | 'glow';
  delay?: number;
  duration?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(({ 
  children,
  variant = 'default',
  delay = 0,
  duration = 0.3,
  className,
  onClick,
  disabled = false,
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const cardVariants: Variants = {
    initial: {
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    hover: {
      scale: variant === 'hover' ? 1.02 : 1,
      boxShadow: variant === 'hover' ? '0 10px 25px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: { duration },
    },
    tap: {
      scale: variant === 'click' ? 0.98 : 1,
      transition: { duration: 0.1 },
    },
    glow: {
      boxShadow: [
        '0 0 0 0 rgba(168, 85, 247, 0.4)',
        '0 0 0 10px rgba(168, 85, 247, 0)',
        '0 0 0 0 rgba(168, 85, 247, 0)',
      ],
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop'
      },
    },
  };
  
  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="initial"
      animate={[
        isHovered && !disabled ? 'hover' : 'initial',
        variant === 'glow' ? 'glow' : ''
      ].filter(Boolean)}
      whileTap={!disabled ? 'tap' : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
});

AnimatedCard.displayName = 'AnimatedCard';