/**
 * WorkspaceController - Working area and dimensions management
 *
 * This controller manages the workspace boundaries, material settings,
 * fixture management, and measurement tools for the CNC working area.
 */

import { workspaceConfig, type WorkspaceConfig } from './config';

// Workspace types and interfaces
export interface WorkspaceDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface WorkspaceOrigin {
  x: 'left' | 'center' | 'right';
  y: 'front' | 'center' | 'back';
  z: 'bottom' | 'center' | 'top';
}

export interface Material {
  id: string;
  name: string;
  thickness: number;
  color: string;
  opacity: number;
  dimensions: WorkspaceDimensions;
  position: { x: number; y: number; z: number };
  properties: {
    density?: number;
    hardness?: string;
    type: 'wood' | 'metal' | 'plastic' | 'composite' | 'other';
    notes?: string;
  };
}

export interface Fixture {
  id: string;
  name: string;
  type: 'clamp' | 'vise' | 'jig' | 'custom';
  position: { x: number; y: number; z: number };
  dimensions: WorkspaceDimensions;
  color: string;
  isActive: boolean;
  constraints: {
    blocksMaterial: boolean;
    blocksToolPath: boolean;
    safetyZone: number; // mm clearance required
  };
}

export interface Tool {
  id: string;
  name: string;
  type: 'endmill' | 'drill' | 'router' | 'custom';
  diameter: number;
  length: number;
  stickout: number; // length beyond holder
  color: string;
  position: { x: number; y: number; z: number };
  isActive: boolean;
  specifications: {
    flutes?: number;
    coating?: string;
    material?: string;
    maxRpm?: number;
    maxFeedRate?: number;
  };
}

export interface WorkspaceGrid {
  enabled: boolean;
  spacing: number;
  majorLineSpacing: number;
  color: string;
  majorColor: string;
  opacity: number;
  showLabels: boolean;
}

export interface MeasurementTool {
  id: string;
  type: 'distance' | 'angle' | 'area' | 'volume';
  points: Array<{ x: number; y: number; z: number }>;
  result: number;
  units: string;
  label: string;
  color: string;
  visible: boolean;
  timestamp: Date;
}

export interface WorkspaceState {
  // Physical workspace
  dimensions: WorkspaceDimensions;
  origin: WorkspaceOrigin;

  // Grid and visual aids
  grid: WorkspaceGrid;
  showAxes: boolean;
  showDimensions: boolean;

  // Materials
  materials: Material[];
  activeMaterial: string | null;

  // Fixtures and workholding
  fixtures: Fixture[];

  // Tools
  tools: Tool[];
  activeTool: string | null;

  // Measurements
  measurements: MeasurementTool[];
  measurementMode: boolean;

  // Workspace bounds and safety
  bounds: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };

  // Collision detection
  collisionDetection: {
    enabled: boolean;
    safetyMargin: number;
    checkFixtures: boolean;
    checkMaterial: boolean;
  };

  // Visualization settings
  visualization: {
    showMaterial: boolean;
    showFixtures: boolean;
    showGrid: boolean;
    showBounds: boolean;
    transparency: number;
  };

  // Units and precision
  units: 'mm' | 'inch';
  precision: number;
}

// Event types for workspace
export type WorkspaceEvent =
  | { type: 'dimensions_changed'; data: { dimensions: WorkspaceDimensions } }
  | { type: 'material_added'; data: { material: Material } }
  | { type: 'material_removed'; data: { materialId: string } }
  | { type: 'fixture_added'; data: { fixture: Fixture } }
  | { type: 'fixture_removed'; data: { fixtureId: string } }
  | { type: 'tool_changed'; data: { tool: Tool } }
  | { type: 'measurement_added'; data: { measurement: MeasurementTool } }
  | { type: 'collision_detected'; data: { type: string; objects: string[] } }
  | { type: 'bounds_exceeded'; data: { axis: string; value: number; limit: number } };

export type WorkspaceEventHandler = (event: WorkspaceEvent) => void;

/**
 * WorkspaceController - Main workspace management interface
 */
export class WorkspaceController {
  private state: WorkspaceState;

  private config: WorkspaceConfig;

  private eventHandlers: Map<string, Set<WorkspaceEventHandler>> = new Map();

  private isInitialized = false;

