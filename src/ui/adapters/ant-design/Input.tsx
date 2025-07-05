/**
 * Ant Design Input Adapter
 * 
 * Enhanced input components with validation, CNC-specific features,
 * and consistent API that can be swapped for other implementations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input as AntInput, InputNumber, Tooltip, Space } from 'antd';
import { InputProps as AntInputProps, InputNumberProps } from 'antd';
import { inputVariants } from '../../theme/component-styles';
import { InputProps, TextAreaProps } from '../../interfaces';
import { cn } from '../../shared/utils';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  LoadingOutlined,
  ClearOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'success';
}

export type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
  message?: string;
};

/**
 * Validate input value against rules
 */
function validateValue(value: any, rules: ValidationRule[] = []): ValidationResult {
  for (const rule of rules) {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        isValid: false,
        message: rule.message || 'This field is required',
        type: 'error',
      };
    }
    
    // Skip other validations if value is empty and not required
    if (!value && !rule.required) continue;
    
    // Min/Max length for strings
    if (typeof value === 'string') {
      if (rule.min && value.length < rule.min) {
        return {
          isValid: false,
          message: rule.message || `Minimum length is ${rule.min} characters`,
          type: 'error',
        };
      }
      if (rule.max && value.length > rule.max) {
        return {
          isValid: false,
          message: rule.message || `Maximum length is ${rule.max} characters`,
          type: 'error',
        };
      }
    }
    
    // Min/Max value for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return {
          isValid: false,
          message: rule.message || `Minimum value is ${rule.min}`,
          type: 'error',
        };
      }
      if (rule.max !== undefined && value > rule.max) {
        return {
          isValid: false,
          message: rule.message || `Maximum value is ${rule.max}`,
          type: 'error',
        };
      }
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return {
        isValid: false,
        message: rule.message || 'Invalid format',
        type: 'error',
      };
    }
    
    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (!result.isValid) {
        return result;
      }
    }
  }
  
  return { isValid: true, type: 'success' };
}

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps our validation state to Ant Design status
 */
const stateToAntStatus: Record<NonNullable<InputProps['state']>, AntInputProps['status']> = {
  default: undefined,
  error: 'error',
  success: undefined, // Ant Design doesn't have success status, we'll use custom styling
  warning: 'warning',
};

/**
 * Maps our size to Ant Design size
 */
const sizeToAntSize: Record<NonNullable<InputProps['size']>, AntInputProps['size']> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

// ============================================================================
// BASE INPUT ADAPTER
// ============================================================================

