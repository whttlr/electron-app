import React from 'react';
import {
  Card, Row, Col, Button, Upload, message, List, Tag, Space, Badge, Dropdown, Divider,
} from 'antd';
import {
  UploadOutlined,
  AppstoreOutlined,
  SettingOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SyncOutlined,
  ExportOutlined,
  ImportOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  GlobalOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Plugin, PluginUpdate } from '../../../services/plugin';

interface LocalPluginsViewProps {
  plugins: Plugin[];
  updates: PluginUpdate[];
  checkingUpdates: boolean;
  updatingPlugin: string | null;
  uploadProps: UploadProps;
  handleCheckForUpdates: () => Promise<void>;
  handleExportPlugins: () => Promise<void>;
  handleImportPlugins: (file: File) => boolean;
  handleUpdatePlugin: (pluginId: string, version?: string) => Promise<void>;
  handleUpdateAll: () => Promise<void>;
  togglePlugin: (id: string) => Promise<void>;
  openConfigModal: (plugin: Plugin) => void;
  removePlugin: (id: string) => Promise<void>;
  getTypeColor: (type: string) => string;
}

const LocalPluginsView: React.FC<LocalPluginsViewProps> = ({
  plugins,
  updates,
  checkingUpdates,
  updatingPlugin,
  uploadProps,
  handleCheckForUpdates,
  handleExportPlugins,
  handleImportPlugins,
  handleUpdatePlugin,
  handleUpdateAll,
  togglePlugin,
  openConfigModal,
  removePlugin,
  getTypeColor,
}) => (
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
                <Badge count={plugins.filter((p) => p.status === 'active').length} color="green">
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
                  </Button>,
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
                    ].filter(Boolean),
                  }}
                >
                  <Button icon={<MoreOutlined />} />
                </Dropdown>,
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
                      <span style={{ color: '#999' }}>
                        Version: {plugin.version}
                        {plugin.latestVersion && plugin.updateAvailable && (
                          <span style={{ color: '#faad14' }}> → {plugin.latestVersion}</span>
                        )}
                      </span>
                      {plugin.installedAt && (
                        <span style={{ color: '#999' }}>
                          Installed: {new Date(plugin.installedAt).toLocaleDateString()}
                        </span>
                      )}
                      {plugin.dependencies && Object.keys(plugin.dependencies).length > 0 && (
                        <span style={{ color: '#999' }}>
                          Dependencies: {Object.keys(plugin.dependencies).length}
                        </span>
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
);

export default LocalPluginsView;
