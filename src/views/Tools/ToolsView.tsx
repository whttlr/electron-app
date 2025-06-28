import React from 'react';
import { Card, Alert } from 'antd';

const ToolsView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Tools">
      <Alert message="Tools" description="Tools management and configuration." type="info" showIcon />
    </Card>
  </div>
);

export default ToolsView;
