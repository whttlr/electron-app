import '@testing-library/jest-dom';

// Mock Three.js for testing
jest.mock('three', () => ({
  ...jest.requireActual('three'),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  PerspectiveCamera: jest.fn(),
  Scene: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn()
}));

// Mock @react-three/fiber for testing
jest.mock('@react-three/fiber', () => ({
  Canvas: jest.fn(({ children }) => children),
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: {},
    scene: {},
    gl: {}
  }))
}));

// Mock @react-three/drei for testing
jest.mock('@react-three/drei', () => ({
  OrbitControls: jest.fn(() => null),
  Box: jest.fn(() => null),
  Line: jest.fn(() => null)
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});