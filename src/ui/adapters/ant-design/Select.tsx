/**
 * Ant Design Select Adapter
 * 
 * Enhanced select components with search, grouping, CNC-specific options,
 * and consistent API that can be swapped for other implementations.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select as AntSelect, Tag, Space, Divider } from 'antd';
import { SelectProps as AntSelectProps, DefaultOptionType } from 'antd/es/select';
import { SelectProps, SelectOption } from '../../interfaces';
import { cn } from '../../shared/utils';
import { 
  SearchOutlined,
  ClearOutlined,
  DownOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  WifiOutlined,
  UsbOutlined,
  ApiOutlined,
} from '@ant-design/icons';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps our size to Ant Design size
 */
const sizeToAntSize: Record<NonNullable<SelectProps['size']>, AntSelectProps['size']> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

/**
 * Maps our validation state to Ant Design status
 */
const stateToAntStatus: Record<NonNullable<SelectProps['state']>, AntSelectProps['status']> = {
  default: undefined,
  error: 'error',
  success: undefined,
  warning: 'warning',
};

// ============================================================================
// SELECT ADAPTER
// ============================================================================

export const Select = React.forwardRef<any, SelectProps & {
  loading?: boolean;
  allowClear?: boolean;
  autoFocus?: boolean;
  dropdownMatchSelectWidth?: boolean;
  dropdownStyle?: React.CSSProperties;
  filterOption?: boolean | ((input: string, option?: DefaultOptionType) => boolean);
  showSearch?: boolean;
  virtual?: boolean;
}>(({
  size = 'md',
  state = 'default',
  options = [],
  value,
  defaultValue,
  placeholder = 'Select an option',
  multiple = false,
  searchable = false,
  clearable = false,
  maxTagCount = 3,
  loading = false,
  disabled = false,
  onChange,
  onSearch,
  onClear,
  className,
  children,
  allowClear,
  autoFocus = false,
  dropdownMatchSelectWidth = true,
  dropdownStyle,
  filterOption,
  showSearch,
  virtual = true,
  ...rest
}, ref) => {
  
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Process options into Ant Design format
  const processedOptions = useMemo(() => {
    // Group options if they have groups
    const grouped = options.reduce((acc, option) => {
      const group = option.group || 'default';
      if (!acc[group]) acc[group] = [];
      acc[group].push({
        ...option,
        key: option.value,
        disabled: option.disabled,
      });
      return acc;
    }, {} as Record<string, typeof options>);
    
    // If only default group, return flat options
    if (Object.keys(grouped).length === 1 && grouped.default) {
      return grouped.default;
    }
    
    // Return grouped options
    return Object.entries(grouped).map(([groupName, groupOptions]) => ({
      label: groupName === 'default' ? undefined : groupName,
      options: groupOptions,
    }));
  }, [options]);
  
  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);
  
  // Handle change
  const handleChange = useCallback((val: any, option: any) => {
    // Convert back to our format
    const selectedOptions = Array.isArray(option) ? option : [option].filter(Boolean);
    const convertedOptions = selectedOptions.map((opt: any) => ({
      value: opt.value,
      label: opt.label || opt.children,
      disabled: opt.disabled,
    }));
    
    onChange?.(val, multiple ? convertedOptions : convertedOptions[0]);
  }, [onChange, multiple]);
  
  // Handle clear
  const handleClear = useCallback(() => {
    setSearchValue('');
    onClear?.();
  }, [onClear]);
  
  // Custom filter function
  const defaultFilterOption = useCallback((input: string, option?: DefaultOptionType) => {
    if (!option) return false;
    const label = String(option.label || option.children || '').toLowerCase();
    const value = String(option.value || '').toLowerCase();
    const searchTerm = input.toLowerCase();
    return label.includes(searchTerm) || value.includes(searchTerm);
  }, []);
  
  // Render tag for multiple selection
  const tagRender = useCallback((props: any) => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag
        color="blue"
        closable={closable}
        onClose={onClose}
        className="mr-1 mb-1"
      >
        {label}
      </Tag>
    );
  }, []);
  
  return (
    <AntSelect
      ref={ref}
      size={sizeToAntSize[size]}
      status={stateToAntStatus[state]}
      mode={multiple ? 'multiple' : undefined}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      loading={loading}
      disabled={disabled}
      allowClear={clearable || allowClear}
      showSearch={searchable || showSearch}
      filterOption={filterOption !== undefined ? filterOption : (searchable ? defaultFilterOption : false)}
      onSearch={handleSearch}
      onChange={handleChange}
      onClear={handleClear}
      onDropdownVisibleChange={setIsOpen}
      maxTagCount={maxTagCount}
      tagRender={multiple ? tagRender : undefined}
      dropdownMatchSelectWidth={dropdownMatchSelectWidth}
      dropdownStyle={dropdownStyle}
      virtual={virtual}
      autoFocus={autoFocus}
      options={Array.isArray(processedOptions[0]) ? undefined : processedOptions as any}
      className={cn(
        'w-full',
        isOpen && 'ring-2 ring-primary/20',
        className
      )}
      {...rest}
    >
      {/* If we have grouped options, render them manually */}
      {Array.isArray(processedOptions[0]) && processedOptions.map((group: any, index: number) => (
        <AntSelect.OptGroup key={index} label={group.label}>
          {group.options.map((option: SelectOption) => (
            <AntSelect.Option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </AntSelect.Option>
          ))}
        </AntSelect.OptGroup>
      ))}
      
      {/* Render children if provided */}
      {children}
    </AntSelect>
  );
});

