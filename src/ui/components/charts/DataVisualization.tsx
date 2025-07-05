/**
 * Data Visualization Components - Legacy Export
 * 
 * This file now re-exports from the modular chart components.
 * Use individual component imports for better tree-shaking.
 */

// Re-export everything from the modular structure
export {
  // Components
  MetricCard,
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  MachineDashboard,
  
  // Types
  type ChartDataPoint,
  type ChartConfig,
  type MetricCardData,
  type BaseChartProps,
  type LineChartProps,
  type AreaChartProps,
  type BarChartProps,
  type PieChartProps,
  type MetricCardProps,
  type MachineDashboardProps,
  
  // Constants
  chartColors,
  chartDefaults,
  metricCardSizes,
  pieChartColors,
  machineStatusColors,
  
  // Utilities
  formatValue,
  getTrendIcon,
  getTrendColor,
  generateTimeLabels,
  calculatePercentageChange,
  getChartMargins,
  formatTooltipValue,
  generateGradientId,
  createLinearGradient,
  
  // Legacy aliases
  LineChartComponent as LineChart,
  AreaChartComponent as AreaChart,
  BarChartComponent as BarChart,
  PieChartComponent as PieChart,
} from './index';

/**
 * @deprecated Use individual component imports instead:
 * 
 * ```typescript
 * import { MetricCard, LineChartComponent } from '@/ui/components/charts';
 * ```
 * 
 * Or import from specific files:
 * 
 * ```typescript
 * import { MetricCard } from '@/ui/components/charts/MetricCard';
 * import { LineChartComponent } from '@/ui/components/charts/LineChart';
 * ```
 */