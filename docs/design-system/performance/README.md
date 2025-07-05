# Performance Optimization Guide

> Comprehensive performance optimization strategies for the CNC Control Design System

## Table of Contents

- [Performance Overview](#performance-overview)
- [React Performance](#react-performance)
- [Bundle Optimization](#bundle-optimization)
- [Real-Time Performance](#real-time-performance)
- [Memory Management](#memory-management)
- [3D Visualization Performance](#3d-visualization-performance)
- [State Management Performance](#state-management-performance)
- [Network Optimization](#network-optimization)
- [Performance Monitoring](#performance-monitoring)
- [Performance Testing](#performance-testing)
- [Troubleshooting](#troubleshooting)

---

## Performance Overview

### Performance Goals

Our CNC control application has strict performance requirements for industrial use:

- **Interaction Response**: < 100ms for critical controls
- **Real-time Updates**: < 50ms for machine position updates
- **Initial Load**: < 3 seconds for complete application
- **Frame Rate**: 60fps for 3D visualization
- **Memory Usage**: < 200MB for typical workloads
- **Battery Life**: Minimal impact on mobile devices

### Performance Monitoring Stack

```typescript
// Performance monitoring setup
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Custom Metrics
  machineResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
}

// Real-time performance tracking
export class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    machineResponseTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0,
  };
  
  // Track Core Web Vitals
  trackWebVitals(): void {
    // LCP tracking
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID tracking
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS tracking
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          this.metrics.cls += entry.value;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  // Track machine response time
  trackMachineResponse(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.metrics.machineResponseTime = responseTime;
    
    if (responseTime > 100) {
      console.warn(`Slow machine response: ${responseTime}ms`);
    }
  }
  
  // Track render performance
  trackRender(componentName: string, renderTime: number): void {
    this.metrics.renderTime = renderTime;
    
    if (renderTime > 16) { // 60fps = 16.67ms per frame
      console.warn(`Slow render for ${componentName}: ${renderTime}ms`);
    }
  }
}
```

---

## React Performance

### Component Optimization

#### 1. Memoization Strategies

```typescript
// ✅ Memoize expensive components
const JogControls = React.memo<JogControlsProps>(({ position, onJog, disabled }) => {
  // Only re-render when props actually change
  return (
    <div className="jog-controls">
      {/* Component content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for complex props
  return (
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.position.z === nextProps.position.z &&
    prevProps.disabled === nextProps.disabled
  );
});

// ✅ Memoize expensive calculations
const MachineStatistics = () => {
  const { machineHistory } = useMachineStore();
  
  const statistics = useMemo(() => {
    // Expensive calculation
    return calculateMachineStatistics(machineHistory);
  }, [machineHistory]);
  
  return <div>{/* Display statistics */}</div>;
};

// ✅ Memoize callbacks to prevent child re-renders
const ControlsPage = () => {
  const { updatePosition } = useMachineStore();
  
  const handleJog = useCallback((axis: Axis, direction: number, distance: number) => {
    const newPosition = calculateNewPosition(axis, direction, distance);
    updatePosition(newPosition);
  }, [updatePosition]);
  
  return (
    <JogControls
      onJog={handleJog} // Stable reference prevents re-renders
      position={position}
    />
  );
};
```

#### 2. Lazy Loading

```typescript
// ✅ Lazy load heavy components
const Visualization3D = React.lazy(() => 
  import('./Visualization3D').then(module => ({
    default: module.Visualization3D
  }))
);

const AdvancedSettings = React.lazy(() => import('./AdvancedSettings'));

// ✅ Lazy load with loading fallback
const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/controls" element={
        <Suspense fallback={<LoadingSpinner />}>
          <ControlsView />
        </Suspense>
      } />
      <Route path="/visualization" element={
        <Suspense fallback={<div>Loading 3D Visualization...</div>}>
          <Visualization3D />
        </Suspense>
      } />
    </Routes>
  </Router>
);

// ✅ Conditional lazy loading
const useConditionalComponent = (condition: boolean) => {
  return useMemo(() => {
    if (!condition) return null;
    
    return React.lazy(() => import('./ConditionalComponent'));
  }, [condition]);
};
```

#### 3. Virtual Scrolling

```typescript
// ✅ Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

interface JobListProps {
  jobs: Job[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <JobItem job={jobs[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={jobs.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};

// ✅ Variable size virtual scrolling
import { VariableSizeList as VList } from 'react-window';

const VariableJobList: React.FC<JobListProps> = ({ jobs }) => {
  const getItemSize = (index: number) => {
    const job = jobs[index];
    // Calculate height based on job content
    return job.description ? 120 : 80;
  };
  
  return (
    <VList
      height={600}
      itemCount={jobs.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VList>
  );
};
```

#### 4. Optimized Hooks

```typescript
// ✅ Custom hook with optimized dependencies
const useMachinePosition = () => {
  const position = useMachineStore(useCallback(
    (state) => state.machine.position,
    []
  ));
  
  // Memoize derived values
  const distanceFromOrigin = useMemo(() => {
    return Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
  }, [position.x, position.y, position.z]);
  
  const isAtOrigin = useMemo(() => {
    return position.x === 0 && position.y === 0 && position.z === 0;
  }, [position.x, position.y, position.z]);
  
  return { position, distanceFromOrigin, isAtOrigin };
};

// ✅ Debounced hook for expensive operations
const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [searchTerm, delay]);
  
  return debouncedTerm;
};

// ✅ Throttled hook for real-time updates
const useThrottledCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
};
```

---

## Bundle Optimization

### Code Splitting Strategies

#### 1. Route-based Splitting

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          
          // Feature chunks
          controls: ['./src/views/Controls'],
          visualization: ['./src/ui/visualization'],
          jobs: ['./src/views/Jobs'],
          settings: ['./src/views/Settings'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd'],
    exclude: ['@react-three/fiber'], // Load on demand
  },
});
```

#### 2. Dynamic Imports

```typescript
// ✅ Dynamic imports for heavy libraries
const loadThreeJS = async () => {
  const [
    { Canvas },
    { OrbitControls },
    { Mesh, BoxGeometry, MeshBasicMaterial }
  ] = await Promise.all([
    import('@react-three/fiber'),
    import('@react-three/drei'),
    import('three')
  ]);
  
  return { Canvas, OrbitControls, Mesh, BoxGeometry, MeshBasicMaterial };
};

// ✅ Conditional feature loading
const useAdvancedFeatures = () => {
  const [features, setFeatures] = useState(null);
  
  const loadFeatures = useCallback(async () => {
    if (features) return features;
    
    const advancedFeatures = await import('./advanced-features');
    setFeatures(advancedFeatures);
    return advancedFeatures;
  }, [features]);
  
  return { features, loadFeatures };
};
```

#### 3. Tree Shaking Optimization

```typescript
// ✅ Import only what you need
import { debounce } from 'lodash-es'; // Tree-shakable
import { Button } from '@/ui/components/Button'; // Specific import

// ❌ Avoid importing entire libraries
import * as _ from 'lodash'; // Imports everything
import { Button, Input, Card } from 'antd'; // May import unused code

// ✅ Configure tree shaking in package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts"
  ]
}
```

### Asset Optimization

#### 1. Image Optimization

```typescript
// Image optimization configuration
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Image optimization plugin
    {
      name: 'image-optimization',
      generateBundle(options, bundle) {
        // Optimize images during build
      }
    }
  ],
  
  // Asset handling
  assetsInclude: ['**/*.gltf', '**/*.glb'], // 3D models
  
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});

// ✅ Responsive images
const ResponsiveImage: React.FC<{
  src: string;
  alt: string;
  sizes?: string;
}> = ({ src, alt, sizes = "100vw" }) => {
  return (
    <picture>
      <source
        media="(min-width: 1200px)"
        srcSet={`${src}?w=1200 1x, ${src}?w=2400 2x`}
      />
      <source
        media="(min-width: 768px)"
        srcSet={`${src}?w=768 1x, ${src}?w=1536 2x`}
      />
      <img
        src={`${src}?w=400`}
        srcSet={`${src}?w=400 1x, ${src}?w=800 2x`}
        alt={alt}
        sizes={sizes}
        loading="lazy"
      />
    </picture>
  );
};
```

#### 2. Font Optimization

```css
/* ✅ Optimized font loading */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* Prevents invisible text during font load */
  src: url('/fonts/inter-v12-latin-regular.woff2') format('woff2');
}

/* ✅ Preload critical fonts */
/* Add to index.html */
<link rel="preload" href="/fonts/inter-v12-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
```

---

## Real-Time Performance

### WebSocket Optimization

#### 1. Efficient Message Handling

```typescript
// ✅ Optimized WebSocket manager
export class OptimizedWebSocketManager {
  private ws: WebSocket | null = null;
  private messageQueue: any[] = [];
  private isProcessing = false;
  private subscribers = new Map<string, Set<Function>>();
  
  // Batch message processing
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Process messages in batches to avoid blocking UI
    const batchSize = 10;
    while (this.messageQueue.length > 0) {
      const batch = this.messageQueue.splice(0, batchSize);
      
      for (const message of batch) {
        this.handleMessage(message);
      }
      
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.isProcessing = false;
  }
  
  // Throttled position updates
  private lastPositionUpdate = 0;
  private readonly POSITION_UPDATE_THROTTLE = 16; // ~60fps
  
  private handlePositionUpdate(position: Position3D): void {
    const now = performance.now();
    
    if (now - this.lastPositionUpdate < this.POSITION_UPDATE_THROTTLE) {
      return; // Skip update to maintain performance
    }
    
    this.lastPositionUpdate = now;
    this.notifySubscribers('position', position);
  }
  
  // Efficient subscription management
  subscribe(event: string, callback: Function): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    this.subscribers.get(event)!.add(callback);
    
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }
  
  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (!callbacks) return;
    
    // Use requestAnimationFrame for UI updates
    requestAnimationFrame(() => {
      callbacks.forEach(callback => callback(data));
    });
  }
}
```

#### 2. Data Compression

```typescript
// ✅ Message compression for large data
import { compress, decompress } from 'lz-string';

export class CompressedWebSocket {
  private ws: WebSocket;
  
  send(data: any): void {
    const serialized = JSON.stringify(data);
    
    // Compress large messages
    if (serialized.length > 1024) {
      const compressed = compress(serialized);
      this.ws.send(JSON.stringify({
        compressed: true,
        data: compressed,
      }));
    } else {
      this.ws.send(serialized);
    }
  }
  
  private onMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      if (message.compressed) {
        const decompressed = decompress(message.data);
        const data = JSON.parse(decompressed);
        this.handleMessage(data);
      } else {
        this.handleMessage(message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
}
```

---

## Memory Management

### Memory Leak Prevention

#### 1. Proper Cleanup

```typescript
// ✅ Comprehensive cleanup in useEffect
const MachineMonitor = () => {
  useEffect(() => {
    const subscriptions: (() => void)[] = [];
    const timers: NodeJS.Timeout[] = [];
    
    // WebSocket subscription
    const unsubscribePosition = websocket.subscribe('position', handlePositionUpdate);
    subscriptions.push(unsubscribePosition);
    
    // Polling timer
    const statusTimer = setInterval(checkMachineStatus, 1000);
    timers.push(statusTimer);
    
    // Event listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseMonitoring();
      } else {
        resumeMonitoring();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Clean up all subscriptions
      subscriptions.forEach(unsubscribe => unsubscribe());
      
      // Clear all timers
      timers.forEach(timer => clearInterval(timer));
      
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

// ✅ Memory-efficient store updates
const useMachineStore = create<MachineStore>()((set, get) => ({
  machine: initialMachineState,
  
  // Efficient position updates with history limiting
  updatePosition: (position: Position3D) => set((state) => {
    const newHistory = [...state.machine.positionHistory, position];
    
    // Limit history to prevent memory growth
    if (newHistory.length > 1000) {
      newHistory.splice(0, newHistory.length - 1000);
    }
    
    return {
      machine: {
        ...state.machine,
        position,
        positionHistory: newHistory,
      },
    };
  }),
}));
```

#### 2. Object Pooling

```typescript
// ✅ Object pool for frequent allocations
class Vector3Pool {
  private pool: Position3D[] = [];
  private maxSize = 100;
  
  acquire(): Position3D {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    
    return { x: 0, y: 0, z: 0 };
  }
  
  release(vector: Position3D): void {
    if (this.pool.length < this.maxSize) {
      vector.x = 0;
      vector.y = 0;
      vector.z = 0;
      this.pool.push(vector);
    }
  }
}

const vectorPool = new Vector3Pool();

// Usage in performance-critical code
const calculateTrajectory = (waypoints: Position3D[]): Position3D[] => {
  const result: Position3D[] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const interpolated = vectorPool.acquire();
    
    // Calculate interpolated position
    interpolated.x = (waypoints[i].x + waypoints[i + 1].x) / 2;
    interpolated.y = (waypoints[i].y + waypoints[i + 1].y) / 2;
    interpolated.z = (waypoints[i].z + waypoints[i + 1].z) / 2;
    
    result.push(interpolated);
  }
  
  return result;
};

// Clean up when done
const cleanup = (positions: Position3D[]) => {
  positions.forEach(pos => vectorPool.release(pos));
};
```

#### 3. Weak References

```typescript
// ✅ Weak references for cache management
class ComponentCache {
  private cache = new WeakMap<Object, React.ComponentType>();
  
  get(key: Object): React.ComponentType | undefined {
    return this.cache.get(key);
  }
  
  set(key: Object, component: React.ComponentType): void {
    this.cache.set(key, component);
  }
  
  // No need for explicit cleanup - WeakMap handles it
}

// ✅ Weak references for event listeners
class EventManager {
  private listeners = new WeakMap<Object, Map<string, Function[]>>();
  
  addEventListener(target: Object, event: string, listener: Function): void {
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }
    
    const targetListeners = this.listeners.get(target)!;
    if (!targetListeners.has(event)) {
      targetListeners.set(event, []);
    }
    
    targetListeners.get(event)!.push(listener);
  }
  
  // Listeners are automatically cleaned up when target is garbage collected
}
```

---

## 3D Visualization Performance

### Three.js Optimization

#### 1. Geometry and Material Optimization

```typescript
// ✅ Optimized 3D scene setup
import * as THREE from 'three';

export class OptimizedMachineVisualization {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  
  // Shared materials and geometries
  private materials = {
    machine: new THREE.MeshStandardMaterial({ color: 0x606060 }),
    workpiece: new THREE.MeshStandardMaterial({ color: 0x8B4513 }),
    tool: new THREE.MeshStandardMaterial({ color: 0xFF6B6B }),
  };
  
  private geometries = {
    box: new THREE.BoxGeometry(),
    cylinder: new THREE.CylinderGeometry(),
    sphere: new THREE.SphereGeometry(),
  };
  
  constructor(canvas: HTMLCanvasElement) {
    this.setupRenderer(canvas);
    this.setupScene();
    this.setupCamera();
    this.setupLighting();
  }
  
  private setupRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.devicePixelRatio < 2, // Adaptive quality
      powerPreference: 'high-performance',
      alpha: false, // Opaque background is faster
    });
    
    // Adaptive pixel ratio
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    // Performance settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Frustum culling
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
  
  // LOD (Level of Detail) for complex models
  private createLODMachine(): THREE.LOD {
    const lod = new THREE.LOD();
    
    // High detail (close view)
    const highDetail = this.createDetailedMachine();
    lod.addLevel(highDetail, 0);
    
    // Medium detail
    const mediumDetail = this.createMediumMachine();
    lod.addLevel(mediumDetail, 50);
    
    // Low detail (far view)
    const lowDetail = this.createSimpleMachine();
    lod.addLevel(lowDetail, 200);
    
    return lod;
  }
  
  // Instanced rendering for repeated elements
  private createInstancedScrews(count: number): THREE.InstancedMesh {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      );
      instancedMesh.setMatrixAt(i, matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }
  
  // Optimized render loop
  private render(): void {
    // Only render if camera moved or scene changed
    if (this.needsUpdate()) {
      this.renderer.render(this.scene, this.camera);
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics();
  }
  
  private needsUpdate(): boolean {
    // Implement smart update detection
    return true; // Simplified for example
  }
  
  // Cleanup
  dispose(): void {
    // Dispose geometries
    Object.values(this.geometries).forEach(geometry => geometry.dispose());
    
    // Dispose materials
    Object.values(this.materials).forEach(material => material.dispose());
    
    // Dispose renderer
    this.renderer.dispose();
  }
}
```

#### 2. Adaptive Quality

```typescript
// ✅ Adaptive rendering quality
export class AdaptiveQualityManager {
  private targetFPS = 60;
  private currentFPS = 60;
  private qualityLevel = 1.0;
  
  private frameCount = 0;
  private lastTime = performance.now();
  
  updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      this.adjustQuality();
    }
  }
  
  private adjustQuality(): void {
    const fpsRatio = this.currentFPS / this.targetFPS;
    
    if (fpsRatio < 0.8) {
      // Reduce quality
      this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.1);
    } else if (fpsRatio > 0.95) {
      // Increase quality
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
    }
    
    this.applyQualitySettings();
  }
  
  private applyQualitySettings(): void {
    // Adjust renderer settings based on quality level
    const pixelRatio = Math.min(window.devicePixelRatio * this.qualityLevel, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    // Adjust shadow quality
    const shadowMapSize = Math.floor(1024 * this.qualityLevel);
    this.renderer.shadowMap.size = shadowMapSize;
    
    // Adjust antialiasing
    this.renderer.antialias = this.qualityLevel > 0.8;
  }
  
  getQualityLevel(): number {
    return this.qualityLevel;
  }
}
```

---

## State Management Performance

### Zustand Optimization

#### 1. Selective Subscriptions

```typescript
// ✅ Optimized store subscriptions
export const useMachineStore = create<MachineStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        machine: initialMachineState,
        
        updatePosition: (position: Position3D) => set((state) => {
          state.machine.position = position;
          state.machine.lastUpdate = Date.now();
        }),
        
        // Batch multiple updates
        batchUpdate: (updates: Partial<MachineState>) => set((state) => {
          Object.assign(state.machine, updates);
        }),
      })),
      {
        name: 'machine-store',
        partialize: (state) => ({
          // Only persist essential data
          machine: {
            position: state.machine.position,
            settings: state.machine.settings,
          },
        }),
      }
    )
  )
);

