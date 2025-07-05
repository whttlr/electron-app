import React from 'react';
import dayjs from 'dayjs';
import { Form, Select, Radio, InputNumber, Checkbox, DatePicker, TimePicker, Transfer, Upload } from 'antd';
import { Input as AntInput, Button as AntButton } from 'antd';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
} from '../../../ui/shared';
import { FileText, Upload as UploadIcon, X, Check } from 'lucide-react';

interface FormsProps {
  formsRef?: React.RefObject<HTMLDivElement>;
  transferRef?: React.RefObject<HTMLDivElement>;
  uploadRef?: React.RefObject<HTMLDivElement>;
  form: any;
  transferTargetKeys: string[];
  transferSelectedKeys: string[];
  fileList: any[];
  transferData: any[];
  handleFormSubmit: (values: any) => void;
  handleTransferChange: (newTargetKeys: string[], direction: string, moveKeys: string[]) => void;
  handleTransferSelectChange: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  handleUploadChange: (info: any) => void;
  handleUploadRemove: (file: any) => void;
  beforeUpload: (file: any) => boolean;
}

export const FormsDemo: React.FC<FormsProps> = ({
  formsRef,
  transferRef,
  uploadRef,
  form,
  transferTargetKeys,
  transferSelectedKeys,
  fileList,
  transferData,
  handleFormSubmit,
  handleTransferChange,
  handleTransferSelectChange,
  handleUploadChange,
  handleUploadRemove,
  beforeUpload,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
        Forms & Input Controls
      </h2>
      <Card ref={formsRef}>
        <CardHeader>
          <CardTitle>CNC Machine Configuration Form</CardTitle>
          <p className="text-sm text-muted-foreground">Complete form example with various input types</p>
        </CardHeader>
        <CardContent>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              machineName: 'CNC-001',
              machineType: 'mill',
              workAreaX: 300,
              workAreaY: 200,
              workAreaZ: 100,
              maxSpeed: 5000,
              acceleration: 1000,
              units: 'metric',
              autoHome: true,
              safetyEnabled: true,
              emergencyStopType: 'hardware',
              operatingHours: dayjs('08:00', 'HH:mm'),
              maintenanceDate: undefined,
              priority: 'high',
              notes: 'High precision milling machine for prototype development',
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                
                <Form.Item
                  label="Machine Name"
                  name="machineName"
                  rules={[{ required: true, message: 'Please enter machine name' }]}
                >
                  <Input placeholder="Enter machine name" />
                </Form.Item>

                <Form.Item
                  label="Machine Type"
                  name="machineType"
                  rules={[{ required: true, message: 'Please select machine type' }]}
                >
                  <Select placeholder="Select machine type">
                    <Select.Option value="mill">CNC Mill</Select.Option>
                    <Select.Option value="lathe">CNC Lathe</Select.Option>
                    <Select.Option value="router">CNC Router</Select.Option>
                    <Select.Option value="plasma">Plasma Cutter</Select.Option>
                    <Select.Option value="laser">Laser Cutter</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Units"
                  name="units"
                >
                  <Radio.Group>
                    <Radio value="metric">Metric (mm)</Radio>
                    <Radio value="imperial">Imperial (in)</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="Priority Level"
                  name="priority"
                >
                  <Select placeholder="Select priority">
                    <Select.Option value="low">Low Priority</Select.Option>
                    <Select.Option value="medium">Medium Priority</Select.Option>
                    <Select.Option value="high">High Priority</Select.Option>
                    <Select.Option value="critical">Critical</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Technical Specifications</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <Form.Item
                    label="Work Area X"
                    name="workAreaX"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={2000}
                      className="w-full"
                      formatter={(value) => `${value} mm`}
                      parser={(value) => value!.replace(' mm', '')}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Work Area Y"
                    name="workAreaY"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={2000}
                      className="w-full"
                      formatter={(value) => `${value} mm`}
                      parser={(value) => value!.replace(' mm', '')}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Work Area Z"
                    name="workAreaZ"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={500}
                      className="w-full"
                      formatter={(value) => `${value} mm`}
                      parser={(value) => value!.replace(' mm', '')}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Maximum Speed"
                  name="maxSpeed"
                  rules={[{ required: true, message: 'Please enter maximum speed' }]}
                >
                  <InputNumber
                    min={100}
                    max={20000}
                    step={100}
                    className="w-full"
                    formatter={(value) => `${value} mm/min`}
                    parser={(value) => value!.replace(' mm/min', '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Acceleration"
                  name="acceleration"
                  rules={[{ required: true, message: 'Please enter acceleration' }]}
                >
                  <InputNumber
                    min={50}
                    max={5000}
                    step={50}
                    className="w-full"
                    formatter={(value) => `${value} mm/s²`}
                    parser={(value) => value!.replace(' mm/s²', '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Operating Hours"
                  name="operatingHours"
                >
                  <TimePicker 
                    format="HH:mm" 
                    className="w-full"
                    placeholder="Select operating hours"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Safety & Configuration */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Safety & Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Form.Item
                    name="autoHome"
                    valuePropName="checked"
                  >
                    <Checkbox>Auto-home on startup</Checkbox>
                  </Form.Item>

                  <Form.Item
                    name="safetyEnabled"
                    valuePropName="checked"
                  >
                    <Checkbox>Enable safety interlocks</Checkbox>
                  </Form.Item>

                  <Form.Item
                    label="Emergency Stop Type"
                    name="emergencyStopType"
                  >
                    <Radio.Group>
                      <Radio value="hardware">Hardware E-Stop</Radio>
                      <Radio value="software">Software E-Stop</Radio>
                      <Radio value="both">Both</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>

                <div className="space-y-4">
                  <Form.Item
                    label="Maintenance Date"
                    name="maintenanceDate"
                  >
                    <DatePicker 
                      className="w-full"
                      placeholder="Select maintenance date"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Notes"
                    name="notes"
                  >
                    <AntInput.TextArea
                      rows={4}
                      placeholder="Additional notes or comments..."
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Feature Selection & File Management */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Advanced Configuration</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Selection */}
                <div className="space-y-4" ref={transferRef}>
                  <h4 className="text-md font-medium text-foreground mb-3">Active Features & Sensors</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure which CNC features and sensors are active for your machine setup. 
                    Move items between Available and Active lists.
                  </p>
                  
                  <Transfer
                    dataSource={transferData}
                    targetKeys={transferTargetKeys}
                    selectedKeys={transferSelectedKeys}
                    onChange={handleTransferChange}
                    onSelectChange={handleTransferSelectChange}
                    render={item => (
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    )}
                    titles={['Available Features', 'Active Features']}
                    showSearch
                    searchPlaceholder="Search features..."
                    listStyle={{
                      width: 280,
                      height: 320,
                    }}
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-4 mb-8" ref={uploadRef}>
                  <h4 className="text-md font-medium text-foreground mb-3">G-Code File Upload</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload G-Code files, CAM programs, and configuration files. 
                    Supports drag-and-drop and validates file types.
                  </p>

                  <Upload.Dragger
                    name="files"
                    multiple
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    onChange={handleUploadChange}
                    onRemove={handleUploadRemove}
                    beforeUpload={beforeUpload}
                    fileList={fileList}
                    accept=".gcode,.nc,.txt"
                    className="upload-dragger"
                  >
                    <p className="ant-upload-drag-icon mb-4">
                      <UploadIcon className="w-12 h-12 text-primary mx-auto" />
                    </p>
                    <p className="ant-upload-text text-foreground font-medium mb-2">
                      Click or drag G-Code files to this area to upload
                    </p>
                    <p className="ant-upload-hint text-muted-foreground">
                      Support for .gcode, .nc, and .txt files. Maximum file size: 10MB. 
                      Multiple files supported (up to 5 files).
                    </p>
                  </Upload.Dragger>

                  {fileList.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-foreground mb-2">
                        Uploaded Files ({fileList.length}/5):
                      </h5>
                      <div className="space-y-2">
                        {fileList.map((file, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.status === 'done' && (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                              {file.status === 'error' && (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                              <AntButton
                                type="text"
                                size="small"
                                icon={<X className="w-4 h-4" />}
                                onClick={() => handleUploadRemove(file)}
                                className="text-muted-foreground hover:text-destructive"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button type="submit" size="lg">
                Save Configuration
              </Button>
              <Button 
                type="button" 
                size="lg"
                onClick={() => form.resetFields()}
              >
                Reset Form
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => console.log('Current values:', form.getFieldsValue())}
              >
                Preview Values
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};