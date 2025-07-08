import React from 'react';
import { Typography, Divider } from 'antd';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter, 
  Button, 
  Grid,
  DashboardContainer 
} from '@whttlr/ui-core';
import {
  ControlOutlined, ToolOutlined, SettingOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { PluginRenderer, SupabaseTestComponent } from '../../components';

// Add inside your dashboard layout:

import DatabaseIntegrationDemo from '../../services/database/DatabaseDemo';

const { Title, Paragraph } = Typography;

// In your component:

const DashboardView: React.FC = () => (
    <DashboardContainer data-testid="dashboard-container">
      <Title level={2}>CNC Dashboard</Title>
        <DatabaseIntegrationDemo />

      <SupabaseTestComponent />
      <Paragraph>
        Welcome to the CNC Jog Controls dashboard. Select a section below to get started.
      </Paragraph>

      <Grid cols={4} gap={4} style={{ marginTop: '24px' }} className="dashboard-grid">
        <Card
          variant="dashboard"
          className="dashboard-card"
          data-testid="quick-actions"
        >
          <CardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Jog Controls</CardTitle>
            <ControlOutlined style={{ fontSize: '1.25rem', color: '#666' }} />
          </CardHeader>
          <CardContent>
            <p>Manual machine control and positioning</p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => window.location.href = '/controls'} data-testid="quick-action-jog-controls">
              Open Controls
            </Button>
          </CardFooter>
        </Card>

        <Card
          variant="dashboard"
          className="dashboard-card"
          data-testid="connection-status"
        >
          <CardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Machine Status</CardTitle>
            <ToolOutlined style={{ fontSize: '1.25rem', color: '#666' }} />
          </CardHeader>
          <CardContent>
            <p>Real-time machine monitoring and diagnostics</p>
          </CardContent>
          <CardFooter>
            <Button variant="link">
              View Status
            </Button>
          </CardFooter>
        </Card>

        <Card
          variant="dashboard"
          className="dashboard-card"
          data-testid="plugins-card"
        >
          <CardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Plugins</CardTitle>
            <AppstoreOutlined style={{ fontSize: '1.25rem', color: '#666' }} />
          </CardHeader>
          <CardContent>
            <p>Install and configure CNC plugins</p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => window.location.href = '/plugins'}>
              Manage Plugins
            </Button>
          </CardFooter>
        </Card>

        <Card
          variant="dashboard"
          className="dashboard-card"
          data-testid="settings-card"
        >
          <CardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Settings</CardTitle>
            <SettingOutlined style={{ fontSize: '1.25rem', color: '#666' }} />
          </CardHeader>
          <CardContent>
            <p>System configuration and preferences</p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => window.location.href = '/settings'}>
              Configure
            </Button>
          </CardFooter>
        </Card>
      </Grid>

      {/* Render plugins configured for the main screen */}
      <PluginRenderer screen="main" />

      {/* Show divider if there are plugins */}
      <div style={{ marginTop: '32px' }}>
        <Divider>Additional Tools</Divider>
        <PluginRenderer screen="main" placement="modal" />
      </div>
    </DashboardContainer>
);

export default DashboardView;
