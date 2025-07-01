import React from 'react';
import { Card, Row, Col, Modal, Typography } from 'antd';
import { usePlugins, Plugin } from '../../services/plugin';

const { Title, Paragraph } = Typography;

interface PluginRendererProps {
  screen: 'main' | 'controls' | 'settings';
  placement?: 'dashboard' | 'modal' | 'sidebar';
}

const PluginRenderer: React.FC<PluginRendererProps> = ({ screen, placement }) => {
  const { plugins } = usePlugins();

  // Filter plugins for this screen and placement
  const relevantPlugins = plugins.filter(plugin => 
    plugin.status === 'active' &&
    plugin.config?.screen === screen &&
    (placement ? plugin.config?.placement === placement : true)
  );

  if (relevantPlugins.length === 0) {
    return null;
  }

  const renderPluginContent = (plugin: Plugin) => {
    // This is a placeholder for actual plugin content
    // In a real implementation, this would load and render the plugin's React components
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔌</div>
        <Title level={5}>{plugin.name}</Title>
        <Paragraph type="secondary" style={{ fontSize: '12px' }}>
          {plugin.description}
        </Paragraph>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px', 
          fontSize: '10px',
          textAlign: 'left'
        }}>
          <strong>Config:</strong><br/>
          Type: {plugin.type}<br/>
          Placement: {plugin.config?.placement}<br/>
          Priority: {plugin.config?.priority}
        </div>
      </div>
    );
  };

  const renderDashboardPlugins = () => {
    return (
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {relevantPlugins
          .sort((a, b) => (b.config?.priority || 0) - (a.config?.priority || 0))
          .map(plugin => {
            const width = plugin.config?.size?.width;
            const colSpan = width === 'auto' ? 6 : 
                          typeof width === 'number' && width > 400 ? 12 : 6;
            
            return (
              <Col key={plugin.id} xs={24} sm={12} md={colSpan}>
                <Card
                  className="dashboard-card"
                  title={plugin.name}
                  size="small"
                  style={{
                    height: plugin.config?.size?.height === 'auto' ? 'auto' : plugin.config?.size?.height
                  }}
                >
                  {renderPluginContent(plugin)}
                </Card>
              </Col>
            );
          })}
      </Row>
    );
  };

  const renderSidebarPlugins = () => {
    return (
      <div style={{ marginTop: '16px' }}>
        {relevantPlugins
          .sort((a, b) => (b.config?.priority || 0) - (a.config?.priority || 0))
          .map(plugin => (
            <Card 
              key={plugin.id}
              size="small" 
              title={plugin.name}
              style={{ marginBottom: '8px' }}
            >
              {renderPluginContent(plugin)}
            </Card>
          ))}
      </div>
    );
  };

  // Render based on placement type
  switch (placement) {
    case 'dashboard':
      return renderDashboardPlugins();
    case 'sidebar':
      return renderSidebarPlugins();
    case 'modal':
      // Modal plugins would be triggered by buttons or events
      // For now, just show them as cards
      return (
        <div style={{ marginTop: '16px' }}>
          <Title level={4}>Available Modal Plugins</Title>
          <Row gutter={[8, 8]}>
            {relevantPlugins.map(plugin => (
              <Col key={plugin.id} span={8}>
                <Card 
                  size="small" 
                  title={plugin.name}
                  hoverable
                  onClick={() => {
                    Modal.info({
                      title: plugin.name,
                      content: renderPluginContent(plugin),
                      width: plugin.config?.size?.width === 'auto' ? 600 : plugin.config?.size?.width,
                    });
                  }}
                >
                  <div style={{ textAlign: 'center', fontSize: '24px' }}>🔌</div>
                  <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '4px' }}>
                    Click to open
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      );
    default:
      // Show all plugins for this screen
      return (
        <>
          {relevantPlugins.filter(p => p.config?.placement === 'dashboard').length > 0 && 
            renderDashboardPlugins()}
          {relevantPlugins.filter(p => p.config?.placement === 'sidebar').length > 0 && 
            renderSidebarPlugins()}
          {relevantPlugins.filter(p => p.config?.placement === 'modal').length > 0 && (
            <PluginRenderer screen={screen} placement="modal" />
          )}
        </>
      );
  }
};

export default PluginRenderer;