/**
 * VisualizationController - 3D/2D rendering logic and scene management
 * 
 * This controller manages the visualization layer for the CNC interface,
 * including 3D scene management, 2D plotting, camera controls, and rendering optimizations.
 */

import { visualizationConfig, type VisualizationConfig } from './config';

// Visualization types and interfaces
export interface Camera3D {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
  zoom: number;
}

export interface Camera2D {
  position: { x: number; y: number };
  zoom: number;
  minZoom: number;
  maxZoom: number;
  panEnabled: boolean;
}

export interface Light {
  id: string;
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color: string;
  intensity: number;
  position?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  castShadow: boolean;
  enabled: boolean;
}

export interface SceneObject {
  id: string;
  type: 'machine' | 'tool' | 'material' | 'fixture' | 'grid' | 'axes' | 'path' | 'bounds';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  opacity: number;
  visible: boolean;
  geometry: {
    type: 'box' | 'cylinder' | 'sphere' | 'plane' | 'line' | 'custom';
    parameters: any;
  };
  material: {
    type: 'standard' | 'phong' | 'lambert' | 'basic' | 'line';
    properties: any;
  };
}

export interface ToolPath {
  id: string;
  name: string;
  points: Array<{ x: number; y: number; z: number; feedRate?: number }>;
  color: string;
  lineWidth: number;
  visible: boolean;
  animated: boolean;
  progress: number; // 0-1 for animation
}

export interface ViewportSettings {
  width: number;
  height: number;
  aspectRatio: number;
  pixelRatio: number;
  backgroundColor: string;
  antialias: boolean;
  shadows: boolean;
}

export interface RenderQuality {
  level: 'low' | 'medium' | 'high' | 'ultra';
  shadowMapSize: number;
  antialias: boolean;
  pixelRatio: number;
  maxFPS: number;
}

export interface VisualizationState {
  // View mode
  viewMode: '3D' | '2D' | 'dual';
  
  // Cameras
  camera3D: Camera3D;
  camera2D: Camera2D;
  
  // Scene objects
  objects: SceneObject[];
  
  // Lighting
  lights: Light[];
  
  // Tool paths
  toolPaths: ToolPath[];
  
  // Viewport settings
  viewport: ViewportSettings;
  
  // Render quality
  quality: RenderQuality;
  
  // Performance monitoring
  performance: {
    fps: number;
    frameTime: number;
    renderTime: number;
    triangleCount: number;
    drawCalls: number;
    memoryUsage: number;
  };
  
  // Animation
  animation: {
    enabled: boolean;
    speed: number;
    loop: boolean;
    currentFrame: number;
    totalFrames: number;
    isPlaying: boolean;
  };
  
  // Interaction
  interaction: {
    orbitControls: boolean;
    panEnabled: boolean;
    zoomEnabled: boolean;
    rotateEnabled: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
  };
  
  // Visibility toggles
  visibility: {
    grid: boolean;
    axes: boolean;
    bounds: boolean;
    machine: boolean;
    material: boolean;
    fixtures: boolean;
    toolPaths: boolean;
    shadows: boolean;
  };
}

// Event types for visualization
export type VisualizationEvent = 
  | { type: 'camera_changed'; data: { camera: Camera3D | Camera2D; viewMode: string } }
  | { type: 'object_added'; data: { object: SceneObject } }
  | { type: 'object_removed'; data: { objectId: string } }
  | { type: 'tool_path_updated'; data: { toolPath: ToolPath } }
  | { type: 'view_mode_changed'; data: { oldMode: string; newMode: string } }
  | { type: 'quality_changed'; data: { quality: RenderQuality } }
  | { type: 'performance_update'; data: { performance: VisualizationState['performance'] } }
  | { type: 'animation_state_changed'; data: { isPlaying: boolean; frame: number } };

export type VisualizationEventHandler = (event: VisualizationEvent) => void;

/**
 * VisualizationController - Main visualization management interface
 */
export class VisualizationController {
  private state: VisualizationState;
  private config: VisualizationConfig;
  private eventHandlers: Map<string, Set<VisualizationEventHandler>> = new Map();
  private animationTimer: NodeJS.Timeout | null = null;
  private performanceTimer: NodeJS.Timeout | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private isInitialized = false;

