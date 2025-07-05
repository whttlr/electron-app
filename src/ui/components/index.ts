/**
 * Unified Component Exports
 * 
 * This file provides the main component exports that applications should use.
 * Components are provided through the ComponentProvider system, allowing
 * for seamless switching between different implementations.
 */

import { useComponents } from '../providers/ComponentProvider';

// ============================================================================
// COMPONENT HOOKS
// ============================================================================

/**
 * Hook to get all components from the current provider
 */
export const useAppComponents = () => {
  return useComponents();
};

/**
 * Hook to get a specific component from the current provider
 */
export const useComponent = <T extends keyof ReturnType<typeof useComponents>>(
  componentName: T
): ReturnType<typeof useComponents>[T] => {
  const components = useComponents();
  return components[componentName];
};

// ============================================================================
// COMPONENT GETTERS
// ============================================================================

/**
 * Get Button component from current provider
 */
export const useButton = () => useComponent('Button');

/**
 * Get Card component from current provider
 */
export const useCard = () => useComponent('Card');

/**
 * Get Badge component from current provider
 */
export const useBadge = () => useComponent('Badge');

/**
 * Get Input component from current provider
 */
export const useInput = () => useComponent('Input');

/**
 * Get TextArea component from current provider
 */
export const useTextArea = () => useComponent('TextArea');

/**
 * Get Alert component from current provider
 */
export const useAlert = () => useComponent('Alert');

/**
 * Get Form components from current provider
 */
export const useForm = () => ({
  Form: useComponent('Form'),
  FormItem: useComponent('FormItem'),
});

/**
 * Get Select component from current provider
 */
export const useSelect = () => useComponent('Select');

/**
 * Get Table component from current provider
 */
export const useTable = () => useComponent('Table');

/**
 * Get Transfer component from current provider
 */
export const useTransfer = () => useComponent('Transfer');

/**
 * Get Upload component from current provider
 */
export const useUpload = () => useComponent('Upload');

/**
 * Get DatePicker component from current provider
 */
export const useDatePicker = () => useComponent('DatePicker');

/**
 * Get TimePicker component from current provider
 */
export const useTimePicker = () => useComponent('TimePicker');

/**
 * Get Layout components from current provider
 */
export const useLayout = () => ({
  Layout: useComponent('Layout'),
  Header: useComponent('Header'),
  Content: useComponent('Content'),
  Sider: useComponent('Sider'),
});

/**
 * Get Modal component from current provider
 */
export const useModal = () => useComponent('Modal');

/**
 * Get Drawer component from current provider
 */
export const useDrawer = () => useComponent('Drawer');

/**
 * Get Popover component from current provider
 */
export const usePopover = () => useComponent('Popover');

/**
 * Get Tooltip component from current provider
 */
export const useTooltip = () => useComponent('Tooltip');

/**
 * Get Progress component from current provider
 */
export const useProgress = () => useComponent('Progress');

/**
 * Get CNC-specific components from current provider
 */
export const useCNCComponents = () => ({
  StatusIndicator: useComponent('StatusIndicator'),
  CoordinateDisplay: useComponent('CoordinateDisplay'),
  JogControls: useComponent('JogControls'),
});

// ============================================================================
// COMPONENT COLLECTIONS
// ============================================================================

/**
 * Get all form-related components
 */
export const useFormComponents = () => {
  const components = useComponents();
  
  return {
    Form: components.Form,
    FormItem: components.FormItem,
    Input: components.Input,
    TextArea: components.TextArea,
    Select: components.Select,
    DatePicker: components.DatePicker,
    TimePicker: components.TimePicker,
    Upload: components.Upload,
    Transfer: components.Transfer,
    Button: components.Button,
  };
};

/**
 * Get all layout-related components
 */
export const useLayoutComponents = () => {
  const components = useComponents();
  
  return {
    Layout: components.Layout,
    Header: components.Header,
    Content: components.Content,
    Sider: components.Sider,
    Card: components.Card,
  };
};

/**
 * Get all feedback-related components
 */
export const useFeedbackComponents = () => {
  const components = useComponents();
  
  return {
    Modal: components.Modal,
    Drawer: components.Drawer,
    Popover: components.Popover,
    Tooltip: components.Tooltip,
    Progress: components.Progress,
    Alert: components.Alert,
    Badge: components.Badge,
  };
};

/**
 * Get all CNC-specific components
 */
export const useCNCComponentCollection = () => {
  const components = useComponents();
  
  return {
    StatusIndicator: components.StatusIndicator,
    CoordinateDisplay: components.CoordinateDisplay,
    JogControls: components.JogControls,
  };
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Re-export component interfaces for TypeScript
 */
export type {
  ButtonProps,
  CardProps,
  BadgeProps,
  InputProps,
  TextAreaProps,
  AlertProps,
  FormProps,
  FormItemProps,
  SelectProps,
  TableProps,
  StatusIndicatorProps,
  CoordinateDisplayProps,
  JogControlProps,
} from '../interfaces';

/**
 * Re-export component provider utilities
 */
export {
  ComponentProvider,
  useComponentProvider,
  useComponents,
  useImplementationSwitcher,
  ComponentProviderDebug,
  withComponents,
  type ComponentImplementation,
  type ComponentLibrary,
} from '../providers/ComponentProvider';

/**
 * Re-export design tokens and styles
 */
export { designTokens, componentTokens } from '../theme/tokens';
export { componentVariants } from '../theme/component-styles';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a component is available in the current implementation
 */
export const useComponentAvailability = () => {
  const { isImplementationAvailable } = useComponentProvider();
  
  return {
    isAvailable: isImplementationAvailable,
    checkComponent: (componentName: string) => {
      // This would need to be implemented based on the current provider
      return true; // Placeholder
    },
  };
};

/**
 * Get current implementation info
 */
export const useImplementationInfo = () => {
  const { implementation } = useComponentProvider();
  
  return {
    current: implementation,
    isAntDesign: implementation === 'ant-design',
    isHeadlessUI: implementation === 'headless-ui',
    isCustom: implementation === 'custom',
  };
};

/**
 * Development helper to list all available components
 */
export const useComponentList = () => {
  const components = useComponents();
  
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }
  
  return Object.keys(components) as (keyof typeof components)[];
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  useAppComponents,
  useComponent,
  useFormComponents,
  useLayoutComponents,
  useFeedbackComponents,
  useCNCComponentCollection,
};
