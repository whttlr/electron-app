import React from 'react';
import { Card, Row, Col, Input, Select, Spin, List, Space, Button, Tag, Rate, Tooltip, Avatar, Text } from 'antd';
import { SearchOutlined, DownloadOutlined, GlobalOutlined, AppstoreOutlined, UserOutlined, ClockCircleOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';

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

interface MarketplaceViewProps {
  marketplacePlugins: MarketplacePlugin[];
  marketplaceLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setMarketplacePlugins: React.Dispatch<React.SetStateAction<MarketplacePlugin[]>>;
  handleMarketplaceSearch: (query: string) => Promise<void>;
  installMarketplacePlugin: (plugin: MarketplacePlugin) => Promise<void>;
  getFilteredMarketplacePlugins: () => MarketplacePlugin[];
  formatDownloads: (downloads: number) => string;
  isPluginInstalled: (plugin: MarketplacePlugin) => boolean;
  getTypeColor: (type: string) => string;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  marketplacePlugins,
  marketplaceLoading,
  searchQuery,
  selectedCategory,
  setSearchQuery,
  setSelectedCategory,
  setMarketplacePlugins,
  handleMarketplaceSearch,
  installMarketplacePlugin,
  getFilteredMarketplacePlugins,
  formatDownloads,
  isPluginInstalled,
  getTypeColor,
}) => {
  return (
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
      <Card 
        title="Available Plugins" 
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                setMarketplacePlugins([]);
                // This will trigger the useEffect to reload plugins
              }}
              loading={marketplaceLoading}
            >
              Refresh
            </Button>
            <GlobalOutlined />
          </Space>
        }
      >
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
  );
};

export default MarketplaceView;