/**
 * Line Chart Component
 * Professional line chart with multiple data series support
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Card } from '../../adapters/ant-design/Card';
import { Spin, Empty, Alert } from 'antd';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush,
  Tooltip,
} from 'recharts';
import { LineChartProps } from './types';
import { chartDefaults } from './constants';
import { getChartMargins, formatTooltipValue } from './utils';

export const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  config,
  height = chartDefaults.height,
  title,
  subtitle,
  className,
  loading = false,
  error,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  responsive = true,
  strokeWidth = chartDefaults.strokeWidth,
  showDots = false,
  showBrush = false,
  referenceLine,
}) => {
  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center" style={{ height }}>
          <Spin size="large" tip="Loading chart data..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <Alert message="Chart Error" description={error} type="error" showIcon />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <Empty description="No data available" />
      </Card>
    );
  }

  const margins = getChartMargins(showLegend, true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-6">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        )}
        
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={margins}
            >
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
              )}
              
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              
              {showTooltip && (
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              )}
              
              {showLegend && (
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              )}
              
              {referenceLine && (
                <ReferenceLine 
                  y={referenceLine.value}
                  stroke={referenceLine.color || '#ef4444'}
                  strokeDasharray="5 5"
                  label={referenceLine.label}
                />
              )}
              
              {config.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth || strokeWidth}
                  strokeDasharray={line.strokeDasharray}
                  dot={showDots ? { r: 4, fill: line.color } : false}
                  activeDot={{ r: 6, fill: line.color }}
                  name={line.name}
                  animationDuration={chartDefaults.animationDuration}
                />
              ))}
              
              {showBrush && (
                <Brush 
                  dataKey="name"
                  height={30}
                  stroke="#a855f7"
                />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};