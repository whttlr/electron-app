/**
 * Toast Component
 * Individual toast notification component with animations
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Button } from '../../adapters/ant-design/Button';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { ToastComponentProps } from './types';

export const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onClose, onRead }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const getTypeConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircleOutlined />,
          color: 'border-green-500 bg-green-50 text-green-800',
          iconColor: 'text-green-500',
        };
      case 'error':
        return {
          icon: <ExclamationCircleOutlined />,
          color: 'border-red-500 bg-red-50 text-red-800',
          iconColor: 'text-red-500',
        };
      case 'warning':
        return {
          icon: <WarningOutlined />,
          color: 'border-amber-500 bg-amber-50 text-amber-800',
          iconColor: 'text-amber-500',
        };
      case 'info':
        return {
          icon: <InfoCircleOutlined />,
          color: 'border-blue-500 bg-blue-50 text-blue-800',
          iconColor: 'text-blue-500',
        };
      case 'machine':
        return {
          icon: <ToolOutlined />,
          color: 'border-purple-500 bg-purple-50 text-purple-800',
          iconColor: 'text-purple-500',
        };
      case 'safety':
        return {
          icon: <SafetyCertificateOutlined />,
          color: 'border-red-600 bg-red-100 text-red-900',
          iconColor: 'text-red-600',
        };
      case 'job':
        return {
          icon: <ClockCircleOutlined />,
          color: 'border-indigo-500 bg-indigo-50 text-indigo-800',
          iconColor: 'text-indigo-500',
        };
      default:
        return {
          icon: <InfoCircleOutlined />,
          color: 'border-gray-500 bg-gray-50 text-gray-800',
          iconColor: 'text-gray-500',
        };
    }
  };
  
  const config = getTypeConfig();
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };
  
  const handleClick = () => {
    if (!toast.read) {
      onRead(toast.id);
    }
    toast.onClick?.();
  };
  
  const variants = {
    initial: { opacity: 0, x: 100, scale: 0.3 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.5, transition: { duration: 0.3 } },
  };
  
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate={isVisible ? "animate" : "exit"}
      exit="exit"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        'relative p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm max-w-sm cursor-pointer',
        config.color,
        !toast.read && 'ring-2 ring-primary/20',
        toast.priority === 'critical' && 'animate-pulse'
      )}
      onClick={handleClick}
    >
      {/* Priority Indicator */}
      {toast.priority === 'critical' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
      
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 text-xl', config.iconColor)}>
          {toast.icon || config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs mt-1 opacity-90 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-current opacity-60 hover:opacity-100 -mt-1 -mr-1"
            />
          </div>
          
          {/* Actions */}
          {toast.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {toast.actions.map((action, index) => (
                <Button
                  key={index}
                  size="small"
                  type={action.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-xs opacity-60 mt-2">
            {toast.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};