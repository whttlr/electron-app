// Mock machine state and configuration for testing

export interface MockMachineState {
  position: { x: number; y: number; z: number };
  isConnected: boolean;
  status: 'idle' | 'running' | 'error' | 'emergency_stop';
  speed: number;
  feedRate: number;
}

export interface MockMachineConfig {
  port: string;
  baudRate: number;
  workArea: { x: number; y: number; z: number };
  maxSpeed: number;
  acceleration: number;
  units: 'metric' | 'imperial';
}

export const mockMachineState: MockMachineState = {
  position: { x: 0, y: 0, z: 0 },
  isConnected: false,
  status: 'idle',
  speed: 1000,
  feedRate: 1000,
};

export const mockMachineConfig: MockMachineConfig = {
  port: '/dev/ttyUSB0',
  baudRate: 115200,
  workArea: { x: 300, y: 200, z: 50 },
  maxSpeed: 5000,
  acceleration: 1000,
  units: 'metric',
};

export const createMockMachineState = (overrides: Partial<MockMachineState> = {}): MockMachineState => ({
  ...mockMachineState,
  ...overrides,
});

export const createMockMachineConfig = (overrides: Partial<MockMachineConfig> = {}): MockMachineConfig => ({
  ...mockMachineConfig,
  ...overrides,
});

// Mock machine controller for testing
export class MockMachineController {
  private state: MockMachineState;

  private config: MockMachineConfig;

  constructor(config: MockMachineConfig = mockMachineConfig) {
    this.config = { ...config };
    this.state = { ...mockMachineState };
  }

  // Connection methods
  async connect(): Promise<void> {
    this.state.isConnected = true;
    this.state.status = 'idle';
  }

  async disconnect(): Promise<void> {
    this.state.isConnected = false;
    this.state.status = 'idle';
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  // State methods
  getCurrentPosition(): { x: number; y: number; z: number } {
    return { ...this.state.position };
  }

  updatePosition(position: { x: number; y: number; z: number }): void {
    if (!this.isPositionValid(position)) {
      throw new Error('Position exceeds work area bounds');
    }
    this.state.position = { ...position };
  }

  getState(): MockMachineState['status'] {
    return this.state.status;
  }

  getConfig(): MockMachineConfig {
    return { ...this.config };
  }

  // Safety methods
  emergencyStop(): void {
    this.state.status = 'emergency_stop';
  }

  isMoveSafe(targetPosition: { x: number; y: number; z: number }): boolean {
    return this.isPositionValid(targetPosition);
  }

  private isPositionValid(position: { x: number; y: number; z: number }): boolean {
    const { workArea } = this.config;
    return (
      position.x >= -workArea.x / 2 && position.x <= workArea.x / 2
      && position.y >= -workArea.y / 2 && position.y <= workArea.y / 2
      && position.z >= 0 && position.z <= workArea.z
    );
  }

  // Movement methods
  async moveAbsolute(position: { x: number; y: number; z: number }): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Machine not connected');
    }
    if (!this.isMoveSafe(position)) {
      throw new Error('Unsafe move detected');
    }
    this.state.status = 'running';
    this.updatePosition(position);
    this.state.status = 'idle';
  }

  async moveRelative(delta: { x: number; y: number; z: number }): Promise<void> {
    const newPosition = {
      x: this.state.position.x + delta.x,
      y: this.state.position.y + delta.y,
      z: this.state.position.z + delta.z,
    };
    await this.moveAbsolute(newPosition);
  }

  // Speed control
  setSpeed(speed: number): void {
    if (speed < 0 || speed > this.config.maxSpeed) {
      throw new Error('Speed out of valid range');
    }
    this.state.speed = speed;
  }

  getSpeed(): number {
    return this.state.speed;
  }
}

export default MockMachineController;
