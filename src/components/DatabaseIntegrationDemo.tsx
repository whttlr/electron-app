/**
 * Database Integration Demo Component
 * Demonstrates the new database-backed configuration and plugin features
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Statistic, Table, Spin, Alert, Button, Space,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { configManagementService } from '../services/bundled-api-supabase/config-management';

const { Title, Text } = Typography;

interface ConnectionStatus {
  connected: boolean
  loading: boolean
  error: string | null
  configCount: number
  lastChecked: Date | null
}

export const DatabaseIntegrationDemo: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    loading: true,
    error: null,
    configCount: 0,
    lastChecked: null,
  });

  const [pluginStats, setPluginStats] = useState<any[]>([]);

  const pluginStatsColumns = [
    { title: 'Plugin', dataIndex: 'name', key: 'name' },
    { title: 'Downloads', dataIndex: 'downloads', key: 'downloads' },
    { title: 'Likes', dataIndex: 'likes', key: 'likes' },
    { title: 'Stars', dataIndex: 'stars', key: 'stars' },
    { title: 'Installs', dataIndex: 'installs', key: 'installs' },
  ];

  const checkDatabaseConnection = async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Test database connection by fetching configurations
      const configs = await configManagementService.request('/app-configurations');

      // Try to get plugin stats
      const stats = await configManagementService.request('/plugin-stats');

      setStatus({
        connected: true,
        loading: false,
        error: null,
        configCount: configs.length || 0,
        lastChecked: new Date(),
      });

      // Format plugin stats for display
      const formattedStats = stats.map((stat: any) => ({
        key: stat.plugin_id,
        name: stat.plugin_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        downloads: stat.downloads || 0,
        likes: stat.likes || 0,
        stars: stat.stars || 0,
        installs: stat.installs || 0,
      }));

      setPluginStats(formattedStats);
    } catch (error) {
      setStatus({
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        configCount: 0,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const getStatusColor = () => {
    if (status.loading) return '#1890ff';
    return status.connected ? '#52c41a' : '#ff4d4f';
  };

  const getStatusText = () => {
    if (status.loading) return 'Checking...';
    return status.connected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    if (status.loading) return null;
    return status.connected ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Database Integration Demo</Title>
      <Text type="secondary">
        This demo showcases the new database-backed configuration management and plugin analytics system.
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Database Connection Status"
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={checkDatabaseConnection}
                loading={status.loading}
              >
                Refresh
              </Button>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Status"
                  value={getStatusText()}
                  valueStyle={{ color: getStatusColor() }}
                  prefix={getStatusIcon()}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Configurations"
                  value={status.configCount}
                  valueStyle={{ color: status.connected ? '#52c41a' : '#8c8c8c' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Last Checked"
                  value={status.lastChecked ? status.lastChecked.toLocaleTimeString() : 'Never'}
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>

            {status.error && (
              <Alert
                message="Connection Error"
                description={status.error}
                type="error"
                style={{ marginTop: 16 }}
                showIcon
              />
            )}

            {status.connected && (
              <Alert
                message="Database Connected"
                description="Successfully connected to Supabase. Configuration management and plugin analytics are operational."
                type="success"
                style={{ marginTop: 16 }}
                showIcon
              />
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Plugin Analytics">
            <Spin spinning={status.loading}>
              <Table
                dataSource={pluginStats.length > 0 ? pluginStats : [
                  {
                    key: 'machine-monitor', name: 'Machine Monitor', downloads: 0, likes: 0, stars: 0, installs: 0,
                  },
                  {
                    key: 'gcode-snippets', name: 'G-code Snippets', downloads: 0, likes: 0, stars: 0, installs: 0,
                  },
                ]}
                columns={pluginStatsColumns}
                rowKey="key"
                size="small"
                pagination={false}
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {status.connected
                    ? `Showing ${pluginStats.length > 0 ? 'real' : 'sample'} plugin analytics data from database.`
                    : 'Connect to database to see real plugin statistics.'
                  }
                </Text>
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DatabaseIntegrationDemo;
