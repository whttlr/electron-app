/**
 * Metric Card Component
 * Professional metric display with trend indicators and animations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Card } from '../../adapters/ant-design/Card';
import { Tooltip, Progress, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { MetricCardProps } from './types';
import { formatValue, getTrendIcon, getTrendColor } from './utils';
import { metricCardSizes } from './constants';

export const MetricCard: React.FC<MetricCardProps> = ({
  data,
  size = 'md',
  showChange = true,
  showTarget = true,
  animated = true,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Animate value changes
  useEffect(() => {
    if (animated && typeof data.value === 'number') {
      const startValue = displayValue;
      const endValue = data.value;
      const duration = 1000; // 1 second
      const steps = 60;
      const stepValue = (endValue - startValue) / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue(startValue + (stepValue * currentStep));
        
        if (currentStep >= steps) {
          setDisplayValue(endValue);
          clearInterval(timer);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(typeof data.value === 'number' ? data.value : 0);
    }
  }, [data.value, animated, displayValue]);
  
  const sizeConfig = metricCardSizes[size];
  const formattedValue = formatValue(
    animated && typeof data.value === 'number' ? displayValue : data.value,
    data.format,
    data.precision,
    data.unit
  );
  
  const changeValue = data.change;
  const changeFormatted = changeValue ? `${changeValue > 0 ? '+' : ''}${changeValue.toFixed(2)}%` : null;
  
  const targetProgress = data.target && typeof data.value === 'number' 
    ? Math.min((data.value / data.target) * 100, 100)
    : null;
  
  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card
        className={cn(
          'h-full',
          'hover:shadow-lg transition-shadow duration-200',
          size === 'sm' && 'p-3',
          size === 'md' && 'p-4',
          size === 'lg' && 'p-6'
        )}
        style={{ padding: sizeConfig.padding }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="text-gray-600 font-medium"
                style={{ fontSize: sizeConfig.titleSize }}
              >
                {data.title}
              </span>
              {data.icon && (
                <Tooltip title="More information">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span 
                className="font-bold text-gray-900"
                style={{ fontSize: sizeConfig.valueSize }}
              >
                {formattedValue}
              </span>
              
              {showChange && changeValue !== undefined && (
                <Space className={cn('text-sm', getTrendColor(data.trend))}>
                  {getTrendIcon(data.trend)}
                  <span>{changeFormatted}</span>
                </Space>
              )}
            </div>
            
            {showTarget && targetProgress !== null && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progress to target</span>
                  <span className="text-xs text-gray-500">
                    {targetProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  percent={targetProgress}
                  showInfo={false}
                  size="small"
                  strokeColor={
                    targetProgress >= 100 ? '#22c55e' :
                    targetProgress >= 75 ? '#f59e0b' : '#a855f7'
                  }
                />
              </div>
            )}
          </div>
          
          {data.icon && (
            <div 
              className="text-gray-400 ml-3"
              style={{ fontSize: sizeConfig.iconSize }}
            >
              {data.icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};