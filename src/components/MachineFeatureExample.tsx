/**
 * Machine Feature Example Component
 * 
 * Demonstrates how to use the machine configuration features
 * including WCS, tool direction, and spindle control.
 */

import React, { useState } from 'react';
import { Card, Select, Button, InputNumber, Switch, Space, Divider, Typography } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  RotateLeftOutlined, 
  RotateRightOutlined 
} from '@ant-design/icons';
import { 
  configService,
  getWorkCoordinateSystems,
  getDefaultWorkCoordinateSystem,
  getToolDirections,
  getDefaultToolDirection,
  getSpindleRange,
  getToolDirectionCommand,
  getCoolantCommands,
  isMachineFeatureEnabled
} from '../services/config';
import type { WorkCoordinateSystem, ToolDirection } from '../types/MachineConfig';

const { Title, Text } = Typography;
const { Option } = Select;

export const MachineFeatureExample: React.FC = () => {
  // Machine feature states
  const [selectedWCS, setSelectedWCS] = useState<WorkCoordinateSystem>(getDefaultWorkCoordinateSystem());
  const [toolDirection, setToolDirection] = useState<ToolDirection>(getDefaultToolDirection());
  const [spindleRPM, setSpindleRPM] = useState(getSpindleRange().default);
  const [spindleEnabled, setSpindleEnabled] = useState(false);
  const [coolantEnabled, setCoolantEnabled] = useState(false);

  // Get configuration data
  const workCoordinateSystems = getWorkCoordinateSystems();
  const toolDirections = getToolDirections();
  const spindleRange = getSpindleRange();
  const coolantCommands = getCoolantCommands();

  // Feature availability checks
  const wcsEnabled = isMachineFeatureEnabled('workCoordinateSystems');
  const toolDirectionEnabled = isMachineFeatureEnabled('toolDirection');
  const spindleControlEnabled = isMachineFeatureEnabled('spindleControl');

  const handleSpindleStart = () => {
    const command = getToolDirectionCommand(toolDirection);
    console.log(`Starting spindle: ${command} S${spindleRPM}`);
    setSpindleEnabled(true);
  };

  const handleSpindleStop = () => {
    const command = getToolDirectionCommand('clockwise'); // Stop command is M05
    console.log(`Stopping spindle: M05`);
    setSpindleEnabled(false);
  };

  const handleCoolantToggle = (enabled: boolean) => {
    const command = enabled ? coolantCommands.flood : coolantCommands.off;
    console.log(`Coolant ${enabled ? 'ON' : 'OFF'}: ${command}`);
    setCoolantEnabled(enabled);
  };

  const handleWCSChange = (wcs: WorkCoordinateSystem) => {
    console.log(`Setting work coordinate system: ${wcs}`);
    setSelectedWCS(wcs);
  };

  return (
    <Card title="Machine Features Configuration" style={{ width: '100%', maxWidth: 600 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        
        {/* Work Coordinate Systems */}
        {wcsEnabled && (
          <div>
            <Title level={5}>Work Coordinate System (WCS)</Title>
            <Select
              value={selectedWCS}
              onChange={handleWCSChange}
              style={{ width: '100%' }}
              placeholder="Select work coordinate system"
            >
              {workCoordinateSystems.map(wcs => (
                <Option key={wcs} value={wcs}>
                  {wcs} - Work Coordinate System {wcs.slice(1)}
                </Option>
              ))}
            </Select>
            <Text type="secondary">
              Current WCS: {selectedWCS} - Controls the active coordinate reference frame
            </Text>
          </div>
        )}

        <Divider />

        {/* Tool Direction & Spindle Control */}
        {(toolDirectionEnabled || spindleControlEnabled) && (
          <div>
            <Title level={5}>Spindle Control</Title>
            
            {/* Tool Direction */}
            {toolDirectionEnabled && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Tool Direction:</Text>
                <br />
                <Select
                  value={toolDirection}
                  onChange={setToolDirection}
                  style={{ width: 200, marginTop: 8 }}
                >
                  {toolDirections.map(direction => (
                    <Option key={direction} value={direction}>
                      <Space>
                        {direction === 'clockwise' ? <RotateRightOutlined /> : <RotateLeftOutlined />}
                        {direction.charAt(0).toUpperCase() + direction.slice(1)}
                        <Text type="secondary">({getToolDirectionCommand(direction)})</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            {/* Spindle RPM */}
            {spindleControlEnabled && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Spindle RPM:</Text>
                <br />
                <InputNumber
                  value={spindleRPM}
                  onChange={(value) => setSpindleRPM(value || spindleRange.default)}
                  min={spindleRange.min}
                  max={spindleRange.max}
                  step={spindleRange.step}
                  style={{ width: 200, marginTop: 8 }}
                  addonAfter="RPM"
                />
                <br />
                <Text type="secondary">
                  Range: {spindleRange.min} - {spindleRange.max} RPM
                </Text>
              </div>
            )}

            {/* Spindle Controls */}
            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleSpindleStart}
                disabled={spindleEnabled}
              >
                Start Spindle
              </Button>
              <Button
                danger
                icon={<PauseCircleOutlined />}
                onClick={handleSpindleStop}
                disabled={!spindleEnabled}
              >
                Stop Spindle
              </Button>
            </Space>

            {/* Coolant Control */}
            <div style={{ marginTop: 16 }}>
              <Text strong>Coolant:</Text>
              <br />
              <Switch
                checked={coolantEnabled}
                onChange={handleCoolantToggle}
                checkedChildren="ON"
                unCheckedChildren="OFF"
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ marginLeft: 16 }}>
                Commands: ON={coolantCommands.flood}, OFF={coolantCommands.off}
              </Text>
            </div>
          </div>
        )}

        <Divider />

        {/* Current Status */}
        <div>
          <Title level={5}>Current Status</Title>
          <Space direction="vertical">
            <Text>Work Coordinate System: <Text code>{selectedWCS}</Text></Text>
            <Text>Tool Direction: <Text code>{toolDirection} ({getToolDirectionCommand(toolDirection)})</Text></Text>
            <Text>Spindle: <Text code>{spindleEnabled ? `${spindleRPM} RPM` : 'Stopped'}</Text></Text>
            <Text>Coolant: <Text code>{coolantEnabled ? 'ON' : 'OFF'}</Text></Text>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default MachineFeatureExample;