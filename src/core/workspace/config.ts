/**
 * Workspace Module Configuration
 */

export const workspaceConfig = {
  // Working area settings
  workingArea: {
    // Default dimensions (mm)
    defaultDimensions: {
      width: 300,
      height: 300,
      depth: 100,
    },
    // Grid settings
    grid: {
      enabled: true,
      spacing: 10, // mm
      majorLines: 50, // mm
      color: '#e0e0e0',
      majorColor: '#bdbdbd',
    },
    // Origin position
    origin: {
      x: 'left',   // left, center, right
      y: 'front',  // front, center, back
      z: 'bottom', // bottom, center, top
    },
  },

  // Material settings
  material: {
    // Default material thickness (mm)
    defaultThickness: 10,
    // Common material thicknesses (mm)
    commonThicknesses: [3, 6, 10, 12, 18, 25],
    // Material colors for visualization
    defaultColor: '#8B4513',
    transparentMode: false,
    opacity: 0.8,
  },

  // Tool settings
  tool: {
    // Default tool diameter (mm)
    defaultDiameter: 6,
    // Tool visualization
    showTool: true,
    showToolPath: true,
    toolColor: '#FF4444',
    toolPathColor: '#4444FF',
    // Tool length for visualization (mm)
    defaultLength: 50,
  },

  // Fixture and workholding
  fixtures: {
    // Show fixture visualization
    showFixtures: true,
    // Default fixture dimensions (mm)
    defaultFixtureSize: {
      width: 100,
      height: 100,
      thickness: 20,
    },
    fixtureColor: '#666666',
  },

  // Measurement and inspection
  measurement: {
    // Enable measurement tools
    enableMeasurement: true,
    // Measurement precision (decimal places)
    precision: 3,
    // Measurement units
    units: 'mm',
    // Show dimensions
    showDimensions: true,
  },
} as const;

export type WorkspaceConfig = typeof workspaceConfig;