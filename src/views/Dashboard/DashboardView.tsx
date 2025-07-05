import React from 'react';
import {
  Card, Row, Col, Typography, Button, Divider,
} from 'antd';
import {
  ControlOutlined, ToolOutlined, SettingOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { PluginRenderer, SupabaseTestComponent } from '../../components';

// Add inside your dashboard layout:

import DatabaseIntegrationDemo from '../../services/database/DatabaseDemo';

const { Title, Paragraph } = Typography;

// In your component:

const DashboardView: React.FC = () => (
    <div data-testid="dashboard-container">
      <Title level={2}>CNC Dashboard</Title>
        <DatabaseIntegrationDemo />

      <SupabaseTestComponent />
      <Paragraph>
        Welcome to the CNC Jog Controls dashboard. Select a section below to get started.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }} className="dashboard-grid">
        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            data-testid="quick-actions"
            title="Jog Controls"
            extra={<ControlOutlined />}
            actions={[
              <Button type="link" href="/controls" data-testid="quick-action-jog-controls">
                Open Controls
              </Button>,
            ]}
          >
            <p>Manual machine control and positioning</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            data-testid="connection-status"
            title="Machine Status"
            extra={<ToolOutlined />}
            actions={[
              <Button type="link">
                View Status
              </Button>,
            ]}
          >
            <p>Real-time machine monitoring and diagnostics</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            data-testid="plugins-card"
            title="Plugins"
            extra={<AppstoreOutlined />}
            actions={[
              <Button type="link" href="/plugins">
                Manage Plugins
              </Button>,
            ]}
          >
            <p>Install and configure CNC plugins</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            data-testid="settings-card"
            title="Settings"
            extra={<SettingOutlined />}
            actions={[
              <Button type="link" href="/settings">
                Configure
              </Button>,
            ]}
          >
            <p>System configuration and preferences</p>
          </Card>
        </Col>
      </Row>

      {/* Render plugins configured for the main screen */}
      <PluginRenderer screen="main" />

      {/* Show divider if there are plugins */}
      <div style={{ marginTop: '32px' }}>
        <Divider>Additional Tools</Divider>
        <PluginRenderer screen="main" placement="modal" />
      </div>
    </div>
);

export default DashboardView;
