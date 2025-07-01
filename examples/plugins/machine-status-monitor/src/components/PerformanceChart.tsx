import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

interface PerformanceData {
  timestamp: number
  feedRate: number
  spindleLoad: number
  axisLoad: {
    x: number
    y: number
    z: number
  }
}

interface PerformanceChartProps {
  data: PerformanceData[]
  maxDataPoints?: number
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  maxDataPoints = 50
}) => {
  const [selectedMetric, setSelectedMetric] = React.useState<'overview' | 'feedRate' | 'spindleLoad' | 'axisLoad'>('overview')

  // Limit data points for performance
  const chartData = data.slice(-maxDataPoints).map(d => ({
    ...d,
    time: format(new Date(d.timestamp), 'HH:mm:ss'),
    avgAxisLoad: (d.axisLoad.x + d.axisLoad.y + d.axisLoad.z) / 3
  }))

  const renderChart = () => {
    switch (selectedMetric) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#888"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#888"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="feedRate"
                stroke="#00ff88"
                strokeWidth={2}
                dot={false}
                name="Feed Rate %"
              />
              <Line
                type="monotone"
                dataKey="spindleLoad"
                stroke="#ff8800"
                strokeWidth={2}
                dot={false}
                name="Spindle Load %"
              />
              <Line
                type="monotone"
                dataKey="avgAxisLoad"
                stroke="#0088ff"
                strokeWidth={2}
                dot={false}
                name="Avg Axis Load %"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'feedRate':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 150]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />
              <Area
                type="monotone"
                dataKey="feedRate"
                stroke="#00ff88"
                fill="#00ff88"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'spindleLoad':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />
              <Area
                type="monotone"
                dataKey="spindleLoad"
                stroke="#ff8800"
                fill="#ff8800"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'axisLoad':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="axisLoad.x"
                stroke="#ff0000"
                strokeWidth={2}
                dot={false}
                name="X Axis"
              />
              <Line
                type="monotone"
                dataKey="axisLoad.y"
                stroke="#00ff00"
                strokeWidth={2}
                dot={false}
                name="Y Axis"
              />
              <Line
                type="monotone"
                dataKey="axisLoad.z"
                stroke="#0000ff"
                strokeWidth={2}
                dot={false}
                name="Z Axis"
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="performance-chart">
      <div className="performance-chart__controls">
        <button
          className={`tab ${selectedMetric === 'overview' ? 'tab--active' : ''}`}
          onClick={() => setSelectedMetric('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${selectedMetric === 'feedRate' ? 'tab--active' : ''}`}
          onClick={() => setSelectedMetric('feedRate')}
        >
          Feed Rate
        </button>
        <button
          className={`tab ${selectedMetric === 'spindleLoad' ? 'tab--active' : ''}`}
          onClick={() => setSelectedMetric('spindleLoad')}
        >
          Spindle Load
        </button>
        <button
          className={`tab ${selectedMetric === 'axisLoad' ? 'tab--active' : ''}`}
          onClick={() => setSelectedMetric('axisLoad')}
        >
          Axis Load
        </button>
      </div>

      <div className="performance-chart__content">
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="performance-chart__empty">
            <p>No performance data available</p>
          </div>
        )}
      </div>

      <div className="performance-chart__stats">
        {chartData.length > 0 && (
          <>
            <div className="stat">
              <span className="stat__label">Current Feed:</span>
              <span className="stat__value">{chartData[chartData.length - 1].feedRate}%</span>
            </div>
            <div className="stat">
              <span className="stat__label">Spindle Load:</span>
              <span className="stat__value">{chartData[chartData.length - 1].spindleLoad}%</span>
            </div>
            <div className="stat">
              <span className="stat__label">Data Points:</span>
              <span className="stat__value">{chartData.length}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}