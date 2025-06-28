/**
 * Controls View
 * 
 * Main jog controls interface view, containing the existing jog controls functionality
 * integrated into the routing system.
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, App } from 'antd';
import AxisControl, { HomeControl } from '../../ui/controls/AxisControls';
import PositionDisplay from '../../ui/controls/PositionDisplay';
import JogSettings from '../../ui/controls/JogSettings';
import WorkingAreaPreview from '../../components/WorkingAreaPreview';
import MachineDisplay3D from '../../components/MachineDisplay3D';
import { SectionHeader } from '../../ui/shared/SectionHeader';
import { AXIS_COLORS } from '../../ui/theme/constants';
import { machineController } from '../../core/machine';
import { jogController } from '../../core/positioning';
import { unitConverter } from '../../core/units';
import { stateManager } from '../../services/state';
import { logger } from '../../services/logger';

interface ControlsViewProps {
  route?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

const ControlsView: React.FC<ControlsViewProps> = () => {
  const { message } = App.useApp();
  const [appState, setAppState] = useState(stateManager.getState());

  useEffect(() => {
    // Subscribe to state changes
    const stateSubscription = stateManager.subscribe(setAppState);

    // Subscribe to machine events
    const machineSubscription = machineController.on('positionChanged', (event) => {
      stateManager.setPosition(event.data);
    });

    // Cleanup
    return () => {
      stateSubscription.unsubscribe();
      machineController.off('positionChanged', machineSubscription);
    };
  }, []);

  const handleJog = async (axis: 'x' | 'y' | 'z', direction: 1 | -1, distance: number) => {
    try {
      const jogCommand = jogController.calculateStepJog(axis, direction);
      const currentPosition = appState.machine.position;
      
      await jogController.executeJog(currentPosition, {
        ...jogCommand,
        distance: distance * direction
      });
      
      // Update machine position
      await machineController.jog(axis, distance * direction);
      
      logger.info(`Jogged ${axis} axis`, { direction, distance });
    } catch (error) {
      logger.error('Jog command failed', error);
      message.error('Jog command failed');
    }
  };

  const handleHome = async () => {
    try {
      await machineController.home();
      message.success('Homing completed');
    } catch (error) {
      logger.error('Homing failed', error);
      message.error('Homing failed');
    }
  };

  const handleSettingsChange = (settings: Partial<typeof appState.jog>) => {
    stateManager.setJogSettings(settings);
    jogController.updateSettings(settings);
    
    if (settings.isMetric !== undefined) {
      unitConverter.setSystem(settings.isMetric ? 'metric' : 'imperial');
      stateManager.setUnits(settings.isMetric ? 'metric' : 'imperial');
    }
  };

  const handleAxisHighlight = (axis: 'x' | 'y' | 'z' | null) => {
    stateManager.setHighlightedAxis(axis);
  };

  const handleJogAxis = (axis: keyof typeof appState.machine.position, direction: 1 | -1) => {
    handleJog(axis, direction, appState.jog.increment);
  };

  const handleAxisHighlightControl = (axis: keyof typeof appState.machine.position) => {
    handleAxisHighlight(axis);
  };

  const handleClearHighlight = () => {
    handleAxisHighlight(null);
  };

  const jogHelpContent = (
    <div>
      <p>The Jog Controls allow you to manually move the machine head along the X, Y, and Z axes.</p>
      <p>Use the directional buttons to move the machine by the selected increment amount.</p>
      <p>Adjust the jog speed and increment size in the settings below.</p>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Current Position */}
        <Col span={24}>
          <Card title="Current Position">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="X Position"
                  value={appState.machine.position.x}
                  suffix={appState.jog.isMetric ? 'mm' : 'in'}
                  precision={3}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Y Position"
                  value={appState.machine.position.y}
                  suffix={appState.jog.isMetric ? 'mm' : 'in'}
                  precision={3}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Z Position"
                  value={appState.machine.position.z}
                  suffix={appState.jog.isMetric ? 'mm' : 'in'}
                  precision={3}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Machine Position Controls */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <SectionHeader 
                level={5}
                title="Machine Position Controls" 
                helpTitle="Using Jog Controls"
                helpContent={jogHelpContent}
              />
            }
          >
            <Row gutter={[24, 0]} align="middle" justify="center">
              <Col xs={6} sm={6}>
                <AxisControl
                  axis="x"
                  label="X Axis"
                  color={AXIS_COLORS.y} // Note: UI shows Y movement as X axis
                  onJog={(direction) => handleJogAxis('y', direction)} // Y movement
                  disabled={!appState.machine.isConnected}
                  onHighlight={() => handleAxisHighlightControl('x')}
                  onClearHighlight={handleClearHighlight}
                />
              </Col>
              
              <Col xs={6} sm={6}>
                <AxisControl
                  axis="y"
                  label="Y Axis"
                  color={AXIS_COLORS.x} // Note: UI shows X movement as Y axis
                  onJog={(direction) => handleJogAxis('x', direction)} // X movement
                  disabled={!appState.machine.isConnected}
                  onHighlight={() => handleAxisHighlightControl('y')}
                  onClearHighlight={handleClearHighlight}
                />
              </Col>

              <Col xs={6} sm={6}>
                <AxisControl
                  axis="z"
                  label="Z Axis"
                  color={AXIS_COLORS.z}
                  onJog={(direction) => handleJogAxis('z', direction)}
                  disabled={!appState.machine.isConnected}
                  onHighlight={() => handleAxisHighlightControl('z')}
                  onClearHighlight={handleClearHighlight}
                />
              </Col>

              <Col xs={6} sm={6}>
                <HomeControl
                  onHome={handleHome}
                  disabled={!appState.machine.isConnected}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Settings */}
        <Col xs={24} lg={12}>
          <JogSettings
            speed={appState.jog.speed}
            increment={appState.jog.increment}
            isMetric={appState.jog.isMetric}
            onSpeedChange={(speed) => handleSettingsChange({ speed })}
            onIncrementChange={(increment) => handleSettingsChange({ increment })}
            onUnitChange={(isMetric) => handleSettingsChange({ isMetric })}
            disabled={!appState.machine.isConnected}
          />
        </Col>

        {/* 2D Preview */}
        <Col xs={24} lg={12}>
          <Card title="2D Working Area Preview">
            <WorkingAreaPreview
              width={appState.machine.dimensions.width}
              height={appState.machine.dimensions.height}
              depth={appState.machine.dimensions.depth}
              highlightAxis={appState.ui.highlightedAxis}
              toolPosition={appState.machine.position}
            />
          </Card>
        </Col>

        {/* 3D Preview */}
        <Col xs={24} lg={12}>
          <Card title="3D Machine Preview">
            <MachineDisplay3D
              width={appState.machine.dimensions.width}
              height={appState.machine.dimensions.height}
              depth={appState.machine.dimensions.depth}
              highlightAxis={appState.ui.highlightedAxis}
              toolPosition={appState.machine.position}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ControlsView;