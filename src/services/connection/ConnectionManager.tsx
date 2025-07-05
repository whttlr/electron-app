/**
 * Connection Manager Component
 * Combines connection status display and modal for complete connection management
 */

import React, { useState } from 'react';
import { Space } from 'antd';
import ConnectionStatus from '../../ui/controls/ConnectionStatus';
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

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <ConnectionStatus
        onOpenModal={handleOpenModal}
        compact={compact}
        showSettings={showSettings}
      />

      <ConnectionModal
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ConnectionManager;