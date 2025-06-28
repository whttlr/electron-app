import React from 'react';
import { Card, Alert } from 'antd';

const AdvancedSettingsView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Advanced Settings">
      <Alert message="Advanced Settings" description="Advanced Settings interface." type="info" showIcon />
    </Card>
  </div>
);

export default AdvancedSettingsView;