Select.displayName = 'Select';

// Add static methods
(Select as any).Option = AntSelect.Option;
(Select as any).OptGroup = AntSelect.OptGroup;

// ============================================================================
// CNC-SPECIFIC SELECT COMPONENTS
// ============================================================================

/**
 * Machine selection dropdown with icons
 */
export const MachineSelect: React.FC<Omit<SelectProps, 'options'> & {
  machines: Array<{
    id: string;
    name: string;
    type: 'cnc' | 'laser' | '3d-printer';
    status: 'connected' | 'disconnected' | 'error';
    description?: string;
  }>;
}> = ({ machines = [], ...props }) => {
  
  const machineOptions = machines.map(machine => ({
    value: machine.id,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <SettingOutlined className="text-primary" />
          <div>
            <div className="font-medium">{machine.name}</div>
            {machine.description && (
              <div className="text-xs text-secondary-400">{machine.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className={cn(
            'w-2 h-2 rounded-full',
            machine.status === 'connected' ? 'bg-green-500' : 
            machine.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
          )} />
          <span className="text-xs capitalize">{machine.status}</span>
        </div>
      </div>
    ),
    disabled: machine.status === 'error',
    group: machine.type === 'cnc' ? 'CNC Machines' : 
           machine.type === 'laser' ? 'Laser Cutters' : '3D Printers',
  }));
  
  return (
    <Select
      {...props}
      options={machineOptions}
      searchable
      placeholder="Select a machine..."
      className="machine-select"
    />
  );
};

/**
 * Connection type selector
 */
export const ConnectionSelect: React.FC<Omit<SelectProps, 'options'>> = (props) => {
  const connectionOptions = [
    {
      value: 'serial',
      label: (
        <div className="flex items-center space-x-2">
          <UsbOutlined className="text-blue-500" />
          <div>
            <div>Serial Connection</div>
            <div className="text-xs text-secondary-400">Direct USB/Serial cable</div>
          </div>
        </div>
      ),
    },
    {
      value: 'tcp',
      label: (
        <div className="flex items-center space-x-2">
          <WifiOutlined className="text-green-500" />
          <div>
            <div>TCP/IP Network</div>
            <div className="text-xs text-secondary-400">Ethernet or WiFi connection</div>
          </div>
        </div>
      ),
    },
    {
      value: 'api',
      label: (
        <div className="flex items-center space-x-2">
          <ApiOutlined className="text-purple-500" />
          <div>
            <div>API Integration</div>
            <div className="text-xs text-secondary-400">REST API or WebSocket</div>
          </div>
        </div>
      ),
    },
  ];
  
  return (
    <Select
      {...props}
      options={connectionOptions}
      placeholder="Select connection type..."
      className="connection-select"
    />
  );
};

/**
 * Units selector (metric/imperial)
 */
export const UnitsSelect: React.FC<Omit<SelectProps, 'options'>> = (props) => {
  const unitsOptions = [
    {
      value: 'mm',
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Millimeters (mm)</span>
          <span className="text-xs text-secondary-400">Metric</span>
        </div>
      ),
    },
    {
      value: 'in',
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Inches (in)</span>
          <span className="text-xs text-secondary-400">Imperial</span>
        </div>
      ),
    },
  ];
  
  return (
    <Select
      {...props}
      options={unitsOptions}
      placeholder="Select units..."
      className="units-select"
    />
  );
};

/**
 * Preset selector for common values
 */
export const PresetSelect: React.FC<Omit<SelectProps, 'options'> & {
  presets: Array<{
    name: string;
    value: any;
    description?: string;
    category?: string;
  }>;
  onPresetSelect?: (preset: any) => void;
}> = ({ presets = [], onPresetSelect, ...props }) => {
  
  const presetOptions = presets.map(preset => ({
    value: preset.name,
    label: (
      <div className="w-full">
        <div className="font-medium">{preset.name}</div>
        {preset.description && (
          <div className="text-xs text-secondary-400">{preset.description}</div>
        )}
      </div>
    ),
    group: preset.category || 'Presets',
  }));
  
  const handleChange = (value: any, option: any) => {
    const preset = presets.find(p => p.name === value);
    if (preset && onPresetSelect) {
      onPresetSelect(preset);
    }
    props.onChange?.(value, option);
  };
  
  return (
    <Select
      {...props}
      options={presetOptions}
      onChange={handleChange}
      searchable
      placeholder="Select a preset..."
      className="preset-select"
    />
  );
};

/**
 * Multi-select for features/capabilities
 */
export const FeatureSelect: React.FC<Omit<SelectProps, 'multiple' | 'options'> & {
  features: Array<{
    id: string;
    name: string;
    description?: string;
    enabled?: boolean;
    required?: boolean;
  }>;
}> = ({ features = [], ...props }) => {
  
  const featureOptions = features.map(feature => ({
    value: feature.id,
    label: (
      <div className="flex items-center justify-between w-full">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{feature.name}</span>
            {feature.required && (
              <Tag size="small" color="red">Required</Tag>
            )}
          </div>
          {feature.description && (
            <div className="text-xs text-secondary-400 mt-1">{feature.description}</div>
          )}
        </div>
        {feature.enabled && (
          <CheckOutlined className="text-green-500" />
        )}
      </div>
    ),
    disabled: feature.required, // Required features cannot be deselected
  }));
  
  return (
    <Select
      {...props}
      multiple
      options={featureOptions}
      searchable
      placeholder="Select features..."
      className="feature-select"
      maxTagCount={2}
    />
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Select;
export type { SelectProps, SelectOption } from '../../interfaces';
