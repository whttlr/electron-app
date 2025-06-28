import React from 'react';
import { Card, Alert } from 'antd';

const ToolCalibrationView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Tool Calibration">
      <Alert message="Tool Calibration" description="Tool Calibration interface." type="info" showIcon />
    </Card>
  </div>
);

export default ToolCalibrationView;
