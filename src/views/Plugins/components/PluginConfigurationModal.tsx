import React from 'react';
import {
  Modal, Form, Row, Col, Select, Input, InputNumber, Switch,
} from 'antd';
import { Plugin } from '../../../services/plugin';

interface PluginConfigurationModalProps {
  visible: boolean;
  selectedPlugin: Plugin | null;
  form: any;
  onSave: (values: any) => Promise<void>;
  onCancel: () => void;
  onPlacementChange: (placement: string) => void;
}

const PluginConfigurationModal: React.FC<PluginConfigurationModalProps> = ({
  visible,
  selectedPlugin,
  form,
  onSave,
  onCancel,
  onPlacementChange,
}) => (
    <Modal
      title={`Configure ${selectedPlugin?.name || 'Plugin'}`}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      width={600}
      okText="Save Configuration"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
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
                onChange={onPlacementChange}
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
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.placement !== currentValues.placement
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
                    { pattern: /^\/[a-z0-9-]+$/, message: 'Route path must start with / and contain only lowercase letters, numbers, and hyphens' },
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
);

export default PluginConfigurationModal;
