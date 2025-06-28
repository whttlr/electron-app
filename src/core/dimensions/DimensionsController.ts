import { MachineDimensions, Position } from '../machine/MachineTypes';
import { WorkingArea, ViewportDimensions, DisplayArea, DimensionCalculation } from './DimensionTypes';
import { logger } from '@/services/logger';
import machineConfig from '@config/machine.json';

export class DimensionsController {
  private workingArea: WorkingArea;
  
  constructor() {
    this.workingArea = this.createDefaultWorkingArea();
  }

  // Working Area Management
  private createDefaultWorkingArea(): WorkingArea {
    const dimensions = machineConfig.defaultDimensions;
    return {
      dimensions,
      origin: { x: 0, y: 0, z: 0 },
      bounds: {
        min: { x: 0, y: 0, z: 0 },
        max: {
          x: dimensions.width,
          y: dimensions.height,
          z: dimensions.depth
        }
      }
    };
  }

  getWorkingArea(): WorkingArea {
    return {
      ...this.workingArea,
      dimensions: { ...this.workingArea.dimensions },
      origin: { ...this.workingArea.origin },
      bounds: {
        min: { ...this.workingArea.bounds.min },
        max: { ...this.workingArea.bounds.max }
      }
    };
  }

  setDimensions(dimensions: MachineDimensions): void {
    this.workingArea.dimensions = { ...dimensions };
    this.updateBounds();
    logger.info('Working area dimensions updated', dimensions);
  }

  setOrigin(origin: Position): void {
    this.workingArea.origin = { ...origin };
    this.updateBounds();
    logger.info('Working area origin updated', origin);
  }

  private updateBounds(): void {
    const { dimensions, origin } = this.workingArea;
    this.workingArea.bounds = {
      min: { ...origin },
      max: {
        x: origin.x + dimensions.width,
        y: origin.y + dimensions.height,
        z: origin.z + dimensions.depth
      }
    };
  }

  // Calculations
  calculateArea(): number {
    const { width, height } = this.workingArea.dimensions;
    return width * height;
  }

  calculateVolume(): number {
    const { width, height, depth } = this.workingArea.dimensions;
    return width * height * depth;
  }

  calculateDiagonal(): number {
    const { width, height, depth } = this.workingArea.dimensions;
    return Math.sqrt(width * width + height * height + depth * depth);
  }

  calculatePerimeter(): number {
    const { width, height } = this.workingArea.dimensions;
    return 2 * (width + height);
  }

  getAllCalculations(): DimensionCalculation {
    return {
      area: this.calculateArea(),
      volume: this.calculateVolume(),
      diagonal: this.calculateDiagonal(),
      perimeter: this.calculatePerimeter()
    };
  }

  // Position Utilities
  isPositionInWorkingArea(position: Position): boolean {
    const { bounds } = this.workingArea;
    return (
      position.x >= bounds.min.x && position.x <= bounds.max.x &&
      position.y >= bounds.min.y && position.y <= bounds.max.y &&
      position.z >= bounds.min.z && position.z <= bounds.max.z
    );
  }

  clampToWorkingArea(position: Position): Position {
    const { bounds } = this.workingArea;
    return {
      x: Math.max(bounds.min.x, Math.min(bounds.max.x, position.x)),
      y: Math.max(bounds.min.y, Math.min(bounds.max.y, position.y)),
      z: Math.max(bounds.min.z, Math.min(bounds.max.z, position.z))
    };
  }

  getClosestEdgeDistance(position: Position): number {
    const { bounds } = this.workingArea;
    
    const distances = [
      position.x - bounds.min.x,  // Left edge
      bounds.max.x - position.x,  // Right edge
      position.y - bounds.min.y,  // Bottom edge
      bounds.max.y - position.y,  // Top edge
      position.z - bounds.min.z,  // Bottom face
      bounds.max.z - position.z   // Top face
    ];

    return Math.min(...distances.filter(d => d >= 0));
  }

  // Display Scaling
  calculateViewportScale(viewport: ViewportDimensions, margin: number = 20): number {
    const { width, height } = this.workingArea.dimensions;
    const availableWidth = viewport.width - 2 * margin;
    const availableHeight = viewport.height - 2 * margin;
    
    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    
    return Math.min(scaleX, scaleY);
  }

  calculateDisplayArea(viewport: ViewportDimensions, margin: number = 20): DisplayArea {
    const scale = this.calculateViewportScale(viewport, margin);
    const { width, height } = this.workingArea.dimensions;
    
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    const offsetX = (viewport.width - scaledWidth) / 2;
    const offsetY = (viewport.height - scaledHeight) / 2;
    
    return {
      scale,
      offset: { x: offsetX, y: offsetY, z: 0 },
      rotation: 0
    };
  }

  // Coordinate Conversion
  worldToScreen(worldPos: Position, displayArea: DisplayArea): Position {
    const { scale, offset } = displayArea;
    const { origin } = this.workingArea;
    
    return {
      x: (worldPos.x - origin.x) * scale + offset.x,
      y: (worldPos.y - origin.y) * scale + offset.y,
      z: (worldPos.z - origin.z) * scale + offset.z
    };
  }

  screenToWorld(screenPos: Position, displayArea: DisplayArea): Position {
    const { scale, offset } = displayArea;
    const { origin } = this.workingArea;
    
    return {
      x: (screenPos.x - offset.x) / scale + origin.x,
      y: (screenPos.y - offset.y) / scale + origin.y,
      z: (screenPos.z - offset.z) / scale + origin.z
    };
  }

  // Utility Methods
  formatDimensions(dimensions: MachineDimensions, unit: string = 'mm'): string {
    return `${dimensions.width}×${dimensions.height}×${dimensions.depth} ${unit}`;
  }

  getDimensionRatio(): { width: number; height: number; depth: number } {
    const { width, height, depth } = this.workingArea.dimensions;
    const max = Math.max(width, height, depth);
    
    return {
      width: width / max,
      height: height / max,
      depth: depth / max
    };
  }
}