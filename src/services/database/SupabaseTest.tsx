import React, { useEffect, useState } from 'react';
import {
  Card, Button, List, message, Space, Form, Input, Select, Modal, Spin,
} from 'antd';
import { bundledApiSupabaseService, type MachineConfig, type CncJob } from '../bundled-api-supabase';

const { Option } = Select;

export const SupabaseTestComponent: React.FC = () => {
  const [machineConfigs, setMachineConfigs] = useState<MachineConfig[]>([]);
  const [jobs, setJobs] = useState<CncJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [form] = Form.useForm();
  const [jobForm] = Form.useForm();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await bundledApiSupabaseService.checkConnection();
      setConnectionStatus(connected);
      if (!connected) {
        message.error('API server is not running on localhost:3000');
      } else {
        loadData();
      }
    } catch (error) {
      setConnectionStatus(false);
      message.error('Failed to check API connection');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [configsData, jobsData] = await Promise.all([
        bundledApiSupabaseService.getMachineConfigs().catch(() => []),
        bundledApiSupabaseService.getJobs({ limit: 10 }).catch(() => []),
      ]);

      setMachineConfigs(configsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('Failed to load data from Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async (values: any) => {
    try {
      const config = await bundledApiSupabaseService.createMachineConfig(values);
      setMachineConfigs((prev) => [config, ...prev]);
      setShowConfigModal(false);
      form.resetFields();
      message.success('Machine configuration created successfully');
    } catch (error) {
      message.error('Failed to create machine configuration');
    }
  };

  const handleCreateJob = async (values: any) => {
    try {
      const job = await bundledApiSupabaseService.createJob(values);
      setJobs((prev) => [job, ...prev]);
      setShowJobModal(false);
      jobForm.resetFields();
      message.success('Job created successfully');
    } catch (error) {
      message.error('Failed to create job');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await bundledApiSupabaseService.deleteMachineConfig(id);
      setMachineConfigs((prev) => prev.filter((config) => config.id !== id));
      message.success('Machine configuration deleted successfully');
    } catch (error) {
      message.error('Failed to delete machine configuration');
    }
  };

  const handleUpdateJobStatus = async (id: string, status: CncJob['status']) => {
    try {
      const updatedJob = await bundledApiSupabaseService.updateJobStatus(id, status);
      setJobs((prev) => prev.map((job) => (job.id === id ? updatedJob : job)));
      message.success(`Job status updated to ${status}`);
    } catch (error) {
      message.error('Failed to update job status');
    }
  };

  if (connectionStatus === null) {
    return (
      <Card title="Supabase Integration Test">
        <Spin size="large" />
        <p style={{ textAlign: 'center', marginTop: 16 }}>Checking API connection...</p>
      </Card>
    );
  }

  if (!connectionStatus) {
    return (
      <Card title="Supabase Integration Test" style={{ border: '1px solid #ff4d4f' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ color: '#ff4d4f' }}>⚠️ API Server Not Available</h3>
          <p>Make sure the API server is running:</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', textAlign: 'left' }}>
            cd /Users/tylerhenry/Desktop/whttlr/api{'\n'}
            npm start
          </pre>
          <Button onClick={checkConnection} style={{ marginTop: '10px' }}>
            Retry Connection
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="Supabase Integration Test"
        extra={
          <Space>
            <Button onClick={loadData} loading={loading}>
              Refresh Data
            </Button>
            <span style={{ color: '#52c41a' }}>✅ Connected</span>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">

          {/* Machine Configurations */}
          <Card
            title="Machine Configurations"
            size="small"
            extra={
              <Button type="primary" onClick={() => setShowConfigModal(true)}>
                Add Configuration
              </Button>
            }
          >
            <List
              loading={loading}
              dataSource={machineConfigs}
              renderItem={(config) => (
                <List.Item
                  actions={[
                    <Button
                      danger
                      size="small"
                      onClick={() => handleDeleteConfig(config.id!)}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={config.name}
                    description={
                      <div>
                        <div>Work Area: {config.work_area_x}×{config.work_area_y}×{config.work_area_z} {config.units}</div>
                        <div>Created: {new Date(config.created_at!).toLocaleString()}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No machine configurations found' }}
            />
          </Card>

          {/* Jobs */}
          <Card
            title="CNC Jobs"
            size="small"
            extra={
              <Button type="primary" onClick={() => setShowJobModal(true)}>
                Create Job
              </Button>
            }
          >
            <List
              loading={loading}
              dataSource={jobs}
              renderItem={(job) => (
                <List.Item
                  actions={[
                    <Select
                      size="small"
                      value={job.status}
                      onChange={(status) => handleUpdateJobStatus(job.id!, status)}
                      style={{ width: 120 }}
                    >
                      <Option value="pending">Pending</Option>
                      <Option value="running">Running</Option>
                      <Option value="paused">Paused</Option>
                      <Option value="completed">Completed</Option>
                      <Option value="failed">Failed</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>,
                  ]}
                >
                  <List.Item.Meta
                    title={job.job_name}
                    description={
                      <div>
                        <div>Status: <span style={{ fontWeight: 'bold' }}>{job.status}</span></div>
                        <div>Created: {new Date(job.created_at!).toLocaleString()}</div>
                        {job.gcode_file && <div>G-code: {job.gcode_file}</div>}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No jobs found' }}
            />
          </Card>

        </Space>
      </Card>

      {/* Create Configuration Modal */}
      <Modal
        title="Create Machine Configuration"
        open={showConfigModal}
        onOk={() => form.submit()}
        onCancel={() => setShowConfigModal(false)}
        destroyOnHidden
      >
        <Form form={form} onFinish={handleCreateConfig} layout="vertical">
          <Form.Item name="name" label="Configuration Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., CNC Router 3018" />
          </Form.Item>
          <Form.Item name="work_area_x" label="Work Area X (mm)">
            <Input type="number" placeholder="300" />
          </Form.Item>
          <Form.Item name="work_area_y" label="Work Area Y (mm)">
            <Input type="number" placeholder="180" />
          </Form.Item>
          <Form.Item name="work_area_z" label="Work Area Z (mm)">
            <Input type="number" placeholder="45" />
          </Form.Item>
          <Form.Item name="units" label="Units" initialValue="mm">
            <Select>
              <Option value="mm">Millimeters</Option>
              <Option value="in">Inches</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Job Modal */}
      <Modal
        title="Create CNC Job"
        open={showJobModal}
        onOk={() => jobForm.submit()}
        onCancel={() => setShowJobModal(false)}
        destroyOnHidden
      >
        <Form form={jobForm} onFinish={handleCreateJob} layout="vertical">
          <Form.Item name="job_name" label="Job Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Logo Engraving" />
          </Form.Item>
          <Form.Item name="machine_config_id" label="Machine Configuration">
            <Select placeholder="Select a machine configuration">
              {machineConfigs.map((config) => (
                <Option key={config.id} value={config.id}>
                  {config.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="gcode_file" label="G-code File (optional)">
            <Input placeholder="logo.gcode" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupabaseTestComponent;