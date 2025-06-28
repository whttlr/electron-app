import React from 'react';
import { Card, Alert } from 'antd';

const UnitsSettingsView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Units Settings">
      <Alert message="Units Settings" description="Units Settings interface." type="info" showIcon />
    </Card>
  </div>
);

export default UnitsSettingsView;
