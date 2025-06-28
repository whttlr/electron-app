/**
 * Workspace View
 * 
 * Workspace management and configuration.
 */

import React from 'react';
import { Card, Alert } from 'antd';

interface WorkspaceViewProps {
  route?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Workspace Management">
        <Alert
          message="Workspace"
          description="This view will contain workspace configuration and management tools."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default WorkspaceView;