export const Input = React.forwardRef<HTMLInputElement, InputProps & {
  validationRules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationIcon?: boolean;
}>(({
  variant = 'default',
  size = 'md',
  state = 'default',
  label,
  help,
  error,
  startIcon,
  endIcon,
  value,
  onChange,
  onClear,
  clearable = false,
  loading = false,
  disabled = false,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  showValidationIcon = true,
  className,
  ...rest
}, ref) => {
  
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [isFocused, setIsFocused] = useState(false);
  
  // Validate value
  const validate = useCallback((val: any) => {
    const result = validateValue(val, validationRules);
    setValidationResult(result);
    return result;
  }, [validationRules]);
  
  // Validate on value change
  useEffect(() => {
    if (validateOnChange && value !== undefined) {
      validate(value);
    }
  }, [value, validate, validateOnChange]);
  
  // Handle change with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (validateOnChange) {
      validate(newValue);
    }
    onChange?.(e);
  };
  
  // Handle blur with validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (validateOnBlur) {
      validate(e.target.value);
    }
    rest.onBlur?.(e);
  };
  
  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  };
  
  // Determine final state
  const finalState = error ? 'error' : (validationResult.isValid ? state : 'error');
  const finalError = error || (!validationResult.isValid ? validationResult.message : undefined);
  
  // Generate CSS classes
  const inputClasses = cn(
    inputVariants({ size, variant, state: finalState }),
    !validationResult.isValid && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    validationResult.isValid && validationResult.type === 'success' && 'border-green-500 focus:border-green-500 focus:ring-green-500',
    isFocused && 'ring-2 ring-primary/20',
    className
  );
  
  // Generate validation icon
  const ValidationIcon = () => {
    if (!showValidationIcon || loading) return null;
    
    if (!validationResult.isValid) {
      return <ExclamationCircleOutlined style={{ color: '#ef4444' }} />;
    }
    
    if (validationResult.type === 'success' && value) {
      return <CheckCircleOutlined style={{ color: '#22c55e' }} />;
    }
    
    return null;
  };
  
  // Generate suffix icons
  const suffixIcons = [
    loading && <LoadingOutlined key="loading" />,
    showValidationIcon && <ValidationIcon key="validation" />,
    clearable && value && !disabled && (
      <ClearOutlined 
        key="clear" 
        onClick={() => {
          onClear?.();
          if (onChange) {
            onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        style={{ cursor: 'pointer', color: '#64748b' }}
      />
    ),
    endIcon && <span key="endIcon">{endIcon}</span>,
  ].filter(Boolean);
  
  const inputComponent = (
    <AntInput
      ref={ref}
      size={sizeToAntSize[size]}
      status={stateToAntStatus[finalState]}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      className={inputClasses}
      prefix={startIcon}
      suffix={suffixIcons.length > 0 ? (
        <Space size={4}>
          {suffixIcons}
        </Space>
      ) : undefined}
      {...rest}
    />
  );
  
  // Wrap with label and help text if provided
  if (label || help || finalError) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {validationRules.some(rule => rule.required) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        {inputComponent}
        {(help || finalError) && (
          <div className={cn(
            'text-xs',
            finalError ? 'text-red-500' : 'text-secondary-400'
          )}>
            {finalError || help}
          </div>
        )}
      </div>
    );
  }
  
  return inputComponent;
});

Input.displayName = 'Input';

// ============================================================================
// TEXTAREA ADAPTER
// ============================================================================

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps & {
  validationRules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationIcon?: boolean;
}>(({
  size = 'md',
  state = 'default',
  label,
  help,
  error,
  rows = 4,
  disabled = false,
  autoSize = false,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  showValidationIcon = true,
  className,
  ...rest
}, ref) => {
  
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  
  // Validate value
  const validate = useCallback((val: any) => {
    const result = validateValue(val, validationRules);
    setValidationResult(result);
    return result;
  }, [validationRules]);
  
  // Handle change with validation
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (validateOnChange) {
      validate(e.target.value);
    }
    rest.onChange?.(e);
  };
  
  // Handle blur with validation
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (validateOnBlur) {
      validate(e.target.value);
    }
    rest.onBlur?.(e);
  };
  
  // Determine final state
  const finalState = error ? 'error' : (validationResult.isValid ? state : 'error');
  const finalError = error || (!validationResult.isValid ? validationResult.message : undefined);
  
  // Size mapping for TextArea
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg',
  };
  
  const textareaClasses = cn(
    'flex w-full rounded-md border border-input bg-background px-3 py-2',
    'text-sm ring-offset-background placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors duration-200 resize-none',
    sizeClasses[size],
    !validationResult.isValid && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    validationResult.isValid && validationResult.type === 'success' && 'border-green-500 focus:border-green-500 focus:ring-green-500',
    className
  );
  
  const textareaComponent = (
    <AntInput.TextArea
      ref={ref}
      rows={rows}
      disabled={disabled}
      autoSize={autoSize}
      status={stateToAntStatus[finalState]}
      onChange={handleChange}
      onBlur={handleBlur}
      className={textareaClasses}
      {...rest}
    />
  );
  
  // Wrap with label and help text if provided
  if (label || help || finalError) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {validationRules.some(rule => rule.required) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        {textareaComponent}
        {(help || finalError) && (
          <div className={cn(
            'text-xs',
            finalError ? 'text-red-500' : 'text-secondary-400'
          )}>
            {finalError || help}
          </div>
        )}
      </div>
    );
  }
  
  return textareaComponent;
});

