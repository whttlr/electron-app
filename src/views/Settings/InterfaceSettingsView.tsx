import React from 'react';
import { Card, Alert } from 'antd';

const InterfaceSettingsView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Interface Settings">
      <Alert message="Interface Settings" description="Interface Settings interface." type="info" showIcon />
    </Card>
  </div>
);

export default InterfaceSettingsView;
