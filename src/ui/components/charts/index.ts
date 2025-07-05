/**
 * Chart Components - Main Export
 * Professional data visualization components for CNC Control
 */

// Components
export { MetricCard } from './MetricCard';
export { LineChartComponent } from './LineChart';
export { AreaChartComponent } from './AreaChart';
export { BarChartComponent } from './BarChart';
export { PieChartComponent } from './PieChart';
export { MachineDashboard } from './MachineDashboard';

// Types
export type {
  ChartDataPoint,
  ChartConfig,
  MetricCardData,
  BaseChartProps,
  LineChartProps,
  AreaChartProps,
  BarChartProps,
  PieChartProps,
  MetricCardProps,
  MachineDashboardProps,
} from './types';

// Constants
export { chartColors, chartDefaults, metricCardSizes, pieChartColors, machineStatusColors } from './constants';

// Utilities
export { 
  formatValue, 
  getTrendIcon, 
  getTrendColor, 
  generateTimeLabels, 
  calculatePercentageChange,
  getChartMargins,
  formatTooltipValue,
  generateGradientId,
  createLinearGradient,
} from './utils';

// Legacy exports for backward compatibility
export { LineChartComponent as LineChart };
export { AreaChartComponent as AreaChart };
export { BarChartComponent as BarChart };
export { PieChartComponent as PieChart };