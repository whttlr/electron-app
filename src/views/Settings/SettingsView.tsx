import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Form, Input, InputNumber, Select, Switch, Button, Divider, Spin, Alert } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { PluginRenderer } from '../../components';
import { useMachineConfig, useStateConfig, useUIConfig, useAPIConfig } from '../../services/config';

const { Title } = Typography;
const { Option } = Select;

const SettingsView: React.FC = () => {
  const [form] = Form.useForm();
  
  // Configuration hooks
  const { 
    machineConfig, 
    isLoading: machineLoading, 
    error: machineError,
    workingAreaDimensions,
    defaultPosition,
    feedRateLimits
  } = useMachineConfig();
  
  const { 
    stateConfig, 
    isLoading: stateLoading 
  } = useStateConfig();
  
  const { 
    uiConfig, 
    isLoading: uiLoading 
  } = useUIConfig();
  
  const { 
    apiConfig, 
    isLoading: apiLoading 
  } = useAPIConfig();

  const [settings, setSettings] = useState<any>(null);
  
  // Initialize settings from config when loaded
  useEffect(() => {
    if (machineConfig && stateConfig && uiConfig && apiConfig) {
      const workArea = workingAreaDimensions();
      const homePos = defaultPosition();
      const feedLimits = feedRateLimits();
      
      const configSettings = {
        machine: {
          name: 'CNC Router', // Could be from app config
          workArea: {
            x: workArea.width,
            y: workArea.height,
            z: workArea.depth
          },
          units: stateConfig.defaultState.machine.units,
          homePosition: {
            x: homePos.x,
            y: homePos.y,
            z: homePos.z
          }
        },
        jog: {
          defaultSpeed: machineConfig.jogSettings.defaultSpeed,
          acceleration: machineConfig.movement.acceleration,
          maxSpeed: feedLimits.max,
          distances: machineConfig.jogSettings.metricIncrements
        },
        ui: {
          theme: stateConfig.defaultState.ui.theme,
          language: stateConfig.defaultState.ui.language,
          showGrid: true, // Could be from UI config
          showCoordinates: true, // Could be from UI config
          autoConnect: false // Could be from connection config
        },
        connection: {
          port: '/dev/ttyUSB0', // Could be from defaults config
          baudRate: 115200, // Could be from defaults config
          timeout: apiConfig.timeouts.connection
        }
      };
      
      setSettings(configSettings);
      form.setFieldsValue(configSettings);
    }
  }, [machineConfig, stateConfig, uiConfig, apiConfig, form, workingAreaDimensions, defaultPosition, feedRateLimits]);

  const handleSave = (values: any) => {
    console.log('Saving settings:', values);
    setSettings({ ...settings, ...values });
  };

  const isLoading = machineLoading || stateLoading || uiLoading || apiLoading;
  const hasError = machineError;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading configuration...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div>
        <Title level={2}>Settings</Title>
        <Alert
          message="Configuration Error"
          description={`Failed to load configuration: ${hasError}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!settings) {
    return (
      <div>
        <Title level={2}>Settings</Title>
        <Alert
          message="Configuration Loading"
          description="Waiting for configuration to load..."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Settings</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Machine Configuration" extra={<SettingOutlined />}>
              <Form.Item label="Machine Name" name={['machine', 'name']}>
                <Input placeholder="Enter machine name" />
              </Form.Item>
              
              <Form.Item label="Units" name={['machine', 'units']}>
                <Select>
                  <Option value="metric">Metric (mm)</Option>
                  <Option value="imperial">Imperial (inches)</Option>
                </Select>
              </Form.Item>
              
              <Divider>Work Area (mm)</Divider>
              
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item label="X" name={['machine', 'workArea', 'x']}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Y" name={['machine', 'workArea', 'y']}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Z" name={['machine', 'workArea', 'z']}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Jog Settings">
              <Form.Item label="Default Speed (mm/min)" name={['jog', 'defaultSpeed']}>
                <InputNumber min={1} max={10000} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item label="Acceleration (mm/s²)" name={['jog', 'acceleration']}>
                <InputNumber min={1} max={2000} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item label="Maximum Speed (mm/min)" name={['jog', 'maxSpeed']}>
                <InputNumber min={1} max={20000} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} lg={12}>
            <Card title="Connection Settings">
              <Form.Item label="Serial Port" name={['connection', 'port']}>
                <Select>
                  <Option value="/dev/ttyUSB0">/dev/ttyUSB0</Option>
                  <Option value="/dev/ttyACM0">/dev/ttyACM0</Option>
                  <Option value="COM3">COM3</Option>
                  <Option value="COM4">COM4</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Baud Rate" name={['connection', 'baudRate']}>
                <Select>
                  <Option value={9600}>9600</Option>
                  <Option value={19200}>19200</Option>
                  <Option value={38400}>38400</Option>
                  <Option value={57600}>57600</Option>
                  <Option value={115200}>115200</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Connection Timeout (ms)" name={['connection', 'timeout']}>
                <InputNumber min={1000} max={30000} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="User Interface">
              <Form.Item label="Theme" name={['ui', 'theme']}>
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Language" name={['ui', 'language']}>
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name={['ui', 'showGrid']} valuePropName="checked">
                <Switch /> Show Grid in Workspace
              </Form.Item>
              
              <Form.Item name={['ui', 'showCoordinates']} valuePropName="checked">
                <Switch /> Show Coordinates Display
              </Form.Item>
              
              <Form.Item name={['ui', 'autoConnect']} valuePropName="checked">
                <Switch /> Auto-connect on Startup
              </Form.Item>
            </Card>
          </Col>
        </Row>
        
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
              Save Settings
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Render plugins configured for the settings screen */}
      <div style={{ marginTop: '32px' }}>
        <Divider>Plugin Settings</Divider>
        <PluginRenderer screen="settings" />
      </div>
    </div>
  );
};

export default SettingsView;