import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Upload, message, List, Tag, Space, Modal, Form, Input, Select, Switch, InputNumber, Tabs, Spin, Rate, Avatar, Tooltip, Badge, Dropdown, Menu, notification, Progress, Divider } from 'antd';
import { UploadOutlined, AppstoreOutlined, SettingOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, GlobalOutlined, StarOutlined, UserOutlined, ClockCircleOutlined, SyncOutlined, ExportOutlined, ImportOutlined, CloudUploadOutlined, SafetyOutlined, BranchesOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MoreOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { usePlugins, Plugin, PluginUpdate, RegistryConfig } from '../../services/plugin';

const { Title, Text } = Typography;

interface MarketplacePlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
  category: string;
  icon?: string;
  lastUpdated: string;
  size: string;
  homepage?: string;
  installed?: boolean;
  dependencies?: { [key: string]: string };
  changelog?: string;
  license?: string;
  verified?: boolean;
}

const PluginsView: React.FC = () => {
  const { 
    plugins, 
    setPlugins, 
    checkForUpdates, 
    updatePlugin, 
    updateAllPlugins,
    registryConfig,
    setRegistryConfig,
    syncWithRegistry,
    publishToRegistry,
    checkDependencies,
    installDependencies,
    exportPlugins,
    importPlugins
  } = usePlugins();
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [configForm] = Form.useForm();
  
  // Marketplace state
  const [activeTab, setActiveTab] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  
  // New states for advanced features
  const [updates, setUpdates] = useState<PluginUpdate[]>([]);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updatingPlugin, setUpdatingPlugin] = useState<string | null>(null);
  const [registryModalVisible, setRegistryModalVisible] = useState(false);
  const [registryForm] = Form.useForm();
  const [syncingRegistry, setSyncingRegistry] = useState(false);
  const [publishingPlugin, setPublishingPlugin] = useState<string | null>(null);
  const [marketplacePlugins, setMarketplacePlugins] = useState<MarketplacePlugin[]>([
    {
      id: 'cnc-visualizer-pro',
      name: 'CNC Visualizer Pro',
      version: '2.1.0',
      description: 'Advanced 3D toolpath visualization with collision detection and material simulation',
      author: 'CNC Tools Inc',
      rating: 4.8,
      downloads: 12543,
      tags: ['3d', 'visualization', 'toolpath', 'simulation'],
      category: 'visualization',
      lastUpdated: '2024-01-15',
      size: '2.4 MB',
      homepage: 'https://github.com/cnc-tools/visualizer-pro',
      dependencies: { 'gcode-parser': '1.0.0', 'three-js-utils': '2.1.0' },
      license: 'MIT',
      verified: true
    },
    {
      id: 'machine-monitor',
      name: 'Machine Health Monitor',
      version: '1.5.3',
      description: 'Real-time machine health monitoring with predictive maintenance alerts',
      author: 'Industrial IoT Solutions',
      rating: 4.6,
      downloads: 8921,
      tags: ['monitoring', 'health', 'predictive', 'iot'],
      category: 'productivity',
      lastUpdated: '2024-01-10',
      size: '1.8 MB'
    },
    {
      id: 'gcode-optimizer',
      name: 'G-code Optimizer',
      version: '3.0.1',
      description: 'Optimize G-code for faster machining and better surface finish',
      author: 'Precision Manufacturing',
      rating: 4.9,
      downloads: 15230,
      tags: ['gcode', 'optimization', 'performance', 'quality'],
      category: 'productivity',
      lastUpdated: '2024-01-12',
      size: '1.2 MB'
    },
    {
      id: 'tool-library',
      name: 'Tool Library Manager',
      version: '2.3.0',
      description: 'Comprehensive tool database with cutting parameters and lifecycle tracking',
      author: 'ToolTech Solutions',
      rating: 4.7,
      downloads: 6789,
      tags: ['tools', 'database', 'management', 'parameters'],
      category: 'utility',
      lastUpdated: '2024-01-08',
      size: '3.1 MB'
    },
    {
      id: 'cnc-camera-feed',
      name: 'CNC Camera Integration',
      version: '1.4.2',
      description: 'Live camera feed integration with work piece alignment and measurement tools',
      author: 'Vision Systems Ltd',
      rating: 4.5,
      downloads: 4321,
      tags: ['camera', 'vision', 'alignment', 'measurement'],
      category: 'control',
      lastUpdated: '2024-01-05',
      size: '5.7 MB'
    }
  ]);

  const uploadProps: UploadProps = {
    name: 'plugin',
    accept: '.zip',
    beforeUpload: (file) => {
      console.log('Uploading plugin:', file.name);
      message.success(`${file.name} plugin uploaded successfully!`);
      
      // Simulate plugin installation
      const newPlugin: Plugin = {
        id: file.name.replace('.zip', ''),
        name: file.name.replace('.zip', '').replace(/-/g, ' '),
        version: '1.0.0',
        description: 'Uploaded plugin',
        status: 'active',
        type: 'utility'
      };
      
      setPlugins(prev => [...prev, newPlugin]);
      return false; // Prevent actual upload
    },
  };

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === id 
        ? { ...plugin, status: plugin.status === 'active' ? 'inactive' : 'active' }
        : plugin
    ));
  };

  const removePlugin = (id: string) => {
    setPlugins(prev => prev.filter(plugin => plugin.id !== id));
    message.success('Plugin removed successfully');
  };

  const openConfigModal = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setConfigModalVisible(true);
    configForm.setFieldsValue(plugin.config || {});
  };

  const handleConfigSave = (values: any) => {
    if (!selectedPlugin) return;
    
    setPlugins(prev => prev.map(plugin => 
      plugin.id === selectedPlugin.id 
        ? { ...plugin, config: { ...plugin.config, ...values } }
        : plugin
    ));
    
    setConfigModalVisible(false);
    setSelectedPlugin(null);
    configForm.resetFields();
    message.success('Plugin configuration saved successfully');
  };

  const handleConfigCancel = () => {
    setConfigModalVisible(false);
    setSelectedPlugin(null);
    configForm.resetFields();
  };

  const generateRoutePath = (pluginName: string): string => {
    return '/' + pluginName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handlePlacementChange = (placement: string) => {
    if (placement === 'standalone' && selectedPlugin) {
      const currentRoutePath = configForm.getFieldValue('routePath');
      const currentMenuTitle = configForm.getFieldValue('menuTitle');
      
      // Auto-generate route path if not set
      if (!currentRoutePath) {
        const generatedPath = generateRoutePath(selectedPlugin.name);
        configForm.setFieldsValue({ routePath: generatedPath });
      }
      
      // Auto-set menu title if not set
      if (!currentMenuTitle) {
        configForm.setFieldsValue({ menuTitle: selectedPlugin.name });
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visualization': return 'blue';
      case 'control': return 'green';
      case 'productivity': return 'orange';
      case 'utility': return 'purple';
      default: return 'default';
    }
  };

  // Marketplace functions
  const handleMarketplaceSearch = async (query: string) => {
    setSearchQuery(query);
    setMarketplaceLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMarketplaceLoading(false);
    }, 800);
  };

  const installMarketplacePlugin = async (marketplacePlugin: MarketplacePlugin) => {
    setMarketplaceLoading(true);
    
    try {
      // Convert marketplace plugin to local plugin
      const newPlugin: Plugin = {
        id: marketplacePlugin.id,
        name: marketplacePlugin.name,
        version: marketplacePlugin.version,
        description: marketplacePlugin.description,
        status: 'inactive', // Start as inactive until dependencies are resolved
        type: marketplacePlugin.category as any,
        dependencies: marketplacePlugin.dependencies,
        installedAt: new Date().toISOString(),
        source: 'marketplace'
      };

      // Check dependencies first
      if (marketplacePlugin.dependencies) {
        const depNames = Object.keys(marketplacePlugin.dependencies);
        const missingDeps = depNames.filter(depId => 
          !plugins.some(p => p.id === depId)
        );

        if (missingDeps.length > 0) {
          Modal.confirm({
            title: 'Dependencies Required',
            content: (
              <div>
                <p>This plugin requires the following dependencies:</p>
                <ul>
                  {Object.entries(marketplacePlugin.dependencies).map(([id, version]) => (
                    <li key={id}>{id}@{version}</li>
                  ))}
                </ul>
                <p>Missing: {missingDeps.join(', ')}</p>
                <p>Would you like to install dependencies automatically?</p>
              </div>
            ),
            onOk: async () => {
              try {
                await installDependencies(newPlugin);
                newPlugin.status = 'active';
                setPlugins(prev => [...prev, newPlugin]);
                message.success(`${marketplacePlugin.name} and dependencies installed successfully!`);
              } catch (error) {
                message.error('Failed to install dependencies');
              }
            },
            onCancel: () => {
              // Install without dependencies
              setPlugins(prev => [...prev, newPlugin]);
              message.warning(`${marketplacePlugin.name} installed but dependencies are missing`);
            }
          });
        } else {
          // All dependencies satisfied
          const depsOk = await checkDependencies(newPlugin);
          newPlugin.status = depsOk ? 'active' : 'inactive';
          setPlugins(prev => [...prev, newPlugin]);
          
          if (!depsOk) {
            message.warning(`${marketplacePlugin.name} installed but some dependencies have version conflicts`);
          } else {
            message.success(`${marketplacePlugin.name} installed successfully!`);
          }
        }
      } else {
        // No dependencies
        newPlugin.status = 'active';
        setPlugins(prev => [...prev, newPlugin]);
        message.success(`${marketplacePlugin.name} installed successfully!`);
      }
      
      setMarketplacePlugins(prev => 
        prev.map(p => 
          p.id === marketplacePlugin.id 
            ? { ...p, installed: true }
            : p
        )
      );
      
    } catch (error) {
      message.error(`Failed to install ${marketplacePlugin.name}`);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const getFilteredMarketplacePlugins = () => {
    return marketplacePlugins.filter(plugin => {
      const matchesSearch = !searchQuery || 
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  const isPluginInstalled = (marketplacePlugin: MarketplacePlugin) => {
    return plugins.some(p => p.id === marketplacePlugin.id) || marketplacePlugin.installed;
  };

  // New handlers for advanced features
  const handleCheckForUpdates = async () => {
    setCheckingUpdates(true);
    try {
      const foundUpdates = await checkForUpdates();
      setUpdates(foundUpdates);
      
      if (foundUpdates.length > 0) {
        notification.success({
          message: 'Updates Available',
          description: `Found ${foundUpdates.length} plugin update(s)`,
          duration: 4
        });
      } else {
        message.info('All plugins are up to date');
      }
    } catch (error) {
      message.error('Failed to check for updates');
    } finally {
      setCheckingUpdates(false);
    }
  };

  const handleUpdatePlugin = async (pluginId: string, version?: string) => {
    setUpdatingPlugin(pluginId);
    try {
      await updatePlugin(pluginId, version);
      message.success('Plugin updated successfully');
      
      // Remove from updates list
      setUpdates(prev => prev.filter(u => u.pluginId !== pluginId));
    } catch (error) {
      message.error('Failed to update plugin');
    } finally {
      setUpdatingPlugin(null);
    }
  };

  const handleUpdateAll = async () => {
    try {
      await updateAllPlugins();
      message.success('All plugins updated successfully');
      setUpdates([]);
    } catch (error) {
      message.error('Failed to update plugins');
    }
  };

  const handleRegistryConfig = () => {
    setRegistryModalVisible(true);
    if (registryConfig) {
      registryForm.setFieldsValue(registryConfig);
    }
  };

  const handleRegistrySave = async (values: RegistryConfig) => {
    setRegistryConfig(values);
    setRegistryModalVisible(false);
    registryForm.resetFields();
    message.success('Registry configuration saved');
  };

  const handleSyncRegistry = async () => {
    if (!registryConfig) {
      message.warning('Please configure registry first');
      return;
    }
    
    setSyncingRegistry(true);
    try {
      await syncWithRegistry();
      message.success('Registry synced successfully');
    } catch (error) {
      message.error('Failed to sync with registry');
    } finally {
      setSyncingRegistry(false);
    }
  };

  const handlePublishPlugin = async (pluginId: string) => {
    if (!registryConfig) {
      message.warning('Please configure registry first');
      return;
    }
    
    setPublishingPlugin(pluginId);
    try {
      await publishToRegistry(pluginId);
      message.success('Plugin published to registry');
    } catch (error) {
      message.error('Failed to publish plugin');
    } finally {
      setPublishingPlugin(null);
    }
  };

  const handleExportPlugins = async () => {
    try {
      const exportData = await exportPlugins();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plugins-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Plugins exported successfully');
    } catch (error) {
      message.error('Failed to export plugins');
    }
  };

  const handleImportPlugins = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string;
        await importPlugins(data);
        message.success('Plugins imported successfully');
      } catch (error) {
        message.error('Failed to import plugins: ' + error);
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  // Auto-check for updates on component mount
  useEffect(() => {
    if (plugins.length > 0 && activeTab === 'local') {
      handleCheckForUpdates();
    }
  }, [activeTab]);

  return (
    <div>
      <Title level={2}>Plugin Management</Title>
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'local',
            label: (
              <span>
                <AppstoreOutlined />
                Local Plugins
              </span>
            ),
            children: (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} md={8}>
                    <Card title="Upload Plugin" extra={<UploadOutlined />}>
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Select Plugin ZIP File</Button>
                      </Upload>
                      <Divider />
                      <Upload 
                        accept=".json"
                        beforeUpload={handleImportPlugins}
                        showUploadList={false}
                      >
                        <Button icon={<ImportOutlined />} block>Import Plugins</Button>
                      </Upload>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <Card title="Plugin Statistics">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                          {plugins.length}
                        </div>
                        <div>Total Plugins</div>
                        <div style={{ marginTop: '16px' }}>
                          <Badge count={plugins.filter(p => p.status === 'active').length} color="green">
                            <span style={{ color: '#52c41a', marginRight: '16px' }}>Active</span>
                          </Badge>
                          <Badge count={updates.length} color="orange">
                            <span style={{ color: '#faad14' }}>Updates</span>
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card title="Actions">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                          icon={<SyncOutlined />} 
                          onClick={handleCheckForUpdates}
                          loading={checkingUpdates}
                          block
                        >
                          Check Updates
                        </Button>
                        <Button 
                          icon={<ExportOutlined />} 
                          onClick={handleExportPlugins}
                          block
                        >
                          Export Plugins
                        </Button>
                        <Button 
                          icon={<LoginOutlined />} 
                          onClick={handleRegistryConfig}
                          block
                        >
                          Registry Config
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                {/* Update Notifications */}
                {updates.length > 0 && (
                  <Card 
                    title={
                      <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                        Plugin Updates Available
                        <Badge count={updates.length} />
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />}
                        onClick={handleUpdateAll}
                        size="small"
                      >
                        Update All
                      </Button>
                    }
                    style={{ marginBottom: '16px' }}
                  >
                    <List
                      size="small"
                      dataSource={updates}
                      renderItem={(update) => (
                        <List.Item
                          actions={[
                            <Button 
                              type="primary" 
                              size="small"
                              icon={<DownloadOutlined />}
                              loading={updatingPlugin === update.pluginId}
                              onClick={() => handleUpdatePlugin(update.pluginId, update.latestVersion)}
                            >
                              Update
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={`${update.pluginId} ${update.currentVersion} → ${update.latestVersion}`}
                            description={update.changelog}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
                
                <Card title="Installed Plugins" extra={<AppstoreOutlined />}>
                  <List
                    itemLayout="horizontal"
                    dataSource={plugins}
                    renderItem={(plugin) => (
                      <List.Item
                        actions={[
                          plugin.updateAvailable && (
                            <Button
                              type="primary"
                              icon={<DownloadOutlined />}
                              size="small"
                              loading={updatingPlugin === plugin.id}
                              onClick={() => handleUpdatePlugin(plugin.id)}
                            >
                              Update
                            </Button>
                          ),
                          <Button
                            type={plugin.status === 'active' ? 'default' : 'primary'}
                            onClick={() => togglePlugin(plugin.id)}
                          >
                            {plugin.status === 'active' ? 'Disable' : 'Enable'}
                          </Button>,
                          <Button 
                            icon={<SettingOutlined />}
                            onClick={() => openConfigModal(plugin)}
                          >
                            Configure
                          </Button>,
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'versions',
                                  label: 'Version Info',
                                  icon: <BranchesOutlined />,
                                  onClick: () => message.info(`Current: ${plugin.version}${plugin.latestVersion ? `, Latest: ${plugin.latestVersion}` : ''}`),
                                },
                                plugin.source === 'local' && {
                                  key: 'publish',
                                  label: 'Publish to Registry',
                                  icon: <CloudUploadOutlined />,
                                  onClick: () => handlePublishPlugin(plugin.id),
                                },
                                {
                                  key: 'dependencies',
                                  label: 'Dependencies',
                                  icon: <SafetyOutlined />,
                                  onClick: () => {
                                    const deps = plugin.dependencies;
                                    if (deps && Object.keys(deps).length > 0) {
                                      message.info(`Dependencies: ${Object.entries(deps).map(([id, ver]) => `${id}@${ver}`).join(', ')}`);
                                    } else {
                                      message.info('No dependencies');
                                    }
                                  },
                                },
                                {
                                  key: 'remove',
                                  label: 'Remove',
                                  icon: <DeleteOutlined />,
                                  danger: true,
                                  onClick: () => removePlugin(plugin.id),
                                },
                              ].filter(Boolean)
                            }}
                          >
                            <Button icon={<MoreOutlined />} />
                          </Dropdown>
                        ].filter(Boolean)}
                      >
                        <List.Item.Meta
                          avatar={<AppstoreOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                          title={
                            <Space>
                              {plugin.name}
                              <Tag color={plugin.status === 'active' ? 'green' : 'default'}>
                                {plugin.status}
                              </Tag>
                              <Tag color={getTypeColor(plugin.type)}>
                                {plugin.type}
                              </Tag>
                              {plugin.updateAvailable && (
                                <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                                  Update Available
                                </Tag>
                              )}
                              {plugin.source === 'registry' && (
                                <Tag color="blue" icon={<CheckCircleOutlined />}>
                                  Registry
                                </Tag>
                              )}
                              {plugin.source === 'marketplace' && (
                                <Tag color="purple" icon={<GlobalOutlined />}>
                                  Marketplace
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <div>
                              <div>{plugin.description}</div>
                              <Space size="large" style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                  Version: {plugin.version}
                                  {plugin.latestVersion && plugin.updateAvailable && (
                                    <span style={{ color: '#faad14' }}> → {plugin.latestVersion}</span>
                                  )}
                                </Text>
                                {plugin.installedAt && (
                                  <Text type="secondary">
                                    Installed: {new Date(plugin.installedAt).toLocaleDateString()}
                                  </Text>
                                )}
                                {plugin.dependencies && Object.keys(plugin.dependencies).length > 0 && (
                                  <Text type="secondary">
                                    Dependencies: {Object.keys(plugin.dependencies).length}
                                  </Text>
                                )}
                              </Space>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  
                  {plugins.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <div>No plugins installed</div>
                      <div>Upload a plugin ZIP file to get started</div>
                    </div>
                  )}
                </Card>
              </div>
            ),
          },
          {
            key: 'marketplace',
            label: (
              <span>
                <GlobalOutlined />
                Marketplace
              </span>
            ),
            children: (
              <div>
                {/* Search and Filter Section */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} md={16}>
                    <Input.Search
                      placeholder="Search plugins by name, description, or tags..."
                      allowClear
                      enterButton={<SearchOutlined />}
                      size="large"
                      onSearch={handleMarketplaceSearch}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      loading={marketplaceLoading}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Select
                      placeholder="Filter by category"
                      style={{ width: '100%' }}
                      size="large"
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                    >
                      <Select.Option value="all">All Categories</Select.Option>
                      <Select.Option value="visualization">Visualization</Select.Option>
                      <Select.Option value="control">Control</Select.Option>
                      <Select.Option value="productivity">Productivity</Select.Option>
                      <Select.Option value="utility">Utility</Select.Option>
                    </Select>
                  </Col>
                </Row>

                {/* Marketplace Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} md={8}>
                    <Card>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                          {getFilteredMarketplacePlugins().length}
                        </div>
                        <div>Available Plugins</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                          {marketplacePlugins.reduce((sum, p) => sum + p.downloads, 0).toLocaleString()}
                        </div>
                        <div>Total Downloads</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                          {(marketplacePlugins.reduce((sum, p) => sum + p.rating, 0) / marketplacePlugins.length).toFixed(1)}
                        </div>
                        <div>Average Rating</div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Plugin List */}
                <Card title="Available Plugins" extra={<GlobalOutlined />}>
                  <Spin spinning={marketplaceLoading}>
                    <List
                      itemLayout="horizontal"
                      dataSource={getFilteredMarketplacePlugins()}
                      renderItem={(marketplacePlugin) => {
                        const installed = isPluginInstalled(marketplacePlugin);
                        return (
                          <List.Item
                            actions={[
                              <Space>
                                <Rate 
                                  disabled 
                                  value={marketplacePlugin.rating} 
                                  style={{ fontSize: '14px' }}
                                />
                                <Text type="secondary">({marketplacePlugin.rating})</Text>
                              </Space>,
                              <Tooltip title={`${marketplacePlugin.downloads.toLocaleString()} downloads`}>
                                <Space>
                                  <DownloadOutlined />
                                  <Text type="secondary">{formatDownloads(marketplacePlugin.downloads)}</Text>
                                </Space>
                              </Tooltip>,
                              installed ? (
                                <Button disabled>
                                  Installed
                                </Button>
                              ) : (
                                <Button 
                                  type="primary"
                                  icon={<DownloadOutlined />}
                                  onClick={() => installMarketplacePlugin(marketplacePlugin)}
                                  loading={marketplaceLoading}
                                >
                                  Install
                                </Button>
                              ),
                              marketplacePlugin.homepage && (
                                <Button 
                                  type="link"
                                  icon={<GlobalOutlined />}
                                  href={marketplacePlugin.homepage}
                                  target="_blank"
                                >
                                  Homepage
                                </Button>
                              )
                            ].filter(Boolean)}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar 
                                  size={48}
                                  icon={<AppstoreOutlined />}
                                  style={{ backgroundColor: '#1890ff' }}
                                />
                              }
                              title={
                                <Space>
                                  {marketplacePlugin.name}
                                  <Tag color={getTypeColor(marketplacePlugin.category)}>
                                    {marketplacePlugin.category}
                                  </Tag>
                                  {marketplacePlugin.verified && (
                                    <Tag color="blue" icon={<CheckCircleOutlined />}>
                                      Verified
                                    </Tag>
                                  )}
                                  {installed && (
                                    <Tag color="green">Installed</Tag>
                                  )}
                                  {marketplacePlugin.dependencies && Object.keys(marketplacePlugin.dependencies).length > 0 && (
                                    <Tag color="purple" icon={<SafetyOutlined />}>
                                      {Object.keys(marketplacePlugin.dependencies).length} deps
                                    </Tag>
                                  )}
                                </Space>
                              }
                              description={
                                <div>
                                  <div style={{ marginBottom: '8px' }}>
                                    {marketplacePlugin.description}
                                  </div>
                                  <Space size="large">
                                    <Space>
                                      <UserOutlined />
                                      <Text type="secondary">{marketplacePlugin.author}</Text>
                                    </Space>
                                    <Space>
                                      <Text type="secondary">v{marketplacePlugin.version}</Text>
                                    </Space>
                                    <Space>
                                      <ClockCircleOutlined />
                                      <Text type="secondary">{marketplacePlugin.lastUpdated}</Text>
                                    </Space>
                                    <Text type="secondary">{marketplacePlugin.size}</Text>
                                  </Space>
                                  <div style={{ marginTop: '8px' }}>
                                    {marketplacePlugin.tags.map(tag => (
                                      <Tag key={tag} size="small" style={{ margin: '2px' }}>
                                        {tag}
                                      </Tag>
                                    ))}
                                  </div>
                                  {marketplacePlugin.dependencies && Object.keys(marketplacePlugin.dependencies).length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Dependencies: {Object.entries(marketplacePlugin.dependencies).map(([id, version]) => `${id}@${version}`).join(', ')}
                                      </Text>
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                    
                    {getFilteredMarketplacePlugins().length === 0 && !marketplaceLoading && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <SearchOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <div>No plugins found</div>
                        <div>Try adjusting your search or filter criteria</div>
                      </div>
                    )}
                  </Spin>
                </Card>
              </div>
            ),
          },
          {
            key: 'registry',
            label: (
              <Space>
                <CloudUploadOutlined />
                Registry
                {registryConfig && <Tag color="green" size="small">Connected</Tag>}
              </Space>
            ),
            children: (
              <div>
                {!registryConfig ? (
                  <Card title="Connect to Registry" style={{ textAlign: 'center', marginTop: '50px' }}>
                    <div style={{ padding: '40px' }}>
                      <CloudUploadOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
                      <Title level={4}>No Registry Connected</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                        Connect to a plugin registry to publish and sync your plugins
                      </Text>
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<LoginOutlined />}
                        onClick={handleRegistryConfig}
                      >
                        Connect to Registry
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div>
                    {/* Registry Status */}
                    <Card 
                      title={
                        <Space>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          Connected to Registry
                        </Space>
                      }
                      extra={
                        <Space>
                          <Button 
                            icon={<SyncOutlined />}
                            onClick={handleSyncRegistry}
                            loading={syncingRegistry}
                          >
                            Sync
                          </Button>
                          <Button 
                            icon={<SettingOutlined />}
                            onClick={handleRegistryConfig}
                          >
                            Settings
                          </Button>
                        </Space>
                      }
                      style={{ marginBottom: '16px' }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                              {registryConfig.url}
                            </div>
                            <Text type="secondary">Registry URL</Text>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                              {registryConfig.username || 'Anonymous'}
                            </div>
                            <Text type="secondary">Username</Text>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                              Connected
                            </div>
                            <Text type="secondary">Status</Text>
                          </div>
                        </Col>
                      </Row>
                    </Card>

                    {/* Publishable Plugins */}
                    <Card title="Your Plugins" extra={<Text type="secondary">Ready to publish</Text>}>
                      <List
                        itemLayout="horizontal"
                        dataSource={plugins.filter(p => p.source === 'local')}
                        renderItem={(plugin) => (
                          <List.Item
                            actions={[
                              plugin.source === 'registry' ? (
                                <Tag color="blue">Published</Tag>
                              ) : (
                                <Button
                                  type="primary"
                                  icon={<CloudUploadOutlined />}
                                  loading={publishingPlugin === plugin.id}
                                  onClick={() => handlePublishPlugin(plugin.id)}
                                >
                                  Publish
                                </Button>
                              )
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<AppstoreOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                              title={
                                <Space>
                                  {plugin.name}
                                  <Tag color={getTypeColor(plugin.type)}>{plugin.type}</Tag>
                                  {plugin.source === 'registry' && (
                                    <Tag color="blue" icon={<CheckCircleOutlined />}>Published</Tag>
                                  )}
                                </Space>
                              }
                              description={
                                <div>
                                  <div>{plugin.description}</div>
                                  <Text type="secondary">Version: {plugin.version}</Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                      
                      {plugins.filter(p => p.source === 'local').length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                          <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                          <div>No local plugins to publish</div>
                          <div>Upload or create plugins to publish to the registry</div>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Registry Configuration Modal */}
      <Modal
        title="Registry Configuration"
        open={registryModalVisible}
        onOk={() => registryForm.submit()}
        onCancel={() => {
          setRegistryModalVisible(false);
          registryForm.resetFields();
        }}
        width={500}
        okText="Save Configuration"
      >
        <Form
          form={registryForm}
          layout="vertical"
          onFinish={handleRegistrySave}
        >
          <Form.Item
            label="Registry URL"
            name="url"
            rules={[
              { required: true, message: 'Please enter registry URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://registry.example.com" />
          </Form.Item>
          
          <Form.Item
            label="Username"
            name="username"
            tooltip="Optional: Username for registry authentication"
          >
            <Input placeholder="your-username" />
          </Form.Item>
          
          <Form.Item
            label="Access Token"
            name="token"
            tooltip="Optional: Access token for registry authentication"
          >
            <Input.Password placeholder="your-access-token" />
          </Form.Item>
          
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button 
              icon={<SyncOutlined />}
              onClick={handleSyncRegistry}
              loading={syncingRegistry}
              disabled={!registryConfig}
            >
              Test Connection
            </Button>
            {registryConfig && (
              <Button 
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  setRegistryConfig(null);
                  message.success('Registry disconnected');
                }}
              >
                Disconnect
              </Button>
            )}
          </Space>
        </Form>
      </Modal>

      {/* Plugin Configuration Modal */}
      <Modal
        title={`Configure ${selectedPlugin?.name || 'Plugin'}`}
        open={configModalVisible}
        onOk={() => configForm.submit()}
        onCancel={handleConfigCancel}
        width={600}
        okText="Save Configuration"
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleConfigSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Placement"
                name="placement"
                tooltip="Where the plugin UI will be displayed"
              >
                <Select 
                  placeholder="Select placement"
                  onChange={handlePlacementChange}
                >
                  <Select.Option value="dashboard">Dashboard Card</Select.Option>
                  <Select.Option value="standalone">Standalone Screen</Select.Option>
                  <Select.Option value="modal">Modal Dialog</Select.Option>
                  <Select.Option value="sidebar">Sidebar Panel</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Screen"
                name="screen"
                tooltip="Which screen/section to display on"
              >
                <Select placeholder="Select screen">
                  <Select.Option value="main">Dashboard Screen</Select.Option>
                  <Select.Option value="controls">Controls Screen</Select.Option>
                  <Select.Option value="settings">Settings Screen</Select.Option>
                  <Select.Option value="new">New Screen (Standalone only)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Show menu configuration for standalone plugins */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.placement !== currentValues.placement
          }>
            {({ getFieldValue }) => {
              const placement = getFieldValue('placement');
              return placement === 'standalone' ? (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Menu Title"
                        name="menuTitle"
                        tooltip="Text to display in the navigation menu"
                      >
                        <Input placeholder="Menu display name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Menu Icon"
                        name="menuIcon"
                        tooltip="Icon to display in the navigation menu"
                      >
                        <Select placeholder="Select icon">
                          <Select.Option value="monitor">Monitor</Select.Option>
                          <Select.Option value="control">Control</Select.Option>
                          <Select.Option value="appstore">App Store</Select.Option>
                          <Select.Option value="setting">Setting</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    label="Route Path"
                    name="routePath"
                    tooltip="URL path for this plugin screen (e.g., /machine-monitor)"
                    rules={[
                      { required: true, message: 'Route path is required for standalone screens' },
                      { pattern: /^\/[a-z0-9-]+$/, message: 'Route path must start with / and contain only lowercase letters, numbers, and hyphens' }
                    ]}
                  >
                    <Input placeholder="/my-plugin" />
                  </Form.Item>
                </>
              ) : null;
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Width"
                name={['size', 'width']}
                tooltip="Plugin width (number in pixels or 'auto')"
              >
                <Input placeholder="auto or number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Height"
                name={['size', 'height']}
                tooltip="Plugin height (number in pixels or 'auto')"
              >
                <Input placeholder="auto or number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Priority"
                name="priority"
                tooltip="Display priority (higher numbers show first)"
              >
                <InputNumber min={0} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Auto Start"
                name="autoStart"
                valuePropName="checked"
                tooltip="Automatically start plugin when application loads"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Permissions"
            name="permissions"
            tooltip="Required permissions for this plugin"
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              style={{ width: '100%' }}
            >
              <Select.Option value="file.read">File Read</Select.Option>
              <Select.Option value="file.write">File Write</Select.Option>
              <Select.Option value="machine.read">Machine Read</Select.Option>
              <Select.Option value="machine.control">Machine Control</Select.Option>
              <Select.Option value="status.read">Status Read</Select.Option>
              <Select.Option value="settings.read">Settings Read</Select.Option>
              <Select.Option value="settings.write">Settings Write</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PluginsView;