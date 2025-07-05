/**
 * Demo usage of the core CNC controllers
 * 
 * This file demonstrates how to use the four core controllers:
 * - MachineController: Machine state and control
 * - PositioningController: Position tracking and jogging
 * - WorkspaceController: Working area management
 * - VisualizationController: 3D/2D rendering
 */

import { machineController } from './machine';
import { positioningController } from './positioning';
import { workspaceController } from './workspace';
import { visualizationController } from './visualization';

/**
 * Demo function showing basic controller usage
 */
export async function runControllerDemo(): Promise<void> {
  console.log('🔧 Starting CNC Controller Demo...');

  try {
    // Initialize all controllers
    console.log('Initializing controllers...');
    await machineController.initialize();
    await positioningController.initialize();
    await workspaceController.initialize();
    await visualizationController.initialize();

    // Machine Controller Demo
    console.log('\n🤖 Machine Controller Demo:');
    
    // Connect to machine
    await machineController.connect('/dev/ttyUSB0', 115200);
    console.log('Connected:', machineController.isConnected());
    console.log('Ready:', machineController.isReady());
    
    // Send some commands
    await machineController.sendCommand('G28'); // Home all axes
    await machineController.sendCommand('G90'); // Absolute positioning

    // Positioning Controller Demo
    console.log('\n📐 Positioning Controller Demo:');
    
    // Update position
    positioningController.updatePosition({ x: 10, y: 20, z: 5 });
    console.log('Current position:', positioningController.getCurrentPosition());
    
    // Perform jog operations
    await positioningController.jogIncremental('X', 1, 10); // Jog X+ 10mm
    await positioningController.jogIncremental('Y', -1, 5); // Jog Y- 5mm
    
    // Home the machine
    await positioningController.homeAxes(['Z', 'X', 'Y']);

    // Workspace Controller Demo
    console.log('\n🏗️ Workspace Controller Demo:');
    
    // Set workspace dimensions
    workspaceController.setDimensions({ width: 400, height: 300, depth: 100 });
    console.log('Workspace dimensions:', workspaceController.getDimensions());
    
    // Add material to workspace
    const materialId = workspaceController.addMaterial({
      name: 'Plywood Sheet',
      thickness: 12,
      color: '#8B4513',
      opacity: 0.8,
      dimensions: { width: 200, height: 150, depth: 12 },
      position: { x: 0, y: 0, z: 0 },
      properties: {
        type: 'wood',
        density: 600,
        notes: 'Baltic birch plywood'
      }
    });
    
    // Add fixture
    const fixtureId = workspaceController.addFixture({
      name: 'Corner Clamp',
      type: 'clamp',
      position: { x: -10, y: -10, z: 0 },
      dimensions: { width: 20, height: 20, depth: 15 },
      color: '#666666',
      isActive: true,
      constraints: {
        blocksMaterial: false,
        blocksToolPath: true,
        safetyZone: 5
      }
    });
    
    console.log('Material added:', materialId);
    console.log('Fixture added:', fixtureId);

    // Visualization Controller Demo
    console.log('\n🎨 Visualization Controller Demo:');
    
    // Set view mode and camera
    visualizationController.setViewMode('3D');
    visualizationController.updateCamera3D({
      position: { x: 100, y: 100, z: 100 },
      target: { x: 0, y: 0, z: 0 }
    });
    
    // Add objects to scene
    const gridId = visualizationController.addObject({
      type: 'grid',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#e0e0e0',
      opacity: 1,
      visible: true,
      geometry: {
        type: 'plane',
        parameters: { width: 400, height: 300 }
      },
      material: {
        type: 'basic',
        properties: { wireframe: true }
      }
    });
    
    // Add tool path
    const pathId = visualizationController.addToolPath({
      name: 'Test Cut',
      points: [
        { x: 0, y: 0, z: 5 },
        { x: 50, y: 0, z: 5 },
        { x: 50, y: 50, z: 5 },
        { x: 0, y: 50, z: 5 },
        { x: 0, y: 0, z: 5 }
      ],
      color: '#0066cc',
      lineWidth: 2,
      visible: true,
      animated: true,
      progress: 0
    });
    
    console.log('Grid object added:', gridId);
    console.log('Tool path added:', pathId);
    
    // Set up event handlers
    setupEventHandlers();
    
    // Simulate some operations
    console.log('\n⚡ Simulating CNC operations...');
    
    // Simulate tool movement
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const progress = i / 100;
      const x = 50 * progress;
      const y = 25 * Math.sin(progress * Math.PI * 2);
      
      // Update position
      positioningController.updatePosition({ x, y, z: 5 });
      
      // Update visualization
      visualizationController.updateToolPosition({ x, y, z: 5 });
      visualizationController.updateToolPathProgress(pathId, progress);
      
      console.log(`Progress: ${i}% - Position: (${x.toFixed(1)}, ${y.toFixed(1)}, 5)`);
    }
    
    console.log('\n✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

/**
 * Set up event handlers to demonstrate controller events
 */
function setupEventHandlers(): void {
  // Machine events
  machineController.on('connection_changed', (event) => {
    console.log('🔌 Connection changed:', event.data);
  });
  
  machineController.on('state_changed', (event) => {
    console.log('🔄 Machine state changed:', event.data);
  });
  
  machineController.on('emergency_stop', (event) => {
    console.log('🚨 Emergency stop:', event.data);
  });
  
  // Position events
  positioningController.on('position_changed', (event) => {
    console.log('📍 Position changed:', event.data.position);
  });
  
  positioningController.on('jog_started', (event) => {
    console.log('🎯 Jog started:', event.data.command);
  });
  
  positioningController.on('homing_completed', (event) => {
    console.log('🏠 Homing completed:', event.data);
  });
  
  // Workspace events
  workspaceController.on('material_added', (event) => {
    console.log('📦 Material added:', event.data.material.name);
  });
  
  workspaceController.on('fixture_added', (event) => {
    console.log('🔧 Fixture added:', event.data.fixture.name);
  });
  
  workspaceController.on('collision_detected', (event) => {
    console.log('⚠️ Collision detected:', event.data);
  });
  
  // Visualization events
  visualizationController.on('view_mode_changed', (event) => {
    console.log('👁️ View mode changed:', event.data);
  });
  
  visualizationController.on('object_added', (event) => {
    console.log('🎨 Object added to scene:', event.data.object.type);
  });
  
  visualizationController.on('performance_update', (event) => {
    console.log('📊 Performance:', `${event.data.performance.fps} FPS`);
  });
}

/**
 * Emergency stop demonstration
 */
export async function demonstrateEmergencyStop(): Promise<void> {
  console.log('🚨 Testing emergency stop...');
  
  await machineController.emergencyStop();
  console.log('Emergency stop activated');
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Reset machine
  await machineController.reset();
  console.log('Machine reset completed');
}

/**
 * Advanced positioning demonstration
 */
export async function demonstrateAdvancedPositioning(): Promise<void> {
  console.log('🎯 Advanced positioning demo...');
  
  // Set up coordinate systems
  positioningController.setWorkCoordinateOffset('G54', { x: 10, y: 10, z: 0 });
  positioningController.setWorkCoordinateOffset('G55', { x: 50, y: 50, z: 0 });
  
  // Switch between coordinate systems
  positioningController.switchCoordinateSystem('G55');
  console.log('Switched to G55 coordinate system');
  
  // Perform continuous jog
  await positioningController.jogContinuous('X', 1, 1000);
  
  // Stop after 2 seconds
  setTimeout(() => {
    positioningController.stopJog('demo_complete');
  }, 2000);
}

/**
 * Cleanup function
 */
export async function cleanupDemo(): Promise<void> {
  console.log('🧹 Cleaning up demo...');
  
  await machineController.dispose();
  await positioningController.dispose();
  await workspaceController.dispose();
  await visualizationController.dispose();
  
  console.log('✨ Cleanup completed');
}

// Export for use in other files
export {
  machineController,
  positioningController,
  workspaceController,
  visualizationController
};