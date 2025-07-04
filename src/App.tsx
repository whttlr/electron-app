import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router, Routes, Route, Link, useLocation,
} from 'react-router-dom';
import {
  Layout, Menu, Spin, Alert, Space, ConfigProvider,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

// Set dayjs locale
dayjs.locale('en');
import {
  DashboardOutlined, ControlOutlined, AppstoreOutlined, SettingOutlined, MonitorOutlined,
} from '@ant-design/icons';
import { PluginProvider, usePlugins } from './services/plugin';
import { databaseService } from './services/database';
import { SettingsProvider } from './contexts/SettingsContext';
import { UpdateNotificationBadge, ReleaseNotesPopover } from './services/update';
import { useUpdateService } from './hooks/useUpdateService';
import DashboardView from './views/Dashboard/DashboardView';
import PluginsView from './views/Plugins/PluginsView';
import SettingsView from './views/Settings/SettingsView';
import ControlsView from './views/Controls/ControlsView';
import PluginView from './views/Plugin/PluginView';
import { UIDemoView } from './views/UIDemo/UIDemoView';
import { CustomThemeProvider } from './ui/shared/ThemeProvider';
import './App.css';

const { Header, Content, Sider } = Layout;

const AppContent: React.FC = () => {
  const location = useLocation();
  const { getStandalonePlugins } = usePlugins();
  const standalonePlugins = getStandalonePlugins();
  const {
    updateData,
    downloadProgress,
    isDownloading,
    showReleaseNotes,
    downloadUpdate,
    showUpdateDialog,
    hideUpdateDialog,
  } = useUpdateService();

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'monitor': return <MonitorOutlined />;
      case 'control': return <ControlOutlined />;
      case 'appstore': return <AppstoreOutlined />;
      default: return <AppstoreOutlined />;
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/" data-testid="nav-dashboard">Dashboard</Link>,
    },
    {
      key: '/controls',
      icon: <ControlOutlined />,
      label: <Link to="/controls" data-testid="nav-controls">Controls</Link>,
    },
    {
      key: '/ui-demo',
      icon: <MonitorOutlined />,
      label: <Link to="/ui-demo" data-testid="nav-ui-demo">UI Demo</Link>,
    },
    // Add standalone plugin menu items
    ...standalonePlugins.map((plugin) => ({
      key: plugin.config?.routePath || `/plugin/${plugin.id}`,
      icon: getIconComponent(plugin.config?.menuIcon),
      label: <Link to={plugin.config?.routePath || `/plugin/${plugin.id}`}>
        {plugin.config?.menuTitle || plugin.name}
      </Link>,
    })),
    {
      key: '/plugins',
      icon: <AppstoreOutlined />,
      label: <Link to="/plugins" data-testid="nav-plugins">Plugins</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings" data-testid="nav-settings">Settings</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#001529',
        color: 'white',
        padding: '0 24px',
      }}>
        <h1 style={{ color: 'white', margin: 0 }}>CNC Jog Controls</h1>
        <Space>
          <UpdateNotificationBadge
            updateAvailable={!!updateData?.updateAvailable}
            onUpdateClick={showUpdateDialog}
          />
        </Space>
      </Header>

      <Layout>
        <Sider
          width={200}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ height: '100%', borderRight: 0, paddingTop: '16px' }}
          />
        </Sider>

        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#fff',
            borderRadius: '8px',
            marginTop: '24px',
          }}>
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/controls" element={<ControlsView />} />
              <Route path="/ui-demo" element={<UIDemoView />} />
              <Route path="/plugins" element={<PluginsView />} />
              <Route path="/settings" element={<SettingsView />} />
              {/* Dynamic plugin routes */}
              {standalonePlugins.map((plugin) => (
                <Route
                  key={plugin.id}
                  path={plugin.config?.routePath || `/plugin/${plugin.id}`}
                  element={<PluginView />}
                />
              ))}
              {/* Generic plugin route for any plugin ID */}
              <Route path="/plugin/:pluginId" element={<PluginView />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

      {/* Update Release Notes Modal */}
      <ReleaseNotesPopover
        visible={showReleaseNotes}
        releaseData={updateData || undefined}
        downloadProgress={downloadProgress}
        isDownloading={isDownloading}
        onUpdate={downloadUpdate}
        onDismiss={hideUpdateDialog}
      />
    </Layout>
  );
};

function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown database error');
      }
    };

    initializeDatabase();
  }, []);

  if (dbError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '24px',
      }}>
        <Alert
          message="Database Initialization Failed"
          description={`Failed to initialize the database: ${dbError}. Please restart the application.`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!isDbInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spin size="large" />
        <div style={{ marginLeft: '16px' }}>Initializing database...</div>
      </div>
    );
  }

  return (
    <ConfigProvider>
      <Router>
        <SettingsProvider>
          <PluginProvider>
            <CustomThemeProvider>
              <AppContent />
            </CustomThemeProvider>
          </PluginProvider>
        </SettingsProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
