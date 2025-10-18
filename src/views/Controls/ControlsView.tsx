import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  Grid,
  ControlContainer,
  WorkingAreaPreview,
  MachineDisplay2D,
  Input,
  NumberInput,
  Stack,
  Skeleton,
} from '@whttlr/ui-core';

import {
  ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { PluginRenderer } from '../../components';
import { useMachineConfig, useStateConfig } from '../../services/config/useConfig';

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
      <ControlContainer style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '16px' }}>Loading Configuration...</h2>
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="rectangular" width="100%" height="200px" style={{ marginTop: '1rem' }} />
      </ControlContainer>
    );
  }

  // Show error if configuration failed to load
  if (machineError) {
    return (
      <Alert
        variant="destructive"
        title="Configuration Error"
        description={`Failed to load machine configuration: ${machineError}`}
      />
    );
  }

  return (
    <ControlContainer data-testid="controls-container">
      <h2 style={{ marginBottom: '24px' }}>Jog Controls</h2>

      {!isConnected && (
        <Alert
          variant="warning"
          title="Machine Not Connected"
          description="Connect to your CNC machine to enable jog controls."
          actions={
            <Button variant="default" onClick={() => setIsConnected(true)}>
              Connect
            </Button>
          }
          style={{ marginBottom: '24px' }}
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

      <Grid cols={2} gap={4}>
        <Card>
          <CardHeader>
            <CardTitle>Position Display</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ textAlign: 'center', fontSize: '18px', marginBottom: '16px' }}>
              <div>X: {position.x.toFixed(machineConfig?.features.coordinateDisplay.precision || 3)} {isMetric ? 'mm' : 'in'}</div>
              <div>Y: {position.y.toFixed(machineConfig?.features.coordinateDisplay.precision || 3)} {isMetric ? 'mm' : 'in'}</div>
              <div>Z: {position.z.toFixed(machineConfig?.features.coordinateDisplay.precision || 3)} {isMetric ? 'mm' : 'in'}</div>
            </div>
            <Button variant="default" onClick={handleHome} style={{ width: '100%' }}>
              Home All Axes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jog Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing={16} style={{ width: '100%' }}>
              <div>
                <label>Unit System:</label>
                <Select
                  value={isMetric ? 'metric' : 'imperial'}
                  onChange={(value) => setIsMetric(value === 'metric')}
                  style={{ width: '100%', marginTop: '8px' }}
                  options={[
                    { value: 'metric', label: 'Metric (mm)' },
                    { value: 'imperial', label: 'Imperial (inches)' },
                  ]}
                />
              </div>

              <div>
                <label>Jog Distance ({isMetric ? 'mm' : 'in'}):</label>
                <Select
                  value={jogDistance}
                  onChange={setJogDistance}
                  style={{ width: '100%', marginTop: '8px' }}
                  options={availableIncrements.map((increment) => ({
                    value: increment,
                    label: `${increment} ${isMetric ? 'mm' : 'in'}`,
                  }))}
                />
              </div>

              <div>
                <label>Feed Rate (mm/min):</label>
                <NumberInput
                  value={feedRate}
                  onChange={(value) => setFeedRate(value || 1000)}
                  min={feedLimits?.min || 100}
                  max={feedLimits?.max || 5000}
                  step={10}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid cols={3} gap={4} style={{ marginTop: '24px' }}>
        <Card>
          <CardHeader>
            <CardTitle>X/Y Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center',
            }}>
              <div></div>
              <Button
                variant="default"
                onClick={() => handleJog('y', 1)}
                disabled={!isConnected}
              >
                <ArrowUpOutlined /> Y+
              </Button>
              <div></div>

              <Button
                variant="default"
                onClick={() => handleJog('x', -1)}
                disabled={!isConnected}
              >
                <ArrowLeftOutlined /> X-
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                XY
              </div>
              <Button
                variant="default"
                onClick={() => handleJog('x', 1)}
                disabled={!isConnected}
              >
                <ArrowRightOutlined /> X+
              </Button>

              <div></div>
              <Button
                variant="default"
                onClick={() => handleJog('y', -1)}
                disabled={!isConnected}
              >
                <ArrowDownOutlined /> Y-
              </Button>
              <div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Z Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing={8} style={{ width: '100%' }}>
              <Button
                variant="default"
                style={{ width: '100%' }}
                onClick={() => handleJog('z', 1)}
                disabled={!isConnected}
              >
                <ArrowUpOutlined /> Z+ (Up)
              </Button>
              <Button
                variant="default"
                style={{ width: '100%' }}
                onClick={() => handleJog('z', -1)}
                disabled={!isConnected}
              >
                <ArrowDownOutlined /> Z- (Down)
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing={8} style={{ width: '100%' }}>
              <Button variant="outline" disabled={!isConnected} style={{ width: '100%' }}>
                Set Origin (G92)
              </Button>
              <Button variant="outline" disabled={!isConnected} style={{ width: '100%' }}>
                Go to Origin
              </Button>
              <Button variant="outline" disabled={!isConnected} style={{ width: '100%' }}>
                Probe Z
              </Button>
              <Button variant="destructive" disabled={!isConnected} style={{ width: '100%' }}>
                Emergency Stop
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Render plugins configured for the controls screen */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginBottom: '16px' }}>Control Plugins</h3>
        <PluginRenderer screen="controls" />
      </div>
    </ControlContainer>
  );
};

export default ControlsView;
