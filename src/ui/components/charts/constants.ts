/**
 * Chart Constants and Color Schemes
 * Shared constants for chart components
 */

export const chartColors = {
  primary: '#a855f7',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  accent: {
    purple: '#8b5cf6',
    blue: '#06b6d4',
    green: '#10b981',
    orange: '#f97316',
    pink: '#ec4899',
    yellow: '#eab308',
  },
};

export const chartDefaults = {
  height: 300,
  strokeWidth: 2,
  animationDuration: 300,
  tooltipAnimationDuration: 0,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
};

export const metricCardSizes = {
  sm: {
    padding: 16,
    titleSize: 14,
    valueSize: 24,
    iconSize: 20,
  },
  md: {
    padding: 20,
    titleSize: 16,
    valueSize: 32,
    iconSize: 24,
  },
  lg: {
    padding: 24,
    titleSize: 18,
    valueSize: 40,
    iconSize: 28,
  },
};

export const pieChartColors = [
  '#a855f7',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
];

export const machineStatusColors = {
  online: '#22c55e',
  offline: '#ef4444',
  warning: '#f59e0b',
  maintenance: '#8b5cf6',
};