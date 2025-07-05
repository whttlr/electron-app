/**
 * Chart Utility Functions
 * Shared utility functions for chart components
 */

import { TrendingUpOutlined, TrendingDownOutlined, MinusOutlined } from '@ant-design/icons';
import React from 'react';

export const formatValue = (
  value: number | string, 
  format?: string, 
  precision = 2, 
  unit?: string
): string => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
      }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(precision)}%`;
    case 'time':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return `${hours}h ${minutes}m`;
    case 'number':
    default:
      const formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
      return unit ? `${formatted} ${unit}` : formatted;
  }
};

export const getTrendIcon = (trend?: string): React.ReactNode => {
  switch (trend) {
    case 'up':
      return React.createElement(TrendingUpOutlined, { className: "text-green-500" });
    case 'down':
      return React.createElement(TrendingDownOutlined, { className: "text-red-500" });
    case 'stable':
      return React.createElement(MinusOutlined, { className: "text-gray-500" });
    default:
      return null;
  }
};

export const getTrendColor = (trend?: string): string => {
  switch (trend) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-red-500';
    case 'stable':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};

export const generateTimeLabels = (
  startTime: Date, 
  endTime: Date, 
  intervals: number
): string[] => {
  const labels: string[] = [];
  const step = (endTime.getTime() - startTime.getTime()) / intervals;
  
  for (let i = 0; i <= intervals; i++) {
    const time = new Date(startTime.getTime() + (step * i));
    labels.push(time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }
  
  return labels;
};

export const calculatePercentageChange = (
  current: number, 
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getChartMargins = (
  showLegend: boolean, 
  showLabels: boolean
) => ({
  top: showLegend ? 40 : 20,
  right: 30,
  left: showLabels ? 60 : 20,
  bottom: showLabels ? 40 : 20,
});

export const formatTooltipValue = (
  value: number, 
  name: string, 
  props: any
): [string, string] => {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : value;
  
  return [formattedValue, name];
};

export const generateGradientId = (color: string): string => {
  return `gradient-${color.replace('#', '')}`;
};

export const createLinearGradient = (
  id: string, 
  color: string, 
  opacity = 0.8
): React.ReactNode => {
  return React.createElement('defs', { key: id }, [
    React.createElement('linearGradient', {
      key: `gradient-${id}`,
      id: id,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, [
      React.createElement('stop', {
        key: `stop1-${id}`,
        offset: "5%",
        stopColor: color,
        stopOpacity: opacity
      }),
      React.createElement('stop', {
        key: `stop2-${id}`,
        offset: "95%",
        stopColor: color,
        stopOpacity: 0
      })
    ])
  ]);
};