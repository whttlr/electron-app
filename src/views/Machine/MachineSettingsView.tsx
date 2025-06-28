/**
 * Machine Settings View
 * 
 * Machine-specific settings and configuration.
 */

import React from 'react';
import { Card, Alert } from 'antd';

interface MachineSettingsViewProps {
  route?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

const MachineSettingsView: React.FC<MachineSettingsViewProps> = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Machine Settings">
        <Alert
          message="Machine Settings"
          description="This view will contain machine-specific configuration options."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default MachineSettingsView;