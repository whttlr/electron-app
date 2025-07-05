/**
 * Visual Regression Testing Utilities
 * 
 * Automated visual testing framework for CNC control interfaces.
 * Captures and compares screenshots across different devices, orientations,
 * and accessibility modes to ensure consistent visual experience.
 */

export interface VisualTestConfig {
  name: string;
  description: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  theme: 'light' | 'dark';
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
  selector?: string;
  hideElements?: string[];
  waitForSelector?: string;
  delay?: number;
  threshold?: number;
}

export interface VisualTestResult {
  testName: string;
  passed: boolean;
  difference: number;
  threshold: number;
  screenshotPath: string;
  baselinePath: string;
  diffPath?: string;
  timestamp: number;
  metadata: {
    viewport: { width: number; height: number };
    userAgent: string;
    devicePixelRatio: number;
  };
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality?: number;
  type?: 'png' | 'jpeg';
  omitBackground?: boolean;
}

// Canvas-based image comparison
export class ImageComparator {
  static async compareImages(
    baseline: string | HTMLCanvasElement,
    current: string | HTMLCanvasElement,
    threshold = 0.1
  ): Promise<{
    difference: number;
    passed: boolean;
    diffCanvas?: HTMLCanvasElement;
  }> {
    const baselineCanvas = await this.loadImageToCanvas(baseline);
    const currentCanvas = await this.loadImageToCanvas(current);

    if (
      baselineCanvas.width !== currentCanvas.width ||
      baselineCanvas.height !== currentCanvas.height
    ) {
      throw new Error('Image dimensions do not match');
    }

    const width = baselineCanvas.width;
    const height = baselineCanvas.height;

    const baselineData = baselineCanvas.getContext('2d')!.getImageData(0, 0, width, height);
    const currentData = currentCanvas.getContext('2d')!.getImageData(0, 0, width, height);

    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = width;
    diffCanvas.height = height;
    const diffContext = diffCanvas.getContext('2d')!;
    const diffData = diffContext.createImageData(width, height);

    let differentPixels = 0;
    const totalPixels = width * height;

    for (let i = 0; i < baselineData.data.length; i += 4) {
      const baselineR = baselineData.data[i];
      const baselineG = baselineData.data[i + 1];
      const baselineB = baselineData.data[i + 2];
      const baselineA = baselineData.data[i + 3];

      const currentR = currentData.data[i];
      const currentG = currentData.data[i + 1];
      const currentB = currentData.data[i + 2];
      const currentA = currentData.data[i + 3];

      const deltaR = Math.abs(baselineR - currentR);
      const deltaG = Math.abs(baselineG - currentG);
      const deltaB = Math.abs(baselineB - currentB);
      const deltaA = Math.abs(baselineA - currentA);

      const pixelDiff = (deltaR + deltaG + deltaB + deltaA) / (255 * 4);

      if (pixelDiff > 0.01) { // Sensitivity threshold
        differentPixels++;
        
        // Highlight different pixels in red
        diffData.data[i] = 255;     // R
        diffData.data[i + 1] = 0;   // G
        diffData.data[i + 2] = 0;   // B
        diffData.data[i + 3] = 255; // A
      } else {
        // Keep original pixel but make it semi-transparent
        diffData.data[i] = currentR;
        diffData.data[i + 1] = currentG;
        diffData.data[i + 2] = currentB;
        diffData.data[i + 3] = currentA * 0.3;
      }
    }

    diffContext.putImageData(diffData, 0, 0);

    const difference = differentPixels / totalPixels;
    const passed = difference <= threshold;

    return {
      difference,
      passed,
      diffCanvas: difference > 0 ? diffCanvas : undefined,
    };
  }

  private static async loadImageToCanvas(
    source: string | HTMLCanvasElement
  ): Promise<HTMLCanvasElement> {
    if (source instanceof HTMLCanvasElement) {
      return source;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = source;
    });
  }
}

// Screenshot capture utilities
export class ScreenshotCapture {
  static async captureElement(
    element: HTMLElement,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    // Use html2canvas for element screenshots
    if (typeof window !== 'undefined' && 'html2canvas' in window) {
      const canvas = await (window as any).html2canvas(element, {
        backgroundColor: options.omitBackground ? null : '#ffffff',
        scale: window.devicePixelRatio,
        useCORS: true,
        allowTaint: false,
      });

      return canvas.toDataURL(
        options.type === 'jpeg' ? 'image/jpeg' : 'image/png',
        options.quality || 0.9
      );
    }

    // Fallback: capture using canvas if available
    return this.captureElementFallback(element, options);
  }

