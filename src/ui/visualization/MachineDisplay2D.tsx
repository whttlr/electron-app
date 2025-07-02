import React, { useRef, useEffect, useState } from 'react';
import {
  Card, Typography, Row, Col, Switch, Button,
} from 'antd';
import { AimOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Position {
  x: number;
  y: number;
  z: number;
}

interface MachineDisplay2DProps {
  currentPosition?: Position;
  workArea?: { x: number; y: number; z: number };
  showGrid?: boolean;
  showTrail?: boolean;
  onGridToggle?: (show: boolean) => void;
  onTrailToggle?: (show: boolean) => void;
  onSetOrigin?: () => void;
  onGoHome?: () => void;
}

const MachineDisplay2D: React.FC<MachineDisplay2DProps> = ({
  currentPosition = { x: 0, y: 0, z: 0 },
  workArea = { x: 300, y: 200, z: 50 },
  showGrid = true,
  showTrail = false,
  onGridToggle,
  onTrailToggle,
  onSetOrigin,
  onGoHome,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trail, setTrail] = useState<Position[]>([]);
  const [scale, setScale] = useState(1);

  // Add current position to trail
  useEffect(() => {
    if (showTrail) {
      setTrail((prev) => {
        const newTrail = [...prev, currentPosition];
        // Keep only last 100 points
        return newTrail.slice(-100);
      });
    } else {
      setTrail([]);
    }
  }, [currentPosition, showTrail]);

  // Calculate scale to fit work area in canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 40;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;

    const scaleX = availableWidth / workArea.x;
    const scaleY = availableHeight / workArea.y;

    setScale(Math.min(scaleX, scaleY));
  }, [workArea]);

  // Draw the 2D view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Transform coordinates (Y is inverted for screen coordinates)
    const toScreenX = (x: number) => centerX + (x * scale);
    const toScreenY = (y: number) => centerY - (y * scale);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;

      const gridSize = 10; // 10mm grid
      const workAreaLeft = -workArea.x / 2;
      const workAreaRight = workArea.x / 2;
      const workAreaTop = workArea.y / 2;
      const workAreaBottom = -workArea.y / 2;

      // Vertical grid lines
      for (let x = workAreaLeft; x <= workAreaRight; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(x), toScreenY(workAreaTop));
        ctx.lineTo(toScreenX(x), toScreenY(workAreaBottom));
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = workAreaBottom; y <= workAreaTop; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(workAreaLeft), toScreenY(y));
        ctx.lineTo(toScreenX(workAreaRight), toScreenY(y));
        ctx.stroke();
      }

      // Major grid lines (every 50mm)
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;

      const majorGridSize = 50;
      for (let x = workAreaLeft; x <= workAreaRight; x += majorGridSize) {
        if (x !== 0) {
          ctx.beginPath();
          ctx.moveTo(toScreenX(x), toScreenY(workAreaTop));
          ctx.lineTo(toScreenX(x), toScreenY(workAreaBottom));
          ctx.stroke();
        }
      }

      for (let y = workAreaBottom; y <= workAreaTop; y += majorGridSize) {
        if (y !== 0) {
          ctx.beginPath();
          ctx.moveTo(toScreenX(workAreaLeft), toScreenY(y));
          ctx.lineTo(toScreenX(workAreaRight), toScreenY(y));
          ctx.stroke();
        }
      }
    }

    // Draw work area boundary
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      toScreenX(-workArea.x / 2),
      toScreenY(workArea.y / 2),
      workArea.x * scale,
      workArea.y * scale,
    );

    // Draw coordinate axes
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;

    // X axis
    ctx.beginPath();
    ctx.moveTo(toScreenX(-workArea.x / 2), toScreenY(0));
    ctx.lineTo(toScreenX(workArea.x / 2), toScreenY(0));
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(-workArea.y / 2));
    ctx.lineTo(toScreenX(0), toScreenY(workArea.y / 2));
    ctx.stroke();

    // Draw origin marker
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(toScreenX(0), toScreenY(0), 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw trail
    if (showTrail && trail.length > 1) {
      ctx.strokeStyle = '#52c41a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toScreenX(trail[0].x), toScreenY(trail[0].y));

      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(toScreenX(trail[i].x), toScreenY(trail[i].y));
      }
      ctx.stroke();
    }

    // Draw current position
    const currentX = toScreenX(currentPosition.x);
    const currentY = toScreenY(currentPosition.y);

    // Tool position circle
    ctx.fillStyle = '#1890ff';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Tool crosshairs
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(currentX - 10, currentY);
    ctx.lineTo(currentX + 10, currentY);
    ctx.moveTo(currentX, currentY - 10);
    ctx.lineTo(currentX, currentY + 10);
    ctx.stroke();

    // Draw position labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // Origin label
    ctx.fillText('(0,0)', toScreenX(0) + 15, toScreenY(0) - 10);

    // Current position label
    ctx.fillText(
      `(${currentPosition.x.toFixed(1)}, ${currentPosition.y.toFixed(1)})`,
      currentX,
      currentY - 15,
    );

    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText('X', toScreenX(workArea.x / 2) - 10, toScreenY(0) + 20);
    ctx.fillText('Y', toScreenX(0) + 15, toScreenY(workArea.y / 2) + 5);
  }, [currentPosition, workArea, scale, showGrid, showTrail, trail]);

  return (
    <Card title="2D Working Area View" size="small">
      <div style={{ marginBottom: '12px' }}>
        <Row gutter={[8, 8]} align="middle">
          <Col span={6}>
            <Text strong>Grid:</Text>
            <Switch
              size="small"
              checked={showGrid}
              onChange={onGridToggle}
              style={{ marginLeft: '4px' }}
            />
          </Col>
          <Col span={6}>
            <Text strong>Trail:</Text>
            <Switch
              size="small"
              checked={showTrail}
              onChange={onTrailToggle}
              style={{ marginLeft: '4px' }}
            />
          </Col>
          <Col span={6}>
            <Button
              size="small"
              icon={<AimOutlined />}
              onClick={onSetOrigin}
            >
              Set Origin
            </Button>
          </Col>
          <Col span={6}>
            <Button
              size="small"
              icon={<HomeOutlined />}
              onClick={onGoHome}
            >
              Go Home
            </Button>
          </Col>
        </Row>
      </div>

      <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          style={{
            width: '100%',
            height: '300px',
            background: '#fafafa',
          }}
        />
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        <Row gutter={16}>
          <Col span={6}>X: {currentPosition.x.toFixed(2)}mm</Col>
          <Col span={6}>Y: {currentPosition.y.toFixed(2)}mm</Col>
          <Col span={6}>Z: {currentPosition.z.toFixed(2)}mm</Col>
          <Col span={6}>Scale: {(scale * 100).toFixed(0)}%</Col>
        </Row>
      </div>
    </Card>
  );
};

export default MachineDisplay2D;
