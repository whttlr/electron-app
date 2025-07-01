import React from 'react';
import { Card, Row, Col, Typography, Button, Divider } from 'antd';
import { ControlOutlined, ToolOutlined, SettingOutlined, AppstoreOutlined } from '@ant-design/icons';
import PluginRenderer from '../../components/PluginRenderer';

const { Title, Paragraph } = Typography;

const DashboardView: React.FC = () => {
  return (
    <div>
      <Title level={2}>CNC Dashboard</Title>
      <Paragraph>
        Welcome to the CNC Jog Controls dashboard. Select a section below to get started.
      </Paragraph>
      
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            title="Jog Controls"
            extra={<ControlOutlined />}
            actions={[
              <Button type="primary" href="/controls">
                Open Controls
              </Button>
            ]}
          >
            <p>Manual machine control and positioning</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            title="Machine Status"
            extra={<ToolOutlined />}
            actions={[
              <Button type="default">
                View Status
              </Button>
            ]}
          >
            <p>Real-time machine monitoring and diagnostics</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            title="Plugins"
            extra={<AppstoreOutlined />}
            actions={[
              <Button type="default" href="/plugins">
                Manage Plugins
              </Button>
            ]}
          >
            <p>Install and configure CNC plugins</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card
            className="dashboard-card"
            title="Settings"
            extra={<SettingOutlined />}
            actions={[
              <Button type="default" href="/settings">
                Configure
              </Button>
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
};

export default DashboardView;