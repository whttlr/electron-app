import React from 'react';
import { Card, Row, Col, Typography, Button, Space, Divider } from 'antd';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import { DebugPanelProps } from './SharedTypes';
import { SectionHeader } from './SectionHeader';

const { Text } = Typography;

export const DebugPanel: React.FC<DebugPanelProps> = ({
  title,
  data,
  visible,
  onClose
}) => {
  if (!visible) return null;

  const renderValue = (key: string, value: any): React.ReactNode => {
    if (typeof value === 'object' && value !== null) {
      return (
        <pre style={{
          background: '#f0f0f0',
          padding: '8px',
          borderRadius: '4px',
          overflowX: 'auto',
          fontSize: '12px',
          margin: 0
        }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    if (typeof value === 'number') {
      return value.toFixed(3);
    }

    return String(value);
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader title={title} />
          <Button
            type="text"
            icon={<EyeInvisibleOutlined />}
            onClick={onClose}
            style={{ color: '#1890ff' }}
          />
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(data).map(([key, value]) => (
            <Row key={key} gutter={[16, 8]}>
              <Col span={8}>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>
              </Col>
              <Col span={16}>
                {renderValue(key, value)}
              </Col>
            </Row>
          ))}
        </Space>
      </Space>
    </Card>
  );
};