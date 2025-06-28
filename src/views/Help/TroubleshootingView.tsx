import React from 'react';
import { Card, Alert } from 'antd';

const TroubleshootingView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Troubleshooting">
      <Alert message="Troubleshooting" description="Troubleshooting interface." type="info" showIcon />
    </Card>
  </div>
);

export default TroubleshootingView;
