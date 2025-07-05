/**
 * Bar Chart Component
 * Professional bar chart with horizontal and vertical layouts
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Card } from '../../adapters/ant-design/Card';
import { Spin, Empty, Alert } from 'antd';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { BarChartProps } from './types';
import { chartDefaults } from './constants';
import { getChartMargins, formatTooltipValue } from './utils';

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  dataKey,
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
  barSize = 40,
  layout = 'vertical',
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
            <RechartsBarChart
              layout={layout}
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
                type={layout === 'vertical' ? 'number' : 'category'}
                dataKey={layout === 'vertical' ? undefined : 'name'}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              
              <YAxis 
                type={layout === 'vertical' ? 'category' : 'number'}
                dataKey={layout === 'vertical' ? 'name' : undefined}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
                axisLine={{ stroke: '#d1d5db' }}
                width={80}
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
              
              <Bar
                dataKey={dataKey}
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
                maxBarSize={barSize}
                animationDuration={chartDefaults.animationDuration}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};