// ✅ Selective subscriptions to prevent unnecessary re-renders
const PositionDisplay = () => {
  // Only subscribe to position changes
  const position = useMachineStore(
    useCallback((state) => state.machine.position, [])
  );
  
  return <div>Position: {position.x}, {position.y}, {position.z}</div>;
};

const ConnectionStatus = () => {
  // Only subscribe to connection state
  const isConnected = useMachineStore(
    useCallback((state) => state.connection.isConnected, [])
  );
  
  return <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>;
};
```

#### 2. State Normalization

```typescript
// ✅ Normalized state structure for performance
interface NormalizedJobStore {
  jobs: {
    byId: Record<string, Job>;
    allIds: string[];
  };
  queue: {
    currentJobId: string | null;
    queueIds: string[];
  };
  ui: {
    selectedJobId: string | null;
    filter: JobFilter;
  };
}

export const useJobStore = create<NormalizedJobStore>()((set, get) => ({
  jobs: {
    byId: {},
    allIds: [],
  },
  queue: {
    currentJobId: null,
    queueIds: [],
  },
  ui: {
    selectedJobId: null,
    filter: 'all',
  },
  
  // Efficient job operations
  addJob: (job: Omit<Job, 'id'>) => set((state) => {
    const id = generateId();
    const newJob = { ...job, id };
    
    state.jobs.byId[id] = newJob;
    state.jobs.allIds.push(id);
  }),
  
  updateJob: (id: string, updates: Partial<Job>) => set((state) => {
    if (state.jobs.byId[id]) {
      Object.assign(state.jobs.byId[id], updates);
    }
  }),
  
  removeJob: (id: string) => set((state) => {
    delete state.jobs.byId[id];
    state.jobs.allIds = state.jobs.allIds.filter(jobId => jobId !== id);
    state.queue.queueIds = state.queue.queueIds.filter(jobId => jobId !== id);
  }),
}));

