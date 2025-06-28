/**
 * Machine Setup View
 * 
 * Machine connection and initial setup configuration.
 */

import React from 'react';
import { Card, Alert } from 'antd';

interface MachineSetupViewProps {
  route?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

const MachineSetupView: React.FC<MachineSetupViewProps> = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Machine Setup">
        <Alert
          message="Machine Setup"
          description="This view will contain machine connection and configuration settings."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default MachineSetupView;