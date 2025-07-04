/**
 * Connection Modal Component
 * Provides interface for managing CNC machine connections
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  Divider,
  Typography,
  List,
  Card,
  Switch,
  InputNumber,
  message,
  Alert,
  Tag,
  Tooltip,
} from 'antd';
import {
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  SettingOutlined,
  HistoryOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  connectionService,
  ConnectionStatus,
  ConnectionPreferences,
  SerialPort,
} from '../services/connection';

const { Title, Text } = Typography;
const { Option } = Select;

interface ConnectionModalProps {
  visible: boolean
  onClose: () => void
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  visible,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);
  const [preferences, setPreferences] = useState<ConnectionPreferences>({
    autoConnect: false,
    defaultBaudRate: 115200,
    connectionTimeout: 5000,
    retryAttempts: 3,
    lastUsedPorts: [],
  });
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [selectedBaudRate, setSelectedBaudRate] = useState<number>(115200);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    // Add status listener
    connectionService.addStatusListener(handleStatusChange);
    return () => {
      connectionService.removeStatusListener(handleStatusChange);
    };
  }, []);

  const loadData = async () => {
    try {
      const currentStatus = connectionService.getConnectionStatus();
      const ports = connectionService.getAvailablePorts();
      const prefs = connectionService.getPreferences();

      setStatus(currentStatus);
      setAvailablePorts(ports);
      setPreferences(prefs);

      // Set form values
      setSelectedPort(currentStatus.port || prefs.defaultPort || '');
      setSelectedBaudRate(currentStatus.baudRate || prefs.defaultBaudRate);

      form.setFieldsValue({
        port: currentStatus.port || prefs.defaultPort || '',
        baudRate: currentStatus.baudRate || prefs.defaultBaudRate,
        autoConnect: prefs.autoConnect,
        defaultPort: prefs.defaultPort,
      });
    } catch (error) {
      console.error('Failed to load connection data:', error);
      message.error('Failed to load connection data');
    }
  };

  const handleStatusChange = (newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    if (newStatus.connected && newStatus.port) {
      setSelectedPort(newStatus.port);
      form.setFieldValue('port', newStatus.port);
    }
  };

  const handleRefreshPorts = async () => {
    setLoading(true);
    try {
      const ports = await connectionService.refreshAvailablePorts();
      setAvailablePorts(ports);
      message.success(`Found ${ports.length} available ports`);
    } catch (error) {
      console.error('Failed to refresh ports:', error);
      message.error('Failed to refresh ports');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedPort) {
      message.error('Please select a port');
      return;
    }

    setLoading(true);
    try {
      const success = await connectionService.connect(selectedPort, selectedBaudRate);
      if (success) {
        message.success(`Connected to ${selectedPort}`);
      } else {
        message.error('Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      message.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const success = await connectionService.disconnect();
      if (success) {
        message.success('Disconnected successfully');
      } else {
        message.error('Disconnect failed');
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      message.error('Disconnect failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAsDefault = async (port: string) => {
    try {
      await connectionService.setDefaultPort(port);
      const updatedPrefs = connectionService.getPreferences();
      setPreferences(updatedPrefs);
      form.setFieldValue('defaultPort', port);
      message.success(`Set ${port} as default port`);
    } catch (error) {
      console.error('Failed to set default port:', error);
      message.error('Failed to set default port');
    }
  };

  const handleAutoConnectChange = async (enabled: boolean) => {
    try {
      await connectionService.setAutoConnect(enabled);
      const updatedPrefs = connectionService.getPreferences();
      setPreferences(updatedPrefs);
      message.success(`Auto-connect ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update auto-connect:', error);
      message.error('Failed to update auto-connect setting');
    }
  };

  const handlePortSelect = (port: string) => {
    setSelectedPort(port);
    form.setFieldValue('port', port);
  };

  const renderPortOption = (port: SerialPort) => {
    const isDefault = port.path === preferences.defaultPort;
    const isLastUsed = preferences.lastUsedPorts.includes(port.path);

    return (
      <Option key={port.path} value={port.path}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>{port.path}</Text>
            {port.manufacturer && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {port.manufacturer}
              </div>
            )}
          </div>
          <Space>
            {isLastUsed && <Tag color="blue" icon={<HistoryOutlined />}>Recent</Tag>}
            {isDefault && <Tag color="gold" icon={<StarFilled />}>Default</Tag>}
          </Space>
        </div>
      </Option>
    );
  };

  const renderPortCard = (port: SerialPort) => {
    const isDefault = port.path === preferences.defaultPort;
    const isConnected = status.connected && status.port === port.path;

    return (
      <Card
        key={port.path}
        size="small"
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Space>
              <Text strong>{port.path}</Text>
              {isConnected && <Tag color="green">Connected</Tag>}
              {isDefault && <Tag color="gold" icon={<StarFilled />}>Default</Tag>}
            </Space>
            {port.manufacturer && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                {port.manufacturer}
                {port.serialNumber && ` • S/N: ${port.serialNumber}`}
              </div>
            )}
          </div>
          <Space>
            {!isDefault && (
              <Tooltip title="Set as default port">
                <Button
                  type="text"
                  size="small"
                  icon={<StarOutlined />}
                  onClick={() => handleSetAsDefault(port.path)}
                />
              </Tooltip>
            )}
            <Button
              type={isConnected ? 'default' : 'primary'}
              size="small"
              icon={isConnected ? <DisconnectOutlined /> : <WifiOutlined />}
              onClick={() => {
                if (isConnected) {
                  handleDisconnect();
                } else {
                  handlePortSelect(port.path);
                }
              }}
              loading={loading}
            >
              {isConnected ? 'Disconnect' : 'Select'}
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  const baudRateOptions = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

  return (
    <Modal
      title="Connection Management"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={null}
    >
      <Form form={form} layout="vertical">
        {/* Current Status */}
        <Alert
          message={status.connected ? 'Connected' : 'Disconnected'}
          description={
            status.connected && status.port
              ? `Connected to ${status.port} at ${status.baudRate || 115200} baud`
              : status.error || 'No active connection'
          }
          type={status.connected ? 'success' : status.error ? 'error' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Available Ports */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
          }}>
            <Title level={5} style={{ margin: 0 }}>Available Ports</Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefreshPorts}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
          </div>

          {availablePorts.length > 0 ? (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {availablePorts.map(renderPortCard)}
            </div>
          ) : (
            <Card size="small">
              <Text type="secondary">No serial ports found. Make sure your CNC controller is connected.</Text>
            </Card>
          )}
        </div>

        {/* Connection Form */}
        <Title level={5}>Connect to Port</Title>
        <Space style={{ width: '100%', marginBottom: 16 }} size="middle">
          <Form.Item label="Port" style={{ flex: 1, marginBottom: 0 }}>
            <Select
              value={selectedPort}
              onChange={setSelectedPort}
              placeholder="Select a port"
              style={{ width: '200px' }}
            >
              {availablePorts.map(renderPortOption)}
            </Select>
          </Form.Item>

          <Form.Item label="Baud Rate" style={{ marginBottom: 0 }}>
            <Select
              value={selectedBaudRate}
              onChange={setSelectedBaudRate}
              style={{ width: '120px' }}
            >
              {baudRateOptions.map((rate) => (
                <Option key={rate} value={rate}>{rate}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label=" " style={{ marginBottom: 0 }}>
            {status.connected ? (
              <Button
                danger
                icon={<DisconnectOutlined />}
                onClick={handleDisconnect}
                loading={loading}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<WifiOutlined />}
                onClick={handleConnect}
                loading={loading}
                disabled={!selectedPort}
              >
                Connect
              </Button>
            )}
          </Form.Item>
        </Space>

        <Divider />

        {/* Connection Preferences */}
        <Title level={5}>Preferences</Title>
        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Auto-connect on startup</Text>
              <Switch
                checked={preferences.autoConnect}
                onChange={handleAutoConnectChange}
              />
            </div>

            {preferences.defaultPort && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Default port:</Text>
                <Tag color="gold">{preferences.defaultPort}</Tag>
              </div>
            )}

            {preferences.lastUsedPorts.length > 0 && (
              <div>
                <Text type="secondary">Recent ports:</Text>
                <div style={{ marginTop: 4 }}>
                  {preferences.lastUsedPorts.map((port) => (
                    <Tag
                      key={port}
                      style={{ marginBottom: 4, cursor: 'pointer' }}
                      onClick={() => handlePortSelect(port)}
                    >
                      {port}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConnectionModal;
