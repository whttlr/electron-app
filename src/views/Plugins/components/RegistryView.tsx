import React from 'react';
import { Card, Row, Col, Typography, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Plugin } from '../../../services/plugin';

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

interface RegistryViewProps {
  plugins: Plugin[];
  marketplacePlugins: MarketplacePlugin[];
}

const RegistryView: React.FC<RegistryViewProps> = ({
  plugins,
  marketplacePlugins,
}) => {
  return (
    <div>
      <Card title="Plugin Registry" style={{ marginTop: '20px' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={4}>Connected to Plugin Registry</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Automatically connected to the official whttlr plugin registry
          </Text>
          <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            https://github.com/whttlr/plugin-registry
          </Text>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {marketplacePlugins.length}
                </div>
                <Text type="secondary">Available Plugins</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {plugins.filter(p => p.source === 'registry').length}
                </div>
                <Text type="secondary">Installed from Registry</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {plugins.filter(p => p.source === 'local').length}
                </div>
                <Text type="secondary">Local Plugins</Text>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default RegistryView;