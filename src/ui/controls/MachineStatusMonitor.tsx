/**
 * Machine Status Monitor Component
 * Real-time monitoring of CNC machine status with visual indicators
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Space,
  Typography,
  Alert,
  Button,
  Tooltip,
  Timeline,
  Tag,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  WarningOutlined,
  ReloadOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { gcodeService, MachineStatus, GCodeExecution } from '../../services/gcode';

const { Title, Text } = Typography;

interface MachineStatusMonitorProps {
  compact?: boolean
  showControls?: boolean
  refreshInterval?: number
}

export const MachineStatusMonitor: React.FC<MachineStatusMonitorProps> = ({
  compact = false,
  showControls = true,
  refreshInterval = 1000,
}) => {
  const [status, setStatus] = useState<MachineStatus | null>(null);
  const [currentExecution, setCurrentExecution] = useState<GCodeExecution | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    initializeMonitor();
    return () => {
      // Cleanup listeners when component unmounts
      gcodeService.removeStatusListener(handleStatusUpdate);
      gcodeService.removeExecutionListener(handleExecutionUpdate);
    };
  }, []);

  const initializeMonitor = async () => {
    try {
      // Add listeners
      gcodeService.addStatusListener(handleStatusUpdate);
      gcodeService.addExecutionListener(handleExecutionUpdate);

      // Get initial status
      const initialStatus = await gcodeService.getMachineStatus();
      if (initialStatus) {
        setStatus(initialStatus);
        setIsConnected(true);
        setLastUpdate(new Date());
      }

      setCurrentExecution(gcodeService.getCurrentExecution());
    } catch (error) {
      console.error('Failed to initialize machine monitor:', error);
      setIsConnected(false);
    }
  };

  const handleStatusUpdate = (newStatus: MachineStatus) => {
    setStatus(newStatus);
    setIsConnected(true);
    setLastUpdate(new Date());
  };

  const handleExecutionUpdate = (execution: GCodeExecution | null) => {
    setCurrentExecution(execution);
  };

  const handleRefresh = async () => {
    try {
      await gcodeService.getMachineStatus();
    } catch (error) {
      console.error('Failed to refresh status:', error);
      setIsConnected(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'idle': return '#52c41a'; // green
      case 'run': return '#1890ff'; // blue
      case 'alarm': return '#ff4d4f'; // red
      case 'hold': return '#faad14'; // orange
      case 'home': return '#722ed1'; // purple
      case 'check': return '#13c2c2'; // cyan
      default: return '#d9d9d9'; // gray
    }
  };

  const getStateIcon = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'run': return <PlayCircleOutlined />;
      case 'hold': return <PauseCircleOutlined />;
      case 'alarm': return <WarningOutlined />;
      default: return <StopOutlined />;
    }
  };

  const formatPosition = (pos: { x: number; y: number; z: number }) => `X${pos.x.toFixed(3)} Y${pos.y.toFixed(3)} Z${pos.z.toFixed(3)}`;

  const getExecutionProgress = () => {
    if (!currentExecution) return 0;
    return Math.round((currentExecution.completedCommands / currentExecution.totalCommands) * 100);
  };

  if (!isConnected || !status) {
    return (
      <Card title={compact ? undefined : 'Machine Status'} size={compact ? 'small' : 'default'}>
        <Alert
          message="Machine Disconnected"
          description="Unable to connect to the CNC machine. Check your connection settings."
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh} icon={<ReloadOutlined />}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  if (compact) {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Badge color={getStateColor(status.state)} />
            <Text strong>{status.state}</Text>
          </Space>
          {showControls && (
            <Button type="text" size="small" icon={<ReloadOutlined />} onClick={handleRefresh} />
          )}
        </div>

        <div style={{ fontSize: '12px', color: '#666' }}>
          {formatPosition(status.position)}
        </div>

        {currentExecution && (
          <Progress
            percent={getExecutionProgress()}
            size="small"
            status={currentExecution.status === 'failed' ? 'exception' : 'active'}
          />
        )}
      </Space>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
      }}>
        <Title level={4} style={{ margin: 0 }}>
          <DashboardOutlined /> Machine Status
        </Title>
        {showControls && (
          <Space>
            <Tooltip title="Refresh status">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              />
            </Tooltip>
          </Space>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {/* Current State */}
        <Col span={24}>
          <Card size="small">
            <Space size="large">
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: getStateColor(status.state),
                  marginBottom: 8,
                }}>
                  {getStateIcon(status.state)}
                </div>
                <Text strong style={{ color: getStateColor(status.state) }}>
                  {status.state.toUpperCase()}
                </Text>
              </div>

              <div>
                <Text type="secondary">Machine Position</Text>
                <div style={{ fontSize: '16px', fontFamily: 'monospace' }}>
                  {formatPosition(status.position)}
                </div>
              </div>

              <div>
                <Text type="secondary">Work Position</Text>
                <div style={{ fontSize: '16px', fontFamily: 'monospace' }}>
                  {formatPosition(status.workPosition)}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Real-time Values */}
        <Col span={12}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Statistic
                title="Feed Rate"
                value={status.feedRate}
                suffix="mm/min"
                valueStyle={{ fontSize: '18px' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Spindle Speed"
                value={status.spindleSpeed}
                suffix="RPM"
                valueStyle={{ fontSize: '18px' }}
              />
            </Col>
            {status.temperature !== undefined && (
              <Col span={12}>
                <Statistic
                  title="Temperature"
                  value={status.temperature}
                  suffix="°C"
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
            )}
            <Col span={12}>
              <div>
                <Text type="secondary">Last Update</Text>
                <div style={{ fontSize: '12px' }}>
                  {lastUpdate?.toLocaleTimeString() || 'Unknown'}
                </div>
              </div>
            </Col>
          </Row>
        </Col>

        {/* Current Execution */}
        <Col span={12}>
          {currentExecution ? (
            <Card title="Current Execution" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>{currentExecution.fileName || 'Multiple Commands'}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={
                      currentExecution.status === 'running' ? 'processing'
                        : currentExecution.status === 'completed' ? 'success'
                          : currentExecution.status === 'failed' ? 'error' : 'default'
                    }>
                      {currentExecution.status.toUpperCase()}
                    </Tag>
                  </div>
                </div>

                <Progress
                  percent={getExecutionProgress()}
                  status={currentExecution.status === 'failed' ? 'exception' : 'active'}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <Text type="secondary">
                    {currentExecution.completedCommands} / {currentExecution.totalCommands} completed
                  </Text>
                  {currentExecution.failedCommands > 0 && (
                    <Text type="danger">
                      {currentExecution.failedCommands} failed
                    </Text>
                  )}
                </div>
              </Space>
            </Card>
          ) : (
            <Card title="Execution Status" size="small">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">No active execution</Text>
              </div>
            </Card>
          )}
        </Col>

        {/* Status Timeline */}
        <Col span={24}>
          <Card title="Recent Activity" size="small">
            <Timeline size="small">
              <Timeline.Item color={getStateColor(status.state)}>
                <Text>Machine state: {status.state}</Text>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(status.lastUpdate).toLocaleString()}
                </div>
              </Timeline.Item>

              {currentExecution && (
                <Timeline.Item color="blue">
                  <Text>Execution started: {currentExecution.fileName || 'Commands'}</Text>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(currentExecution.startTime).toLocaleString()}
                  </div>
                </Timeline.Item>
              )}

              <Timeline.Item color="gray">
                <Text>Last position update</Text>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatPosition(status.position)}
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MachineStatusMonitor;