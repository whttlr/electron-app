import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { pathToFileURL } from 'url';

const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
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

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load from appropriate source based on environment
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Use development server for development
    mainWindow.loadURL('http://localhost:5173'); // Vite default port
  } else {
    // Load from built files in production
    const indexPath = path.join(__dirname, '../../dist/index.html');
    console.log(`Loading Electron app from: ${indexPath}`);
    console.log(`Current __dirname: ${__dirname}`);
    console.log(`File exists: ${require('fs').existsSync(indexPath)}`);
    mainWindow.loadFile(indexPath);
  }

  // Add error handling for failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading successfully');
  });

  // Only open DevTools in actual development (not test)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC communications
ipcMain.handle('get-app-version', () => app.getVersion());