  constructor(config: VisualizationConfig = visualizationConfig) {
    this.config = config;
    this.state = this.createInitialState();
    this.initializeEventHandlers();
  }

  /**
   * Initialize the visualization controller
   */
  async initialize(): Promise<void> {
    try {
      // Set up default scene
      this.setupDefaultScene();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Initialize camera positions
      this.resetCamera();
      
      this.isInitialized = true;
      console.log('VisualizationController initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VisualizationController:', error);
      throw error;
    }
  }

  /**
   * Set view mode (3D, 2D, or dual)
   */
  setViewMode(mode: '3D' | '2D' | 'dual'): void {
    const oldMode = this.state.viewMode;
    this.state.viewMode = mode;
    
    // Adjust camera and scene based on mode
    this.adaptToViewMode(mode);
    
    // Emit view mode change event
    this.emit('view_mode_changed', { oldMode, newMode: mode });
    
    console.log(`View mode changed to: ${mode}`);
  }

  /**
   * Update 3D camera position
   */
  updateCamera3D(camera: Partial<Camera3D>): void {
    this.state.camera3D = { ...this.state.camera3D, ...camera };
    
    // Emit camera change event
    this.emit('camera_changed', { camera: this.state.camera3D, viewMode: '3D' });
  }

  /**
   * Update 2D camera position
   */
  updateCamera2D(camera: Partial<Camera2D>): void {
    this.state.camera2D = { ...this.state.camera2D, ...camera };
    
    // Emit camera change event
    this.emit('camera_changed', { camera: this.state.camera2D, viewMode: '2D' });
  }

  /**
   * Reset camera to default position
   */
  resetCamera(): void {
    if (this.state.viewMode === '3D') {
      this.state.camera3D = {
        position: { ...this.config.threeDimensions.camera.position },
        target: { ...this.config.threeDimensions.camera.target },
        up: { x: 0, y: 0, z: 1 },
        fov: this.config.threeDimensions.camera.fov,
        near: this.config.threeDimensions.camera.near,
        far: this.config.threeDimensions.camera.far,
        zoom: 1
      };
    } else {
      this.state.camera2D = {
        position: { x: 0, y: 0 },
        zoom: this.config.twoDimensions.view.defaultZoom,
        minZoom: this.config.twoDimensions.view.minZoom,
        maxZoom: this.config.twoDimensions.view.maxZoom,
        panEnabled: this.config.twoDimensions.view.enablePanning
      };
    }
  }

  /**
   * Add object to scene
   */
  addObject(object: Omit<SceneObject, 'id'>): string {
    const newObject: SceneObject = {
      id: this.generateId('object'),
      ...object
    };
    
    this.state.objects.push(newObject);
    
    // Emit object added event
    this.emit('object_added', { object: newObject });
    
    return newObject.id;
  }

  /**
   * Remove object from scene
   */
  removeObject(objectId: string): boolean {
    const index = this.state.objects.findIndex(obj => obj.id === objectId);
    if (index === -1) {
      return false;
    }
    
    this.state.objects.splice(index, 1);
    
    // Emit object removed event
    this.emit('object_removed', { objectId });
    
    return true;
  }

  /**
   * Update object properties
   */
  updateObject(objectId: string, updates: Partial<SceneObject>): boolean {
    const object = this.state.objects.find(obj => obj.id === objectId);
    if (!object) {
      return false;
    }
    
    Object.assign(object, updates);
    return true;
  }

  /**
   * Add tool path to visualization
   */
  addToolPath(toolPath: Omit<ToolPath, 'id'>): string {
    const newToolPath: ToolPath = {
      id: this.generateId('path'),
      ...toolPath
    };
    
    this.state.toolPaths.push(newToolPath);
    
    // Emit tool path updated event
    this.emit('tool_path_updated', { toolPath: newToolPath });
    
    return newToolPath.id;
  }

  /**
   * Update tool path animation progress
   */
  updateToolPathProgress(pathId: string, progress: number): boolean {
    const toolPath = this.state.toolPaths.find(tp => tp.id === pathId);
    if (!toolPath) {
      return false;
    }
    
    toolPath.progress = Math.max(0, Math.min(1, progress));
    
    // Emit tool path updated event
    this.emit('tool_path_updated', { toolPath });
    
    return true;
  }

