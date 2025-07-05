/**
 * Component Provider System
 * 
 * This provider allows switching between different component implementations
 * (Ant Design, Headless UI, Custom) without changing application code.
 * 
 * The abstraction layer enables future migration by changing the implementation
 * at the provider level while keeping all application code unchanged.
 */

import React, { createContext, useContext, ReactNode } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Available component implementations
 */
export type ComponentImplementation = 'ant-design' | 'headless-ui' | 'custom';

/**
 * Component implementation registry
 * Each implementation must provide the same component interfaces
 */
export interface ComponentImplementations {
  'ant-design': ComponentLibrary;
  'headless-ui': ComponentLibrary;
  'custom': ComponentLibrary;
}

/**
 * Standard component library interface
 * All implementations must conform to this structure
 */
export interface ComponentLibrary {
  // Basic components
  Button: React.ComponentType<any>;
  Card: React.ComponentType<any>;
  Badge: React.ComponentType<any>;
  Input: React.ComponentType<any>;
  TextArea: React.ComponentType<any>;
  Alert: React.ComponentType<any>;
  
  // Form components
  Form: React.ComponentType<any>;
  FormItem: React.ComponentType<any>;
  Select: React.ComponentType<any>;
  
  // Complex components
  Table: React.ComponentType<any>;
  Transfer: React.ComponentType<any>;
  Upload: React.ComponentType<any>;
  DatePicker: React.ComponentType<any>;
  TimePicker: React.ComponentType<any>;
  
  // Layout components
  Layout: React.ComponentType<any>;
  Header: React.ComponentType<any>;
  Content: React.ComponentType<any>;
  Sider: React.ComponentType<any>;
  
  // Feedback components
  Modal: React.ComponentType<any>;
  Drawer: React.ComponentType<any>;
  Popover: React.ComponentType<any>;
  Tooltip: React.ComponentType<any>;
  Progress: React.ComponentType<any>;
  
  // CNC-specific components (always custom)
  StatusIndicator: React.ComponentType<any>;
  CoordinateDisplay: React.ComponentType<any>;
  JogControls: React.ComponentType<any>;
}

/**
 * Component provider context
 */
interface ComponentContextType {
  implementation: ComponentImplementation;
  components: ComponentLibrary;
  switchImplementation: (implementation: ComponentImplementation) => void;
  isImplementationAvailable: (implementation: ComponentImplementation) => boolean;
}

// ============================================================================
// CONTEXT SETUP
// ============================================================================

const ComponentContext = createContext<ComponentContextType | null>(null);

/**
 * Component provider props
 */
export interface ComponentProviderProps {
  /** Default implementation to use */
  implementation?: ComponentImplementation;
  /** Available implementations */
  implementations?: Partial<ComponentImplementations>;
  /** Child components */
  children: ReactNode;
  /** Allow runtime switching */
  allowSwitching?: boolean;
}

// ============================================================================
// COMPONENT LOADERS
// ============================================================================

// Import Ant Design components at the top level
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

// Import our adapter components
import { Button } from '../adapters/ant-design/Button';
import { Card } from '../adapters/ant-design/Card';
import { Badge } from '../adapters/ant-design/Badge';
import { Input, TextArea } from '../adapters/ant-design/Input';
import { Form, FormItem } from '../adapters/ant-design/Form';
import { Select } from '../adapters/ant-design/Select';

/**
 * Load Ant Design component implementation
 */
function loadAntDesignComponents(): ComponentLibrary {
  
  // Import CNC components (placeholders for now)
  const StatusIndicator = createPlaceholderComponent('StatusIndicator');
  const CoordinateDisplay = createPlaceholderComponent('CoordinateDisplay');
  const JogControls = createPlaceholderComponent('JogControls');
  
  return {
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
    
    // CNC-specific components (placeholders)
    StatusIndicator,
    CoordinateDisplay,
    JogControls,
  };
}

/**
 * Create a placeholder component with a specific name
 */
function createPlaceholderComponent(name: string): React.FC<any> {
  const PlaceholderComponent: React.FC<any> = ({ children, ...props }) => (
    <div style={{ border: '2px dashed #ccc', padding: '8px', margin: '4px' }}>
      <small style={{ color: '#666' }}>{name} (Placeholder)</small>
      {children}
    </div>
  );
  
  PlaceholderComponent.displayName = name;
  return PlaceholderComponent;
}

// ============================================================================
// COMPONENT PROVIDER
// ============================================================================

