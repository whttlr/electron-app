/**
 * Machine Setup Form Component
 * 
 * Form for configuring CNC machine basic info, working area,
 * connection settings, movement parameters, and safety options.
 */

import React, { useState } from 'react';
import { Form, FormItem } from '../adapters/ant-design/Form';
import { Input, CoordinateInput, FeedRateInput } from '../adapters/ant-design/Input';
import { Select, MachineSelect, ConnectionSelect, UnitsSelect } from '../adapters/ant-design/Select';
import { Button } from '../adapters/ant-design/Button';
import { Card } from '../adapters/ant-design/Card';
import { Badge } from '../adapters/ant-design/Badge';
import { Space, Divider, Row, Col, Tabs, Alert, Progress } from 'antd';
import { 
  validateCoordinate, 
  validateFeedRate, 
  validateMachineId,
  validateWorkingArea,
  validateIpAddress,
  validatePort,
  required,
  range
} from '../validation';
import { 
  SettingOutlined,
  HomeOutlined,
  TargetOutlined,
  SpeedOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

export interface MachineSetupFormData {
  // Basic Info
  machineId: string;
  machineName: string;
  machineType: 'cnc' | 'laser' | '3d-printer';
  manufacturer?: string;
  model?: string;
  
  // Working Area
  workingArea: {
    width: number;
    height: number;
    depth: number;
    units: 'mm' | 'in';
  };
  
  // Connection
  connection: {
    type: 'serial' | 'tcp' | 'usb';
    port?: string;
    baudRate?: number;
    ipAddress?: string;
    tcpPort?: number;
  };
  
  // Movement Settings
  movement: {
    maxFeedRate: number;
    defaultFeedRate: number;
    rapidSpeed: number;
    jogSpeed: number;
    jogStepSize: number;
    homingRequired: boolean;
  };
  
  // Safety Settings
  safety: {
    softLimits: boolean;
    hardLimits: boolean;
    emergencyStopEnabled: boolean;
    maxSpindleSpeed?: number;
  };
}

export interface MachineSetupFormProps {
  initialValues?: Partial<MachineSetupFormData>;
  onSubmit: (data: MachineSetupFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const MachineSetupForm: React.FC<MachineSetupFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  
  const handleSubmit = (values: any) => {
    onSubmit(values as MachineSetupFormData);
  };
  
  const tabItems = [
    {
      key: 'basic',
      label: (
        <span>
          <SettingOutlined />
          Basic Info
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name="machineId"
                label="Machine ID"
                required
                rules={[required(), (value) => validateMachineId(value)]}
                tooltip="Unique identifier for this machine"
              >
                <Input placeholder="cnc-001" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="machineName"
                label="Display Name"
                required
                rules={[required('Display name is required')]}
              >
                <Input placeholder="Main CNC Router" />
              </FormItem>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name="machineType"
                label="Machine Type"
                required
                rules={[required()]}
              >
                <MachineSelect />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="manufacturer"
                label="Manufacturer"
                tooltip="Optional manufacturer information"
              >
                <Input placeholder="Haas Automation" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="model"
                label="Model"
                tooltip="Optional model information"
              >
                <Input placeholder="VF-3" />
              </FormItem>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'area',
      label: (
        <span>
          <TargetOutlined />
          Working Area
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Alert 
            message="Define the machine's working envelope"
            description="Set the maximum travel distances for each axis. These limits help prevent collisions and ensure safe operation."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Row gutter={16}>
            <Col span={6}>
              <FormItem
                name={['workingArea', 'width']}
                label="Width (X-axis)"
                required
                rules={[required(), range(0.1, 10000, 'Width must be between 0.1 and 10000')]}
              >
                <CoordinateInput suffix="mm" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name={['workingArea', 'height']}
                label="Height (Y-axis)"
                required
                rules={[required(), range(0.1, 10000, 'Height must be between 0.1 and 10000')]}
              >
                <CoordinateInput suffix="mm" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name={['workingArea', 'depth']}
                label="Depth (Z-axis)"
                required
                rules={[required(), range(0.1, 1000, 'Depth must be between 0.1 and 1000')]}
              >
                <CoordinateInput suffix="mm" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name={['workingArea', 'units']}
                label="Units"
                required
                rules={[required()]}
              >
                <UnitsSelect />
              </FormItem>
            </Col>
          </Row>
          
          {/* Working Area Preview */}
          <Card size="small" title="Working Envelope Preview">
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <div className="text-sm">Working Area Visualization</div>
                <div className="text-xs mt-1">
                  {form.getFieldValue(['workingArea', 'width']) || '---'} × {' '}
                  {form.getFieldValue(['workingArea', 'height']) || '---'} × {' '}
                  {form.getFieldValue(['workingArea', 'depth']) || '---'} {' '}
                  {form.getFieldValue(['workingArea', 'units']) || 'mm'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'connection',
      label: (
        <span>
          <HomeOutlined />
          Connection
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name={['connection', 'type']}
                label="Connection Type"
                required
                rules={[required()]}
              >
                <ConnectionSelect />
              </FormItem>
            </Col>
            
            {/* Serial Connection Settings */}
            <Col span={8}>
              <FormItem
                name={['connection', 'port']}
                label="Port"
                required={form.getFieldValue(['connection', 'type']) === 'serial'}
                rules={[
                  {
                    required: form.getFieldValue(['connection', 'type']) === 'serial',
                    message: 'Port is required for serial connections'
                  }
                ]}
                tooltip="Serial port (e.g., COM3, /dev/ttyUSB0)"
              >
                <Input placeholder="/dev/ttyUSB0" />
              </FormItem>
            </Col>
            
            <Col span={8}>
              <FormItem
                name={['connection', 'baudRate']}
                label="Baud Rate"
                rules={[range(300, 921600, 'Invalid baud rate')]}
              >
                <Select
                  placeholder="115200"
                  options={[
                    { value: 9600, label: '9600' },
                    { value: 19200, label: '19200' },
                    { value: 38400, label: '38400' },
                    { value: 57600, label: '57600' },
                    { value: 115200, label: '115200' },
                    { value: 230400, label: '230400' },
                    { value: 460800, label: '460800' },
                    { value: 921600, label: '921600' },
                  ]}
                />
              </FormItem>
            </Col>
          </Row>
          
          {/* TCP Connection Settings */}
          {form.getFieldValue(['connection', 'type']) === 'tcp' && (
            <Row gutter={16}>
              <Col span={12}>
                <FormItem
                  name={['connection', 'ipAddress']}
                  label="IP Address"
                  required
                  rules={[required(), (value) => validateIpAddress(value)]}
                >
                  <Input placeholder="192.168.1.100" />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  name={['connection', 'tcpPort']}
                  label="TCP Port"
                  required
                  rules={[required(), (value) => validatePort(value)]}
                >
                  <Input placeholder="23" />
                </FormItem>
              </Col>
            </Row>
          )}
          
          {/* Connection Status */}
          <Card size="small" title="Connection Status">
            <div className="flex items-center justify-between">
              <span>Current Status:</span>
              <Badge status="processing" text="Disconnected" />
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'movement',
      label: (
        <span>
          <SpeedOutlined />
          Movement
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Alert 
            message="Configure movement and speed parameters"
            description="Set feed rates, rapid speeds, and jogging behavior for optimal performance and safety."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name={['movement', 'maxFeedRate']}
                label="Maximum Feed Rate"
                required
                rules={[required(), range(1, 50000, 'Feed rate must be between 1 and 50000 mm/min')]}
                tooltip="Maximum cutting feed rate in mm/min"
              >
                <FeedRateInput />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name={['movement', 'defaultFeedRate']}
                label="Default Feed Rate"
                required
                rules={[required(), range(1, 5000, 'Default feed rate must be between 1 and 5000 mm/min')]}
                tooltip="Default cutting feed rate in mm/min"
              >
                <FeedRateInput />
              </FormItem>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name={['movement', 'rapidSpeed']}
                label="Rapid Speed"
                required
                rules={[required(), range(1, 50000, 'Rapid speed must be between 1 and 50000 mm/min')]}
                tooltip="Rapid positioning speed in mm/min"
              >
                <FeedRateInput />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name={['movement', 'jogSpeed']}
                label="Jog Speed"
                required
                rules={[required(), range(1, 10000, 'Jog speed must be between 1 and 10000 mm/min')]}
                tooltip="Manual jogging speed in mm/min"
              >
                <FeedRateInput />
              </FormItem>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name={['movement', 'jogStepSize']}
                label="Jog Step Size"
                required
                rules={[required(), range(0.001, 100, 'Step size must be between 0.001 and 100 mm')]}
                tooltip="Default jog increment in mm"
              >
                <CoordinateInput suffix="mm" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name={['movement', 'homingRequired']}
                label="Homing Required"
                valuePropName="checked"
                tooltip="Require homing before allowing movement"
              >
                <input type="checkbox" />
              </FormItem>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'safety',
      label: (
        <span>
          <SafetyOutlined />
          Safety
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Alert 
            message="Safety Configuration"
            description="Configure safety limits and emergency stop behavior to prevent damage and ensure operator safety."
            type="warning"
            showIcon
            className="mb-4"
          />
          
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name={['safety', 'softLimits']}
                label="Soft Limits"
                valuePropName="checked"
                tooltip="Enable software travel limits based on working area"
              >
                <input type="checkbox" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name={['safety', 'hardLimits']}
                label="Hard Limits"
                valuePropName="checked"
                tooltip="Enable hardware limit switches"
              >
                <input type="checkbox" />
              </FormItem>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name={['safety', 'emergencyStopEnabled']}
                label="Emergency Stop"
                valuePropName="checked"
                tooltip="Enable emergency stop functionality"
              >
                <input type="checkbox" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name={['safety', 'maxSpindleSpeed']}
                label="Max Spindle Speed"
                rules={[range(0, 50000, 'Max spindle speed must be between 0 and 50000 RPM')]}
                tooltip="Maximum spindle speed in RPM (optional)"
              >
                <Input placeholder="15000" suffix="RPM" />
              </FormItem>
            </Col>
          </Row>
          
          {/* Safety Status */}
          <Card size="small" title="Safety Status">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Soft Limits:</span>
                <Badge 
                  status={form.getFieldValue(['safety', 'softLimits']) ? 'success' : 'default'} 
                  text={form.getFieldValue(['safety', 'softLimits']) ? 'Enabled' : 'Disabled'} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Hard Limits:</span>
                <Badge 
                  status={form.getFieldValue(['safety', 'hardLimits']) ? 'success' : 'default'} 
                  text={form.getFieldValue(['safety', 'hardLimits']) ? 'Enabled' : 'Disabled'} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Emergency Stop:</span>
                <Badge 
                  status={form.getFieldValue(['safety', 'emergencyStopEnabled']) ? 'success' : 'default'} 
                  text={form.getFieldValue(['safety', 'emergencyStopEnabled']) ? 'Enabled' : 'Disabled'} 
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="machine-setup-form">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        className="space-y-6"
      >
        <Card title="Machine Configuration" size="small">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="machine-setup-tabs"
          />
        </Card>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Configuration
          </Button>
        </div>
      </Form>
    </div>
  );
};