  /**
   * Start/stop animation
   */
  toggleAnimation(): void {
    if (this.state.animation.isPlaying) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  /**
   * Start animation
   */
  startAnimation(): void {
    if (!this.state.animation.enabled) {
      return;
    }
    
    this.state.animation.isPlaying = true;
    
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
    }
    
    const frameInterval = 1000 / 60; // 60 FPS
    this.animationTimer = setInterval(() => {
      this.updateAnimation();
    }, frameInterval);
    
    console.log('Animation started');
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    this.state.animation.isPlaying = false;
    
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    
    console.log('Animation stopped');
  }

  /**
   * Set render quality
   */
  setRenderQuality(quality: RenderQuality['level']): void {
    const qualitySettings = this.getQualitySettings(quality);
    this.state.quality = { ...this.state.quality, ...qualitySettings };
    
    // Emit quality change event
    this.emit('quality_changed', { quality: this.state.quality });
    
    console.log(`Render quality set to: ${quality}`);
  }

  /**
   * Update viewport settings
   */
  updateViewport(settings: Partial<ViewportSettings>): void {
    this.state.viewport = { ...this.state.viewport, ...settings };
    
    // Update aspect ratio if dimensions changed
    if (settings.width && settings.height) {
      this.state.viewport.aspectRatio = settings.width / settings.height;
    }
  }

  /**
   * Toggle object visibility
   */
  toggleVisibility(type: keyof VisualizationState['visibility']): void {
    this.state.visibility[type] = !this.state.visibility[type];
    
    // Update corresponding objects
    this.updateObjectVisibility(type, this.state.visibility[type]);
  }

