// Jest setup file for testing
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required for react-router-dom)
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress specific console warnings/errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is deprecated')
      || args[0]?.includes?.('Warning: React.createElement: type is invalid')
      || args[0]?.includes?.('Warning: Failed prop type')
      || args[0]?.includes?.('Warning: <ambientLight />')
      || args[0]?.includes?.('Warning: The tag <ambientLight>')
      || args[0]?.includes?.('Warning: <pointLight />')
      || args[0]?.includes?.('Warning: The tag <pointLight>')
      || args[0]?.includes?.('Warning: <directionalLight />')
      || args[0]?.includes?.('Warning: The tag <directionalLight>')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
