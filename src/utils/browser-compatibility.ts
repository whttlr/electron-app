/**
 * Browser Compatibility Testing Utilities
 *
 * Comprehensive browser compatibility detection and polyfill management
 * for CNC control interfaces across different browsers and devices.
 * Ensures consistent functionality in industrial environments.
 */

export interface BrowserCapabilities {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  touch: boolean;
  webgl: boolean;
  serviceWorker: boolean;
  indexedDB: boolean;
  webAssembly: boolean;
  webRTC: boolean;
  geolocation: boolean;
  deviceOrientation: boolean;
  battery: boolean;
  vibration: boolean;
  fullscreen: boolean;
  notifications: boolean;
  clipboard: boolean;
  webUSB: boolean;
  webSerial: boolean;
  customElements: boolean;
  shadowDOM: boolean;
  modules: boolean;
  webWorkers: boolean;
  sharedArrayBuffer: boolean;
  offscreenCanvas: boolean;
  css: {
    grid: boolean;
    flexbox: boolean;
    customProperties: boolean;
    backdrop: boolean;
    containerQueries: boolean;
    subgrid: boolean;
  };
  es6: {
    arrow: boolean;
    classes: boolean;
    destructuring: boolean;
    modules: boolean;
    promises: boolean;
    async: boolean;
    maps: boolean;
    sets: boolean;
    symbols: boolean;
  };
}

export interface CompatibilityIssue {
  feature: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  workaround?: string;
  polyfillAvailable?: boolean;
  affectedFeatures: string[];
}

export class BrowserCompatibilityDetector {
  private userAgent: string;

  private capabilities: BrowserCapabilities | null = null;

  constructor() {
    this.userAgent = navigator.userAgent;
  }

  detectCapabilities(): BrowserCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    this.capabilities = {
      ...this.detectBrowserInfo(),
      ...this.detectHardwareCapabilities(),
      ...this.detectAPISupport(),
      css: this.detectCSSSupport(),
      es6: this.detectES6Support(),
    };

