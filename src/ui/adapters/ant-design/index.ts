/**
 * Ant Design Component Adapter Index
 * 
 * Exports all Ant Design adapter components and provides the complete
 * component library implementation for the ComponentProvider system.
 */

import React from 'react';
import { ComponentLibrary } from '../../providers/ComponentProvider';

// Import all adapter components
import { Button, EmergencyButton, JogButton, ButtonGroup } from './Button';
import { Card, StatusCard, MetricCard, ControlCard } from './Card';
import { Badge, StatusBadge, CountBadge, PrecisionBadge, AxisBadge } from './Badge';
import { Input, TextArea, PasswordInput, CoordinateInput, FeedRateInput } from './Input';
import { Form, FormItem } from './Form';
import { Select, MachineSelect, ConnectionSelect, UnitsSelect, PresetSelect, FeatureSelect } from './Select';

// Import Ant Design components that don't need adapters
import { 
  Table, 
  Transfer, 
  Upload, 
  DatePicker, 
  TimePicker, 
  Layout, 
  Modal, 
  Drawer, 
  Popover, 
  Tooltip, 
  Progress,
  Alert,
} from 'antd';

// Import custom CNC components (placeholders for now)
// These will be implemented in a future phase
const StatusIndicator = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props}>StatusIndicator Placeholder</div>
));
StatusIndicator.displayName = 'StatusIndicator';

const CoordinateDisplay = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props}>CoordinateDisplay Placeholder</div>
));
CoordinateDisplay.displayName = 'CoordinateDisplay';

const JogControls = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props}>JogControls Placeholder</div>
));
JogControls.displayName = 'JogControls';

// ============================================================================
// COMPONENT LIBRARY IMPLEMENTATION
// ============================================================================

/**
 * Complete Ant Design component library implementation
 * This object provides all components needed by the ComponentProvider
 */
export const antDesignComponents: ComponentLibrary = {
  // Basic components (with adapters)
  Button,
  Card,
  Badge,
  
  // Form components (with adapters)
  Input,
  TextArea,
  Alert,
  Form,
  FormItem,
  Select,
  
  // Complex components (direct Ant Design)
  Table,
  Transfer,
  Upload,
  DatePicker,
  TimePicker,
  
  // Layout components (direct Ant Design)
  Layout,
  Header: Layout.Header,
  Content: Layout.Content,
  Sider: Layout.Sider,
  
  // Feedback components (direct Ant Design)
  Modal,
  Drawer,
  Popover,
  Tooltip,
  Progress,
  
  // CNC-specific components (custom)
  StatusIndicator,
  CoordinateDisplay,
  JogControls,
};

// ============================================================================
// SPECIALIZED COMPONENT EXPORTS
// ============================================================================

// Export specialized components for direct use
export {
  // Button variants
  Button,
  EmergencyButton,
  JogButton,
  ButtonGroup,
  
  // Card variants
  Card,
  StatusCard,
  MetricCard,
  ControlCard,
  
  // Badge variants
  Badge,
  StatusBadge,
  CountBadge,
  PrecisionBadge,
  AxisBadge,
  
  // Input variants
  Input,
  TextArea,
  PasswordInput,
  CoordinateInput,
  FeedRateInput,
  
  // Form components
  Form,
  FormItem,
  
  // Select variants
  Select,
  MachineSelect,
  ConnectionSelect,
  UnitsSelect,
  PresetSelect,
  FeatureSelect,
};

// ============================================================================
// COMPONENT COLLECTIONS
// ============================================================================

/**
 * CNC-specific component collection
 */
export const cncComponents = {
  // Status and feedback
  StatusBadge,
  StatusCard,
  StatusIndicator,
  
  // Controls
  EmergencyButton,
  JogButton,
  JogControls,
  ControlCard,
  
  // Measurement and display
  CoordinateDisplay,
  MetricCard,
  PrecisionBadge,
  AxisBadge,
};

/**\n * Form component collection\n */\nexport const formComponents = {\n  Form,\n  FormItem,\n  Input,\n  TextArea,\n  PasswordInput,\n  CoordinateInput,\n  FeedRateInput,\n  Select,\n  MachineSelect,\n  ConnectionSelect,\n  UnitsSelect,\n  PresetSelect,\n  FeatureSelect,\n  DatePicker,\n  TimePicker,\n  Upload,\n  Transfer,\n  Button,\n};

/**
 * Layout component collection
 */
export const layoutComponents = {
  Layout,
  Header: Layout.Header,
  Content: Layout.Content,
  Sider: Layout.Sider,
  Card,
};

/**
 * Feedback component collection
 */
export const feedbackComponents = {
  Modal,
  Drawer,
  Popover,
  Tooltip,
  Progress,
  Alert,
  Badge,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a component is available in the Ant Design implementation
 */
export function isComponentAvailable(componentName: keyof ComponentLibrary): boolean {
  return componentName in antDesignComponents;
}

/**
 * Get component from the Ant Design implementation
 */
export function getComponent<T extends keyof ComponentLibrary>(
  componentName: T
): ComponentLibrary[T] | null {
  return antDesignComponents[componentName] || null;
}

/**
 * Get all available component names
 */
export function getAvailableComponents(): (keyof ComponentLibrary)[] {
  return Object.keys(antDesignComponents) as (keyof ComponentLibrary)[];
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default antDesignComponents;
