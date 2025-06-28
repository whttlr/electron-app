import React from 'react';
import { Card, Alert } from 'antd';

const WorkspacePreviewView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Workspace Preview">
      <Alert message="Workspace Preview" description="2D/3D workspace visualization and preview." type="info" showIcon />
    </Card>
  </div>
);

export default WorkspacePreviewView;