import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Form, Input, InputNumber, Select, Switch, Button, Divider, Spin, Alert, message,
} from 'antd';
import { SettingOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { PluginRenderer } from '../../ui/plugin';
import { useUpdateService } from '../../hooks/useUpdateService';
import {
  useMachineConfig, useStateConfig, useUIConfig, useAPIConfig,
} from '../../services/config';
import { AppSettings } from '../../services/settings';
import { useSettings } from '../../contexts/SettingsContext';

const { Title } = Typography;
const { Option } = Select;

const SettingsView: React.FC = () => {
  const [form] = Form.useForm();

  // Global settings context
  const {
    settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    updateSettings,
  } = useSettings();

  // Configuration hooks (for fallback defaults)
  const {
    machineConfig,
    isLoading: machineLoading,
    error: machineError,
    workingAreaDimensions,
    defaultPosition,
    feedRateLimits,
  } = useMachineConfig();

  const {
    stateConfig,
    isLoading: stateLoading,
  } = useStateConfig();

  const {
    uiConfig,
    isLoading: uiLoading,
  } = useUIConfig();

  const {
    apiConfig,
    isLoading: apiLoading,
  } = useAPIConfig();

  const {
    updateData,
    updateStatus,
    checkForUpdates,
    showUpdateDialog,
  } = useUpdateService();

  const [isSaving, setIsSaving] = useState(false);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  const handleSave = async (values: any) => {
    try {
      setIsSaving(true);

      // Save settings via global context
      await updateSettings(values);

      message.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      setCheckingForUpdates(true);
      await checkForUpdates();
      if (updateData?.updateAvailable) {
        message.success('Update available! Click the notification to view details.');
      } else {
        message.info('No updates available. You are running the latest version.');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      message.error('Failed to check for updates. Please try again later.');
    } finally {
      setCheckingForUpdates(false);
    }
  };

  const isLoading = machineLoading || stateLoading || uiLoading || apiLoading || isLoadingSettings;
  const hasError = machineError || settingsError;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          {isLoadingSettings ? 'Loading settings...' : 'Loading configuration...'}
        </div>
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
    <div data-testid="settings-container">
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

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} lg={12}>
            <Card title="Update Settings" extra={<UploadOutlined />}>
              <Form.Item name={['updates', 'autoCheck']} valuePropName="checked">
                <Switch /> Check for updates automatically
              </Form.Item>

              <Form.Item label="Check Interval" name={['updates', 'checkInterval']}>
                <Select>
                  <Option value={1800000}>30 minutes</Option>
                  <Option value={3600000}>1 hour</Option>
                  <Option value={7200000}>2 hours</Option>
                  <Option value={21600000}>6 hours</Option>
                  <Option value={43200000}>12 hours</Option>
                  <Option value={86400000}>24 hours</Option>
                </Select>
              </Form.Item>

              <Form.Item name={['updates', 'includePreReleases']} valuePropName="checked">
                <Switch /> Include pre-release versions
              </Form.Item>

              <Form.Item name={['updates', 'autoDownload']} valuePropName="checked">
                <Switch /> Download updates automatically
              </Form.Item>

              <Divider />

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="default"
                  icon={<UploadOutlined />}
                  loading={checkingForUpdates}
                  onClick={handleCheckForUpdates}
                  style={{ marginBottom: '8px' }}
                >
                  Check for Updates Now
                </Button>
                {updateData?.updateAvailable && (
                  <div style={{ marginTop: '8px' }}>
                    <Alert
                      message="Update Available"
                      description={`Version ${updateData.latestVersion} is available`}
                      type="success"
                      showIcon
                      action={
                        <Button size="small" type="link" onClick={showUpdateDialog}>
                          View Details
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
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
