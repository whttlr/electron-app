/**
 * Ant Design Form Adapter
 * 
 * Enhanced form components with CNC-specific validation, machine settings,
 * and consistent API that can be swapped for other implementations.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { Form as AntForm, FormInstance, Space, Button, Divider, Input as AntInput, Select as AntSelect } from 'antd';
import { FormProps as AntFormProps, FormItemProps as AntFormItemProps } from 'antd';
import { FormProps, FormItemProps, ValidationRule } from '../../interfaces';
import { cn } from '../../shared/utils';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';

// ============================================================================
// CNC-SPECIFIC VALIDATION RULES
// ============================================================================

/**
 * Common CNC validation patterns
 */
export const cncValidationPatterns = {
  // Coordinate validation (support for decimal numbers with +/- signs)
  coordinate: /^[+-]?\d*\.?\d+$/,
  // Feed rate validation (positive numbers only)
  feedRate: /^\d*\.?\d+$/,
  // Machine ID validation (alphanumeric with dashes/underscores)
  machineId: /^[a-zA-Z0-9_-]+$/,
  // IP address validation
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  // Port validation
  port: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  // File path validation
  filePath: /^[^<>:"|?*]+$/,
};

/**
 * CNC-specific validation rules
 */
export const cncValidationRules = {
  // Machine configuration
  machineId: {
    required: true,
    pattern: cncValidationPatterns.machineId,
    message: 'Machine ID must contain only letters, numbers, dashes, and underscores',
  },
  
  // Coordinate validation
  coordinate: (axis: string, min?: number, max?: number) => ({
    required: true,
    pattern: cncValidationPatterns.coordinate,
    message: `${axis}-axis coordinate must be a valid number`,
    validator: async (_: any, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error(`${axis}-axis coordinate must be a valid number`);
      }
      if (min !== undefined && num < min) {
        throw new Error(`${axis}-axis coordinate must be >= ${min}`);
      }
      if (max !== undefined && num > max) {
        throw new Error(`${axis}-axis coordinate must be <= ${max}`);
      }
    },
  }),
  
  // Feed rate validation
  feedRate: (min = 0, max = 10000) => ({
    required: true,
    pattern: cncValidationPatterns.feedRate,
    message: `Feed rate must be between ${min} and ${max}`,
    validator: async (_: any, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < min || num > max) {
        throw new Error(`Feed rate must be a number between ${min} and ${max}`);
      }
    },
  }),
  
  // Connection settings
  ipAddress: {
    required: true,
    pattern: cncValidationPatterns.ipAddress,
    message: 'Please enter a valid IP address',
  },
  
  port: {
    required: true,
    pattern: cncValidationPatterns.port,
    message: 'Port must be between 1 and 65535',
  },
  
  // Working area dimensions
  workingAreaDimension: (dimension: string, max = 1000) => ({
    required: true,
    pattern: cncValidationPatterns.feedRate,
    message: `${dimension} dimension must be a positive number <= ${max}mm`,
    validator: async (_: any, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0 || num > max) {
        throw new Error(`${dimension} dimension must be a positive number <= ${max}mm`);
      }
    },
  }),
};

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps our layout to Ant Design layout
 */
const layoutToAntLayout: Record<NonNullable<FormProps['layout']>, AntFormProps['layout']> = {
  horizontal: 'horizontal',
  vertical: 'vertical',
  inline: 'inline',
};

/**
 * Maps our size to Ant Design size
 */
const sizeToAntSize: Record<NonNullable<FormProps['size']>, AntFormProps['size']> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

// ============================================================================
// FORM ADAPTER
// ============================================================================

export const Form = React.forwardRef<FormInstance, FormProps & {
  onValuesChange?: (changedValues: any, allValues: any) => void;
  validateMessages?: Record<string, string>;
  preserve?: boolean;
  scrollToFirstError?: boolean;
}>(({
  layout = 'vertical',
  size = 'md',
  onFinish,
  onFinishFailed,
  initialValues,
  validateOnChange = true,
  className,
  children,
  onValuesChange,
  validateMessages,
  preserve = true,
  scrollToFirstError = true,
  ...rest
}, ref) => {
  
  const [form] = AntForm.useForm();
  
  // Set ref
  React.useImperativeHandle(ref, () => form, [form]);
  
  // Handle form submission
  const handleFinish = useCallback((values: Record<string, any>) => {
    onFinish?.(values);
  }, [onFinish]);
  
  // Handle form submission failure
  const handleFinishFailed = useCallback((errorInfo: any) => {
    console.error('Form submission failed:', errorInfo);
    onFinishFailed?.(errorInfo);
  }, [onFinishFailed]);
  
  // Custom validation messages for CNC context
  const defaultValidateMessages = {
    required: '${label} is required for machine operation',
    types: {
      email: '${label} is not a valid email address',
      number: '${label} must be a valid number',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
      min: '${label} must be at least ${min}',
      max: '${label} must not exceed ${max}',
    },
    string: {
      min: '${label} must be at least ${min} characters',
      max: '${label} cannot exceed ${max} characters',
    },
    ...validateMessages,
  };
  
  return (
    <AntForm
      form={form}
      layout={layoutToAntLayout[layout]}
      size={sizeToAntSize[size]}
      initialValues={initialValues}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      onValuesChange={onValuesChange}
      validateMessages={defaultValidateMessages}
      preserve={preserve}
      scrollToFirstError={scrollToFirstError}
      className={cn('space-y-4', className)}
      {...rest}
    >
      {children}
    </AntForm>
  );
});

