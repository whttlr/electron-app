import React from 'react';
import { Card, Alert } from 'antd';

const WorkspaceSetupView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Workspace Setup">
      <Alert message="Workspace Setup" description="Configure workspace dimensions and settings." type="info" showIcon />
    </Card>
  </div>
);

export default WorkspaceSetupView;