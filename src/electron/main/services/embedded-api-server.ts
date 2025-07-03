import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import path from 'path';
import net from 'net';
const fetch = require('node-fetch');

export class EmbeddedApiServer {
  private process: ChildProcess | null = null;

  private port: number | null = null;

  private isReady: boolean = false;

  private baseUrl: string | null = null;

  async start(): Promise<string> {
    console.log('🚀 Starting embedded API server...');

    try {
      // Find available port
      this.port = await this.findAvailablePort(3000);

      // Get API server path
      const serverPath = this.getServerPath();

      // Set up environment with Supabase configuration
      const env = {
        ...process.env,
        PORT: this.port.toString(),
        NODE_ENV: 'production',
        EMBEDDED_MODE: 'true',
        // Supabase configuration
        SUPABASE_URL: process.env.SUPABASE_URL || 'https://osbwbvbswubqjyeqrxee.supabase.co',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zYndidmJzd3VicWp5ZXFyeGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTkzNTMsImV4cCI6MjA2NzA3NTM1M30.qT1YatxADWcer300ZpFmseYwW7P0lhdy-NgckV-m8lc',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      };

      // Start the server process
      this.process = spawn(process.execPath, [serverPath], {
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      });

      // Handle process output
      this.setupProcessHandlers();

      // Wait for server to be ready
      await this.waitForServer();

      this.baseUrl = `http://localhost:${this.port}`;
      this.isReady = true;

      console.log(`✅ API server ready at ${this.baseUrl}`);
      return this.baseUrl;
    } catch (error) {
      console.error('❌ Failed to start API server:', error);
      throw error;
    }
  }

  private getServerPath(): string {
    if (app.isPackaged) {
      // Production: API bundled in resources
      return path.join(process.resourcesPath, 'api', 'src', 'server.js');
    }
    // Development: Use API from build-resources (after integration)
    const devPath = path.join(__dirname, '..', '..', '..', 'build-resources', 'api', 'src', 'server.js');
    
    // Fallback to direct API repo for development if build-resources doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(devPath)) {
      return path.join(__dirname, '..', '..', '..', '..', '..', 'api', 'src', 'server.js');
    }
    
    return devPath;
  }

  private setupProcessHandlers(): void {
    if (!this.process) return;

    this.process.stdout?.on('data', (data) => {
      console.log(`[API] ${data.toString().trim()}`);
    });

    this.process.stderr?.on('data', (data) => {
      console.error(`[API Error] ${data.toString().trim()}`);
    });

    this.process.on('exit', (code) => {
      console.log(`[API] Process exited with code ${code}`);
      this.isReady = false;
    });

    this.process.on('error', (error) => {
      console.error('[API] Process error:', error);
      this.isReady = false;
    });
  }

  private async findAvailablePort(startPort: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();

      server.listen(startPort, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          const { port } = address;
          server.close(() => resolve(port));
        } else {
          reject(new Error('Unable to get server address'));
        }
      });

      server.on('error', () => {
        if (startPort < 65535) {
          resolve(this.findAvailablePort(startPort + 1));
        } else {
          reject(new Error('No available ports found'));
        }
      });
    });
  }

  private async waitForServer(maxAttempts: number = 30, interval: number = 1000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`http://localhost:${this.port}/api/v1/health`, {
          timeout: 2000,
        } as any);

        if (response.ok) {
          console.log(`✅ API health check passed (attempt ${attempt})`);
          return true;
        }
      } catch (error) {
        console.log(`⏳ Waiting for API server... (attempt ${attempt}/${maxAttempts})`);
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(`API server failed to start after ${maxAttempts} attempts`);
  }

  stop(): void {
    if (this.process && !this.process.killed) {
      console.log('🛑 Stopping API server...');
      this.process.kill('SIGTERM');

      // Force kill after timeout
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGKILL');
        }
      }, 5000);
    }

    this.process = null;
    this.isReady = false;
    this.baseUrl = null;
  }

  getBaseUrl(): string | null {
    return this.baseUrl;
  }

  isServerReady(): boolean {
    return this.isReady;
  }
}