Form.displayName = 'Form';

// ============================================================================
// FORM ITEM ADAPTER
// ============================================================================

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps & {
  tooltip?: string;
  extra?: React.ReactNode;
  validateFirst?: boolean;
  validateDebounce?: number;
  messageVariables?: Record<string, string>;
}>(({
  name,
  label,
  rules = [],
  required = false,
  help,
  error,
  labelAlign = 'left',
  labelCol,
  wrapperCol,
  dependencies = [],
  tooltip,
  extra,
  validateFirst = false,
  validateDebounce = 0,
  messageVariables,
  className,
  children,
  ...rest
}, ref) => {
  
  // Convert our rules to Ant Design format
  const antRules = rules.map((rule: ValidationRule) => ({
    required: rule.required,
    message: rule.message,
    min: rule.min,
    max: rule.max,
    pattern: rule.pattern,
    type: rule.type as any,
    validator: rule.validator,
  }));
  
  // Add required rule if specified
  if (required && !antRules.some(rule => rule.required)) {
    antRules.unshift({
      required: true,
      message: `${label} is required`,
    });
  }
  
  // Generate tooltip icon
  const TooltipIcon = tooltip ? (
    <InfoCircleOutlined 
      style={{ color: '#64748b', marginLeft: 4 }} 
      title={tooltip}
    />
  ) : null;
  
  // Enhance label with tooltip
  const enhancedLabel = label && (
    <span>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      {TooltipIcon}
    </span>
  );
  
  return (
    <AntForm.Item
      ref={ref}
      name={name}
      label={enhancedLabel}
      rules={antRules}
      help={help}
      validateStatus={error ? 'error' : undefined}
      dependencies={dependencies}
      extra={extra}
      validateFirst={validateFirst}
      validateDebounce={validateDebounce}
      messageVariables={messageVariables}
      labelAlign={labelAlign}
      labelCol={labelCol ? { span: labelCol } : undefined}
      wrapperCol={wrapperCol ? { span: wrapperCol } : undefined}
      className={cn('mb-4', className)}
      {...rest}
    >
      {children}
    </AntForm.Item>
  );
});

FormItem.displayName = 'FormItem';

// ============================================================================
// CNC-SPECIFIC FORM COMPONENTS
// ============================================================================

/**
 * Machine configuration form section
 */
export const MachineConfigSection: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = 'Machine Configuration',
  description = 'Configure your CNC machine settings'
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-secondary-400 mt-1">{description}</p>
        )}
      </div>
      <Divider style={{ margin: '12px 0' }} />
      
      <FormItem
        name="machineId"
        label="Machine ID"
        required
        rules={[cncValidationRules.machineId]}
        tooltip="Unique identifier for this machine"
      >
        <Input placeholder="cnc-001" />
      </FormItem>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem
          name="workingAreaWidth"
          label="Working Area Width (mm)"
          required
          rules={[cncValidationRules.workingAreaDimension('Width')]}
        >
          <Input type="number" placeholder="300" />
        </FormItem>
        
        <FormItem
          name="workingAreaHeight"
          label="Working Area Height (mm)"
          required
          rules={[cncValidationRules.workingAreaDimension('Height')]}
        >
          <Input type="number" placeholder="200" />
        </FormItem>
      </div>
      
      <FormItem
        name="workingAreaDepth"
        label="Working Area Depth (mm)"
        required
        rules={[cncValidationRules.workingAreaDimension('Depth')]}
      >
        <Input type="number" placeholder="50" />
      </FormItem>
    </div>
  );
};

/**
 * Connection settings form section
 */
