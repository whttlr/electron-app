/**
 * Animated List Component
 * List with staggered animation effects for children
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../shared/utils';

export interface AnimatedListProps {
  children: React.ReactNode[];
  stagger?: number;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  stagger = 0.1,
  direction = 'vertical',
  className,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1,
      },
    },
  };
  
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === 'horizontal' ? -20 : 0,
      y: direction === 'vertical' ? 20 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };
  
  return (
    <motion.div
      className={cn(
        'space-y-2',
        direction === 'horizontal' && 'flex space-x-2 space-y-0',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};