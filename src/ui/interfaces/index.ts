/**
 * Component Interface Definitions
 *
 * These interfaces define stable APIs for all UI components that will remain
 * consistent regardless of the underlying implementation (Ant Design, Headless UI, etc.)
 *
 * Key Principles:
 * 1. Framework-agnostic - don't expose implementation-specific props
 * 2. Semantic naming - use meaningful names over technical ones
 * 3. Extensible - allow for future enhancement without breaking changes
 * 4. Type-safe - full TypeScript support
 */

import {
  ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes,
} from 'react';

// Basic variant types - simplified without theme dependencies
type VariantBase = {
  variant?: string;
  size?: string;
};

type ButtonVariants = VariantBase;
type CardVariants = VariantBase & { hoverable?: boolean; interactive?: boolean };
type BadgeVariants = VariantBase & { shape?: string; dot?: boolean };
type InputVariants = VariantBase & { state?: string };
type AlertVariants = VariantBase;

// ============================================================================
// BASE INTERFACES
// ============================================================================

/**
 * Base props that all components should have
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: ReactNode;
  /** Test ID for testing */
  'data-testid'?: string;
  /** Unique identifier */
  id?: string;
}

/**
 * Base props for interactive components
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom aria-label for accessibility */
  'aria-label'?: string;
}

// ============================================================================
// BUTTON INTERFACE
// ============================================================================

export interface ButtonProps extends InteractiveComponentProps,
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'> {
  /** Visual style variant */
  variant?: ButtonVariants['variant'];
  /** Size variant */
  size?: ButtonVariants['size'];
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Icon to display before text */
  startIcon?: ReactNode;
  /** Icon to display after text */
  endIcon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

// ============================================================================
// CARD INTERFACE
// ============================================================================

export interface CardProps extends BaseComponentProps,
  Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Card visual variant */
  variant?: CardVariants['variant'];
  /** Card size */
  size?: CardVariants['size'];
  /** Card title */
  title?: ReactNode;
  /** Extra content in header */
  extra?: ReactNode;
  /** Whether card has border */
  bordered?: boolean;
  /** Whether card is hoverable */
  hoverable?: CardVariants['hoverable'];
  /** Whether card is interactive */
  interactive?: CardVariants['interactive'];
  /** Click handler for interactive cards */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// ============================================================================
// BADGE INTERFACE
// ============================================================================

export interface BadgeProps extends BaseComponentProps {
  /** Visual style variant */
  variant?: BadgeVariants['variant'];
  /** Size variant */
  size?: BadgeVariants['size'];
  /** Shape variant */
  shape?: BadgeVariants['shape'];
  /** Show as dot instead of text */
  dot?: BadgeVariants['dot'];
  /** Count to display */
  count?: number;
  /** Maximum count to display */
  maxCount?: number;
  /** Whether to show zero count */
  showZero?: boolean;
  /** Custom color */
  color?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
}

// ============================================================================
// INPUT INTERFACE
// ============================================================================

export interface InputProps extends InteractiveComponentProps,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'disabled'> {
  /** Visual style variant */
  variant?: InputVariants['variant'];
  /** Size variant */
  size?: InputVariants['size'];
  /** Validation state */
  state?: InputVariants['state'];
  /** Input label */
  label?: string;
  /** Help text */
  help?: string;
  /** Error message */
  error?: string;
  /** Icon before input */
  startIcon?: ReactNode;
  /** Icon after input */
  endIcon?: ReactNode;
  /** Input value */
  value?: string | number;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Whether input can be cleared */
  clearable?: boolean;
}

// ============================================================================
// TEXTAREA INTERFACE
// ============================================================================

export interface TextAreaProps extends BaseComponentProps,
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'disabled'> {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Validation state */
  state?: 'default' | 'error' | 'success' | 'warning';
  /** Input label */
  label?: string;
  /** Help text */
  help?: string;
  /** Error message */
  error?: string;
  /** Number of rows */
  rows?: number;
  /** Whether textarea is disabled */
  disabled?: boolean;
  /** Auto resize */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
}

// ============================================================================
// ALERT INTERFACE
// ============================================================================

export interface AlertProps extends BaseComponentProps {
  /** Visual style variant */
  variant?: AlertVariants['variant'];
  /** Size variant */
  size?: AlertVariants['size'];
  /** Alert title */
  title?: ReactNode;
  /** Alert message/description */
  message?: ReactNode;
  /** Icon to display */
  icon?: ReactNode;
  /** Whether alert can be closed */
  closable?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Action buttons */
  action?: ReactNode;
  /** Whether alert is visible */
  visible?: boolean;
}

// ============================================================================
// FORM INTERFACES
// ============================================================================

export interface FormProps extends BaseComponentProps,
  Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Form layout */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** Submit handler */
  onFinish?: (values: Record<string, any>) => void;
  /** Error handler */
  onFinishFailed?: (errorInfo: any) => void;
  /** Initial form values */
  initialValues?: Record<string, any>;
  /** Whether form should validate on change */
  validateOnChange?: boolean;
  /** Size for all form items */
  size?: 'sm' | 'md' | 'lg';
}

export interface FormItemProps extends BaseComponentProps {
  /** Field name */
  name?: string;
  /** Field label */
  label?: ReactNode;
  /** Validation rules */
  rules?: ValidationRule[];
  /** Whether field is required */
  required?: boolean;
  /** Help text */
  help?: string;
  /** Error message */
  error?: string;
  /** Label alignment */
  labelAlign?: 'left' | 'right';
  /** Label column span */
  labelCol?: number;
  /** Wrapper column span */
  wrapperCol?: number;
  /** Dependencies for conditional validation */
  dependencies?: string[];
}

