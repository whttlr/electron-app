import React from 'react';
import { Button, Space } from 'antd';
import { 
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { AxisControlProps } from './ControlTypes';

const AxisControl: React.FC<AxisControlProps> = ({
  axis,
  label,
  color,
  onJog,
  disabled = false,
  onHighlight,
  onClearHighlight
}) => {
  const getIcons = () => {
    switch (axis) {
      case 'x':
        return [<ArrowLeftOutlined key="neg" />, <ArrowRightOutlined key="pos" />];
      case 'y':
        return [<ArrowDownOutlined key="neg" />, <ArrowUpOutlined key="pos" />];
      case 'z':
        return [<VerticalAlignBottomOutlined key="neg" />, <VerticalAlignTopOutlined key="pos" />];
      default:
        return [<ArrowLeftOutlined key="neg" />, <ArrowRightOutlined key="pos" />];
    }
  };

  const icons = getIcons();

  return (
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <div style={{ color, fontWeight: 'bold', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <Button
          icon={icons[0]}
          onClick={() => onJog(-1)}
          disabled={disabled}
          style={{ borderColor: color }}
          size="large"
          onMouseEnter={onHighlight}
          onMouseLeave={onClearHighlight}
        />
        <Button
          icon={icons[1]}
          onClick={() => onJog(1)}
          disabled={disabled}
          style={{ borderColor: color }}
          size="large"
          onMouseEnter={onHighlight}
          onMouseLeave={onClearHighlight}
        />
      </div>
    </Space>
  );
};

export interface HomeControlProps {
  onHome: () => void;
  disabled?: boolean;
}

export const HomeControl: React.FC<HomeControlProps> = ({ onHome, disabled = false }) => (
  <Space direction="vertical" align="center" style={{ width: '100%' }}>
    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Home</div>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        type="primary"
        icon={<HomeOutlined />}
        onClick={onHome}
        disabled={disabled}
        size="large"
      />
    </div>
  </Space>
);

export default AxisControl;