  constructor(config: WorkspaceConfig = workspaceConfig) {
    this.config = config;
    this.state = this.createInitialState();
    this.initializeEventHandlers();
  }

  /**
   * Initialize the workspace controller
   */
  async initialize(): Promise<void> {
    try {
      // Set up default workspace
      this.setupDefaultWorkspace();

      // Initialize collision detection
      this.initializeCollisionDetection();

      this.isInitialized = true;
      console.log('WorkspaceController initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WorkspaceController:', error);
      throw error;
    }
  }

  /**
   * Set workspace dimensions
   */
  setDimensions(dimensions: WorkspaceDimensions): void {
    this.state.dimensions = { ...dimensions };

    // Update bounds based on origin
    this.updateWorkspaceBounds();

    // Emit dimensions changed event
    this.emit('dimensions_changed', { dimensions });

    console.log(`Workspace dimensions set to: ${dimensions.width}x${dimensions.height}x${dimensions.depth}mm`);
  }

  /**
   * Set workspace origin
   */
  setOrigin(origin: WorkspaceOrigin): void {
    this.state.origin = { ...origin };

    // Update bounds based on new origin
    this.updateWorkspaceBounds();

    console.log(`Workspace origin set to: ${origin.x}, ${origin.y}, ${origin.z}`);
  }

  /**
   * Add material to workspace
   */
  addMaterial(material: Omit<Material, 'id'>): string {
    const newMaterial: Material = {
      id: this.generateId('material'),
      ...material,
    };

    this.state.materials.push(newMaterial);

    // Set as active if it's the first material
    if (this.state.materials.length === 1) {
      this.state.activeMaterial = newMaterial.id;
    }

    // Check for collisions
    this.checkCollisions();

    // Emit material added event
    this.emit('material_added', { material: newMaterial });

    return newMaterial.id;
  }

  /**
   * Remove material from workspace
   */
  removeMaterial(materialId: string): boolean {
    const index = this.state.materials.findIndex((m) => m.id === materialId);
    if (index === -1) {
      return false;
    }

    this.state.materials.splice(index, 1);

    // Update active material if needed
    if (this.state.activeMaterial === materialId) {
      this.state.activeMaterial = this.state.materials.length > 0 ? this.state.materials[0].id : null;
    }

    // Emit material removed event
    this.emit('material_removed', { materialId });

    return true;
  }

  /**
   * Add fixture to workspace
   */
  addFixture(fixture: Omit<Fixture, 'id'>): string {
    const newFixture: Fixture = {
      id: this.generateId('fixture'),
      ...fixture,
    };

    this.state.fixtures.push(newFixture);

    // Check for collisions
    this.checkCollisions();

    // Emit fixture added event
    this.emit('fixture_added', { fixture: newFixture });

    return newFixture.id;
  }

  /**
   * Remove fixture from workspace
   */
  removeFixture(fixtureId: string): boolean {
    const index = this.state.fixtures.findIndex((f) => f.id === fixtureId);
    if (index === -1) {
      return false;
    }

    this.state.fixtures.splice(index, 1);

    // Emit fixture removed event
    this.emit('fixture_removed', { fixtureId });

    return true;
  }

  /**
   * Set active tool
   */
  setActiveTool(toolId: string): boolean {
    const tool = this.state.tools.find((t) => t.id === toolId);
    if (!tool) {
      return false;
    }

    // Deactivate other tools
    this.state.tools.forEach((t) => {
      t.isActive = t.id === toolId;
    });

    this.state.activeTool = toolId;

    // Emit tool changed event
    this.emit('tool_changed', { tool });

    return true;
  }

  /**
   * Add tool to workspace
   */
  addTool(tool: Omit<Tool, 'id'>): string {
    const newTool: Tool = {
      id: this.generateId('tool'),
      ...tool,
    };

    this.state.tools.push(newTool);

    // Set as active if it's the first tool
    if (this.state.tools.length === 1) {
      this.setActiveTool(newTool.id);
    }

    return newTool.id;
  }

  /**
   * Update tool position
   */
  updateToolPosition(toolId: string, position: { x: number; y: number; z: number }): boolean {
    const tool = this.state.tools.find((t) => t.id === toolId);
    if (!tool) {
      return false;
    }

    tool.position = { ...position };

    // Check for collisions
    this.checkCollisions();

    // Emit tool changed event
    this.emit('tool_changed', { tool });

    return true;
  }

