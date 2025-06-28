import React from 'react';
import { Card, Alert } from 'antd';

const GuidesView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Guides">
      <Alert message="Guides" description="Guides interface." type="info" showIcon />
    </Card>
  </div>
);

export default GuidesView;