// ✅ Memoized selectors for complex queries
export const useJobSelectors = () => {
  const getJobById = useCallback((id: string) => 
    useJobStore.getState().jobs.byId[id], 
    []
  );
  
  const getQueuedJobs = useMemo(() => 
    useJobStore((state) => 
      state.queue.queueIds.map(id => state.jobs.byId[id])
    ), 
    []
  );
  
  const getFilteredJobs = useMemo(() => {
    return (filter: JobFilter) => {
      const state = useJobStore.getState();
      return state.jobs.allIds
        .map(id => state.jobs.byId[id])
        .filter(job => applyJobFilter(job, filter));
    };
  }, []);
  
  return { getJobById, getQueuedJobs, getFilteredJobs };
};
```

---

## Network Optimization

### API Performance

#### 1. Request Optimization

```typescript
// ✅ Optimized API client with caching and batching
export class OptimizedAPIClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private requestQueue = new Map<string, Promise<any>>();
  private batchQueue: Array<{ url: string; resolve: Function; reject: Function }> = [];
  
  // Request deduplication
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);
    
    // Return cached response if valid
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    
    // Return existing request if already in flight
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }
    
    // Create new request
    const request = this.makeRequest<T>(url, options);
    this.requestQueue.set(cacheKey, request);
    
    try {
      const response = await request;
      this.setCache(cacheKey, response, options.ttl || 60000);
      return response;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }
  
  // Request batching
  async batch(requests: Array<{ url: string; options?: RequestOptions }>): Promise<any[]> {
    return Promise.all(requests.map(({ url, options }) => this.get(url, options)));
  }
  
  // Prefetch for predictive loading
  prefetch(url: string, options: RequestOptions = {}): void {
    // Don't wait for response, just initiate request
    this.get(url, { ...options, priority: 'low' }).catch(() => {
      // Ignore prefetch errors
    });
  }
  
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    
    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

