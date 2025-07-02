import React, { useRef, useState } from 'react';
import {
  Card, Switch, Typography, Row, Col, Slider,
} from 'antd';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls, Grid, Box, Text,
} from '@react-three/drei';
import * as THREE from 'three';

const { Title, Text: AntText } = Typography;

interface Position {
  x: number;
  y: number;
  z: number;
}

interface WorkingAreaPreviewProps {
  currentPosition?: Position;
  workArea?: { x: number; y: number; z: number };
  showGrid?: boolean;
  onGridToggle?: (show: boolean) => void;
}

// Moving tool component
const Tool: React.FC<{ position: Position }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Add slight rotation animation
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[position.x / 10, position.z / 10, -position.y / 10]}>
      {/* Tool holder */}
      <Box ref={meshRef} args={[0.5, 0.5, 2]} position={[0, 0, 1]}>
        <meshStandardMaterial color="#888888" />
      </Box>
      {/* Tool bit */}
      <Box args={[0.1, 0.1, 3]} position={[0, 0, -0.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      {/* Position indicator */}
      <Box args={[0.2, 0.2, 0.1]} position={[0, 0, -2]}>
        <meshStandardMaterial color="#ff4444" />
      </Box>
    </group>
  );
};

// Work area bounds
const WorkArea: React.FC<{ dimensions: { x: number; y: number; z: number } }> = ({ dimensions }) => (
    <group>
      {/* Work surface */}
      <Box args={[dimensions.x / 10, dimensions.y / 10, 0.1]} position={[0, 0, -dimensions.z / 20]}>
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
      </Box>

      {/* Work area outline */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(dimensions.x / 10, dimensions.y / 10, dimensions.z / 10)]}
        />
        <lineBasicMaterial color="#1890ff" />
      </lineSegments>
    </group>
);

const WorkingAreaPreview: React.FC<WorkingAreaPreviewProps> = ({
  currentPosition = { x: 0, y: 0, z: 0 },
  workArea = { x: 300, y: 200, z: 50 },
  showGrid = true,
  onGridToggle,
}) => {
  const [zoom, setZoom] = useState(1);

  return (
    <Card title="3D Working Area Preview" size="small">
      <div style={{ marginBottom: '12px' }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <AntText strong>Show Grid:</AntText>
            <Switch
              checked={showGrid}
              onChange={onGridToggle}
              style={{ marginLeft: '8px' }}
            />
          </Col>
          <Col span={16}>
            <AntText strong>Zoom:</AntText>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              style={{ marginLeft: '8px' }}
            />
          </Col>
        </Row>
      </div>

      <div style={{ height: '300px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
        <Canvas
          camera={{ position: [20, 20, 20], fov: 50 }}
          style={{ background: '#fafafa' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Grid */}
          {showGrid && (
            <Grid
              args={[30, 30]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#e0e0e0"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#cccccc"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={false}
            />
          )}

          {/* Work area */}
          <WorkArea dimensions={workArea} />

          {/* Current tool position */}
          <Tool position={currentPosition} />

          {/* Coordinate system origin */}
          <group>
            {/* X axis - Red */}
            <Box args={[5, 0.1, 0.1]} position={[2.5, 0, 0]}>
              <meshStandardMaterial color="#ff0000" />
            </Box>
            <Text
              position={[5.5, 0, 0]}
              fontSize={1}
              color="#ff0000"
              anchorX="center"
              anchorY="middle"
            >
              X
            </Text>

            {/* Y axis - Green */}
            <Box args={[0.1, 5, 0.1]} position={[0, 2.5, 0]}>
              <meshStandardMaterial color="#00ff00" />
            </Box>
            <Text
              position={[0, 5.5, 0]}
              fontSize={1}
              color="#00ff00"
              anchorX="center"
              anchorY="middle"
            >
              Y
            </Text>

            {/* Z axis - Blue */}
            <Box args={[0.1, 0.1, 3]} position={[0, 0, 1.5]}>
              <meshStandardMaterial color="#0000ff" />
            </Box>
            <Text
              position={[0, 0, 3.5]}
              fontSize={1}
              color="#0000ff"
              anchorX="center"
              anchorY="middle"
            >
              Z
            </Text>
          </group>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />
        </Canvas>
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        <Row gutter={16}>
          <Col span={8}>X: {currentPosition.x.toFixed(2)}mm</Col>
          <Col span={8}>Y: {currentPosition.y.toFixed(2)}mm</Col>
          <Col span={8}>Z: {currentPosition.z.toFixed(2)}mm</Col>
        </Row>
      </div>
    </Card>
  );
};

export default WorkingAreaPreview;
