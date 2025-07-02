import React, { useState, useEffect } from 'react';
import {
  Typography, Tabs, Space, Form, message, Modal, Tag,
} from 'antd';
import { AppstoreOutlined, GlobalOutlined, CloudUploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { usePlugins, Plugin, PluginUpdate } from '../../services/plugin';
import {
  LocalPluginsView, MarketplaceView, RegistryView, PluginConfigurationModal,
} from './components';

const { Title } = Typography;

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
    checkForUpdates,
    updatePlugin,
    updateAllPlugins,
    registryConfig,
    fetchMarketplacePlugins,
    checkDependencies,
    installDependencies,
    exportPlugins,
    importPlugins,
    updatePluginState,
    savePlugin,
    deletePlugin,
  } = usePlugins();

  // Component state
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [configForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [updates, setUpdates] = useState<PluginUpdate[]>([]);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updatingPlugin, setUpdatingPlugin] = useState<string | null>(null);
  const [marketplacePlugins, setMarketplacePlugins] = useState<MarketplacePlugin[]>([]);

  // Upload configuration
  const uploadProps: UploadProps = {
    name: 'plugin',
    accept: '.zip',
    beforeUpload: async (file) => {
      try {
        const newPlugin: Plugin = {
          id: file.name.replace('.zip', ''),
          name: file.name.replace('.zip', '').replace(/-/g, ' '),
          version: '1.0.0',
          description: 'Uploaded plugin',
          status: 'active',
          type: 'utility',
          source: 'local',
          installedAt: new Date().toISOString(),
        };

        await savePlugin(newPlugin);
        message.success(`${file.name} plugin uploaded and saved successfully!`);
      } catch (error) {
        message.error('Failed to save uploaded plugin');
      }
      return false;
    },
  };

  // Plugin management handlers
  const togglePlugin = async (id: string) => {
    try {
      const plugin = plugins.find((p) => p.id === id);
      if (plugin) {
        const newStatus = plugin.status === 'active' ? 'inactive' : 'active';
        await updatePluginState(id, { enabled: newStatus === 'active' });
        message.success(`Plugin ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      message.error('Failed to update plugin status');
    }
  };

  const removePlugin = async (id: string) => {
    try {
      await deletePlugin(id);
      message.success('Plugin removed successfully');
    } catch (error) {
      message.error('Failed to remove plugin');
    }
  };

  const openConfigModal = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setConfigModalVisible(true);
    configForm.setFieldsValue(plugin.config || {});
  };

  const handleConfigSave = async (values: any) => {
    if (!selectedPlugin) return;

    try {
      const updatedPlugin = {
        ...selectedPlugin,
        config: { ...selectedPlugin.config, ...values },
      };

      await savePlugin(updatedPlugin);

      setConfigModalVisible(false);
      setSelectedPlugin(null);
      configForm.resetFields();
      message.success('Plugin configuration saved successfully');
    } catch (error) {
      message.error('Failed to save plugin configuration');
    }
  };

  const handleConfigCancel = () => {
    setConfigModalVisible(false);
    setSelectedPlugin(null);
    configForm.resetFields();
  };

  const generateRoutePath = (pluginName: string): string => `/${pluginName.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;

  const handlePlacementChange = (placement: string) => {
    if (placement === 'standalone' && selectedPlugin) {
      const currentRoutePath = configForm.getFieldValue('routePath');
      const currentMenuTitle = configForm.getFieldValue('menuTitle');

      if (!currentRoutePath) {
        const generatedPath = generateRoutePath(selectedPlugin.name);
        configForm.setFieldsValue({ routePath: generatedPath });
      }

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

  // Marketplace handlers
  const handleMarketplaceSearch = async (query: string) => {
    setSearchQuery(query);
    setMarketplaceLoading(true);
    setTimeout(() => setMarketplaceLoading(false), 800);
  };

  const installMarketplacePlugin = async (marketplacePlugin: MarketplacePlugin) => {
    setMarketplaceLoading(true);

    try {
      const newPlugin: Plugin = {
        id: marketplacePlugin.id,
        name: marketplacePlugin.name,
        version: marketplacePlugin.version,
        description: marketplacePlugin.description,
        status: 'inactive',
        type: marketplacePlugin.category as any,
        dependencies: marketplacePlugin.dependencies,
        installedAt: new Date().toISOString(),
        source: 'marketplace',
      };

      if (marketplacePlugin.dependencies) {
        const depNames = Object.keys(marketplacePlugin.dependencies);
        const missingDeps = depNames.filter((depId) => !plugins.some((p) => p.id === depId));

        if (missingDeps.length > 0) {
          Modal.confirm({
            title: 'Dependencies Required',
            content: `This plugin requires: ${Object.entries(marketplacePlugin.dependencies).map(([id, version]) => `${id}@${version}`).join(', ')}`,
            onOk: async () => {
              await installDependencies(newPlugin);
              newPlugin.status = 'active';
              await savePlugin(newPlugin);
              message.success(`${marketplacePlugin.name} and dependencies installed successfully!`);
            },
            onCancel: async () => {
              await savePlugin(newPlugin);
              message.warning(`${marketplacePlugin.name} installed but dependencies are missing`);
            },
          });
        } else {
          const depsOk = await checkDependencies(newPlugin);
          newPlugin.status = depsOk ? 'active' : 'inactive';
          await savePlugin(newPlugin);
          message.success(`${marketplacePlugin.name} installed successfully!`);
        }
      } else {
        newPlugin.status = 'active';
        await savePlugin(newPlugin);
        message.success(`${marketplacePlugin.name} installed successfully!`);
      }

      setMarketplacePlugins((prev) => prev.map((p) => (p.id === marketplacePlugin.id
        ? { ...p, installed: true }
        : p)));
    } catch (error) {
      message.error(`Failed to install ${marketplacePlugin.name}`);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const getFilteredMarketplacePlugins = () => marketplacePlugins.filter((plugin) => {
    const matchesSearch = !searchQuery
        || plugin.name.toLowerCase().includes(searchQuery.toLowerCase())
        || plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
        || plugin.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
  };

  const isPluginInstalled = (marketplacePlugin: MarketplacePlugin) =>
    plugins.some((p) => p.id === marketplacePlugin.id) || marketplacePlugin.installed;

  // Update handlers
  const handleCheckForUpdates = async () => {
    setCheckingUpdates(true);
    try {
      const foundUpdates = await checkForUpdates();
      setUpdates(foundUpdates);

      if (foundUpdates.length > 0) {
        message.success(`Found ${foundUpdates.length} plugin update(s)`);
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
      setUpdates((prev) => prev.filter((u) => u.pluginId !== pluginId));
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

  // Export/Import handlers
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
        message.error(`Failed to import plugins: ${error}`);
      }
    };
    reader.readAsText(file);
    return false;
  };

  // Load marketplace plugins when marketplace tab is selected
  useEffect(() => {
    const loadMarketplacePlugins = async () => {
      if (activeTab === 'marketplace' && marketplacePlugins.length === 0) {
        setMarketplaceLoading(true);
        try {
          const registryPlugins = await fetchMarketplacePlugins();

          const marketplaceData: MarketplacePlugin[] = registryPlugins.map((plugin) => ({
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            description: plugin.description,
            author: plugin.publisherId || 'Unknown',
            rating: 4.5,
            downloads: Math.floor(Math.random() * 1000),
            tags: ['cnc', 'control'],
            category: plugin.type,
            lastUpdated: plugin.installedAt || new Date().toISOString(),
            size: '1.2 MB',
            installed: plugins.some((p) => p.id === plugin.id),
            verified: plugin.source === 'registry',
          }));

          setMarketplacePlugins(marketplaceData);
        } catch (error) {
          message.error('Failed to load marketplace plugins');
        } finally {
          setMarketplaceLoading(false);
        }
      }
    };

    loadMarketplacePlugins();
  }, [activeTab, marketplacePlugins.length]);

  // Auto-check for updates on component mount
  useEffect(() => {
    if (plugins.length > 0 && activeTab === 'local') {
      handleCheckForUpdates();
    }
  }, [activeTab]);

  return (
    <div data-testid="plugins-container">
      <Title level={2}>Plugin Management</Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'local',
            label: (
              <span>
                <AppstoreOutlined style={{ marginRight: '8px' }}/>
                Local Plugins
              </span>
            ),
            children: (
              <LocalPluginsView
                plugins={plugins}
                updates={updates}
                checkingUpdates={checkingUpdates}
                updatingPlugin={updatingPlugin}
                uploadProps={uploadProps}
                handleCheckForUpdates={handleCheckForUpdates}
                handleExportPlugins={handleExportPlugins}
                handleImportPlugins={handleImportPlugins}
                handleUpdatePlugin={handleUpdatePlugin}
                handleUpdateAll={handleUpdateAll}
                togglePlugin={togglePlugin}
                openConfigModal={openConfigModal}
                removePlugin={removePlugin}
                getTypeColor={getTypeColor}
              />
            ),
          },
          {
            key: 'marketplace',
            label: (
              <span>
                <GlobalOutlined style={{ marginRight: '8px' }} />
                Marketplace
              </span>
            ),
            children: (
              <MarketplaceView
                marketplacePlugins={marketplacePlugins}
                marketplaceLoading={marketplaceLoading}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                setSearchQuery={setSearchQuery}
                setSelectedCategory={setSelectedCategory}
                setMarketplacePlugins={setMarketplacePlugins}
                handleMarketplaceSearch={handleMarketplaceSearch}
                installMarketplacePlugin={installMarketplacePlugin}
                getFilteredMarketplacePlugins={getFilteredMarketplacePlugins}
                formatDownloads={formatDownloads}
                isPluginInstalled={isPluginInstalled}
                getTypeColor={getTypeColor}
              />
            ),
          },
          {
            key: 'registry',
            label: (
              <Space>
                <CloudUploadOutlined style={{ marginRight: '8px' }} />
                Registry
                {registryConfig && <Tag color="green" size="small">Connected</Tag>}
              </Space>
            ),
            children: (
              <RegistryView
                plugins={plugins}
                marketplacePlugins={marketplacePlugins}
              />
            ),
          },
        ]}
      />

      <PluginConfigurationModal
        visible={configModalVisible}
        selectedPlugin={selectedPlugin}
        form={configForm}
        onSave={handleConfigSave}
        onCancel={handleConfigCancel}
        onPlacementChange={handlePlacementChange}
      />
    </div>
  );
};

export default PluginsView;
