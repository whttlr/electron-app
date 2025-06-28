import React from 'react';
import { Card, Alert } from 'antd';

const ProgramEditorView: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Card title="Program Editor">
      <Alert message="Program Editor" description="Program Editor interface." type="info" showIcon />
    </Card>
  </div>
);

export default ProgramEditorView;
