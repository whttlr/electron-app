import React from 'react';
import { Card, Row, Col, InputNumber, Select, Switch, Space } from 'antd';
import { JogSettingsProps } from './ControlTypes';
import { jogController } from '../../core/positioning';

const { Option } = Select;

const JogSettings: React.FC<JogSettingsProps> = ({
  speed,
  increment,
  isMetric,
  onSpeedChange,
  onIncrementChange,
  onUnitChange,
  disabled = false,
  showDebug = false,
  onDebugToggle
}) => {
  const increments = jogController.getAvailableIncrements();
  const speedLimits = jogController.getSpeedLimits();

  return (
    <Card title="Settings" size="small">
      <Row gutter={[12, 16]} style={{ width: "100%", padding: "0 12px" }}>
        {onDebugToggle && (
          <Col span={6}>
            <Space style={{ width: '100%' }} direction="vertical">
              <div>Debug:</div>
              <Switch
                checked={showDebug}
                disabled={disabled}
                checkedChildren="Close"
                unCheckedChildren="Open"
                onChange={onDebugToggle}
              />
            </Space>
          </Col>
        )}
        
        <Col span={onDebugToggle ? 10 : 8}>
          <Space style={{ width: '100%' }} direction="vertical">
            <div>Jog Speed:</div>
            <InputNumber
              min={speedLimits.min}
              max={speedLimits.max}
              value={speed}
              onChange={(value) => onSpeedChange(value || speedLimits.min)}
              disabled={disabled}
              addonAfter={isMetric ? 'mm/min' : 'in/min'}
              style={{ width: '100%' }}
            />
          </Space>
        </Col>
        
        <Col span={onDebugToggle ? 8 : 8}>
          <Space style={{ width: '100%' }} direction="vertical">
            <div>Jog Increment:</div>
            <Select
              value={increment}
              onChange={onIncrementChange}
              style={{ width: '100%' }}
              disabled={disabled}
            >
              {increments.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>

        {!onDebugToggle && (
          <Col span={8}>
            <Space style={{ width: '100%' }} direction="vertical">
              <div>Units:</div>
              <Switch
                checked={isMetric}
                onChange={onUnitChange}
                disabled={disabled}
                checkedChildren="Metric"
                unCheckedChildren="Imperial"
              />
            </Space>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default JogSettings;