    return this.capabilities;
  }

  private detectBrowserInfo(): Pick<BrowserCapabilities, 'name' | 'version' | 'engine' | 'platform' | 'mobile'> {
    const ua = this.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let engine = 'Unknown';
    let mobile = false;

    // Mobile detection
    mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // Browser detection
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Gecko';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'WebKit';
    } else if (ua.includes('Edg')) {
      name = 'Edge';
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';
    } else if (ua.includes('Opera') || ua.includes('OPR')) {
      name = 'Opera';
      const match = ua.match(/(?:Opera|OPR)\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';
    }

    // Platform detection
    let platform = 'Unknown';
    if (ua.includes('Windows')) platform = 'Windows';
    else if (ua.includes('Mac')) platform = 'macOS';
    else if (ua.includes('Linux')) platform = 'Linux';
    else if (ua.includes('Android')) platform = 'Android';
    else if (ua.includes('iOS')) platform = 'iOS';

    return {
      name, version, engine, platform, mobile,
    };
  }

  private detectHardwareCapabilities(): Pick<BrowserCapabilities, 'touch' | 'webgl'> {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let webgl = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      webgl = !!gl;
    } catch (e) {
      webgl = false;
    }

    return { touch, webgl };
  }

  private detectAPISupport(): Omit<BrowserCapabilities, 'name' | 'version' | 'engine' | 'platform' | 'mobile' | 'touch' | 'webgl' | 'css' | 'es6'> {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      indexedDB: 'indexedDB' in window,
      webAssembly: 'WebAssembly' in window,
      webRTC: 'RTCPeerConnection' in window || 'webkitRTCPeerConnection' in window,
      geolocation: 'geolocation' in navigator,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      battery: 'getBattery' in navigator,
      vibration: 'vibrate' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement
                  || 'webkitRequestFullscreen' in document.documentElement
                  || 'mozRequestFullScreen' in document.documentElement,
      notifications: 'Notification' in window,
      clipboard: 'clipboard' in navigator,
      webUSB: 'usb' in navigator,
      webSerial: 'serial' in navigator,
      customElements: 'customElements' in window,
      shadowDOM: 'attachShadow' in Element.prototype,
      modules: this.testModuleSupport(),
      webWorkers: 'Worker' in window,
      sharedArrayBuffer: 'SharedArrayBuffer' in window,
      offscreenCanvas: 'OffscreenCanvas' in window,
    };
  }

  private testModuleSupport(): boolean {
    const script = document.createElement('script');
    return 'noModule' in script;
  }

  private detectCSSSupport(): BrowserCapabilities['css'] {
    const testCSS = (property: string, value?: string) => {
      try {
        if (CSS && CSS.supports) {
          return CSS.supports(property, value || 'initial');
        }
        // Fallback for older browsers
        const element = document.createElement('div');
        element.style.setProperty(property, value || 'initial');
        return element.style.getPropertyValue(property) !== '';
      } catch (e) {
        return false;
      }
    };

    return {
      grid: testCSS('display', 'grid'),
      flexbox: testCSS('display', 'flex'),
      customProperties: testCSS('--test-var', '1'),
      backdrop: testCSS('backdrop-filter', 'blur(5px)'),
      containerQueries: testCSS('container-type', 'inline-size'),
      subgrid: testCSS('grid-template-rows', 'subgrid'),
    };
  }

  private detectES6Support(): BrowserCapabilities['es6'] {
    try {
      return {
        arrow: (() => {
          try {
            eval('() => {}');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        classes: (() => {
          try {
            eval('class Test {}');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        destructuring: (() => {
          try {
            eval('const [a, b] = [1, 2]');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        modules: 'import' in document.createElement('script'),
        promises: 'Promise' in window,
        async: (() => {
          try {
            eval('async function test() {}');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        maps: 'Map' in window,
        sets: 'Set' in window,
        symbols: 'Symbol' in window,
      };
    } catch (e) {
      return {
        arrow: false,
        classes: false,
        destructuring: false,
        modules: false,
        promises: false,
        async: false,
        maps: false,
        sets: false,
        symbols: false,
      };
    }
  }

  analyzeCompatibility(): CompatibilityIssue[] {
    const capabilities = this.detectCapabilities();
    const issues: CompatibilityIssue[] = [];

    // Critical features for CNC control
    if (!capabilities.serviceWorker) {
      issues.push({
        feature: 'Service Worker',
        severity: 'critical',
        message: 'Service Worker not supported - offline functionality unavailable',
        workaround: 'Implement manual caching and disable offline features',
        polyfillAvailable: false,
        affectedFeatures: ['Offline support', 'Background sync', 'Push notifications'],
      });
    }

    if (!capabilities.indexedDB) {
      issues.push({
        feature: 'IndexedDB',
        severity: 'critical',
        message: 'IndexedDB not supported - local data storage limited',
        workaround: 'Use localStorage with size limitations',
        polyfillAvailable: true,
        affectedFeatures: ['Offline data storage', 'Job queue persistence'],
      });
    }

    if (!capabilities.touch && capabilities.mobile) {
      issues.push({
        feature: 'Touch Events',
        severity: 'high',
        message: 'Touch events not supported on mobile device',
        workaround: 'Use mouse events as fallback',
        polyfillAvailable: true,
        affectedFeatures: ['Touch controls', 'Gesture recognition'],
      });
    }

    if (!capabilities.webgl) {
      issues.push({
        feature: 'WebGL',
        severity: 'medium',
        message: 'WebGL not supported - 3D visualization unavailable',
        workaround: 'Use 2D canvas or SVG for visualization',
        polyfillAvailable: false,
        affectedFeatures: ['3D working area preview', 'Advanced visualizations'],
      });
    }

    if (!capabilities.css.grid) {
      issues.push({
        feature: 'CSS Grid',
        severity: 'medium',
        message: 'CSS Grid not supported - layout may be degraded',
        workaround: 'Use flexbox fallbacks',
        polyfillAvailable: true,
        affectedFeatures: ['Dashboard layout', 'Responsive design'],
      });
    }

    if (!capabilities.css.customProperties) {
      issues.push({
        feature: 'CSS Custom Properties',
        severity: 'medium',
        message: 'CSS Custom Properties not supported - theming limited',
        workaround: 'Use preprocessor variables',
        polyfillAvailable: true,
        affectedFeatures: ['Dynamic theming', 'High contrast mode'],
      });
    }

    if (!capabilities.es6.promises) {
      issues.push({
        feature: 'Promises',
        severity: 'high',
        message: 'Promises not supported - async operations may fail',
        workaround: 'Use callback-based patterns',
        polyfillAvailable: true,
        affectedFeatures: ['API calls', 'File operations', 'Async workflows'],
      });
    }

    if (!capabilities.es6.async) {
      issues.push({
        feature: 'Async/Await',
        severity: 'medium',
        message: 'Async/await not supported - code complexity increased',
        workaround: 'Use Promise.then() syntax',
        polyfillAvailable: true,
        affectedFeatures: ['Modern JavaScript patterns', 'Error handling'],
      });
    }

    if (!capabilities.fullscreen) {
      issues.push({
        feature: 'Fullscreen API',
        severity: 'low',
        message: 'Fullscreen API not supported',
        workaround: 'Manual fullscreen simulation',
        polyfillAvailable: true,
        affectedFeatures: ['Fullscreen mode', 'Kiosk mode'],
      });
    }

    if (!capabilities.vibration && capabilities.mobile) {
      issues.push({
        feature: 'Vibration API',
        severity: 'low',
        message: 'Vibration API not supported - haptic feedback unavailable',
        workaround: 'Visual feedback only',
        polyfillAvailable: false,
        affectedFeatures: ['Haptic feedback', 'Touch confirmations'],
      });
    }

    return issues;
  }

  generateCompatibilityReport(): {
    browser: Pick<BrowserCapabilities, 'name' | 'version' | 'engine' | 'platform'>;
    supportLevel: 'excellent' | 'good' | 'fair' | 'poor';
    issues: CompatibilityIssue[];
    recommendations: string[];
    } {
    const capabilities = this.detectCapabilities();
    const issues = this.analyzeCompatibility();

    const criticalIssues = issues.filter((i) => i.severity === 'critical').length;
    const highIssues = issues.filter((i) => i.severity === 'high').length;
    const mediumIssues = issues.filter((i) => i.severity === 'medium').length;

    let supportLevel: 'excellent' | 'good' | 'fair' | 'poor';
    if (criticalIssues === 0 && highIssues === 0 && mediumIssues <= 2) {
      supportLevel = 'excellent';
    } else if (criticalIssues === 0 && highIssues <= 1 && mediumIssues <= 4) {
      supportLevel = 'good';
    } else if (criticalIssues <= 1 && highIssues <= 2) {
      supportLevel = 'fair';
    } else {
      supportLevel = 'poor';
    }

    const recommendations = this.generateRecommendations(capabilities, issues);

    return {
      browser: {
        name: capabilities.name,
        version: capabilities.version,
        engine: capabilities.engine,
        platform: capabilities.platform,
      },
      supportLevel,
      issues,
      recommendations,
    };
  }

  private generateRecommendations(capabilities: BrowserCapabilities, issues: CompatibilityIssue[]): string[] {
    const recommendations: string[] = [];

    if (capabilities.name === 'Chrome' && parseInt(capabilities.version) >= 90) {
      recommendations.push('Excellent browser choice for CNC control applications');
    } else if (capabilities.name === 'Firefox' && parseInt(capabilities.version) >= 88) {
      recommendations.push('Good browser choice with solid industrial compatibility');
    } else if (capabilities.name === 'Safari' && parseInt(capabilities.version) >= 14) {
      recommendations.push('Acceptable for basic functionality, some features may be limited');
    } else if (capabilities.name === 'Edge' && parseInt(capabilities.version) >= 90) {
      recommendations.push('Good browser choice for Windows industrial environments');
    } else {
      recommendations.push('Consider upgrading to a more recent browser version');
    }

    if (issues.some((i) => i.severity === 'critical')) {
      recommendations.push('Critical compatibility issues detected - some features will not work');
    }

    if (!capabilities.touch && capabilities.mobile) {
      recommendations.push('Enable touch events in browser settings for optimal mobile experience');
    }

    if (!capabilities.serviceWorker) {
      recommendations.push('Upgrade browser to enable offline functionality');
    }

    if (!capabilities.webgl) {
      recommendations.push('Enable hardware acceleration for 3D visualization features');
    }

    if (capabilities.platform === 'iOS' && capabilities.name === 'Safari') {
      recommendations.push('Consider using Chrome or Firefox for better web standards support');
    }

    if (parseInt(capabilities.version) < 70 && capabilities.name === 'Chrome') {
      recommendations.push('Chrome version is outdated - update for security and feature support');
    }

    return recommendations;
  }
}

// Polyfill loader
export class PolyfillLoader {
  private loadedPolyfills = new Set<string>();

  async loadPolyfillsFor(capabilities: BrowserCapabilities): Promise<void> {
    const polyfills: Array<{ condition: boolean; name: string; url: string }> = [
      {
        condition: !capabilities.es6.promises,
        name: 'es6-promise',
        url: 'https://cdn.jsdelivr.net/npm/es6-promise@4.2.8/dist/es6-promise.auto.min.js',
      },
      {
        condition: !capabilities.indexedDB,
        name: 'fake-indexeddb',
        url: 'https://cdn.jsdelivr.net/npm/fake-indexeddb@4.0.2/build/fdb.min.js',
      },
      {
        condition: !capabilities.css.customProperties,
        name: 'css-vars-ponyfill',
        url: 'https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2.4.8/dist/css-vars-ponyfill.min.js',
      },
      {
        condition: !capabilities.fullscreen,
        name: 'fullscreen-polyfill',
        url: 'https://cdn.jsdelivr.net/npm/fullscreen-polyfill@1.0.2/dist/fullscreen.polyfill.min.js',
      },
      {
        condition: !capabilities.es6.async,
        name: 'regenerator-runtime',
        url: 'https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.11/runtime.min.js',
      },
    ];

    const loadPromises = polyfills
      .filter((p) => p.condition && !this.loadedPolyfills.has(p.name))
      .map((p) => this.loadPolyfill(p.name, p.url));

    await Promise.all(loadPromises);
  }

  private async loadPolyfill(name: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        this.loadedPolyfills.add(name);
        console.log(`Polyfill loaded: ${name}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load polyfill: ${name}`);
        reject(new Error(`Failed to load polyfill: ${name}`));
      };
      document.head.appendChild(script);
    });
  }

  getLoadedPolyfills(): string[] {
    return Array.from(this.loadedPolyfills);
  }
}

// Browser testing utilities
export const testBrowserFeatures = (): Promise<{
  touchSupport: boolean;
  performanceGood: boolean;
  storageWorking: boolean;
  networkStable: boolean;
}> => new Promise((resolve) => {
  const results = {
    touchSupport: false,
    performanceGood: false,
    storageWorking: false,
    networkStable: false,
  };

  // Test touch support
  results.touchSupport = 'ontouchstart' in window;

  // Test performance
  const start = performance.now();
  for (let i = 0; i < 100000; i++) {
    Math.random();
  }
  const end = performance.now();
  results.performanceGood = (end - start) < 50;

  // Test storage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    results.storageWorking = true;
  } catch (e) {
    results.storageWorking = false;
  }

  // Test network (simple connectivity check)
  fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
    .then(() => {
      results.networkStable = true;
      resolve(results);
    })
    .catch(() => {
      results.networkStable = false;
      resolve(results);
    });
});

// React hook for browser compatibility
export const useBrowserCompatibility = () => {
  const [compatibility, setCompatibility] = React.useState<{
    capabilities: BrowserCapabilities | null;
    issues: CompatibilityIssue[];
    supportLevel: string;
    recommendations: string[];
  }>({
    capabilities: null,
    issues: [],
    supportLevel: 'unknown',
    recommendations: [],
  });

  React.useEffect(() => {
    const detector = new BrowserCompatibilityDetector();
    const capabilities = detector.detectCapabilities();
    const report = detector.generateCompatibilityReport();

    setCompatibility({
      capabilities,
      issues: report.issues,
      supportLevel: report.supportLevel,
      recommendations: report.recommendations,
    });

    // Load polyfills if needed
    const polyfillLoader = new PolyfillLoader();
    polyfillLoader.loadPolyfillsFor(capabilities).catch(console.error);
  }, []);

  return compatibility;
};

// Export singleton instances
export const browserDetector = new BrowserCompatibilityDetector();
export const polyfillLoader = new PolyfillLoader();

export default {
  BrowserCompatibilityDetector,
  PolyfillLoader,
  testBrowserFeatures,
  useBrowserCompatibility,
  browserDetector,
  polyfillLoader,
};
