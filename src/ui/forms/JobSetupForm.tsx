/**
 * Job Setup Form Component
 * 
 * Complete form implementation for CNC job configuration including
 * material settings, work origin, tool settings, and time estimation.
 */

import React, { useState } from 'react';
import { Form, FormItem } from '../adapters/ant-design/Form';
import { Input, CoordinateInput, FeedRateInput } from '../adapters/ant-design/Input';
import { Select } from '../adapters/ant-design/Select';
import { Button } from '../adapters/ant-design/Button';
import { Card } from '../adapters/ant-design/Card';
import { Divider, Row, Col } from 'antd';
import { 
  required,
  range
} from '../validation';
import { 
  PlayCircleOutlined,
} from '@ant-design/icons';

// ============================================================================
// JOB SETUP FORM
// ============================================================================

export interface JobSetupFormData {
  jobName: string;
  description?: string;
  gcodeFile: File | string;
  material: {
    type: string;
    thickness: number;
    dimensions: { width: number; height: number };
  };
  workOrigin: { x: number; y: number; z: number };
  toolSettings: {
    toolNumber: number;
    spindleSpeed: number;
    feedRate: number;
    plungeRate: number;
  };
  estimatedTime?: number;
}

export interface JobSetupFormProps {
  initialValues?: Partial<JobSetupFormData>;
  onSubmit: (data: JobSetupFormData) => void;
  onCancel?: () => void;
  onEstimate?: (data: Partial<JobSetupFormData>) => Promise<number>;
  loading?: boolean;
}

export const JobSetupForm: React.FC<JobSetupFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  onEstimate,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);
  
  const handleEstimate = async () => {
    try {
      setEstimating(true);
      const values = form.getFieldsValue();
      if (onEstimate) {
        const time = await onEstimate(values);
        setEstimatedTime(time);
      }
    } catch (error) {
      console.error('Failed to estimate job time:', error);
    } finally {
      setEstimating(false);
    }
  };
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <Card title="Job Setup" className="job-setup-form">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          material: { type: 'wood' },
          workOrigin: { x: 0, y: 0, z: 0 },
          toolSettings: { toolNumber: 1, spindleSpeed: 18000, feedRate: 1000, plungeRate: 300 },
          ...initialValues,
        }}
        onFinish={onSubmit}
        className="space-y-4"
      >
        <Row gutter={16}>
          <Col span={16}>
            <FormItem
              name="jobName"
              label="Job Name"
              required
              rules={[required('Job name is required')]}
            >
              <Input placeholder="My CNC Project" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="gcodeFile"
              label="G-Code File"
              required
              rules={[required('G-Code file is required')]}
            >
              <Input placeholder="project.gcode" />
            </FormItem>
          </Col>
        </Row>
        
        <FormItem
          name="description"
          label="Description"
        >
          <Input.TextArea rows={2} placeholder="Optional job description..." />
        </FormItem>
        
        <Divider>Material Settings</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <FormItem
              name={['material', 'type']}
              label="Material Type"
              required
              rules={[required('Material type is required')]}
            >
              <Select
                options={[
                  { value: 'wood', label: 'Wood' },
                  { value: 'plywood', label: 'Plywood' },
                  { value: 'mdf', label: 'MDF' },
                  { value: 'aluminum', label: 'Aluminum' },
                  { value: 'plastic', label: 'Plastic' },
                  { value: 'foam', label: 'Foam' },
                ]}
                placeholder="Select material"
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name={['material', 'thickness']}
              label="Thickness (mm)"
              required
              rules={[
                required('Material thickness is required'),
                range(0.1, 100, 'Thickness must be between 0.1 and 100 mm')
              ]}
            >
              <Input type="number" step="0.1" placeholder="6.35" />
            </FormItem>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              name={['material', 'dimensions', 'width']}
              label="Material Width (mm)"
              required
              rules={[
                required('Material width is required'),
                range(1, 1000, 'Width must be between 1 and 1000 mm')
              ]}
            >
              <Input type="number" step="0.1" placeholder="200" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name={['material', 'dimensions', 'height']}
              label="Material Height (mm)"
              required
              rules={[
                required('Material height is required'),
                range(1, 1000, 'Height must be between 1 and 1000 mm')
              ]}
            >
              <Input type="number" step="0.1" placeholder="150" />
            </FormItem>
          </Col>
        </Row>
        
        <Divider>Work Origin</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <FormItem
              name={['workOrigin', 'x']}
              label="X Origin"
              required
            >
              <CoordinateInput axis="X" units="mm" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name={['workOrigin', 'y']}
              label="Y Origin"
              required
            >
              <CoordinateInput axis="Y" units="mm" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name={['workOrigin', 'z']}
              label="Z Origin"
              required
            >
              <CoordinateInput axis="Z" units="mm" />
            </FormItem>
          </Col>
        </Row>
        
        <Divider>Tool Settings</Divider>
        
        <Row gutter={16}>
          <Col span={6}>
            <FormItem
              name={['toolSettings', 'toolNumber']}
              label="Tool #"
              required
            >
              <Input type="number" placeholder="1" min={1} max={99} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name={['toolSettings', 'spindleSpeed']}
              label="Spindle Speed (RPM)"
              required
            >
              <Input type="number" placeholder="18000" min={0} max={30000} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name={['toolSettings', 'feedRate']}
              label="Feed Rate"
              required
            >
              <FeedRateInput units="mm/min" />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name={['toolSettings', 'plungeRate']}
              label="Plunge Rate"
              required
            >
              <FeedRateInput units="mm/min" />
            </FormItem>
          </Col>
        </Row>
        
        {onEstimate && (
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Job Time Estimation</span>
              <Button 
                onClick={handleEstimate}
                loading={estimating}
                size="sm"
                variant="outline"
              >
                Calculate
              </Button>
            </div>
            {estimatedTime && (
              <div className="text-lg font-mono">
                Estimated Time: <span className="text-primary">{formatTime(estimatedTime)}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center border-t pt-4">
          <div className="flex space-x-2">
            {onCancel && (
              <Button onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={<PlayCircleOutlined />}
            >
              Start Job
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};