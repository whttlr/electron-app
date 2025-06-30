import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Button, App as AntApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  BugOutlined 
} from '@ant-design/icons';
import { MainNavigation, Breadcrumbs, RouteView } from './ui/navigation';
import { DebugPanel } from './ui/shared';
import { machineController } from './core/machine';
import { stateManager } from './services/state';
import { router, navigationService } from './services/router';
import { logger } from './services/logger';
import { CoordinateProvider } from './services/coordinates/CoordinateContext';
import { globalEventBus } from './services/eventBus';
import CoordinateDisplay from './ui/controls/CoordinateDisplay';
import CoordinateSystemSwitcher from './ui/controls/CoordinateSystemSwitcher';
import './App.css';

const { Header, Content } = Layout;

function AppContent() {
  const [appState, setAppState] = useState(stateManager.getState());
  const [navigationState, setNavigationState] = useState(navigationService.getState());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Initialize application
    const initializeApp = async () => {
      try {
        logger.info('Initializing CNC Jog Controls application');
        
        // Router is already initialized and handling routing
        
        // Connect to machine (simulated)
        await machineController.connect();
        
        // Set initial state
        stateManager.setConnected(true);
        stateManager.updateSystem(system => ({ ...system, initialized: true }));
        
        logger.info('Application initialized successfully');
        // Success message will be handled by App component context
      } catch (error) {
        logger.error('Failed to initialize application', error);
        // Error message will be handled by App component context
      }
    };

    initializeApp();

    // Subscribe to state changes
    const stateSubscription = stateManager.subscribe(setAppState);
    const navigationSubscription = navigationService.subscribe(setNavigationState);

    // Subscribe to machine events
    const machineSubscription = machineController.on('positionChanged', (event) => {
      stateManager.setPosition(event.data);
    });

    // Cleanup
    return () => {
      stateSubscription.unsubscribe();
      navigationSubscription.unsubscribe();
      machineController.off('positionChanged', machineSubscription);
    };
  }, []);

  const handleNavigate = async (path: string) => {
    try {
      await router.navigate(path);
    } catch (error) {
      logger.error('Navigation failed', { path, error });
      // Error message will be handled by App component context
    }
  };

  const toggleDebugPanel = () => {
    stateManager.updateUI(ui => ({ ...ui, showDebugPanel: !ui.showDebugPanel }));
  };

  const currentRoute = router.getCurrentRoute();
  const routes = router.getRoutes().filter(route => !route.parentId && !route.hidden);

  const debugData = {
    appState,
    navigationState,
    currentRoute,
    routeCount: router.getRoutes().length
  };

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <AntApp>
        <Layout style={{ minHeight: '100vh' }}>
          <MainNavigation
            routes={routes}
            currentRoute={navigationState.currentRoute}
            isConnected={appState.machine.isConnected}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />

          <Layout>
            <Header style={{ 
              background: '#fff', 
              padding: '0 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button
                  type="text"
                  icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                
                <Breadcrumbs
                  breadcrumbs={navigationState.breadcrumbs}
                  currentRoute={navigationState.currentRoute}
                  onNavigate={handleNavigate}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CoordinateSystemSwitcher compact={true} />
                <Button
                  type="text"
                  icon={<BugOutlined />}
                  onClick={toggleDebugPanel}
                  title="Toggle Debug Panel"
                />
              </div>
            </Header>

            <Content style={{ 
              margin: 0,
              minHeight: 'calc(100vh - 64px)',
              background: '#f5f5f5'
            }}>
              {currentRoute ? (
                <RouteView
                  route={currentRoute}
                  params={navigationState.routeParams}
                  query={navigationState.queryParams}
                  isLoading={navigationState.isNavigating}
                  error={navigationState.error}
                />
              ) : (
                <div style={{ padding: '24px' }}>
                  <div style={{ color: '#ff4d4f' }}>Route not found</div>
                </div>
              )}

              {appState.ui.showDebugPanel && (
                <DebugPanel
                  title="Debug Information"
                  data={debugData}
                  visible={appState.ui.showDebugPanel}
                  onClose={toggleDebugPanel}
                  style={{ 
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    width: '400px',
                    zIndex: 1000
                  }}
                />
              )}
            </Content>
          </Layout>
        </Layout>
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AntApp>
      <CoordinateProvider
        eventBus={globalEventBus}
        logger={logger}
        autoInitialize={true}
      >
        <AppContent />
      </CoordinateProvider>
    </AntApp>
  );
}

export default App;