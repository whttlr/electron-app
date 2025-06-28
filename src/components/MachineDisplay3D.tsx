import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box } from '@react-three/drei';
import * as THREE from 'three';

interface MachineDisplay3DProps {
  width?: number;
  height?: number;
  depth?: number;
  highlightAxis?: 'x' | 'y' | 'z' | null;
  toolPosition?: { x: number; y: number; z: number };
}

const StockBox: React.FC<{
  width: number;
  height: number;
  depth: number;
  highlightAxis?: 'x' | 'y' | 'z' | null;
}> = ({ width, height, depth, highlightAxis }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const getColor = () => {
    switch (highlightAxis) {
      case 'x': return '#ff4d4f';
      case 'y': return '#52c41a';
      case 'z': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  return (
    <Box
      ref={meshRef}
      args={[width * 0.01, height * 0.01, depth * 0.01]}
      position={[0, 0, 0]}
    >
      <meshStandardMaterial 
        color={getColor()} 
        transparent 
        opacity={0.7}
        wireframe={false}
      />
    </Box>
  );
};

const MachineBoundary: React.FC<{
  width: number;
  height: number;
  depth: number;
}> = ({ width, height, depth }) => {
  return (
    <Box
      args={[width * 0.01, height * 0.01, depth * 0.01]}
      position={[0, 0, 0]}
    >
      <meshBasicMaterial 
        color="#666666" 
        wireframe 
        transparent 
        opacity={0.3}
      />
    </Box>
  );
};

const ToolPosition: React.FC<{
  position: { x: number; y: number; z: number };
}> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime();
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position.x * 0.01, position.z * 0.01, -position.y * 0.01]}
    >
      <cylinderGeometry args={[0.02, 0.02, 0.1]} />
      <meshStandardMaterial color="#ff7f00" />
    </mesh>
  );
};

const Scene: React.FC<{
  width: number;
  height: number;
  depth: number;
  highlightAxis?: 'x' | 'y' | 'z' | null;
  toolPosition: { x: number; y: number; z: number };
}> = ({ width, height, depth, highlightAxis, toolPosition }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />

      {/* Grid */}
      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={10}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Machine boundary */}
      <MachineBoundary width={width} height={height} depth={depth} />

      {/* Stock material */}
      <StockBox 
        width={width * 0.6} 
        height={height * 0.6} 
        depth={depth * 0.6} 
        highlightAxis={highlightAxis}
      />

      {/* Tool position */}
      <ToolPosition position={toolPosition} />

      {/* Axes helper */}
      <axesHelper args={[2]} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={20}
      />
    </>
  );
};

export const MachineDisplay3D: React.FC<MachineDisplay3DProps> = ({
  width = 200,
  height = 200,
  depth = 100,
  highlightAxis = null,
  toolPosition = { x: 0, y: 0, z: 0 }
}) => {
  return (
    <div style={{ width: '100%', height: '400px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <Scene
          width={width}
          height={height}
          depth={depth}
          highlightAxis={highlightAxis}
          toolPosition={toolPosition}
        />
      </Canvas>
    </div>
  );
};

export default MachineDisplay3D;