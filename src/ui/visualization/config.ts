/**
 * UI Visualization Configuration
 * 
 * Configures 3D/2D visualization components and rendering behavior
 */

export interface VisualizationConfig {
  /** 3D visualization settings */
  threeDimensional: {
    /** Enable 3D visualization */
    enabled: boolean;
    
    /** Renderer settings */
    renderer: {
      /** Render quality */
      quality: 'low' | 'medium' | 'high';
      
      /** Anti-aliasing */
      antialias: boolean;
      
      /** Enable shadows */
      shadows: boolean;
      
      /** Background color */
      backgroundColor: string;
      
      /** Render scale */
      pixelRatio: number;
    };
    
    /** Camera settings */
    camera: {
      /** Default camera position */
      position: { x: number; y: number; z: number };
      
      /** Look at target */
      target: { x: number; y: number; z: number };
      
      /** Field of view */
      fov: number;
      
      /** Near/far clipping planes */
      near: number;
      far: number;
      
      /** Camera controls */
      controls: {
        enabled: boolean;
        enableZoom: boolean;
        enablePan: boolean;
        enableRotate: boolean;
        autoRotate: boolean;
        autoRotateSpeed: number;
      };
    };
    
    /** Lighting settings */
    lighting: {
      /** Ambient light */
      ambient: {
        enabled: boolean;
        color: string;
        intensity: number;
      };
      
      /** Directional light */
      directional: {
        enabled: boolean;
        color: string;
        intensity: number;
        position: { x: number; y: number; z: number };
        castShadows: boolean;
      };
      
      /** Point lights */
      point: {
        enabled: boolean;
        color: string;
        intensity: number;
        distance: number;
        decay: number;
      };
    };
    
    /** Grid settings */
    grid: {
      /** Show grid */
      enabled: boolean;
      
      /** Grid size */
      size: number;
      
      /** Grid divisions */
      divisions: number;
      
      /** Grid color */
      color: string;
      
      /** Center line color */
      centerLineColor: string;
    };
    
    /** Axes settings */
    axes: {
      /** Show axes */
      enabled: boolean;
      
      /** Axes size */
      size: number;
      
      /** Axis colors */
      colors: {
        x: string;
        y: string;
        z: string;
      };
    };
  };
  
  /** 2D visualization settings */
  twoDimensional: {
    /** Enable 2D visualization */
    enabled: boolean;
    
    /** Canvas settings */
    canvas: {
      /** Canvas size */
      size: { width: number; height: number };
      
      /** Background color */
      backgroundColor: string;
      
      /** Render scale */
      scale: number;
      
      /** Enable high DPI */
      highDPI: boolean;
    };
    
    /** Grid settings */
    grid: {
      /** Show grid */
      enabled: boolean;
      
      /** Grid spacing */
      spacing: number;
      
      /** Grid color */
      color: string;
      
      /** Grid opacity */
      opacity: number;
      
      /** Major grid lines */
      majorLines: {
        enabled: boolean;
        interval: number;
        color: string;
        width: number;
      };
    };
    
    /** Coordinate system */
    coordinates: {
      /** Origin position */
      origin: { x: number; y: number };
      
      /** Coordinate labels */
      labels: {
        enabled: boolean;
        fontSize: number;
        color: string;
        precision: number;
      };
      
      /** Rulers */
      rulers: {
        enabled: boolean;
        color: string;
        width: number;
        tickLength: number;
      };
    };
    
    /** Viewport settings */
    viewport: {
      /** Auto-fit content */
      autoFit: boolean;
      
      /** Zoom settings */
      zoom: {
        enabled: boolean;
        min: number;
        max: number;
        step: number;
        wheelSensitivity: number;
      };
      
      /** Pan settings */
      pan: {
        enabled: boolean;
        sensitivity: number;
        constrainToContent: boolean;
      };
    };
  };
  
  /** Machine visualization */
  machine: {
    /** Machine model */
    model: {
      /** Show machine model */
      enabled: boolean;
      
      /** Model color */
      color: string;
      
      /** Model opacity */
      opacity: number;
      
      /** Model scale */
      scale: number;
      
      /** Show machine parts */
      parts: {
        bed: boolean;
        spindle: boolean;
        axes: boolean;
        enclosure: boolean;
      };
    };
    
    /** Working area */
    workingArea: {
      /** Show working area */
      enabled: boolean;
      
      /** Working area bounds */
      bounds: {
        x: { min: number; max: number };
        y: { min: number; max: number };
        z: { min: number; max: number };
      };
      
      /** Working area color */
      color: string;
      
      /** Working area opacity */
      opacity: number;
      
      /** Show boundaries */
      showBoundaries: boolean;
      
      /** Boundary color */
      boundaryColor: string;
    };
    
    /** Tool visualization */
    tool: {
      /** Show tool */
      enabled: boolean;
      
      /** Tool color */
      color: string;
      
      /** Tool size */
      size: number;
      
      /** Tool path */
      path: {
        enabled: boolean;
        color: string;
        width: number;
        maxLength: number;
      };
    };
  };
  
  /** Animation settings */
  animation: {
    /** Enable animations */
    enabled: boolean;
    
    /** Animation duration */
    duration: number;
    
    /** Animation easing */
    easing: string;
    
    /** Frame rate */
    frameRate: number;
    
    /** Smooth transitions */
    smoothTransitions: boolean;
    
    /** Auto-play animations */
    autoPlay: boolean;
  };
  
