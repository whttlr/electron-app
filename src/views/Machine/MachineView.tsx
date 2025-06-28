/**
 * Machine View
 * 
 * Machine configuration and management view.
 */

import React from 'react';
import { Card, Tabs, Button } from 'antd';
import { navigate } from '../../services/router';

interface MachineViewProps {
  route?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

const MachineView: React.FC<MachineViewProps> = () => {
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <div style={{ padding: '16px' }}>
          <p>Machine configuration overview and status.</p>
          <Button type="primary" onClick={() => navigate('/machine/setup')}>
            Go to Setup
          </Button>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      children: (
        <div style={{ padding: '16px' }}>
          <p>Real-time machine status and diagnostics.</p>
          <Button onClick={() => navigate('/machine/diagnostics')}>
            Run Diagnostics
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Machine Management">
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default MachineView;