import React from 'react';
import { Card, Row, Col, Space } from 'antd';
import AxisControl, { HomeControl } from './AxisControls';
import PositionDisplay from './PositionDisplay';
import JogSettings from './JogSettings';
import { JogControlProps } from './ControlTypes';
import { AXIS_COLORS } from '../theme/constants';
import { SectionHeader } from '../shared/SectionHeader';

const JogControls: React.FC<JogControlProps> = ({
  onJog,
  onHome,
  disabled = false,
  jogSettings,
  onSettingsChange,
  position,
  isConnected,
  onAxisHighlight
}) => {
  const handleJog = (axis: keyof typeof position, direction: 1 | -1) => {
    onJog(axis, direction, jogSettings.increment);
  };

  const handleAxisHighlight = (axis: keyof typeof position) => {
    onAxisHighlight?.(axis);
  };

  const handleClearHighlight = () => {
    onAxisHighlight?.(null);
  };

  const jogHelpContent = (
    <div>
      <p>The Jog Controls allow you to manually move the machine head along the X, Y, and Z axes.</p>
      <p>Use the directional buttons to move the machine by the selected increment amount.</p>
      <p>Adjust the jog speed and increment size in the settings below.</p>
    </div>
  );

  return (
    <Space direction="vertical" style={{ width: '100%', padding: "0 12px" }}>
      {/* Position Display */}
      <PositionDisplay
        position={position}
        unit={jogSettings.isMetric ? 'mm' : 'in'}
        precision={3}
      />

      {/* Jog Controls */}
      <Card
        title={
          <SectionHeader 
            level={5}
            title="Machine Position Controls" 
            helpTitle="Using Jog Controls"
            helpContent={jogHelpContent}
          />
        }
        size="small"
        style={{ height: '100%' }}
      >
        <Row gutter={[24, 0]} align="middle" justify="center">
          <Col xs={6} sm={6}>
            <AxisControl
              axis="x"
              label="X Axis"
              color={AXIS_COLORS.y} // Note: UI shows Y movement as X axis
              onJog={(direction) => handleJog('y', direction)} // Y movement
              disabled={disabled || !isConnected}
              onHighlight={() => handleAxisHighlight('x')}
              onClearHighlight={handleClearHighlight}
            />
          </Col>
          
          <Col xs={6} sm={6}>
            <AxisControl
              axis="y"
              label="Y Axis"
              color={AXIS_COLORS.x} // Note: UI shows X movement as Y axis
              onJog={(direction) => handleJog('x', direction)} // X movement
              disabled={disabled || !isConnected}
              onHighlight={() => handleAxisHighlight('y')}
              onClearHighlight={handleClearHighlight}
            />
          </Col>

          <Col xs={6} sm={6}>
            <AxisControl
              axis="z"
              label="Z Axis"
              color={AXIS_COLORS.z}
              onJog={(direction) => handleJog('z', direction)}
              disabled={disabled || !isConnected}
              onHighlight={() => handleAxisHighlight('z')}
              onClearHighlight={handleClearHighlight}
            />
          </Col>

          <Col xs={6} sm={6}>
            <HomeControl
              onHome={onHome}
              disabled={disabled || !isConnected}
            />
          </Col>
        </Row>
      </Card>

      {/* Settings */}
      <JogSettings
        speed={jogSettings.speed}
        increment={jogSettings.increment}
        isMetric={jogSettings.isMetric}
        onSpeedChange={(speed) => onSettingsChange({ speed })}
        onIncrementChange={(increment) => onSettingsChange({ increment })}
        onUnitChange={(isMetric) => onSettingsChange({ isMetric })}
        disabled={!isConnected}
      />
    </Space>
  );
};

export default JogControls;