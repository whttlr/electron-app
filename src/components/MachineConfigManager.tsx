import React, { useState } from 'react';
import {
  Card,
  Button,
  List,
  message,
  Space,
  Form,
  Input,
  Select,
  Modal,
  Spin,
  Alert,
  Badge,
  Tooltip,
  Popconfirm,
  Divider,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useMachineConfig } from '../services/machine-config/useMachineConfig';

const { Option } = Select;
const { Text, Title } = Typography;

interface MachineConfigFormData {
  name: string
  work_area_x: number
  work_area_y: number
  work_area_z: number
  units: 'mm' | 'in'
  connection_settings?: {
    port: string
    baudRate: number
    dataBits: number
    stopBits: number
    parity: string
  }
}

export const MachineConfigManager: React.FC = () => {
  const {
    configurations,
    activeConfiguration,
    isLoading,
    isConnected,
    error,
    refresh,
    setActive,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
  } = useMachineConfig();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleCreateConfig = async (values: MachineConfigFormData) => {
    try {
      await createConfiguration({
        name: values.name,
        work_area_x: values.work_area_x,
        work_area_y: values.work_area_y,
        work_area_z: values.work_area_z,
        units: values.units,
        connection_settings: values.connection_settings,
      });

      setShowCreateModal(false);
      form.resetFields();
      message.success('Machine configuration created successfully');
    } catch (error) {
      message.error('Failed to create machine configuration');
    }
  };

  const handleUpdateConfig = async (values: MachineConfigFormData) => {
    if (!editingConfig) return;

    try {
      await updateConfiguration(editingConfig, {
        name: values.name,
        work_area_x: values.work_area_x,
        work_area_y: values.work_area_y,
        work_area_z: values.work_area_z,
        units: values.units,
        connection_settings: values.connection_settings,
      });

      setEditingConfig(null);
      form.resetFields();
      message.success('Machine configuration updated successfully');
    } catch (error) {
      message.error('Failed to update machine configuration');
    }
  };

  const handleSetActive = async (configId: string) => {
    try {
      await setActive(configId);
      message.success('Active machine configuration updated');
    } catch (error) {
      message.error('Failed to set active configuration');
    }
  };

  const handleDelete = async (configId: string) => {
    try {
      await deleteConfiguration(configId);
      message.success('Machine configuration deleted');
    } catch (error) {
      message.error('Failed to delete configuration');
    }
  };

  const openEditModal = (config: any) => {
    setEditingConfig(config.id);
    form.setFieldsValue({
      name: config.name,
      work_area_x: config.work_area_x,
      work_area_y: config.work_area_y,
      work_area_z: config.work_area_z,
      units: config.units,
      connection_settings: config.connection_settings,
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingConfig(null);
    form.resetFields();
  };

  if (!isConnected) {
    return (
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            Machine Configurations
          </Space>
        }
        style={{ border: '1px solid #ff7875' }}
      >
        <Alert
          message="Database Connection Unavailable"
          description="Unable to connect to the configuration database. Make sure the API server is running."
          type="error"
          showIcon
          action={
            <Button onClick={refresh} size="small">
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            Machine Configurations
            {isConnected && <Badge status="success" text="Connected" />}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Refresh configurations">
              <Button
                icon={<ReloadOutlined />}
                onClick={refresh}
                loading={isLoading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
            >
              Add Configuration
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {activeConfiguration && (
          <Alert
            message={
              <Space>
                <CheckCircleOutlined />
                <span>Active Configuration: <strong>{activeConfiguration.name}</strong></span>
              </Space>
            }
            description={
              <div>
                <Text type="secondary">
                  Work Area: {activeConfiguration.work_area_x}×{activeConfiguration.work_area_y}×{activeConfiguration.work_area_z} {activeConfiguration.units}
                </Text>
                {activeConfiguration.connection_settings && (
                  <div>
                    <Text type="secondary">
                      Port: {activeConfiguration.connection_settings.port} @ {activeConfiguration.connection_settings.baudRate} baud
                    </Text>
                  </div>
                )}
              </div>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}

        <List
          loading={isLoading}
          dataSource={configurations}
          renderItem={(config) => (
            <List.Item
              actions={[
                <Tooltip title="Set as active">
                  <Button
                    type={config.isActive ? 'primary' : 'default'}
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleSetActive(config.id!)}
                    disabled={config.isActive}
                  >
                    {config.isActive ? 'Active' : 'Set Active'}
                  </Button>
                </Tooltip>,
                <Tooltip title="Edit configuration">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(config)}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Delete Configuration"
                  description="Are you sure you want to delete this configuration?"
                  onConfirm={() => handleDelete(config.id!)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={config.isActive}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {config.name}
                    {config.isActive && <Badge status="processing" text="Active" />}
                    {config.isDefault && <Badge color="blue" text="Default" />}
                  </Space>
                }
                description={
                  <div>
                    <div>
                      <Text type="secondary">
                        Work Area: {config.work_area_x}×{config.work_area_y}×{config.work_area_z} {config.units}
                      </Text>
                    </div>
                    {config.connection_settings && (
                      <div>
                        <Text type="secondary">
                          Connection: {config.connection_settings.port} @ {config.connection_settings.baudRate} baud
                        </Text>
                      </div>
                    )}
                    <div>
                      <Text type="secondary">
                        Created: {new Date(config.created_at!).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No machine configurations found. Create one to get started.' }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingConfig ? 'Edit Machine Configuration' : 'Create Machine Configuration'}
        open={showCreateModal || !!editingConfig}
        onOk={() => form.submit()}
        onCancel={closeModal}
        destroyOnHidden
        width={600}
      >
        <Form
          form={form}
          onFinish={editingConfig ? handleUpdateConfig : handleCreateConfig}
          layout="vertical"
          initialValues={{
            units: 'mm',
            work_area_x: 300,
            work_area_y: 180,
            work_area_z: 45,
            connection_settings: {
              port: '/dev/ttyUSB0',
              baudRate: 115200,
              dataBits: 8,
              stopBits: 1,
              parity: 'none',
            },
          }}
        >
          <Form.Item
            name="name"
            label="Configuration Name"
            rules={[{ required: true, message: 'Please enter a configuration name' }]}
          >
            <Input placeholder="e.g., CNC Router 3018" />
          </Form.Item>

          <Title level={5}>Work Area</Title>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="work_area_x"
              label="X-Axis (Width)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" placeholder="300" addonAfter="mm" />
            </Form.Item>
            <Form.Item
              name="work_area_y"
              label="Y-Axis (Depth)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" placeholder="180" addonAfter="mm" />
            </Form.Item>
            <Form.Item
              name="work_area_z"
              label="Z-Axis (Height)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" placeholder="45" addonAfter="mm" />
            </Form.Item>
          </Space.Compact>

          <Form.Item name="units" label="Units">
            <Select>
              <Option value="mm">Millimeters (mm)</Option>
              <Option value="in">Inches (in)</Option>
            </Select>
          </Form.Item>

          <Divider>Connection Settings</Divider>

          <Form.Item name={['connection_settings', 'port']} label="Serial Port">
            <Input placeholder="/dev/ttyUSB0" />
          </Form.Item>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name={['connection_settings', 'baudRate']}
              label="Baud Rate"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value={9600}>9600</Option>
                <Option value={19200}>19200</Option>
                <Option value={38400}>38400</Option>
                <Option value={57600}>57600</Option>
                <Option value={115200}>115200</Option>
                <Option value={230400}>230400</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['connection_settings', 'dataBits']}
              label="Data Bits"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value={7}>7</Option>
                <Option value={8}>8</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['connection_settings', 'stopBits']}
              label="Stop Bits"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value={1}>1</Option>
                <Option value={2}>2</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['connection_settings', 'parity']}
              label="Parity"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="none">None</Option>
                <Option value="even">Even</Option>
                <Option value="odd">Odd</Option>
              </Select>
            </Form.Item>
          </Space.Compact>
        </Form>
      </Modal>
    </div>
  );
};

export default MachineConfigManager;