export interface ValidationRule {
  /** Whether field is required */
  required?: boolean;
  /** Error message */
  message?: string;
  /** Minimum length */
  min?: number;
  /** Maximum length */
  max?: number;
  /** Pattern to match */
  pattern?: RegExp;
  /** Custom validator function */
  validator?: (rule: any, value: any) => Promise<void>;
  /** Validation type */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'url' | 'email';
}

// ============================================================================
// SELECT INTERFACE
// ============================================================================

export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Option group */
  group?: string;
}

export interface SelectProps extends InteractiveComponentProps,
  Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect' | 'defaultValue'> {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Validation state */
  state?: 'default' | 'error' | 'success' | 'warning';
  /** Select options */
  options?: SelectOption[];
  /** Selected value(s) */
  value?: string | number | (string | number)[];
  /** Default value */
  defaultValue?: string | number | (string | number)[];
  /** Placeholder text */
  placeholder?: string;
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Whether options are searchable */
  searchable?: boolean;
  /** Whether options can be cleared */
  clearable?: boolean;
  /** Maximum number of selected items to show */
  maxTagCount?: number;
  /** Change handler */
  onChange?: (value: string | number | (string | number)[], option?: SelectOption | SelectOption[]) => void;
  /** Search handler */
  onSearch?: (value: string) => void;
  /** Clear handler */
  onClear?: () => void;
}

// ============================================================================
// TABLE INTERFACES
// ============================================================================

export interface TableColumn<T = any> {
  /** Column key */
  key: string;
  /** Column title */
  title: ReactNode;
  /** Data property to display */
  dataIndex?: keyof T;
  /** Custom render function */
  render?: (value: any, record: T, index: number) => ReactNode;
  /** Column width */
  width?: number | string;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Fixed column position */
  fixed?: 'left' | 'right';
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is resizable */
  resizable?: boolean;
}

export interface TableProps<T = any> extends BaseComponentProps {
  /** Table columns */
  columns: TableColumn<T>[];
  /** Table data */
  dataSource: T[];
  /** Row key field or function */
  rowKey?: string | ((record: T) => string);
  /** Loading state */
  loading?: boolean;
  /** Table size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether table has border */
  bordered?: boolean;
  /** Whether rows are hoverable */
  hoverable?: boolean;
  /** Whether rows are striped */
  striped?: boolean;
  /** Pagination configuration */
  pagination?: PaginationConfig | false;
  /** Row selection configuration */
  rowSelection?: RowSelectionConfig<T>;
  /** Row click handler */
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  /** Sort change handler */
  onChange?: (pagination: any, filters: any, sorter: any) => void;
}

export interface PaginationConfig {
  /** Current page */
  current?: number;
  /** Page size */
  pageSize?: number;
  /** Total items */
  total?: number;
  /** Show size changer */
  showSizeChanger?: boolean;
  /** Show quick jumper */
  showQuickJumper?: boolean;
  /** Page change handler */
  onChange?: (page: number, pageSize: number) => void;
}

export interface RowSelectionConfig<T = any> {
  /** Selection type */
  type?: 'checkbox' | 'radio';
  /** Selected row keys */
  selectedRowKeys?: string[];
  /** Selection change handler */
  onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
  /** Get checkbox props */
  getCheckboxProps?: (record: T) => any;
}

// ============================================================================
// CNC-SPECIFIC INTERFACES
// ============================================================================

/**
 * Status indicator for machine states
 */
export interface StatusIndicatorProps extends BaseComponentProps {
  /** Machine status */
  status: 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning' | 'emergency';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether indicator is interactive */
  interactive?: boolean;
  /** Status label */
  label?: string;
  /** Additional status info */
  info?: string;
  /** Click handler */
  onClick?: () => void;
  /** Show pulse animation */
  pulse?: boolean;
}

/**
 * Coordinate display for CNC positioning
 */
export interface CoordinateDisplayProps extends BaseComponentProps {
  /** Axis type */
  axis?: 'x' | 'y' | 'z' | 'combined';
  /** Coordinate value */
  value: number;
  /** Display precision */
  precision?: number;
  /** Units */
  units?: 'mm' | 'in';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether value is editable */
  editable?: boolean;
  /** Change handler for editable mode */
  onChange?: (value: number) => void;
  /** Label for the coordinate */
  label?: string;
}

/**
 * Jog control for machine movement
 */
export interface JogControlProps extends BaseComponentProps {
  /** Current position */
  position: { x: number; y: number; z: number };
  /** Jog distance */
  jogDistance: number;
  /** Jog speed */
  jogSpeed: number;
  /** Whether continuous jog is enabled */
  continuous?: boolean;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Jog handler */
  onJog: (axis: 'X' | 'Y' | 'Z', direction: number, distance?: number) => void;
  /** Distance change handler */
  onJogDistanceChange: (distance: number) => void;
  /** Speed change handler */
  onJogSpeedChange: (speed: number) => void;
  /** Continuous mode change handler */
  onContinuousChange: (continuous: boolean) => void;
}

// ============================================================================
// EXPORTED TYPES
// ============================================================================

// All interfaces are already exported above - no need for duplicate exports

// Component prop type unions for utilities
export type ComponentProps =
  | ButtonProps
  | CardProps
  | BadgeProps
  | InputProps
  | AlertProps
  | FormProps
  | TableProps;

// Size variants union
export type SizeVariant = 'sm' | 'md' | 'lg';

// State variants union
export type StateVariant = 'default' | 'error' | 'success' | 'warning';

// Layout variants union
export type LayoutVariant = 'horizontal' | 'vertical' | 'inline';