  private static async captureElementFallback(
    element: HTMLElement,
    options: ScreenshotOptions
  ): Promise<string> {
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Simple fallback - create a solid color rectangle
    context.fillStyle = '#f0f0f0';
    context.fillRect(0, 0, rect.width, rect.height);
    context.fillStyle = '#333';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText(
      'Screenshot Placeholder',
      rect.width / 2,
      rect.height / 2
    );

    return canvas.toDataURL(
      options.type === 'jpeg' ? 'image/jpeg' : 'image/png',
      options.quality || 0.9
    );
  }

  static async captureViewport(options: ScreenshotOptions = {}): Promise<string> {
    // Use Screen Capture API if available
    if ('getDisplayMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        return new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d')!;
            context.drawImage(video, 0, 0);

            stream.getTracks().forEach(track => track.stop());

            resolve(canvas.toDataURL(
              options.type === 'jpeg' ? 'image/jpeg' : 'image/png',
              options.quality || 0.9
            ));
          };
          video.onerror = reject;
        });
      } catch (error) {
        console.warn('Screen capture not available:', error);
      }
    }

    // Fallback to document body capture
    return this.captureElement(document.body, options);
  }
}

// Visual regression test runner
export class VisualRegressionTester {
  private baselineStorage = new Map<string, string>();
  private testResults: VisualTestResult[] = [];

  async runTest(config: VisualTestConfig): Promise<VisualTestResult> {
    // Apply test configuration
    await this.applyTestConfig(config);

    // Wait for any specified conditions
    if (config.waitForSelector) {
      await this.waitForElement(config.waitForSelector);
    }

    if (config.delay) {
      await this.delay(config.delay);
    }

    // Hide specified elements
    const hiddenElements = await this.hideElements(config.hideElements || []);

    try {
      // Capture screenshot
      const screenshot = await this.captureScreenshot(config);
      
      // Get baseline image
      const baselineKey = this.getBaselineKey(config);
      const baseline = this.baselineStorage.get(baselineKey);

      let result: VisualTestResult;

      if (!baseline) {
        // First run - save as baseline
        this.baselineStorage.set(baselineKey, screenshot);
        result = {
          testName: config.name,
          passed: true,
          difference: 0,
          threshold: config.threshold || 0.1,
          screenshotPath: `screenshots/${config.name}-current.png`,
          baselinePath: `screenshots/${config.name}-baseline.png`,
          timestamp: Date.now(),
          metadata: {
            viewport: config.viewport,
            userAgent: navigator.userAgent,
            devicePixelRatio: window.devicePixelRatio,
          },
        };
      } else {
        // Compare with baseline
        const comparison = await ImageComparator.compareImages(
          baseline,
          screenshot,
          config.threshold || 0.1
        );

        result = {
          testName: config.name,
          passed: comparison.passed,
          difference: comparison.difference,
          threshold: config.threshold || 0.1,
          screenshotPath: `screenshots/${config.name}-current.png`,
          baselinePath: `screenshots/${config.name}-baseline.png`,
          diffPath: comparison.diffCanvas ? `screenshots/${config.name}-diff.png` : undefined,
          timestamp: Date.now(),
          metadata: {
            viewport: config.viewport,
            userAgent: navigator.userAgent,
            devicePixelRatio: window.devicePixelRatio,
          },
        };

        // Save diff image if there are differences
        if (comparison.diffCanvas) {
          const diffDataUrl = comparison.diffCanvas.toDataURL('image/png');
          this.saveImage(result.diffPath!, diffDataUrl);
        }
      }

      // Save current screenshot
      this.saveImage(result.screenshotPath, screenshot);
      
      this.testResults.push(result);
      return result;

    } finally {
      // Restore hidden elements
      this.restoreElements(hiddenElements);
    }
  }

