import { spawn } from 'child_process';
import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class EmbeddedApiServer {
  constructor() {
    this.process = null;
    this.port = null;
    this.isReady = false;
    this.baseUrl = null;
    this.startupTimeout = 30000; // 30 seconds
  }

  async start() {
    console.log('🚀 Starting embedded API server...');
    
    try {
      // Find available port
      this.port = await this.findAvailablePort(3000);
      console.log(`📡 Using port: ${this.port}`);
      
      // Get API server path
      const serverPath = this.getServerPath();
      console.log(`📁 Server path: ${serverPath}`);
      
      // Start the server process
      await this.startServerProcess(serverPath);
      
      // Wait for server to be ready
      await this.waitForServer();
      
      this.baseUrl = `http://localhost:${this.port}`;
      this.isReady = true;
      
      console.log(`✅ API server ready at ${this.baseUrl}`);
      return this.baseUrl;
      
    } catch (error) {
      console.error('❌ Failed to start API server:', error);
      this.stop();
      throw error;
    }
  }

  getServerPath() {
    if (app.isPackaged) {
      // Production: API bundled in app resources
      return path.join(process.resourcesPath, 'api', 'src', 'server.js');
    } else {
      // Development: Use API from build-resources (after integration)
      const devPath = path.join(__dirname, '..', '..', '..', 'build-resources', 'api', 'src', 'server.js');
      
      // Fallback to direct API repo for development
      if (!require('fs').existsSync(devPath)) {
        return path.join(__dirname, '..', '..', '..', '..', 'api', 'src', 'server.js');
      }
      
      return devPath;
    }
  }

  async startServerProcess(serverPath) {
    console.log(`🔧 Starting Node.js process: ${serverPath}`);
    
    const env = {
      ...process.env,
      PORT: this.port,
      NODE_ENV: app.isPackaged ? 'production' : 'development',
      EMBEDDED_MODE: 'true',
      // Disable some features that might conflict in embedded mode
      DISABLE_CORS: 'false',
      LOG_LEVEL: 'info'
    };

    this.process = spawn(process.execPath, [serverPath], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false,
      cwd: path.dirname(serverPath)
    });

    this.setupProcessHandlers();
  }

  setupProcessHandlers() {
    this.process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[API] ${output}`);
      }
    });
    
    this.process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`[API Error] ${output}`);
      }
    });
    
    this.process.on('exit', (code, signal) => {
      console.log(`[API] Process exited with code ${code}, signal ${signal}`);
      this.isReady = false;
      this.process = null;
    });
    
    this.process.on('error', (error) => {
      console.error('[API] Process error:', error);
      this.isReady = false;
    });
  }

  async findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      
      server.listen(startPort, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && startPort < 65535) {
          resolve(this.findAvailablePort(startPort + 1));
        } else {
          reject(new Error(`No available ports found starting from ${startPort}`));
        }
      });
    });
  }

  async waitForServer() {
    console.log('⏳ Waiting for API server to be ready...');
    
    const maxAttempts = 30;
    const interval = 1000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Use dynamic import for fetch since we're in Node.js
        const { default: fetch } = await import('node-fetch');
        
        const response = await fetch(`http://localhost:${this.port}/health`, {
          timeout: 2000
        });
        
        if (response.ok) {
          console.log(`✅ API health check passed (attempt ${attempt})`);
          return true;
        }
      } catch (error) {
        console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Server not ready yet...`);
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error(`API server failed to start after ${maxAttempts} attempts`);
  }

  stop() {
    if (this.process && !this.process.killed) {
      console.log('🛑 Stopping API server...');
      
      // Try graceful shutdown first
      this.process.kill('SIGTERM');
      
      // Force kill after timeout
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          console.log('🔪 Force killing API server...');
          this.process.kill('SIGKILL');
        }
      }, 5000);
    }
    
    this.process = null;
    this.isReady = false;
    this.baseUrl = null;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  isServerReady() {
    return this.isReady;
  }
}