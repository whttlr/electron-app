import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ControlOutlined, AppstoreOutlined, SettingOutlined, MonitorOutlined } from '@ant-design/icons';
import { PluginProvider, usePlugins } from './contexts/PluginContext';
import DashboardView from './views/Dashboard/DashboardView';
import PluginsView from './views/Plugins/PluginsView';
import SettingsView from './views/Settings/SettingsView';
import ControlsView from './views/Controls/ControlsView';
import PluginView from './views/Plugin/PluginView';
import './App.css';

const { Header, Content, Sider } = Layout;

const AppContent: React.FC = () => {
  const location = useLocation();
  const { getStandalonePlugins } = usePlugins();
  const standalonePlugins = getStandalonePlugins();

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
      label: <Link to="/">Dashboard</Link>
    },
    {
      key: '/controls',
      icon: <ControlOutlined />,
      label: <Link to="/controls">Controls</Link>
    },
    // Add standalone plugin menu items
    ...standalonePlugins.map(plugin => ({
      key: plugin.config?.routePath || `/plugin/${plugin.id}`,
      icon: getIconComponent(plugin.config?.menuIcon),
      label: <Link to={plugin.config?.routePath || `/plugin/${plugin.id}`}>
        {plugin.config?.menuTitle || plugin.name}
      </Link>
    })),
    {
      key: '/plugins',
      icon: <AppstoreOutlined />,
      label: <Link to="/plugins">Plugins</Link>
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: '#001529',
        color: 'white',
        padding: '0 24px'
      }}>
        <h1 style={{ color: 'white', margin: 0 }}>CNC Jog Controls</h1>
      </Header>
      
      <Layout>
        <Sider 
          width={200} 
          style={{ background: '#fff' }}
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
            marginTop: '24px'
          }}>
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/controls" element={<ControlsView />} />
              <Route path="/plugins" element={<PluginsView />} />
              <Route path="/settings" element={<SettingsView />} />
              {/* Dynamic plugin routes */}
              {standalonePlugins.map(plugin => (
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
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <PluginProvider>
        <AppContent />
      </PluginProvider>
    </Router>
  );
}

export default App;