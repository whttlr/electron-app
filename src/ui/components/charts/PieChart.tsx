/**
 * Pie Chart Component
 * Professional pie chart with customizable styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Card } from '../../adapters/ant-design/Card';
import { Spin, Empty, Alert } from 'antd';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { PieChartProps } from './types';
import { chartDefaults, pieChartColors } from './constants';
import { formatTooltipValue } from './utils';

export const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  height = chartDefaults.height,
  title,
  subtitle,
  className,
  loading = false,
  error,
  showLegend = true,
  showTooltip = true,
  responsive = true,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = false,
  labelPosition = 'outside',
  colors = pieChartColors,
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

  const renderCustomLabel = (entry: any) => {
    if (!showLabels) return null;
    
    const percent = ((entry.value / data.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(0);
    return `${entry[nameKey]}: ${percent}%`;
  };

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
            <RechartsPieChart>
              {showTooltip && (
                <Tooltip 
                  formatter={(value, name) => formatTooltipValue(value as number, name as string, {})}
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
                  verticalAlign="bottom"
                  height={36}
                />
              )}
              
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showLabels ? renderCustomLabel : false}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                animationDuration={chartDefaults.animationDuration}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};