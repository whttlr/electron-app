import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { pathToFileURL } from 'url';

const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Allow local file access for testing
      allowRunningInsecureContent: true,
      experimentalFeatures: true
    },
    show: false // Don't show until ready
  });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load from built files for testing, dev server for development
  if (process.env.NODE_ENV === 'test') {
    // Load from built files during testing
    const filePath = path.join(__dirname, '../../dist/index.html');
    mainWindow.loadFile(filePath);
  } else {
    // Use development server for development
    mainWindow.loadURL('http://localhost:3001');
  }
  
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
  app.setName('jog-controls-playground');
  
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
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});