  /** Performance settings */
  performance: {
    /** Enable performance monitoring */
    monitoring: boolean;
    
    /** Target frame rate */
    targetFrameRate: number;
    
    /** Level of detail */
    levelOfDetail: {
      enabled: boolean;
      distances: number[];
      models: string[];
    };
    
    /** Culling */
    culling: {
      enabled: boolean;
      frustumCulling: boolean;
      backfaceCulling: boolean;
    };
    
    /** Render optimization */
    optimization: {
      mergeGeometry: boolean;
      instancedRendering: boolean;
      textureCaching: boolean;
      shaderCaching: boolean;
    };
  };
  
  /** Export settings */
  export: {
    /** Supported formats */
    formats: ('png' | 'jpg' | 'svg' | 'pdf')[];
    
    /** Default format */
    defaultFormat: 'png' | 'jpg' | 'svg' | 'pdf';
    
    /** Export quality */
    quality: number;
    
    /** Export resolution */
    resolution: { width: number; height: number };
    
    /** Include metadata */
    includeMetadata: boolean;
  };
}

export const defaultVisualizationConfig: VisualizationConfig = {
  threeDimensional: {
    enabled: true,
    renderer: {
      quality: 'medium',
      antialias: true,
      shadows: true,
      backgroundColor: '#f0f0f0',
      pixelRatio: 1,
    },
    camera: {
      position: { x: 100, y: 100, z: 100 },
      target: { x: 0, y: 0, z: 0 },
      fov: 60,
      near: 0.1,
      far: 2000,
      controls: {
        enabled: true,
        enableZoom: true,
        enablePan: true,
        enableRotate: true,
        autoRotate: false,
        autoRotateSpeed: 1.0,
      },
    },
    lighting: {
      ambient: {
        enabled: true,
        color: '#ffffff',
        intensity: 0.4,
      },
      directional: {
        enabled: true,
        color: '#ffffff',
        intensity: 0.8,
        position: { x: 50, y: 50, z: 50 },
        castShadows: true,
      },
      point: {
        enabled: false,
        color: '#ffffff',
        intensity: 1.0,
        distance: 100,
        decay: 1,
      },
    },
    grid: {
      enabled: true,
      size: 500,
      divisions: 50,
      color: '#888888',
      centerLineColor: '#444444',
    },
    axes: {
      enabled: true,
      size: 50,
      colors: {
        x: '#ff0000',
        y: '#00ff00',
        z: '#0000ff',
      },
    },
  },
  twoDimensional: {
    enabled: true,
    canvas: {
      size: { width: 800, height: 600 },
      backgroundColor: '#ffffff',
      scale: 1,
      highDPI: true,
    },
    grid: {
      enabled: true,
      spacing: 10,
      color: '#e0e0e0',
      opacity: 0.5,
      majorLines: {
        enabled: true,
        interval: 5,
        color: '#cccccc',
        width: 1,
      },
    },
    coordinates: {
      origin: { x: 0, y: 0 },
      labels: {
        enabled: true,
        fontSize: 12,
        color: '#666666',
        precision: 1,
      },
      rulers: {
        enabled: true,
        color: '#999999',
        width: 1,
        tickLength: 5,
      },
    },
    viewport: {
      autoFit: true,
      zoom: {
        enabled: true,
        min: 0.1,
        max: 10,
        step: 0.1,
        wheelSensitivity: 0.1,
      },
      pan: {
        enabled: true,
        sensitivity: 1,
        constrainToContent: false,
      },
    },
  },
  machine: {
    model: {
      enabled: true,
      color: '#4a90e2',
      opacity: 0.8,
      scale: 1,
      parts: {
        bed: true,
        spindle: true,
        axes: true,
        enclosure: false,
      },
    },
    workingArea: {
      enabled: true,
      bounds: {
        x: { min: -250, max: 250 },
        y: { min: -250, max: 250 },
        z: { min: -50, max: 50 },
      },
      color: '#50e3c2',
      opacity: 0.2,
      showBoundaries: true,
      boundaryColor: '#4a90e2',
    },
    tool: {
      enabled: true,
      color: '#f5a623',
      size: 2,
      path: {
        enabled: true,
        color: '#bd10e0',
        width: 2,
        maxLength: 1000,
      },
    },
  },
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    frameRate: 60,
    smoothTransitions: true,
    autoPlay: false,
  },
  performance: {
    monitoring: false,
    targetFrameRate: 60,
    levelOfDetail: {
      enabled: true,
      distances: [100, 500, 1000],
      models: ['high', 'medium', 'low'],
    },
    culling: {
      enabled: true,
      frustumCulling: true,
      backfaceCulling: true,
    },
    optimization: {
      mergeGeometry: true,
      instancedRendering: true,
      textureCaching: true,
      shaderCaching: true,
    },
  },
  export: {
    formats: ['png', 'jpg', 'svg'],
    defaultFormat: 'png',
    quality: 0.9,
    resolution: { width: 1920, height: 1080 },
    includeMetadata: true,
  },
};

export const getVisualizationConfig = (): VisualizationConfig => {
  // In a real application, this would load from configuration service
  return defaultVisualizationConfig;
};