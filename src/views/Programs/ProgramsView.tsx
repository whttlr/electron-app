import React from 'react';
import { Card, Alert } from 'antd';

const ProgramsView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Programs">
      <Alert message="Programs" description="Programs management and configuration." type="info" showIcon />
    </Card>
  </div>
);

export default ProgramsView;
