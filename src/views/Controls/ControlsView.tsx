import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Button, InputNumber, Select, Space, Alert, Divider, Spin,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { PluginRenderer, WorkingAreaPreview, MachineDisplay2D } from '../../components';
import { useMachineConfig, useStateConfig } from '../../services/config/useConfig';

const { Title } = Typography;
const { Option } = Select;

const ControlsView: React.FC = () => {
  // Configuration hooks
  const {
    machineConfig,
    isLoading: machineLoading,
    error: machineError,
    jogIncrements,
    feedRateLimits,
    workingAreaDimensions,
    defaultPosition,
  } = useMachineConfig();

  const {
    stateConfig,
    isLoading: stateLoading,
  } = useStateConfig();

  // State management
  const [jogDistance, setJogDistance] = useState(1);
  const [feedRate, setFeedRate] = useState(1000);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showTrail, setShowTrail] = useState(false);
  const [isMetric, setIsMetric] = useState(true);

  // Derived values from config
  const workArea = workingAreaDimensions();
  const feedLimits = feedRateLimits();
  const availableIncrements = jogIncrements(isMetric);

  // Initialize values from config when loaded
  useEffect(() => {
    if (machineConfig && stateConfig) {
      setJogDistance(machineConfig.jogSettings.metricIncrements[2] || 1); // Default to 3rd increment
      setFeedRate(machineConfig.jogSettings.defaultSpeed);
      setPosition(defaultPosition());
      setIsConnected(stateConfig.defaultState.machine.isConnected);
    }
  }, [machineConfig, stateConfig, defaultPosition]);

  const handleJog = (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    if (!isConnected) {
      console.log('Machine not connected');
      return;
    }

    const distance = jogDistance * direction;
    setPosition((prev) => ({
      ...prev,
      [axis]: prev[axis] + distance,
    }));

    console.log(`Jogging ${axis.toUpperCase()} by ${distance}mm at ${feedRate}mm/min`);
  };

  const handleHome = () => {
    const homePos = defaultPosition();
    setPosition(homePos);
    console.log('Homing all axes');
  };

  const handleSetOrigin = () => {
    // In a real implementation, this would send G92 command
    console.log('Setting current position as origin (G92)');
  };

  const handleGoHome = () => {
    const homePos = defaultPosition();
    setPosition(homePos);
    console.log('Going to home position (G28)');
  };

  // Show loading spinner while configuration loads
  if (machineLoading || stateLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px',
      }}>
        <Spin size="large" tip="Loading configuration..." />
      </div>
    );
  }

  // Show error if configuration failed to load
  if (machineError) {
    return (
      <Alert
        message="Configuration Error"
        description={`Failed to load machine configuration: ${machineError}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div data-testid="controls-container">
      <Title level={2}>Jog Controls</Title>

      {!isConnected && (
        <Alert
          message="Machine Not Connected"
          description="Connect to your CNC machine to enable jog controls."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button type="primary" onClick={() => setIsConnected(true)}>
              Connect
            </Button>
          }
        />
      )}

      {/* 3D and 2D Preview Section */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <WorkingAreaPreview
            currentPosition={position}
            workArea={workArea}
            showGrid={showGrid}
            onGridToggle={setShowGrid}
          />
        </Col>
        <Col xs={24} lg={12}>
          <MachineDisplay2D
            currentPosition={position}
            workArea={workArea}
            showGrid={showGrid}
            showTrail={showTrail}
            onGridToggle={setShowGrid}
            onTrailToggle={setShowTrail}
            onSetOrigin={handleSetOrigin}
            onGoHome={handleGoHome}
          />
        </Col>
      </Row> */}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Position Display">
            <div style={{ textAlign: 'center', fontSize: '18px', marginBottom: '16px' }}>
              <div>X: {position.x.toFixed(machineConfig?.features.coordinateDisplay.precision || 3)} {isMetric ? 'mm' : 'in'}</div>
              <div>Y: {position.y.toFixed(machineConfig?.features.coordinateDisplay.precision || 3)} {isMetric ? 'mm' : 'in'}</div>
              <div>Z: {position.z.toFixed(machineConfig?.features.coordinateDisplay.precision || 3)} {isMetric ? 'mm' : 'in'}</div>
            </div>
            <Button type="primary" block onClick={handleHome}>
              Home All Axes
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Jog Settings">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <label>Unit System:</label>
                <Select
                  value={isMetric ? 'metric' : 'imperial'}
                  onChange={(value) => setIsMetric(value === 'metric')}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <Option value="metric">Metric (mm)</Option>
                  <Option value="imperial">Imperial (inches)</Option>
                </Select>
              </div>

              <div>
                <label>Jog Distance ({isMetric ? 'mm' : 'in'}):</label>
                <Select
                  value={jogDistance}
                  onChange={setJogDistance}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {availableIncrements.map((increment, index) => (
                    <Option key={increment} value={increment}>
                      {increment} {isMetric ? 'mm' : 'in'}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label>Feed Rate (mm/min):</label>
                <InputNumber
                  value={feedRate}
                  onChange={(value) => setFeedRate(value || feedLimits.default)}
                  min={feedLimits.min}
                  max={feedLimits.max}
                  step={10}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={8}>
          <Card title="X/Y Controls">
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
            }}>
              <div></div>
              <Button
                type="primary"
                icon={<ArrowUpOutlined />}
                onClick={() => handleJog('y', 1)}
                disabled={!isConnected}
              >
                Y+
              </Button>
              <div></div>

              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => handleJog('x', -1)}
                disabled={!isConnected}
              >
                X-
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                XY
              </div>
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() => handleJog('x', 1)}
                disabled={!isConnected}
              >
                X+
              </Button>

              <div></div>
              <Button
                type="primary"
                icon={<ArrowDownOutlined />}
                onClick={() => handleJog('y', -1)}
                disabled={!isConnected}
              >
                Y-
              </Button>
              <div></div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Z Controls">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                icon={<ArrowUpOutlined />}
                onClick={() => handleJog('z', 1)}
                disabled={!isConnected}
              >
                Z+ (Up)
              </Button>
              <Button
                type="primary"
                block
                icon={<ArrowDownOutlined />}
                onClick={() => handleJog('z', -1)}
                disabled={!isConnected}
              >
                Z- (Down)
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block disabled={!isConnected}>
                Set Origin (G92)
              </Button>
              <Button block disabled={!isConnected}>
                Go to Origin
              </Button>
              <Button block disabled={!isConnected}>
                Probe Z
              </Button>
              <Button block disabled={!isConnected} danger>
                Emergency Stop
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Render plugins configured for the controls screen */}
      <div style={{ marginTop: '32px' }}>
        <Divider>Control Plugins</Divider>
        <PluginRenderer screen="controls" />
      </div>
    </div>
  );
};

export default ControlsView;
