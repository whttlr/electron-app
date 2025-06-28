/**
 * Route View Component
 * 
 * Dynamic route rendering component that displays the appropriate view
 * based on the current route configuration.
 */

import React, { Suspense, lazy } from 'react';
import { Spin, Alert, Result } from 'antd';
import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { RouteViewProps } from './NavigationTypes';
import { logger } from '../../services/logger';

// Component mapping for dynamic imports
const componentMap = {
  // Dashboard
  'DashboardView': lazy(() => import('../../views/Dashboard/DashboardView')),
  
  // Controls
  'ControlsView': lazy(() => import('../../views/Controls/ControlsView')),
  
  // Machine views
  'MachineView': lazy(() => import('../../views/Machine/MachineView')),
  'MachineSetupView': lazy(() => import('../../views/Machine/MachineSetupView')),
  'DiagnosticsView': lazy(() => import('../../views/Machine/DiagnosticsView')),
  'MachineSettingsView': lazy(() => import('../../views/Machine/MachineSettingsView')),
  
  // Workspace views
  'WorkspaceView': lazy(() => import('../../views/Workspace/WorkspaceView')),
  'WorkspaceSetupView': lazy(() => import('../../views/Workspace/WorkspaceSetupView')),
  'WorkspacePreviewView': lazy(() => import('../../views/Workspace/WorkspacePreviewView')),
  
  // Tools views
  'ToolsView': lazy(() => import('../../views/Tools/ToolsView')),
  'ToolLibraryView': lazy(() => import('../../views/Tools/ToolLibraryView')),
  'ToolCalibrationView': lazy(() => import('../../views/Tools/ToolCalibrationView')),
  
  // Programs views
  'ProgramsView': lazy(() => import('../../views/Programs/ProgramsView')),
  'ProgramLibraryView': lazy(() => import('../../views/Programs/ProgramLibraryView')),
  'ProgramEditorView': lazy(() => import('../../views/Programs/ProgramEditorView')),
  'ProgramHistoryView': lazy(() => import('../../views/Programs/ProgramHistoryView')),
  
  // Settings views
  'SettingsView': lazy(() => import('../../views/Settings/SettingsView')),
  'UnitsSettingsView': lazy(() => import('../../views/Settings/UnitsSettingsView')),
  'InterfaceSettingsView': lazy(() => import('../../views/Settings/InterfaceSettingsView')),
  'AdvancedSettingsView': lazy(() => import('../../views/Settings/AdvancedSettingsView')),
  
  // Help views
  'HelpView': lazy(() => import('../../views/Help/HelpView')),
  'GuidesView': lazy(() => import('../../views/Help/GuidesView')),
  'TroubleshootingView': lazy(() => import('../../views/Help/TroubleshootingView'))
};

/**
 * Loading component for route transitions
 */
const RouteLoading: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Spin 
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
      size="large" 
    />
    <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
  </div>
);

/**
 * Error boundary component for route errors
 */
const RouteError: React.FC<{ error: string; route: string; onRetry: () => void }> = ({ 
  error, 
  route, 
  onRetry 
}) => (
  <Result
    status="error"
    title="Failed to Load Route"
    subTitle={`Error loading route: ${route}`}
    extra={[
      <div key="error-details" style={{ marginBottom: '16px' }}>
        <Alert
          message="Error Details"
          description={error}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />
      </div>
    ]}
  />
);

/**
 * Component not found fallback
 */
const ComponentNotFound: React.FC<{ componentName: string; route: string }> = ({ 
  componentName, 
  route 
}) => (
  <Result
    status="404"
    title="Component Not Found"
    subTitle={`Component "${componentName}" not found for route: ${route}`}
    extra={[
      <Alert
        key="dev-info"
        message="Development Info"
        description={`The component "${componentName}" needs to be implemented and added to the component map.`}
        type="info"
        showIcon
      />
    ]}
  />
);

export const RouteView: React.FC<RouteViewProps> = ({
  route,
  params,
  query,
  isLoading = false,
  error,
  className,
  style
}) => {
  /**
   * Handle component loading errors
   */
  const handleRetry = () => {
    // Force reload the page as a fallback
    window.location.reload();
  };

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className={className} style={style}>
        <RouteError 
          error={error} 
          route={route.fullPath} 
          onRetry={handleRetry} 
        />
      </div>
    );
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className={className} style={style}>
        <RouteLoading />
      </div>
    );
  }

  /**
   * Get component for route
   */
  const Component = componentMap[route.component as keyof typeof componentMap];

  if (!Component) {
    logger.warn('Component not found for route', { 
      route: route.fullPath, 
      component: route.component 
    });

    return (
      <div className={className} style={style}>
        <ComponentNotFound 
          componentName={route.component} 
          route={route.fullPath} 
        />
      </div>
    );
  }

  /**
   * Render the component with suspense
   */
  return (
    <div className={className} style={style}>
      <Suspense fallback={<RouteLoading />}>
        <Component 
          route={route}
          params={params}
          query={query}
        />
      </Suspense>
    </div>
  );
};

export default RouteView;