#### 2. GraphQL Optimization

```typescript
// ✅ Optimized GraphQL client
import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';

const persistedQueriesLink = createPersistedQueryLink({ sha256 });

const client = new ApolloClient({
  link: from([persistedQueriesLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Job: {
        fields: {
          // Efficient pagination
          history: {
            keyArgs: false,
            merge(existing = [], incoming, { args }) {
              const offset = args?.offset || 0;
              const merged = existing.slice();
              for (let i = 0; i < incoming.length; ++i) {
                merged[offset + i] = incoming[i];
              }
              return merged;
            },
          },
        },
      },
    },
  }),
  
  // Performance settings
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});
```

---

## Performance Monitoring

### Real-time Metrics

```typescript
// ✅ Comprehensive performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private alerts: Array<{ metric: string; threshold: number; callback: Function }> = [];
  
  // Track custom metrics
  track(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    
    const values = this.metrics.get(metric)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
    
    this.checkAlerts(metric, value);
  }
  
  // Set performance alerts
  setAlert(metric: string, threshold: number, callback: Function): void {
    this.alerts.push({ metric, threshold, callback });
  }
  
  private checkAlerts(metric: string, value: number): void {
    this.alerts
      .filter(alert => alert.metric === metric && value > alert.threshold)
      .forEach(alert => alert.callback(metric, value));
  }
  
  // Get performance statistics
  getStats(metric: string): { avg: number; min: number; max: number } | null {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) return null;
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
  
  // Export metrics for analysis
  exportMetrics(): Record<string, any> {
    const exported: Record<string, any> = {};
    
    for (const [metric, values] of this.metrics.entries()) {
      exported[metric] = {
        values: values.slice(),
        stats: this.getStats(metric),
      };
    }
    
    return exported;
  }
}

// Usage
const monitor = new PerformanceMonitor();

// Track render times
const trackRender = (componentName: string) => {
  return (WrappedComponent: React.ComponentType) => {
    return React.forwardRef((props, ref) => {
      const startTime = useRef(0);
      
      useLayoutEffect(() => {
        startTime.current = performance.now();
      });
      
      useEffect(() => {
        const renderTime = performance.now() - startTime.current;
        monitor.track(`render.${componentName}`, renderTime);
      });
      
      return <WrappedComponent {...props} ref={ref} />;
    });
  };
};

// Set up alerts
monitor.setAlert('render.JogControls', 16, (metric, value) => {
  console.warn(`Slow render detected: ${metric} took ${value}ms`);
});
```

