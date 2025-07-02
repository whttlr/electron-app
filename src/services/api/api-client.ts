declare global {
  interface Window {
    electronAPI: {
      getApiConfig: () => Promise<{ baseUrl: string | null; ready: boolean }>;
      apiHealthCheck: () => Promise<{ healthy: boolean; error?: string }>;
    };
  }
}

class ApiClient {
  private baseUrl: string | null = null;

  private ready: boolean = false;

  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      const config = await window.electronAPI.getApiConfig();

      if (!config.ready || !config.baseUrl) {
        throw new Error('API server not ready');
      }

      this.baseUrl = config.baseUrl;
      this.ready = true;

      console.log('✅ API client initialized:', this.baseUrl);
    } catch (error) {
      console.error('❌ Failed to initialize API client:', error);
      throw error;
    }
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    await this.initialize();

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // CNC-specific API methods
  async getConnectionStatus(): Promise<any> {
    return this.request('/api/connection/status');
  }

  async connect(port: string): Promise<any> {
    return this.request('/api/connection/connect', {
      method: 'POST',
      body: JSON.stringify({ port }),
    });
  }

  async disconnect(): Promise<any> {
    return this.request('/api/connection/disconnect', {
      method: 'POST',
    });
  }

  async getMachineStatus(): Promise<any> {
    return this.request('/api/machine/status');
  }

  async sendGcode(commands: string | string[]): Promise<any> {
    return this.request('/api/gcode/execute', {
      method: 'POST',
      body: JSON.stringify({
        commands: Array.isArray(commands) ? commands : [commands],
      }),
    });
  }

  async listSerialPorts(): Promise<any> {
    return this.request('/api/connection/ports');
  }

  async uploadGcodeFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/files/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const health = await window.electronAPI.apiHealthCheck();
      return health;
    } catch (error) {
      return { healthy: false, error: (error as Error).message };
    }
  }

  getBaseUrl(): string | null {
    return this.baseUrl;
  }

  isReady(): boolean {
    return this.ready;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
