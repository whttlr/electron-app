import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
// import { pathToFileURL } from 'url'; // Currently unused
import { EmbeddedApiServer } from './services/embedded-api-server';

const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let apiServer: EmbeddedApiServer | null = null;

async function createWindow() {
  // Start embedded API server
  console.log('🔄 Initializing application...');

  try {
    apiServer = new EmbeddedApiServer();
    const apiUrl = await apiServer.start();

    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: 'CNC Jog Controls',
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false, // Allow local file access for testing
        allowRunningInsecureContent: true,
        experimentalFeatures: true,
      },
      show: false, // Don't show until ready
    });

    // Set up IPC handlers
    setupIpcHandlers();

    // Show window when ready to prevent white flash
    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });

    // Use app.isPackaged to reliably detect production vs development
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      isPackaged: app.isPackaged,
      __dirname,
    });

    if (!app.isPackaged) {
      // Development mode - load from Vite dev server
      console.log('Development mode: Loading from Vite dev server...');
      await mainWindow.loadURL('http://localhost:5173');
    } else {
      // Production mode - load from built files
      console.log('Production mode: Loading from built files...');
      const indexPath = path.join(__dirname, '../../dist/index.html');
      console.log(`Loading from: ${indexPath}`);
      console.log(`File exists: ${(await import('fs')).existsSync(indexPath)}`);
      await mainWindow.loadFile(indexPath);
    }

    // Send API configuration to renderer
    mainWindow.webContents.send('api-ready', {
      baseUrl: apiUrl,
    });

    console.log('✅ Application ready!');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    app.quit();
  }

  // Add error handling for failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading successfully');
  });

  // Only open DevTools in development mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers() {
  // API configuration
  ipcMain.handle('get-api-config', () => ({
    baseUrl: apiServer?.getBaseUrl(),
    ready: apiServer?.isServerReady(),
  }));

  // API health check
  ipcMain.handle('api-health-check', async () => {
    if (!apiServer?.isServerReady()) {
      return { healthy: false, error: 'API server not ready' };
    }

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${apiServer.getBaseUrl()}/health`);
      return { healthy: response.ok };
    } catch (error) {
      return { healthy: false, error: (error as Error).message };
    }
  });

  // Handle IPC communications
  ipcMain.handle('get-app-version', () => app.getVersion());
}

app.whenReady().then(() => {
  // Set app name
  app.setName('CNC Jog Controls');

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  console.log('🔄 Shutting down...');
  apiServer?.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
