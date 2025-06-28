import React from 'react';
import { Card, Alert } from 'antd';

const HelpView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Help">
      <Alert message="Help" description="Help management and configuration." type="info" showIcon />
    </Card>
  </div>
);

export default HelpView;