---

## Performance Testing

### Automated Performance Tests

```typescript
// ✅ Performance test suite
describe('Performance Tests', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });
  
  it('should render JogControls within budget', async () => {
    const startTime = performance.now();
    
    renderWithProviders(
      <JogControls
        position={{ x: 0, y: 0, z: 0 }}
        onJog={jest.fn()}
        onHome={jest.fn()}
      />
    );
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(16); // 60fps budget
  });
  
  it('should handle 1000 position updates efficiently', () => {
    const store = useMachineStore.getState();
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      store.updatePosition({ x: i, y: i, z: i });
    }
    
    const updateTime = performance.now() - startTime;
    expect(updateTime).toBeLessThan(100); // 100ms budget for 1000 updates
  });
  
  it('should not leak memory during stress test', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Stress test: rapid component mount/unmount
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderWithProviders(<TestComponent />);
      unmount();
    }
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // < 5MB increase
  });
});
```

---

## Troubleshooting

### Common Performance Issues

#### 1. Unnecessary Re-renders

```typescript
// ❌ Problem: Inline objects cause re-renders
const BadComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <ExpensiveChild 
      config={{ setting: 'value' }} // New object every render
      onUpdate={(data) => console.log(data)} // New function every render
    />
  );
};

// ✅ Solution: Memoize objects and callbacks
const GoodComponent = () => {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({ setting: 'value' }), []);
  const handleUpdate = useCallback((data) => {
    console.log(data);
  }, []);
  
  return (
    <ExpensiveChild 
      config={config}
      onUpdate={handleUpdate}
    />
  );
};
```

