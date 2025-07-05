/**
 * Chart Types and Interfaces
 * Shared type definitions for chart components
 */

export interface ChartDataPoint {
  [key: string]: any;
}

export interface ChartConfig {
  dataKey: string;
  name: string;
  color: string;
  type?: 'line' | 'area' | 'bar';
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface MetricCardData {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percentage' | 'time';
  precision?: number;
  unit?: string;
  target?: number;
  icon?: React.ReactNode;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  height?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
  error?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
}

export interface LineChartProps extends BaseChartProps {
  config: ChartConfig[];
  strokeWidth?: number;
  showDots?: boolean;
  showBrush?: boolean;
  referenceLine?: {
    value: number;
    label?: string;
    color?: string;
  };
}

export interface AreaChartProps extends Omit<LineChartProps, 'config'> {
  dataKey: string;
  gradient?: boolean;
  fillOpacity?: number;
}

export interface BarChartProps extends Omit<LineChartProps, 'config'> {
  dataKey: string;
  barSize?: number;
  layout?: 'horizontal' | 'vertical';
}

export interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  labelPosition?: 'inside' | 'outside';
  colors?: string[];
}

export interface MetricCardProps {
  data: MetricCardData;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
  showTarget?: boolean;
  animated?: boolean;
  className?: string;
}

export interface MachineDashboardProps {
  className?: string;
  refreshInterval?: number;
  showHeader?: boolean;
  compactMode?: boolean;
}