export const ConnectionConfigSection: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = 'Connection Settings',
  description = 'Configure how to connect to your CNC machine'
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-secondary-400 mt-1">{description}</p>
        )}
      </div>
      <Divider style={{ margin: '12px 0' }} />
      
      <div className="grid grid-cols-3 gap-4">
        <FormItem
          name="connectionType"
          label="Connection Type"
          required
          className="col-span-1"
        >
          <Select>
            <Select.Option value="serial">Serial</Select.Option>
            <Select.Option value="tcp">TCP/IP</Select.Option>
            <Select.Option value="usb">USB</Select.Option>
          </Select>
        </FormItem>
        
        <FormItem
          name="ipAddress"
          label="IP Address"
          required
          rules={[cncValidationRules.ipAddress]}
          className="col-span-1"
        >
          <Input placeholder="192.168.1.100" />
        </FormItem>
        
        <FormItem
          name="port"
          label="Port"
          required
          rules={[cncValidationRules.port]}
          className="col-span-1"
        >
          <Input type="number" placeholder="8080" />
        </FormItem>
      </div>
      
      <FormItem
        name="baudRate"
        label="Baud Rate"
        tooltip="Communication speed for serial connections"
      >
        <Select>
          <Select.Option value="9600">9600</Select.Option>
          <Select.Option value="19200">19200</Select.Option>
          <Select.Option value="38400">38400</Select.Option>
          <Select.Option value="57600">57600</Select.Option>
          <Select.Option value="115200">115200</Select.Option>
        </Select>
      </FormItem>
    </div>
  );
};

/**
 * Movement settings form section
 */
export const MovementConfigSection: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = 'Movement Settings',
  description = 'Configure movement speeds and limits'
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-secondary-400 mt-1">{description}</p>
        )}
      </div>
      <Divider style={{ margin: '12px 0' }} />
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem
          name="maxFeedRate"
          label="Max Feed Rate (mm/min)"
          required
          rules={[cncValidationRules.feedRate(1, 10000)]}
        >
          <Input type="number" placeholder="1000" />
        </FormItem>
        
        <FormItem
          name="defaultFeedRate"
          label="Default Feed Rate (mm/min)"
          required
          rules={[cncValidationRules.feedRate(1, 1000)]}
        >
          <Input type="number" placeholder="500" />
        </FormItem>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <FormItem
          name="jogStepSize"
          label="Jog Step Size (mm)"
          required
          tooltip="Default distance for each jog movement"
        >
          <Select>
            <Select.Option value="0.1">0.1</Select.Option>
            <Select.Option value="1">1</Select.Option>
            <Select.Option value="10">10</Select.Option>
            <Select.Option value="50">50</Select.Option>
          </Select>
        </FormItem>
        
        <FormItem
          name="jogSpeed"
          label="Jog Speed (mm/min)"
          required
          rules={[cncValidationRules.feedRate(1, 5000)]}
        >
          <Input type="number" placeholder="100" />
        </FormItem>
        
        <FormItem
          name="rapidSpeed"
          label="Rapid Speed (mm/min)"
          required
          rules={[cncValidationRules.feedRate(1, 10000)]}
        >
          <Input type="number" placeholder="2000" />
        </FormItem>
      </div>
    </div>
  );
};

/**
 * Quick form for coordinate input
 */
export const CoordinateForm: React.FC<{
  onSubmit: (coordinates: { x: number; y: number; z: number }) => void;
  initialValues?: { x?: number; y?: number; z?: number };
  maxValues?: { x?: number; y?: number; z?: number };
  minValues?: { x?: number; y?: number; z?: number };
}> = ({ onSubmit, initialValues, maxValues, minValues }) => {
  const [form] = AntForm.useForm();
  
  const handleSubmit = (values: any) => {
    onSubmit({
      x: parseFloat(values.x),
      y: parseFloat(values.y),
      z: parseFloat(values.z),
    });
  };
  
  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={handleSubmit}
      initialValues={initialValues}
      className="space-y-2"
    >
      <div className="grid grid-cols-3 gap-3">
        <FormItem
          name="x"
          label="X"
          required
          rules={[cncValidationRules.coordinate('X', minValues?.x, maxValues?.x)]}
          className="mb-2"
        >
          <Input type="number" step="0.001" className="font-mono text-center" />
        </FormItem>
        
        <FormItem
          name="y"
          label="Y"
          required
          rules={[cncValidationRules.coordinate('Y', minValues?.y, maxValues?.y)]}
          className="mb-2"
        >
          <Input type="number" step="0.001" className="font-mono text-center" />
        </FormItem>
        
        <FormItem
          name="z"
          label="Z"
          required
          rules={[cncValidationRules.coordinate('Z', minValues?.z, maxValues?.z)]}
          className="mb-2"
        >
          <Input type="number" step="0.001" className="font-mono text-center" />
        </FormItem>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button onClick={() => form.resetFields()}>Reset</Button>
        <Button type="primary" htmlType="submit">Apply</Button>
      </div>
    </Form>
  );
};

// Need to import these for the form sections to work
const Input = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  return <AntInput ref={ref} {...props} />;
});
Input.displayName = 'Input';

const Select = React.forwardRef<any, any>((props, ref) => {
  return <AntSelect ref={ref} {...props} />;
});
Select.displayName = 'Select';
Select.Option = AntSelect.Option;

// ============================================================================
// EXPORTS
// ============================================================================

export default Form;
