/**
 * Connection Manager Component
 * Combines connection status display and modal for complete connection management
 */

import React, { useState, useEffect } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
// TODO: Replace with @whttlr/ui-cnc import once package is built
// import { ConnectionStatus } from '@whttlr/ui-cnc';
import ConnectionModal from '../../ui/shared/ConnectionModal';

interface ConnectionManagerProps {
  compact?: boolean
  showSettings?: boolean
  placement?: 'header' | 'sidebar' | 'standalone'
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  compact = false,
  showSettings = true,
  placement = 'standalone',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [port, setPort] = useState<string | undefined>(undefined);
  const [baudRate, setBaudRate] = useState<number | undefined>(undefined);

  // Mock connection status - replace with real connection service
  useEffect(() => {
    // This would typically connect to a real connection service
    // For now, we'll simulate connection status
    const mockConnectionStatus = {
      isConnected: false,
      port: undefined,
      baudRate: undefined,
    };

    setIsConnected(mockConnectionStatus.isConnected);
    setPort(mockConnectionStatus.port);
    setBaudRate(mockConnectionStatus.baudRate);
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Space size="small">
        {/* Placeholder for ConnectionStatus - will be replaced with @whttlr/ui-cnc component */}
        <span>
          Connection: {isConnected ? 'Connected' : 'Disconnected'}
          {port && ` (${port})`}
          {baudRate && ` @ ${baudRate}`}
        </span>

        {showSettings && (
          <Tooltip title="Connection settings">
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={handleOpenModal}
            />
          </Tooltip>
        )}
      </Space>

      <ConnectionModal
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ConnectionManager;
