import React from 'react';
import { Card, Alert } from 'antd';

const ProgramHistoryView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Program History">
      <Alert message="Program History" description="Program History interface." type="info" showIcon />
    </Card>
  </div>
);

export default ProgramHistoryView;
