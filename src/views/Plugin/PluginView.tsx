import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Typography, Card, Alert } from 'antd';
import { usePlugins } from '../../contexts/PluginContext';

const { Title, Paragraph } = Typography;

const PluginView: React.FC = () => {
  const { pluginId } = useParams<{ pluginId: string }>();
  const location = useLocation();
  const { plugins } = usePlugins();
  
  // Find plugin by ID (for /plugin/:pluginId routes) or by route path (for custom routes)
  const plugin = plugins.find(p => {
    if (pluginId) {
      return p.id === pluginId;
    }
    // Find by custom route path
    return p.config?.routePath === location.pathname;
  });
  
  if (!plugin) {
    return (
      <div>
        <Title level={2}>Plugin Not Found</Title>
        <Alert
          message="Plugin Not Found"
          description={
            <div>
              <div>Plugin ID: {pluginId || 'undefined'}</div>
              <div>Current Path: {location.pathname}</div>
              <div>Available plugins: {plugins.map(p => p.id).join(', ')}</div>
              <div>Standalone plugins: {plugins.filter(p => p.config?.placement === 'standalone').map(p => `${p.id} (${p.config?.routePath})`).join(', ')}</div>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (plugin.status !== 'active') {
    return (
      <div>
        <Title level={2}>{plugin.name}</Title>
        <Alert
          message="Plugin Inactive"
          description="This plugin is currently disabled. Enable it in the Plugins section to use it."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>{plugin.name}</Title>
      <Paragraph type="secondary">{plugin.description}</Paragraph>
      
      <Card>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
          <Title level={4}>Plugin Content Area</Title>
          <Paragraph>
            This is where the {plugin.name} plugin content would be rendered.
            In a real implementation, this would load and display the plugin's 
            React components or embedded content.
          </Paragraph>
          
          <div style={{ marginTop: '24px', textAlign: 'left', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <Title level={5}>Plugin Configuration:</Title>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(plugin.config, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PluginView;