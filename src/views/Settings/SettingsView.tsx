import React from 'react';
import { Card, Alert } from 'antd';

const SettingsView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Settings">
      <Alert message="Settings" description="Settings management and configuration." type="info" showIcon />
    </Card>
  </div>
);

export default SettingsView;