TextArea.displayName = 'TextArea';

// ============================================================================
// PASSWORD INPUT
// ============================================================================

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'> & {
  validationRules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationIcon?: boolean;
  visibilityToggle?: boolean;
}>(({
  visibilityToggle = true,
  ...props
}, ref) => {
  
  const [visible, setVisible] = useState(false);
  
  const toggleVisibility = () => setVisible(!visible);
  
  const visibilityIcon = visibilityToggle ? (
    visible ? (
      <EyeInvisibleOutlined onClick={toggleVisibility} style={{ cursor: 'pointer' }} />
    ) : (
      <EyeOutlined onClick={toggleVisibility} style={{ cursor: 'pointer' }} />
    )
  ) : undefined;
  
  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      endIcon={visibilityIcon}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// ============================================================================
// CNC-SPECIFIC INPUT COMPONENTS
// ============================================================================

/**
 * Coordinate input for CNC positioning
 */
export const CoordinateInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'variant' | 'type'> & {
  axis?: 'X' | 'Y' | 'Z';
  units?: 'mm' | 'in';
  precision?: number;
  min?: number;
  max?: number;
}>(({
  axis,
  units = 'mm',
  precision = 3,
  min,
  max,
  value,
  onChange,
  ...props
}, ref) => {
  
  const axisColors = {
    X: 'border-red-500/30 bg-red-500/5 focus:border-red-500',
    Y: 'border-green-500/30 bg-green-500/5 focus:border-green-500',
    Z: 'border-blue-500/30 bg-blue-500/5 focus:border-blue-500',
  };
  
  const validationRules: ValidationRule[] = [
    min !== undefined && { min, message: `Value must be >= ${min}${units}` },
    max !== undefined && { max, message: `Value must be <= ${max}${units}` },
    {
      custom: (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          return { isValid: false, message: 'Must be a valid number', type: 'error' };
        }
        return { isValid: true, type: 'success' };
      }
    },
  ].filter(Boolean) as ValidationRule[];
  
  return (
    <Input
      ref={ref}
      variant="coordinate"
      type="number"
      value={value}
      onChange={onChange}
      validationRules={validationRules}
      startIcon={axis && (
        <span className={cn(
          'font-mono font-bold text-xs px-1 rounded',
          axis === 'X' && 'text-red-400',
          axis === 'Y' && 'text-green-400', 
          axis === 'Z' && 'text-blue-400'
        )}>
          {axis}
        </span>
      )}
      endIcon={<span className="text-xs text-secondary-400">{units}</span>}
      className={cn(
        'font-mono text-center',
        axis && axisColors[axis]
      )}
      {...props}
    />
  );
});

CoordinateInput.displayName = 'CoordinateInput';

/**
 * Speed/Feed rate input for CNC controls
 */
export const FeedRateInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'variant' | 'type'> & {
  units?: 'mm/min' | 'in/min' | '%';
  min?: number;
  max?: number;
  step?: number;
}>(({
  units = 'mm/min',
  min = 0,
  max = 10000,
  step = 10,
  value,
  onChange,
  ...props
}, ref) => {
  
  const validationRules: ValidationRule[] = [
    { min, message: `Feed rate must be >= ${min}` },
    { max, message: `Feed rate must be <= ${max}` },
    {
      custom: (val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          return { isValid: false, message: 'Must be a positive number', type: 'error' };
        }
        return { isValid: true, type: 'success' };
      }
    },
  ];
  
  return (
    <Input
      ref={ref}
      variant="precision"
      type="number"
      value={value}
      onChange={onChange}
      validationRules={validationRules}
      endIcon={<span className="text-xs text-secondary-400">{units}</span>}
      className="font-mono text-right"
      step={step}
      min={min}
      max={max}
      {...props}
    />
  );
});

FeedRateInput.displayName = 'FeedRateInput';

// ============================================================================
// EXPORTS
// ============================================================================

export default Input;
export { 
  type ValidationRule,
  type ValidationResult,
  validateValue 
};
