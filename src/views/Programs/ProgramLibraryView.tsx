import React from 'react';
import { Card, Alert } from 'antd';

const ProgramLibraryView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Program Library">
      <Alert message="Program Library" description="Program Library interface." type="info" showIcon />
    </Card>
  </div>
);

export default ProgramLibraryView;