  /**
   * Add measurement
   */
  addMeasurement(measurement: Omit<MeasurementTool, 'id' | 'timestamp'>): string {
    const newMeasurement: MeasurementTool = {
      id: this.generateId('measurement'),
      timestamp: new Date(),
      ...measurement,
    };

    this.state.measurements.push(newMeasurement);

    // Emit measurement added event
    this.emit('measurement_added', { measurement: newMeasurement });

    return newMeasurement.id;
  }

  /**
   * Remove measurement
   */
  removeMeasurement(measurementId: string): boolean {
    const index = this.state.measurements.findIndex((m) => m.id === measurementId);
    if (index === -1) {
      return false;
    }

    this.state.measurements.splice(index, 1);
    return true;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1: { x: number; y: number; z: number }, point2: { x: number; y: number; z: number }): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check if point is within workspace bounds
   */
  isWithinBounds(point: { x: number; y: number; z: number }): boolean {
    const { min, max } = this.state.bounds;

    return point.x >= min.x && point.x <= max.x
           && point.y >= min.y && point.y <= max.y
           && point.z >= min.z && point.z <= max.z;
  }

  /**
   * Check if position would collide with fixtures or material
   */
  checkCollisionAtPosition(position: { x: number; y: number; z: number }, toolDiameter: number = 6): boolean {
    if (!this.state.collisionDetection.enabled) {
      return false;
    }

    const toolRadius = toolDiameter / 2;

    // Check fixture collisions
    if (this.state.collisionDetection.checkFixtures) {
      for (const fixture of this.state.fixtures) {
        if (!fixture.isActive) continue;

        if (this.isPositionInBounds(position, toolRadius, fixture.position, fixture.dimensions)) {
          return true;
        }
      }
    }

    // Check material collisions
    if (this.state.collisionDetection.checkMaterial) {
      for (const material of this.state.materials) {
        if (this.isPositionInBounds(position, toolRadius, material.position, material.dimensions)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get workspace state
   */
  getState(): Readonly<WorkspaceState> {
    return { ...this.state };
  }

  /**
   * Get workspace dimensions
   */
  getDimensions(): Readonly<WorkspaceDimensions> {
    return { ...this.state.dimensions };
  }

  /**
   * Get active material
   */
  getActiveMaterial(): Material | null {
    if (!this.state.activeMaterial) return null;
    return this.state.materials.find((m) => m.id === this.state.activeMaterial) || null;
  }

  /**
   * Get active tool
   */
  getActiveTool(): Tool | null {
    if (!this.state.activeTool) return null;
    return this.state.tools.find((t) => t.id === this.state.activeTool) || null;
  }

  /**
   * Update grid settings
   */
  updateGrid(gridSettings: Partial<WorkspaceGrid>): void {
    this.state.grid = { ...this.state.grid, ...gridSettings };
  }

  /**
   * Update visualization settings
   */
  updateVisualization(settings: Partial<WorkspaceState['visualization']>): void {
    this.state.visualization = { ...this.state.visualization, ...settings };
  }

  /**
   * Event subscription methods
   */
  on(event: string, handler: WorkspaceEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: WorkspaceEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    // Clear event handlers
    this.eventHandlers.clear();

    // Reset state
    this.state.measurements = [];
    this.state.materials = [];
    this.state.fixtures = [];
    this.state.tools = [];

    this.isInitialized = false;
    console.log('WorkspaceController disposed');
  }

  // Private methods

  private createInitialState(): WorkspaceState {
    return {
      dimensions: { ...this.config.workingArea.defaultDimensions },
      origin: { ...this.config.workingArea.origin },
      grid: {
        enabled: this.config.workingArea.grid.enabled,
        spacing: this.config.workingArea.grid.spacing,
        majorLineSpacing: this.config.workingArea.grid.majorLines,
        color: this.config.workingArea.grid.color,
        majorColor: this.config.workingArea.grid.majorColor,
        opacity: 1,
        showLabels: true,
      },
      showAxes: true,
      showDimensions: this.config.measurement.showDimensions,
      materials: [],
      activeMaterial: null,
      fixtures: [],
      tools: [],
      activeTool: null,
      measurements: [],
      measurementMode: false,
      bounds: {
        min: { x: 0, y: 0, z: 0 },
        max: {
          x: this.config.workingArea.defaultDimensions.width,
          y: this.config.workingArea.defaultDimensions.height,
          z: this.config.workingArea.defaultDimensions.depth,
        },
      },
      collisionDetection: {
        enabled: true,
        safetyMargin: 5,
        checkFixtures: true,
        checkMaterial: false,
      },
      visualization: {
        showMaterial: true,
        showFixtures: this.config.fixtures.showFixtures,
        showGrid: this.config.workingArea.grid.enabled,
        showBounds: true,
        transparency: 0.8,
      },
      units: this.config.measurement.units,
      precision: this.config.measurement.precision,
    };
  }

  private initializeEventHandlers(): void {
    const events = ['dimensions_changed', 'material_added', 'material_removed', 'fixture_added',
      'fixture_removed', 'tool_changed', 'measurement_added', 'collision_detected', 'bounds_exceeded'];
    events.forEach((event) => {
      this.eventHandlers.set(event, new Set());
    });
  }

  private setupDefaultWorkspace(): void {
    // Add default tool
    this.addTool({
      name: 'Default End Mill',
      type: 'endmill',
      diameter: this.config.tool.defaultDiameter,
      length: this.config.tool.defaultLength,
      stickout: this.config.tool.defaultLength * 0.7,
      color: this.config.tool.toolColor,
      position: { x: 0, y: 0, z: 0 },
      isActive: true,
      specifications: {
        flutes: 2,
        material: 'carbide',
        maxRpm: 20000,
        maxFeedRate: 2000,
      },
    });

    // Set initial bounds
    this.updateWorkspaceBounds();
  }

  private initializeCollisionDetection(): void {
    // Set up collision detection parameters
    this.state.collisionDetection.enabled = true;
    console.log('Collision detection initialized');
  }

  private updateWorkspaceBounds(): void {
    const { dimensions, origin } = this.state;

    // Calculate bounds based on origin
    let minX = 0; let
      maxX = dimensions.width;
    let minY = 0; let
      maxY = dimensions.height;
    let minZ = 0; let
      maxZ = dimensions.depth;

    // Adjust for origin
    if (origin.x === 'center') {
      minX = -dimensions.width / 2;
      maxX = dimensions.width / 2;
    } else if (origin.x === 'right') {
      minX = -dimensions.width;
      maxX = 0;
    }

    if (origin.y === 'center') {
      minY = -dimensions.height / 2;
      maxY = dimensions.height / 2;
    } else if (origin.y === 'back') {
      minY = -dimensions.height;
      maxY = 0;
    }

    if (origin.z === 'center') {
      minZ = -dimensions.depth / 2;
      maxZ = dimensions.depth / 2;
    } else if (origin.z === 'top') {
      minZ = -dimensions.depth;
      maxZ = 0;
    }

    this.state.bounds = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    };
  }

  private checkCollisions(): void {
    if (!this.state.collisionDetection.enabled) return;

    const collisions: string[] = [];

    // Check tool-fixture collisions
    const activeTool = this.getActiveTool();
    if (activeTool) {
      for (const fixture of this.state.fixtures) {
        if (!fixture.isActive) continue;

        if (this.checkCollisionAtPosition(activeTool.position, activeTool.diameter)) {
          collisions.push(`${activeTool.name} - ${fixture.name}`);
        }
      }
    }

    // Emit collision events
    if (collisions.length > 0) {
      this.emit('collision_detected', {
        type: 'tool-fixture',
        objects: collisions,
      });
    }
  }

  private isPositionInBounds(
    position: { x: number; y: number; z: number },
    radius: number,
    objectPosition: { x: number; y: number; z: number },
    objectDimensions: WorkspaceDimensions,
  ): boolean {
    const margin = this.state.collisionDetection.safetyMargin + radius;

    return position.x + margin >= objectPosition.x
           && position.x - margin <= objectPosition.x + objectDimensions.width
           && position.y + margin >= objectPosition.y
           && position.y - margin <= objectPosition.y + objectDimensions.height
           && position.z + margin >= objectPosition.z
           && position.z - margin <= objectPosition.z + objectDimensions.depth;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler({ type: event, data } as WorkspaceEvent);
        } catch (error) {
          console.error(`Error in workspace event handler for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const workspaceController = new WorkspaceController();
