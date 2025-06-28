import React from 'react';
import { Typography, Space, Button, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { SectionHeaderProps } from './SharedTypes';

const { Title } = Typography;

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  level = 4,
  helpTitle,
  helpContent,
  extra
}) => {
  return (
    <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space align="center">
        <Title level={level} style={{ margin: 0 }}>
          {title}
        </Title>
        {helpContent && (
          <Popover
            title={helpTitle || 'Help'}
            content={helpContent}
            trigger="hover"
            placement="right"
          >
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              size="small"
              style={{ color: '#1890ff' }}
            />
          </Popover>
        )}
      </Space>
      {extra && <div>{extra}</div>}
    </Space>
  );
};