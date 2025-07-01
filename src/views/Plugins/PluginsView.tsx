import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Upload, message, List, Tag, Space, Modal, Form, Input, Select, Switch, InputNumber } from 'antd';
import { UploadOutlined, AppstoreOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { usePlugins, Plugin } from '../../contexts/PluginContext';

const { Title, Text } = Typography;

const PluginsView: React.FC = () => {
  const { plugins, setPlugins } = usePlugins();
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [configForm] = Form.useForm();

  const uploadProps: UploadProps = {
    name: 'plugin',
    accept: '.zip',
    beforeUpload: (file) => {
      console.log('Uploading plugin:', file.name);
      message.success(`${file.name} plugin uploaded successfully!`);
      
      // Simulate plugin installation
      const newPlugin: Plugin = {
        id: file.name.replace('.zip', ''),
        name: file.name.replace('.zip', '').replace(/-/g, ' '),
        version: '1.0.0',
        description: 'Uploaded plugin',
        status: 'active',
        type: 'utility'
      };
      
      setPlugins(prev => [...prev, newPlugin]);
      return false; // Prevent actual upload
    },
  };

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === id 
        ? { ...plugin, status: plugin.status === 'active' ? 'inactive' : 'active' }
        : plugin
    ));
  };

  const removePlugin = (id: string) => {
    setPlugins(prev => prev.filter(plugin => plugin.id !== id));
    message.success('Plugin removed successfully');
  };

  const openConfigModal = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setConfigModalVisible(true);
    configForm.setFieldsValue(plugin.config || {});
  };

  const handleConfigSave = (values: any) => {
    if (!selectedPlugin) return;
    
    setPlugins(prev => prev.map(plugin => 
      plugin.id === selectedPlugin.id 
        ? { ...plugin, config: { ...plugin.config, ...values } }
        : plugin
    ));
    
    setConfigModalVisible(false);
    setSelectedPlugin(null);
    configForm.resetFields();
    message.success('Plugin configuration saved successfully');
  };

  const handleConfigCancel = () => {
    setConfigModalVisible(false);
    setSelectedPlugin(null);
    configForm.resetFields();
  };

  const generateRoutePath = (pluginName: string): string => {
    return '/' + pluginName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handlePlacementChange = (placement: string) => {
    if (placement === 'standalone' && selectedPlugin) {
      const currentRoutePath = configForm.getFieldValue('routePath');
      const currentMenuTitle = configForm.getFieldValue('menuTitle');
      
      // Auto-generate route path if not set
      if (!currentRoutePath) {
        const generatedPath = generateRoutePath(selectedPlugin.name);
        configForm.setFieldsValue({ routePath: generatedPath });
      }
      
      // Auto-set menu title if not set
      if (!currentMenuTitle) {
        configForm.setFieldsValue({ menuTitle: selectedPlugin.name });
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visualization': return 'blue';
      case 'control': return 'green';
      case 'productivity': return 'orange';
      case 'utility': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div>
      <Title level={2}>Plugin Management</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Upload Plugin" extra={<UploadOutlined />}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select Plugin ZIP File</Button>
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              Upload a ZIP file containing your plugin package.json and source files.
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Plugin Statistics">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {plugins.length}
              </div>
              <div>Total Plugins</div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ color: '#52c41a' }}>
                  {plugins.filter(p => p.status === 'active').length} Active
                </span>
                {' • '}
                <span style={{ color: '#faad14' }}>
                  {plugins.filter(p => p.status === 'inactive').length} Inactive
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card title="Installed Plugins" extra={<AppstoreOutlined />}>
        <List
          itemLayout="horizontal"
          dataSource={plugins}
          renderItem={(plugin) => (
            <List.Item
              actions={[
                <Button
                  type={plugin.status === 'active' ? 'default' : 'primary'}
                  onClick={() => togglePlugin(plugin.id)}
                >
                  {plugin.status === 'active' ? 'Disable' : 'Enable'}
                </Button>,
                <Button 
                  icon={<SettingOutlined />}
                  onClick={() => openConfigModal(plugin)}
                >
                  Configure
                </Button>,
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => removePlugin(plugin.id)}
                >
                  Remove
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<AppstoreOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                title={
                  <Space>
                    {plugin.name}
                    <Tag color={plugin.status === 'active' ? 'green' : 'default'}>
                      {plugin.status}
                    </Tag>
                    <Tag color={getTypeColor(plugin.type)}>
                      {plugin.type}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{plugin.description}</div>
                    <Text type="secondary">Version: {plugin.version}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        
        {plugins.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>No plugins installed</div>
            <div>Upload a plugin ZIP file to get started</div>
          </div>
        )}
      </Card>

      {/* Plugin Configuration Modal */}
      <Modal
        title={`Configure ${selectedPlugin?.name || 'Plugin'}`}
        open={configModalVisible}
        onOk={() => configForm.submit()}
        onCancel={handleConfigCancel}
        width={600}
        okText="Save Configuration"
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleConfigSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Placement"
                name="placement"
                tooltip="Where the plugin UI will be displayed"
              >
                <Select 
                  placeholder="Select placement"
                  onChange={handlePlacementChange}
                >
                  <Select.Option value="dashboard">Dashboard Card</Select.Option>
                  <Select.Option value="standalone">Standalone Screen</Select.Option>
                  <Select.Option value="modal">Modal Dialog</Select.Option>
                  <Select.Option value="sidebar">Sidebar Panel</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Screen"
                name="screen"
                tooltip="Which screen/section to display on"
              >
                <Select placeholder="Select screen">
                  <Select.Option value="main">Dashboard Screen</Select.Option>
                  <Select.Option value="controls">Controls Screen</Select.Option>
                  <Select.Option value="settings">Settings Screen</Select.Option>
                  <Select.Option value="new">New Screen (Standalone only)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Show menu configuration for standalone plugins */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.placement !== currentValues.placement
          }>
            {({ getFieldValue }) => {
              const placement = getFieldValue('placement');
              return placement === 'standalone' ? (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Menu Title"
                        name="menuTitle"
                        tooltip="Text to display in the navigation menu"
                      >
                        <Input placeholder="Menu display name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Menu Icon"
                        name="menuIcon"
                        tooltip="Icon to display in the navigation menu"
                      >
                        <Select placeholder="Select icon">
                          <Select.Option value="monitor">Monitor</Select.Option>
                          <Select.Option value="control">Control</Select.Option>
                          <Select.Option value="appstore">App Store</Select.Option>
                          <Select.Option value="setting">Setting</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    label="Route Path"
                    name="routePath"
                    tooltip="URL path for this plugin screen (e.g., /machine-monitor)"
                    rules={[
                      { required: true, message: 'Route path is required for standalone screens' },
                      { pattern: /^\/[a-z0-9-]+$/, message: 'Route path must start with / and contain only lowercase letters, numbers, and hyphens' }
                    ]}
                  >
                    <Input placeholder="/my-plugin" />
                  </Form.Item>
                </>
              ) : null;
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Width"
                name={['size', 'width']}
                tooltip="Plugin width (number in pixels or 'auto')"
              >
                <Input placeholder="auto or number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Height"
                name={['size', 'height']}
                tooltip="Plugin height (number in pixels or 'auto')"
              >
                <Input placeholder="auto or number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Priority"
                name="priority"
                tooltip="Display priority (higher numbers show first)"
              >
                <InputNumber min={0} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Auto Start"
                name="autoStart"
                valuePropName="checked"
                tooltip="Automatically start plugin when application loads"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Permissions"
            name="permissions"
            tooltip="Required permissions for this plugin"
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              style={{ width: '100%' }}
            >
              <Select.Option value="file.read">File Read</Select.Option>
              <Select.Option value="file.write">File Write</Select.Option>
              <Select.Option value="machine.read">Machine Read</Select.Option>
              <Select.Option value="machine.control">Machine Control</Select.Option>
              <Select.Option value="status.read">Status Read</Select.Option>
              <Select.Option value="settings.read">Settings Read</Select.Option>
              <Select.Option value="settings.write">Settings Write</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PluginsView;