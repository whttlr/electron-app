/**
 * Mock API Client for Testing
 */

export const mockApiClient = {
  baseUrl: 'http://localhost:3000',
  ready: true,
  
  initialize: jest.fn().mockResolvedValue(undefined),
  
  request: jest.fn().mockResolvedValue({
    success: true,
    data: {},
    timestamp: new Date().toISOString(),
  }),
  
  getConnectionStatus: jest.fn().mockResolvedValue({
    connected: false,
    port: null,
    baudRate: null,
  }),
  
  connect: jest.fn().mockResolvedValue({
    success: true,
    data: { connected: true, port: '/dev/ttyUSB0' },
  }),
  
  disconnect: jest.fn().mockResolvedValue({
    success: true,
    data: { connected: false },
  }),
  
  getMachineStatus: jest.fn().mockResolvedValue({
    state: 'Idle',
    position: { x: 0, y: 0, z: 0 },
    workOffset: { x: 0, y: 0, z: 0 },
  }),
  
  sendGcode: jest.fn().mockResolvedValue({
    success: true,
    data: { commandsExecuted: 1 },
  }),
  
  listSerialPorts: jest.fn().mockResolvedValue([
    { path: '/dev/ttyUSB0', manufacturer: 'FTDI' },
    { path: '/dev/ttyUSB1', manufacturer: 'CH340' },
  ]),
  
  uploadGcodeFile: jest.fn().mockResolvedValue({
    success: true,
    data: { filename: 'test.gcode', size: 1024 },
  }),
  
  healthCheck: jest.fn().mockResolvedValue({
    healthy: true,
  }),
  
  getBaseUrl: jest.fn().mockReturnValue('http://localhost:3000'),
  
  isReady: jest.fn().mockReturnValue(true),
};

export default mockApiClient;