export const ComponentProvider: React.FC<ComponentProviderProps> = ({
  implementation = 'ant-design',
  implementations = {},
  children,
  allowSwitching = false,
}) => {
  const [currentImplementation, setCurrentImplementation] = 
    React.useState<ComponentImplementation>(implementation);

  // Load the current implementation's components
  const components = React.useMemo(() => {
    switch (currentImplementation) {
      case 'ant-design':
        // Import and return Ant Design components
        return loadAntDesignComponents();
      case 'headless-ui':
        // TODO: Implement Headless UI components
        return createPlaceholderComponents();
      case 'custom':
        // TODO: Implement custom components
        return createPlaceholderComponents();
      default:
        return createPlaceholderComponents();
    }
  }, [currentImplementation, implementations]);

  // Switch implementation function
  const switchImplementation = React.useCallback((newImplementation: ComponentImplementation) => {
    if (!allowSwitching) {
      console.warn('Component switching is disabled. Enable with allowSwitching prop.');
      return;
    }

    if (!isImplementationAvailable(newImplementation)) {
      console.warn(`Implementation '${newImplementation}' is not available.`);
      return;
    }

    setCurrentImplementation(newImplementation);
  }, [allowSwitching, implementations]);

  // Check if implementation is available
  const isImplementationAvailable = React.useCallback((impl: ComponentImplementation) => {
    return impl in implementations || impl === 'ant-design'; // ant-design is our default
  }, [implementations]);

  const contextValue: ComponentContextType = {
    implementation: currentImplementation,
    components,
    switchImplementation,
    isImplementationAvailable,
  };

  return (
    <ComponentContext.Provider value={contextValue}>
      {children}
    </ComponentContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to access current component implementation
 */
export const useComponents = (): ComponentLibrary => {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('useComponents must be used within a ComponentProvider');
  }
  return context.components;
};

/**
 * Hook to access component provider context
 */
export const useComponentProvider = (): ComponentContextType => {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('useComponentProvider must be used within a ComponentProvider');
  }
  return context;
};

/**
 * Hook to get a specific component
 */
export const useComponent = <T extends keyof ComponentLibrary>(
  componentName: T
): ComponentLibrary[T] => {
  const { components } = useComponents();
  return components[componentName];
};

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Development utility to switch implementations
 * Only available in development mode
 */
export const useImplementationSwitcher = () => {
  const { implementation, switchImplementation, isImplementationAvailable } = useComponentProvider();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return {
    current: implementation,
    switch: switchImplementation,
    available: (['ant-design', 'headless-ui', 'custom'] as ComponentImplementation[])
      .filter(isImplementationAvailable),
  };
};

/**
 * Debug component to show current implementation
 * Only renders in development
 */
export const ComponentProviderDebug: React.FC = () => {
  const { implementation } = useComponentProvider();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: '#000',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      Component Implementation: {implementation}
    </div>
  );
};

// ============================================================================
// PLACEHOLDER IMPLEMENTATION
// ============================================================================

/**
 * Creates placeholder components for development
 * These will be replaced with actual adapters
 */
function createPlaceholderComponents(): ComponentLibrary {
  const PlaceholderComponent: React.FC<any> = ({ children, ...props }) => (
    <div style={{ border: '2px dashed #ccc', padding: '8px', margin: '4px' }}>
      <small style={{ color: '#666' }}>Placeholder Component</small>
      {children}
    </div>
  );

  return {
    // Basic components
    Button: PlaceholderComponent,
    Card: PlaceholderComponent,
    Badge: PlaceholderComponent,
    Input: PlaceholderComponent,
    TextArea: PlaceholderComponent,
    Alert: PlaceholderComponent,
    
    // Form components
    Form: PlaceholderComponent,
    FormItem: PlaceholderComponent,
    Select: PlaceholderComponent,
    
    // Complex components
    Table: PlaceholderComponent,
    Transfer: PlaceholderComponent,
    Upload: PlaceholderComponent,
    DatePicker: PlaceholderComponent,
    TimePicker: PlaceholderComponent,
    
    // Layout components
    Layout: PlaceholderComponent,
    Header: PlaceholderComponent,
    Content: PlaceholderComponent,
    Sider: PlaceholderComponent,
    
    // Feedback components
    Modal: PlaceholderComponent,
    Drawer: PlaceholderComponent,
    Popover: PlaceholderComponent,
    Tooltip: PlaceholderComponent,
    Progress: PlaceholderComponent,
    
    // CNC-specific components
    StatusIndicator: PlaceholderComponent,
    CoordinateDisplay: PlaceholderComponent,
    JogControls: PlaceholderComponent,
  };
}

// ============================================================================
// HIGHER-ORDER COMPONENT
// ============================================================================

/**
 * HOC to inject components into a component
 */
export function withComponents<T extends object>(
  WrappedComponent: React.ComponentType<T & { components: ComponentLibrary }>
) {
  const WithComponentsComponent = (props: T) => {
    const components = useComponents();
    return <WrappedComponent {...props} components={components} />;
  };

  WithComponentsComponent.displayName = `withComponents(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithComponentsComponent;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ComponentProvider;
export {
  ComponentContext,
  type ComponentImplementation,
  type ComponentLibrary,
  type ComponentImplementations,
};