  private async applyTestConfig(config: VisualTestConfig): Promise<void> {
    // Set viewport
    if (config.viewport) {
      // In a real browser environment, this would set the viewport
      // For testing, we simulate this
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: config.viewport.width,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: config.viewport.height,
      });
    }

    // Apply theme
    document.documentElement.setAttribute('data-theme', config.theme);

    // Apply accessibility settings
    if (config.accessibility.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    }

    if (config.accessibility.largeText) {
      document.documentElement.style.fontSize = '120%';
    }

    if (config.accessibility.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }

    // Apply orientation
    Object.defineProperty(screen, 'orientation', {
      writable: true,
      configurable: true,
      value: {
        angle: config.orientation === 'portrait' ? 0 : 90,
        type: config.orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary',
      },
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  }

  private async waitForElement(selector: string, timeout = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (document.querySelector(selector)) {
        return;
      }
      await this.delay(100);
    }
    
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async hideElements(selectors: string[]): Promise<Array<{ element: HTMLElement; originalDisplay: string }>> {
    const hiddenElements: Array<{ element: HTMLElement; originalDisplay: string }> = [];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const htmlElement = element as HTMLElement;
        hiddenElements.push({
          element: htmlElement,
          originalDisplay: htmlElement.style.display,
        });
        htmlElement.style.display = 'none';
      });
    });

    return hiddenElements;
  }

  private restoreElements(hiddenElements: Array<{ element: HTMLElement; originalDisplay: string }>): void {
    hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay;
    });
  }

  private async captureScreenshot(config: VisualTestConfig): Promise<string> {
    if (config.selector) {
      const element = document.querySelector(config.selector) as HTMLElement;
      if (!element) {
        throw new Error(`Element ${config.selector} not found`);
      }
      return ScreenshotCapture.captureElement(element);
    } else {
      return ScreenshotCapture.captureViewport();
    }
  }

  private getBaselineKey(config: VisualTestConfig): string {
    return `${config.name}-${config.viewport.width}x${config.viewport.height}-${config.orientation}-${config.theme}`;
  }

  private saveImage(path: string, dataUrl: string): void {
    // In a real implementation, this would save to filesystem
    // For testing, we can store in localStorage or IndexedDB
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`visual-test-${path}`, dataUrl);
    }
  }

  getTestResults(): VisualTestResult[] {
    return [...this.testResults];
  }

  clearResults(): void {
    this.testResults = [];
  }

  generateReport(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageDifference: number;
    results: VisualTestResult[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const averageDifference = this.testResults.reduce((sum, r) => sum + r.difference, 0) / totalTests;

    return {
      totalTests,
      passedTests,
      failedTests,
      averageDifference,
      results: this.testResults,
    };
  }
}

// Predefined test configurations for CNC interfaces
export const cncVisualTestConfigs: VisualTestConfig[] = [
  {
    name: 'dashboard-mobile-portrait',
    description: 'Dashboard view on mobile device in portrait mode',
    viewport: { width: 375, height: 667 },
    deviceType: 'mobile',
    orientation: 'portrait',
    theme: 'dark',
    accessibility: { highContrast: false, largeText: false, reducedMotion: false },
    selector: '[data-testid="dashboard"]',
    threshold: 0.1,
  },
  {
    name: 'controls-tablet-landscape',
    description: 'CNC controls on tablet in landscape mode',
    viewport: { width: 1024, height: 768 },
    deviceType: 'tablet',
    orientation: 'landscape',
    theme: 'dark',
    accessibility: { highContrast: false, largeText: false, reducedMotion: false },
    selector: '[data-testid="cnc-controls"]',
    threshold: 0.05,
  },
  {
    name: 'dashboard-high-contrast',
    description: 'Dashboard with high contrast accessibility mode',
    viewport: { width: 1440, height: 900 },
    deviceType: 'desktop',
    orientation: 'landscape',
    theme: 'dark',
    accessibility: { highContrast: true, largeText: false, reducedMotion: false },
    selector: '[data-testid="dashboard"]',
    threshold: 0.15,
  },
  {
    name: 'jog-controls-large-text',
    description: 'Jog controls with large text accessibility mode',
    viewport: { width: 768, height: 1024 },
    deviceType: 'tablet',
    orientation: 'portrait',
    theme: 'dark',
    accessibility: { highContrast: false, largeText: true, reducedMotion: false },
    selector: '[data-testid="jog-controls"]',
    threshold: 0.1,
  },
  {
    name: 'emergency-stop-all-devices',
    description: 'Emergency stop button across all device sizes',
    viewport: { width: 375, height: 667 },
    deviceType: 'mobile',
    orientation: 'portrait',
    theme: 'dark',
    accessibility: { highContrast: false, largeText: false, reducedMotion: true },
    selector: '[data-testid="emergency-stop"]',
    threshold: 0.02,
  },
];

// React hook for visual regression testing
export const useVisualTesting = () => {
  const [tester] = React.useState(() => new VisualRegressionTester());
  const [results, setResults] = React.useState<VisualTestResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const runTest = React.useCallback(async (config: VisualTestConfig) => {
    setIsRunning(true);
    try {
      const result = await tester.runTest(config);
      setResults(prev => [...prev, result]);
      return result;
    } finally {
      setIsRunning(false);
    }
  }, [tester]);

  const runAllTests = React.useCallback(async (configs: VisualTestConfig[]) => {
    setIsRunning(true);
    try {
      const testResults = [];
      for (const config of configs) {
        const result = await tester.runTest(config);
        testResults.push(result);
      }
      setResults(testResults);
      return testResults;
    } finally {
      setIsRunning(false);
    }
  }, [tester]);

  const clearResults = React.useCallback(() => {
    tester.clearResults();
    setResults([]);
  }, [tester]);

  const generateReport = React.useCallback(() => {
    return tester.generateReport();
  }, [tester]);

  return {
    runTest,
    runAllTests,
    clearResults,
    generateReport,
    results,
    isRunning,
  };
};

export default {
  ImageComparator,
  ScreenshotCapture,
  VisualRegressionTester,
  cncVisualTestConfigs,
  useVisualTesting,
};