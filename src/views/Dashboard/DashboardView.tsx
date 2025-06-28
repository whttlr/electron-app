/**
 * Dashboard View
 * 
 * Main dashboard view providing overview of machine status, recent activity, and quick actions.
 */

import React from 'react';
import { Card, Row, Col, Statistic, Button, Progress, Alert } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  HomeOutlined,
  ToolOutlined,
  FileOutlined 
} from '@ant-design/icons';
import { stateManager } from '../../services/state';
import { navigate } from '../../services/router';
import { 
  getWorkCoordinateSystems, 
  getDefaultWorkCoordinateSystem,
  getToolDirections,
  getDefaultToolDirection,
  isMachineFeatureEnabled 
} from '../../services/config';

interface DashboardViewProps {
  route?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

const DashboardView: React.FC<DashboardViewProps> = () => {
  const [appState, setAppState] = React.useState(stateManager.getState());

  React.useEffect(() => {
    const subscription = stateManager.subscribe(setAppState);
    return () => subscription.unsubscribe();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'controls':
        navigate('/controls');
        break;
      case 'machine':
        navigate('/machine');
        break;
      case 'workspace':
        navigate('/workspace');
        break;
      case 'programs':
        navigate('/programs');
        break;
    }
  };

  const connectionStatus = appState.machine.isConnected ? 'success' : 'error';
  const connectionText = appState.machine.isConnected ? 'Connected' : 'Disconnected';

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Connection Status */}
        <Col span={24}>
          <Alert
            message={`Machine Status: ${connectionText}`}
            description={
              appState.machine.isConnected 
                ? 'Machine is connected and ready for operation'
                : 'Connect to machine to enable full functionality'
            }
            type={connectionStatus}
            showIcon
            action={
              !appState.machine.isConnected ? (
                <Button size="small" type="primary" onClick={() => navigate('/machine/setup')}>
                  Connect Machine
                </Button>
              ) : null
            }
          />
        </Col>

        {/* Machine Status Cards */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Connection"
              value={connectionText}
              valueStyle={{ color: appState.machine.isConnected ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="X Position"
              value={appState.machine.position.x}
              suffix="mm"
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Y Position"
              value={appState.machine.position.y}
              suffix="mm"
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Z Position"
              value={appState.machine.position.z}
              suffix="mm"
              precision={2}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col span={24}>
          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  block
                  size="large"
                  onClick={() => handleQuickAction('controls')}
                  disabled={!appState.machine.isConnected}
                >
                  Jog Controls
                </Button>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<ToolOutlined />}
                  block
                  size="large"
                  onClick={() => handleQuickAction('machine')}
                >
                  Machine Setup
                </Button>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<HomeOutlined />}
                  block
                  size="large"
                  onClick={() => handleQuickAction('workspace')}
                >
                  Workspace
                </Button>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<FileOutlined />}
                  block
                  size="large"
                  onClick={() => handleQuickAction('programs')}
                >
                  Programs
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Machine Dimensions */}
        <Col xs={24} lg={12}>
          <Card title="Workspace Dimensions">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Width"
                  value={appState.machine.dimensions.width}
                  suffix="mm"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Height"
                  value={appState.machine.dimensions.height}
                  suffix="mm"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Depth"
                  value={appState.machine.dimensions.depth}
                  suffix="mm"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* System Status */}
        <Col xs={24} lg={12}>
          <Card title="System Status">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                Initialization: {appState.system.initialized ? 'Complete' : 'Pending'}
              </div>
              <Progress 
                percent={appState.system.initialized ? 100 : 50} 
                status={appState.system.initialized ? 'success' : 'active'}
              />
            </div>
            
            <div>
              <div style={{ marginBottom: '8px' }}>
                Units: {appState.machine.units}
              </div>
              <div style={{ marginBottom: '8px' }}>
                Jog Distance: {appState.jog.distance}mm
              </div>
              <div>
                Jog Speed: {appState.jog.speed}mm/min
              </div>
            </div>
          </Card>
        </Col>

        {/* Machine Features */}
        <Col xs={24} lg={12}>
          <Card title="Machine Features">
            <div style={{ marginBottom: '8px' }}>
              <strong>Work Coordinate Systems:</strong> {
                isMachineFeatureEnabled('workCoordinateSystems') 
                  ? `${getWorkCoordinateSystems().length} available (Default: ${getDefaultWorkCoordinateSystem()})`
                  : 'Disabled'
              }
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Tool Direction:</strong> {
                isMachineFeatureEnabled('toolDirection')
                  ? `${getToolDirections().join(', ')} (Default: ${getDefaultToolDirection()})`
                  : 'Disabled'
              }
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Spindle Control:</strong> {
                isMachineFeatureEnabled('spindleControl') ? 'Enabled' : 'Disabled'
              }
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Probing:</strong> {
                isMachineFeatureEnabled('probing') ? 'Enabled' : 'Disabled'
              }
            </div>
            <div>
              <strong>Safety Features:</strong> {
                isMachineFeatureEnabled('safetyFeatures') ? 'Active' : 'Disabled'
              }
            </div>
          </Card>
        </Col>

        {/* Configuration Info */}
        <Col xs={24} lg={12}>
          <Card title="Configuration">
            <div style={{ marginBottom: '8px' }}>
              <strong>Available WCS:</strong> {getWorkCoordinateSystems().join(', ')}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Tool Directions:</strong> {getToolDirections().join(', ')}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              These features are configured in machine.json and can be enabled/disabled per machine.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardView;