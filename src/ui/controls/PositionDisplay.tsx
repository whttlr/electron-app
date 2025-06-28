import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { PositionDisplayProps } from './ControlTypes';
import { AXIS_COLORS } from '../theme/constants';

const { Text } = Typography;

const PositionDisplay: React.FC<PositionDisplayProps> = ({
  position,
  unit,
  precision = 3,
  showLabels = true,
  highlightedAxis = null
}) => {
  const formatValue = (value: number): string => {
    return value.toFixed(precision);
  };

  const getAxisStyle = (axis: keyof typeof position) => ({
    color: highlightedAxis === axis ? AXIS_COLORS[axis] : undefined,
    fontWeight: highlightedAxis === axis ? 'bold' : 'normal',
    transition: 'all 0.2s ease'
  });

  return (
    <Card size="small" title={showLabels ? "Current Position" : undefined}>
      <Row gutter={[16, 8]} align="middle">
        <Col span={8}>
          <Text strong style={getAxisStyle('x')}>
            X: {formatValue(position.x)} {unit}
          </Text>
        </Col>
        <Col span={8}>
          <Text strong style={getAxisStyle('y')}>
            Y: {formatValue(position.y)} {unit}
          </Text>
        </Col>
        <Col span={8}>
          <Text strong style={getAxisStyle('z')}>
            Z: {formatValue(position.z)} {unit}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

export default PositionDisplay;