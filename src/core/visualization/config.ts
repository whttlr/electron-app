/**
 * Visualization Module Configuration
 */

export const visualizationConfig = {
  // 3D rendering settings
  threeDimensions: {
    // Camera settings
    camera: {
      position: { x: 200, y: 200, z: 200 },
      target: { x: 0, y: 0, z: 0 },
      fov: 50,
      near: 0.1,
      far: 2000,
    },
    // Lighting
    lighting: {
      ambient: {
        color: '#404040',
        intensity: 0.6,
      },
      directional: {
        color: '#ffffff',
        intensity: 1,
        position: { x: 100, y: 100, z: 50 },
        castShadow: true,
      },
    },
    // Rendering quality
    renderer: {
      antialias: true,
      shadows: true,
      shadowMapSize: 2048,
      pixelRatio: window.devicePixelRatio || 1,
    },
    // Controls
    controls: {
      enablePan: true,
      enableZoom: true,
      enableRotate: true,
      autoRotate: false,
      autoRotateSpeed: 0.5,
    },
  },

  // 2D rendering settings
  twoDimensions: {
    // View settings
    view: {
      defaultZoom: 1,
      minZoom: 0.1,
      maxZoom: 10,
      enablePanning: true,
    },
    // Grid settings
    grid: {
      enabled: true,
      spacing: 10,
      color: '#e0e0e0',
      thickness: 1,
    },
    // Coordinate display
    coordinates: {
      showAxes: true,
      showLabels: true,
      axisColor: '#333333',
      labelColor: '#666666',
    },
  },

  // Machine visualization
  machine: {
    // Machine model display
    showMachine: true,
    machineColor: '#888888',
    machineOpacity: 0.8,
    // Tool visualization
    tool: {
      showTool: true,
      toolColor: '#FF4444',
      toolSize: 6, // mm diameter
      showTooltip: true,
    },
    // Working area
    workingArea: {
      showBounds: true,
      boundsColor: '#FF0000',
      boundsOpacity: 0.3,
      showGrid: true,
    },
  },

  // Animation settings
  animation: {
    // Enable smooth transitions
    enableTransitions: true,
    // Transition duration (ms)
    transitionDuration: 300,
    // Animation easing
    easing: 'easeInOut',
    // Path animation
    pathAnimation: {
      enabled: true,
      speed: 1000, // mm/min
      showProgress: true,
    },
  },

  // Performance settings
  performance: {
    // Frame rate limiting
    maxFPS: 60,
    // Level of detail
    lodEnabled: true,
    lodDistance: 500,
    // Culling
    frustumCulling: true,
    // Update frequency
    updateFrequency: 30, // Hz
  },
} as const;

export type VisualizationConfig = typeof visualizationConfig;