  /**
   * Set workspace bounds visualization
   */
  setWorkspaceBounds(bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }): void {
    // Remove existing bounds
    this.state.objects = this.state.objects.filter(obj => obj.type !== 'bounds');
    
    // Add new bounds visualization
    this.addObject({
      type: 'bounds',
      position: { 
        x: (bounds.min.x + bounds.max.x) / 2,
        y: (bounds.min.y + bounds.max.y) / 2,
        z: (bounds.min.z + bounds.max.z) / 2
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { 
        x: bounds.max.x - bounds.min.x,
        y: bounds.max.y - bounds.min.y,
        z: bounds.max.z - bounds.min.z
      },
      color: '#ff0000',
      opacity: 0.3,
      visible: this.state.visibility.bounds,
      geometry: {
        type: 'box',
        parameters: { wireframe: true }
      },
      material: {
        type: 'basic',
        properties: { transparent: true }
      }
    });
  }

  /**
   * Update tool position in visualization
   */
  updateToolPosition(position: { x: number; y: number; z: number }): void {
    const toolObject = this.state.objects.find(obj => obj.type === 'tool');
    if (toolObject) {
      toolObject.position = { ...position };
    }
  }

  /**
   * Get visualization state
   */
  getState(): Readonly<VisualizationState> {
    return { ...this.state };
  }

  /**
   * Get camera information
   */
  getCamera(): Camera3D | Camera2D {
    return this.state.viewMode === '3D' ? this.state.camera3D : this.state.camera2D;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): VisualizationState['performance'] {
    return { ...this.state.performance };
  }

  /**
   * Event subscription methods
   */
  on(event: string, handler: VisualizationEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: VisualizationEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    // Stop timers
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
    }
    
    // Clear objects and paths
    this.state.objects = [];
    this.state.toolPaths = [];
    
    // Clear event handlers
    this.eventHandlers.clear();
    
    this.isInitialized = false;
    console.log('VisualizationController disposed');
  }

  // Private methods

  private createInitialState(): VisualizationState {
    return {
      viewMode: '3D',
      camera3D: {
        position: { ...this.config.threeDimensions.camera.position },
        target: { ...this.config.threeDimensions.camera.target },
        up: { x: 0, y: 0, z: 1 },
        fov: this.config.threeDimensions.camera.fov,
        near: this.config.threeDimensions.camera.near,
        far: this.config.threeDimensions.camera.far,
        zoom: 1
      },
      camera2D: {
        position: { x: 0, y: 0 },
        zoom: this.config.twoDimensions.view.defaultZoom,
        minZoom: this.config.twoDimensions.view.minZoom,
        maxZoom: this.config.twoDimensions.view.maxZoom,
        panEnabled: this.config.twoDimensions.view.enablePanning
      },
      objects: [],
      lights: [],
      toolPaths: [],
      viewport: {
        width: 800,
        height: 600,
        aspectRatio: 4/3,
        pixelRatio: this.config.threeDimensions.renderer.pixelRatio,
        backgroundColor: '#f0f0f0',
        antialias: this.config.threeDimensions.renderer.antialias,
        shadows: this.config.threeDimensions.renderer.shadows
      },
      quality: {
        level: 'medium',
        shadowMapSize: this.config.threeDimensions.renderer.shadowMapSize,
        antialias: this.config.threeDimensions.renderer.antialias,
        pixelRatio: this.config.threeDimensions.renderer.pixelRatio,
        maxFPS: this.config.performance.maxFPS
      },
      performance: {
        fps: 0,
        frameTime: 0,
        renderTime: 0,
        triangleCount: 0,
        drawCalls: 0,
        memoryUsage: 0
      },
      animation: {
        enabled: this.config.animation.enableTransitions,
        speed: 1,
        loop: false,
        currentFrame: 0,
        totalFrames: 0,
        isPlaying: false
      },
      interaction: {
        orbitControls: true,
        panEnabled: this.config.threeDimensions.controls.enablePan,
        zoomEnabled: this.config.threeDimensions.controls.enableZoom,
        rotateEnabled: this.config.threeDimensions.controls.enableRotate,
        autoRotate: this.config.threeDimensions.controls.autoRotate,
        autoRotateSpeed: this.config.threeDimensions.controls.autoRotateSpeed
      },
      visibility: {
        grid: this.config.twoDimensions.grid.enabled,
        axes: this.config.twoDimensions.coordinates.showAxes,
        bounds: this.config.machine.workingArea.showBounds,
        machine: this.config.machine.showMachine,
        material: true,
        fixtures: true,
        toolPaths: true,
        shadows: this.config.threeDimensions.renderer.shadows
      }
    };
  }

  private initializeEventHandlers(): void {
    const events = ['camera_changed', 'object_added', 'object_removed', 'tool_path_updated', 
                   'view_mode_changed', 'quality_changed', 'performance_update', 'animation_state_changed'];
    events.forEach(event => {
      this.eventHandlers.set(event, new Set());
    });
  }

  private setupDefaultScene(): void {
    // Add default lights
    this.addDefaultLights();
    
    // Add coordinate axes
    this.addCoordinateAxes();
    
    // Add grid
    this.addGrid();
    
    // Add default tool
    this.addDefaultTool();
  }

  private addDefaultLights(): void {
    // Ambient light
    this.state.lights.push({
      id: 'ambient',
      type: 'ambient',
      color: this.config.threeDimensions.lighting.ambient.color,
      intensity: this.config.threeDimensions.lighting.ambient.intensity,
      castShadow: false,
      enabled: true
    });

    // Directional light
    this.state.lights.push({
      id: 'directional',
      type: 'directional',
      color: this.config.threeDimensions.lighting.directional.color,
      intensity: this.config.threeDimensions.lighting.directional.intensity,
      position: { ...this.config.threeDimensions.lighting.directional.position },
      castShadow: this.config.threeDimensions.lighting.directional.castShadow,
      enabled: true
    });
  }

  private addCoordinateAxes(): void {
    if (!this.state.visibility.axes) return;

    // X axis (red)
    this.addObject({
      type: 'axes',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#ff0000',
      opacity: 1,
      visible: true,
      geometry: {
        type: 'line',
        parameters: { points: [[0, 0, 0], [100, 0, 0]] }
      },
      material: {
        type: 'line',
        properties: { linewidth: 2 }
      }
    });

    // Y axis (green)
    this.addObject({
      type: 'axes',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#00ff00',
      opacity: 1,
      visible: true,
      geometry: {
        type: 'line',
        parameters: { points: [[0, 0, 0], [0, 100, 0]] }
      },
      material: {
        type: 'line',
        properties: { linewidth: 2 }
      }
    });

    // Z axis (blue)
    this.addObject({
      type: 'axes',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#0000ff',
      opacity: 1,
      visible: true,
      geometry: {
        type: 'line',
        parameters: { points: [[0, 0, 0], [0, 0, 100]] }
      },
      material: {
        type: 'line',
        properties: { linewidth: 2 }
      }
    });
  }

  private addGrid(): void {
    if (!this.state.visibility.grid) return;

    this.addObject({
      type: 'grid',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: this.config.twoDimensions.grid.color,
      opacity: 1,
      visible: true,
      geometry: {
        type: 'plane',
        parameters: { 
          width: 1000, 
          height: 1000,
          widthSegments: 100,
          heightSegments: 100
        }
      },
      material: {
        type: 'basic',
        properties: { wireframe: true }
      }
    });
  }

  private addDefaultTool(): void {
    this.addObject({
      type: 'tool',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: this.config.machine.tool.toolColor,
      opacity: 1,
      visible: true,
      geometry: {
        type: 'cylinder',
        parameters: {
          radiusTop: 3,
          radiusBottom: 3,
          height: 50,
          radialSegments: 8
        }
      },
      material: {
        type: 'phong',
        properties: {}
      }
    });
  }

  private adaptToViewMode(mode: '3D' | '2D' | 'dual'): void {
    // Adjust visibility based on view mode
    if (mode === '2D') {
      this.state.visibility.shadows = false;
      this.state.quality.level = 'low';
    } else if (mode === '3D') {
      this.state.visibility.shadows = this.config.threeDimensions.renderer.shadows;
      this.state.quality.level = 'medium';
    }
  }

  private updateAnimation(): void {
    if (!this.state.animation.isPlaying) return;

    this.state.animation.currentFrame += this.state.animation.speed;
    
    if (this.state.animation.currentFrame >= this.state.animation.totalFrames) {
      if (this.state.animation.loop) {
        this.state.animation.currentFrame = 0;
      } else {
        this.stopAnimation();
        return;
      }
    }

    // Update tool path animations
    this.updateToolPathAnimations();
    
    // Emit animation state change
    this.emit('animation_state_changed', {
      isPlaying: this.state.animation.isPlaying,
      frame: this.state.animation.currentFrame
    });
  }

  private updateToolPathAnimations(): void {
    this.state.toolPaths.forEach(toolPath => {
      if (toolPath.animated) {
        const progress = this.state.animation.currentFrame / this.state.animation.totalFrames;
        toolPath.progress = progress;
      }
    });
  }

  private startPerformanceMonitoring(): void {
    this.performanceTimer = setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);
  }

  private updatePerformanceMetrics(): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime > 0) {
      this.state.performance.fps = Math.round(1000 / deltaTime);
      this.state.performance.frameTime = deltaTime;
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
    
    // Update other performance metrics
    this.state.performance.triangleCount = this.calculateTriangleCount();
    this.state.performance.drawCalls = this.state.objects.filter(obj => obj.visible).length;
    
    // Emit performance update
    this.emit('performance_update', {
      performance: this.state.performance
    });
  }

  private calculateTriangleCount(): number {
    // Simplified calculation based on visible objects
    return this.state.objects.filter(obj => obj.visible).length * 100;
  }

  private getQualitySettings(quality: RenderQuality['level']): Partial<RenderQuality> {
    switch (quality) {
      case 'low':
        return {
          level: 'low',
          shadowMapSize: 512,
          antialias: false,
          pixelRatio: 1,
          maxFPS: 30
        };
      case 'medium':
        return {
          level: 'medium',
          shadowMapSize: 1024,
          antialias: true,
          pixelRatio: 1,
          maxFPS: 60
        };
      case 'high':
        return {
          level: 'high',
          shadowMapSize: 2048,
          antialias: true,
          pixelRatio: window.devicePixelRatio || 1,
          maxFPS: 60
        };
      case 'ultra':
        return {
          level: 'ultra',
          shadowMapSize: 4096,
          antialias: true,
          pixelRatio: window.devicePixelRatio || 1,
          maxFPS: 120
        };
      default:
        return { level: 'medium' };
    }
  }

  private updateObjectVisibility(type: keyof VisualizationState['visibility'], visible: boolean): void {
    this.state.objects.forEach(object => {
      if (object.type === type) {
        object.visible = visible;
      }
    });
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({ type: event, data } as VisualizationEvent);
        } catch (error) {
          console.error(`Error in visualization event handler for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const visualizationController = new VisualizationController();