import React from 'react';
import { Card, Alert } from 'antd';

const ToolLibraryView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Tool Library">
      <Alert message="Tool Library" description="Tool Library interface." type="info" showIcon />
    </Card>
  </div>
);

export default ToolLibraryView;
