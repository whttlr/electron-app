/**
 * Monitoring Dashboard - Real-time system monitoring interface
 * Displays analytics, performance metrics, alerts, and system health
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Badge, Alert, Tabs, Progress, Table, Tag,
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DashboardOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  BugOutlined,
  UserOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAnalytics } from '../../../services/analytics/hooks/useAnalytics';
import './MonitoringDashboard.css';

const { TabPane } = Tabs;

interface MonitoringDashboardProps {
  className?: string;
  refreshInterval?: number;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  className,
  refreshInterval = 30000, // 30 seconds
}) => {
  const { track } = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 12,
    responseTime: 156,
    errorRate: 0.02,
    cncMachinesOnline: 8,
    systemLoad: 0.45,
    memoryUsage: 0.67,
    networkLatency: 23,
  });
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 80% threshold',
      timestamp: Date.now() - 300000,
      severity: 'warning',
    },
    {
      id: '2',
      type: 'info',
      title: 'CNC Machine Connected',
      description: 'Machine #3 has come online',
      timestamp: Date.now() - 150000,
      severity: 'info',
    },
  ]);

  // Mock performance data
  const [performanceData] = useState(() => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        responseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: Math.random() * 0.05,
        throughput: Math.floor(Math.random() * 1000) + 500,
        memoryUsage: Math.random() * 0.3 + 0.4,
      });
    }
    return data;
  });

  useEffect(() => {
    track('user_interaction', 'ui_interaction', 'monitoring_dashboard_viewed');

    // Set up real-time data updates
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 100) + 100,
        errorRate: Math.random() * 0.05,
        systemLoad: Math.random() * 0.3 + 0.3,
        memoryUsage: Math.random() * 0.4 + 0.4,
        networkLatency: Math.floor(Math.random() * 20) + 10,
      }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [track, refreshInterval]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    track('user_interaction', 'ui_interaction', 'monitoring_tab_changed', { tab: key });
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return '#ff4d4f';
    if (value >= thresholds.warning) return '#faad14';
    return '#52c41a';
  };

  const alertColumns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors = {
          critical: 'red',
          warning: 'orange',
          info: 'blue',
        };
        return <Tag color={colors[severity as keyof typeof colors]}>{severity.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleTimeString(),
    },
  ];

  const pieData = [
    { name: 'Connected', value: realTimeData.cncMachinesOnline, color: '#52c41a' },
    { name: 'Offline', value: 4, color: '#ff4d4f' },
    { name: 'Maintenance', value: 2, color: '#faad14' },
  ];

  return (
    <div className={`monitoring-dashboard ${className || ''}`}>
      <div className="dashboard-header">
        <h2>
          <DashboardOutlined /> System Monitoring
        </h2>
        <Badge
          count={alerts.filter((a) => a.severity === 'critical').length}
          style={{ backgroundColor: '#ff4d4f' }}
        >
          <AlertOutlined style={{ fontSize: '18px' }} />
        </Badge>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span>
              <DashboardOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          {/* Real-time metrics */}
          <Row gutter={[16, 16]} className="metrics-row">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Active Users"
                  value={realTimeData.activeUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Response Time"
                  value={realTimeData.responseTime}
                  suffix="ms"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{
                    color: getStatusColor(realTimeData.responseTime, { warning: 200, critical: 500 }),
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Error Rate"
                  value={(realTimeData.errorRate * 100).toFixed(2)}
                  suffix="%"
                  prefix={<BugOutlined />}
                  valueStyle={{
                    color: getStatusColor(realTimeData.errorRate, { warning: 0.02, critical: 0.05 }),
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="CNC Machines"
                  value={realTimeData.cncMachinesOnline}
                  suffix="/ 14"
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* System health indicators */}
          <Row gutter={[16, 16]} className="health-row">
            <Col xs={24} md={12}>
              <Card title="System Load" extra={<Tag color="green">Healthy</Tag>}>
                <Progress
                  percent={realTimeData.systemLoad * 100}
                  status={realTimeData.systemLoad > 0.8 ? 'exception' : 'active'}
                  strokeColor={getStatusColor(realTimeData.systemLoad, { warning: 0.7, critical: 0.9 })}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Memory Usage" extra={<Tag color="orange">Warning</Tag>}>
                <Progress
                  percent={realTimeData.memoryUsage * 100}
                  status={realTimeData.memoryUsage > 0.8 ? 'exception' : 'active'}
                  strokeColor={getStatusColor(realTimeData.memoryUsage, { warning: 0.7, critical: 0.9 })}
                />
              </Card>
            </Col>
          </Row>

          {/* Performance chart */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Response Time Trend (24h)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#1890ff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* CNC Machine Status */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="CNC Machine Status">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Recent Alerts">
                <div className="alerts-list">
                  {alerts.slice(0, 5).map((alert) => (
                    <Alert
                      key={alert.id}
                      message={alert.title}
                      description={alert.description}
                      type={alert.severity as any}
                      icon={
                        alert.severity === 'critical' ? <CloseCircleOutlined />
                          : alert.severity === 'warning' ? <ExclamationCircleOutlined />
                            : <CheckCircleOutlined />
                      }
                      style={{ marginBottom: 8 }}
                      closable
                    />
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Performance
            </span>
          }
          key="performance"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Performance Metrics">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#1890ff"
                      fillOpacity={1}
                      fill="url(#colorResponse)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="throughput"
                      stroke="#52c41a"
                      fillOpacity={1}
                      fill="url(#colorThroughput)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <AlertOutlined />
              Alerts
            </span>
          }
          key="alerts"
        >
          <Card title="System Alerts">
            <Table
              columns={alertColumns}
              dataSource={alerts}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BugOutlined />
              Errors
            </span>
          }
          key="errors"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Error Rate Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="errorRate"
                      stroke="#ff4d4f"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};
