/**
 * Animated Status Component
 * Status indicator with pulse animation and icon support
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../shared/utils';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  CloseOutlined,
} from '@ant-design/icons';

export interface AnimatedStatusProps {
  status: 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const AnimatedStatus: React.FC<AnimatedStatusProps> = ({
  status,
  label,
  size = 'md',
  showPulse = true,
  className,
}) => {
  const statusConfig = {
    connected: { color: 'bg-green-500', icon: CheckCircleOutlined, text: 'Connected' },
    disconnected: { color: 'bg-red-500', icon: CloseOutlined, text: 'Disconnected' },
    idle: { color: 'bg-amber-500', icon: ExclamationCircleOutlined, text: 'Idle' },
    running: { color: 'bg-blue-500', icon: LoadingOutlined, text: 'Running' },
    error: { color: 'bg-red-600', icon: ExclamationCircleOutlined, text: 'Error' },
    warning: { color: 'bg-amber-600', icon: ExclamationCircleOutlined, text: 'Warning' },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  const pulseVariants: Variants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    static: {}
  };
  
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <motion.div
          className={cn(
            'rounded-full',
            config.color,
            sizeClasses[size]
          )}
          variants={pulseVariants}
          animate={showPulse && (status === 'running' || status === 'connected') ? 'pulse' : 'static'}
        />
        {showPulse && (status === 'running' || status === 'connected') && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              config.color,
              'opacity-20'
            )}
            animate={{
              scale: [1, 2],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </div>
      
      <span className="text-sm font-medium text-foreground">
        {label || config.text}
      </span>
      
      {status === 'running' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icon className="text-blue-500" />
        </motion.div>
      )}
    </div>
  );
};