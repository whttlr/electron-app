/**
 * Adapter Type Definitions
 * 
 * TypeScript interfaces for adapter components
 */

import React from 'react';

/**
 * Base adapter props that all adapter components should accept
 */
export interface AdapterProps {
  /** Which adapter to use */
  adapter?: 'ant-design' | 'headless-ui' | 'custom';
  
  /** Component children */
  children?: React.ReactNode;
  
  /** CSS class name */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Data test ID for testing */
  'data-testid'?: string;
}

/**
 * Adapter component interface
 */
export interface AdapterComponent<T extends AdapterProps = AdapterProps> 
  extends React.FC<T> {
  /** Available adapters for this component */
  adapters: Record<string, React.ComponentType<T>>;
}

/**
 * Button adapter props
 */
export interface ButtonAdapterProps extends AdapterProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  
  /** Icon */
  icon?: React.ReactNode;
  
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

/**
 * Input adapter props
 */
export interface InputAdapterProps extends AdapterProps {
  /** Input value */
  value?: string;
  
  /** Change handler */
  onChange?: (value: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Error state */
  error?: boolean;
  
  /** Error message */
  errorMessage?: string;
  
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  
  /** Input size */
  size?: 'small' | 'medium' | 'large';
  
  /** Max length */
  maxLength?: number;
  
  /** Auto focus */
  autoFocus?: boolean;
}

/**
 * Card adapter props
 */
export interface CardAdapterProps extends AdapterProps {
  /** Card title */
  title?: string;
  
  /** Card subtitle */
  subtitle?: string;
  
  /** Card actions */
  actions?: React.ReactNode;
  
  /** Card extra content */
  extra?: React.ReactNode;
  
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  
  /** Hoverable state */
  hoverable?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Bordered style */
  bordered?: boolean;
}

/**
 * Modal adapter props
 */
export interface ModalAdapterProps extends AdapterProps {
  /** Modal visibility */
  visible?: boolean;
  
  /** Modal title */
  title?: string;
  
  /** Modal width */
  width?: number | string;
  
  /** Close handler */
  onClose?: () => void;
  
  /** OK handler */
  onOk?: () => void;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Footer content */
  footer?: React.ReactNode;
  
  /** Closable */
  closable?: boolean;
  
  /** Mask closable */
  maskClosable?: boolean;
  
  /** Loading state */
  loading?: boolean;
}

/**
 * Select adapter props
 */
export interface SelectAdapterProps extends AdapterProps {
  /** Select options */
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  
  /** Selected value */
  value?: string | number | Array<string | number>;
  
  /** Change handler */
  onChange?: (value: string | number | Array<string | number>) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Multiple selection */
  multiple?: boolean;
  
  /** Searchable */
  searchable?: boolean;
  
  /** Clear handler */
  onClear?: () => void;
  
  /** Loading state */
  loading?: boolean;
}