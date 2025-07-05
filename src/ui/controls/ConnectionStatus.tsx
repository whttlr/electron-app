/**
 * Connection Status Component
 * Displays current connection status and provides quick access to connection modal
 */

import React, { useState, useEffect } from 'react';
import {
  Button, Space, Typography, Tooltip, Badge,
} from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { connectionService, ConnectionStatus as ConnectionStatusType } from '../../services/connection';

const { Text } = Typography;

interface ConnectionStatusProps {
  onOpenModal: () => void
  compact?: boolean
  showSettings?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  onOpenModal,
  compact = false,
  showSettings = true,
}) => {
  const [status, setStatus] = useState<ConnectionStatusType>({ connected: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize and get initial status
    initializeConnection();

    // Add status listener
    connectionService.addStatusListener(handleStatusChange);

    return () => {
      // Remove status listener on cleanup
      connectionService.removeStatusListener(handleStatusChange);
    };
  }, []);

  const initializeConnection = async () => {
    try {
      await connectionService.initialize();
      const currentStatus = connectionService.getConnectionStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to initialize connection:', error);
    }
  };

  const handleStatusChange = (newStatus: ConnectionStatusType) => {
    setStatus(newStatus);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await connectionService.refreshConnectionStatus();
      await connectionService.refreshAvailablePorts();
    } catch (error) {
      console.error('Failed to refresh connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDisconnect = async () => {
    if (status.connected) {
      setLoading(true);
      try {
        await connectionService.disconnect();
      } catch (error) {
        console.error('Failed to disconnect:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusText = () => {
    if (status.connected && status.port) {
      return compact ? status.port : `Connected to ${status.port}`;
    }
    if (status.error) {
      return compact ? 'Error' : `Error: ${status.error}`;
    }
    return compact ? 'Not Connected' : 'Not Connected';
  };

  const getStatusColor = () => {
    if (status.connected) return '#52c41a'; // green
    if (status.error) return '#ff4d4f'; // red
    return '#d9d9d9'; // gray
  };

  const getStatusIcon = () => {
    if (status.connected) {
      return <WifiOutlined style={{ color: getStatusColor() }} />;
    }
    return <DisconnectOutlined style={{ color: getStatusColor() }} />;
  };

  if (compact) {
    return (
      <Space size="small">
        <Badge
          color={getStatusColor()}
          text={
            <Button
              type="text"
              size="small"
              onClick={onOpenModal}
              style={{ padding: 0, height: 'auto' }}
            >
              <Space size="small">
                {getStatusIcon()}
                <Text style={{ fontSize: '12px' }}>{getStatusText()}</Text>
              </Space>
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: '#fafafa',
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      minWidth: '200px',
    }}>
      <Space size="small">
        {getStatusIcon()}
        <div>
          <Text strong style={{ fontSize: '14px' }}>
            {status.connected ? 'Connected' : 'Disconnected'}
          </Text>
          {status.port && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {status.port}
            </div>
          )}
          {status.error && (
            <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
              {status.error}
            </div>
          )}
        </div>
      </Space>

      <Space size="small">
        <Tooltip title="Refresh connection status">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRefresh}
          />
        </Tooltip>

        {status.connected && (
          <Tooltip title="Disconnect">
            <Button
              type="text"
              size="small"
              icon={<DisconnectOutlined />}
              loading={loading}
              onClick={handleQuickDisconnect}
              danger
            />
          </Tooltip>
        )}

        {showSettings && (
          <Tooltip title="Connection settings">
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={onOpenModal}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default ConnectionStatus;