#### 2. Bundle Size Issues

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for duplicate dependencies
npm ls --depth=0

# Analyze what's in your bundles
npx webpack-bundle-analyzer dist/static/js/*.js
```

#### 3. Memory Leaks

```typescript
// ✅ Memory leak detection
const useMemoryLeakDetection = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        });
      }
    };
    
    const interval = setInterval(checkMemory, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);
};
```

### Performance Debugging Tools

```typescript
// ✅ Performance debugging utilities
export const debugPerformance = {
  // Profile component renders
  profileRender: (name: string) => {
    return <T extends React.ComponentType<any>>(Component: T): T => {
      return React.forwardRef((props, ref) => {
        const renderCount = useRef(0);
        const startTime = useRef(0);
        
        renderCount.current++;
        startTime.current = performance.now();
        
        useEffect(() => {
          const renderTime = performance.now() - startTime.current;
          console.log(`${name} render #${renderCount.current}: ${renderTime}ms`);
        });
        
        return <Component {...props} ref={ref} />;
      }) as T;
    };
  },
  
  // Track state changes
  trackStateChanges: (storeName: string) => {
    const store = stores[storeName];
    return store.subscribe((state, prevState) => {
      const changes = detectChanges(prevState, state);
      console.log(`${storeName} state changes:`, changes);
    });
  },
  
  // Monitor performance metrics
  startMonitoring: () => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    return () => observer.disconnect();
  },
};
```

---

**Optimize for excellence! ⚡**