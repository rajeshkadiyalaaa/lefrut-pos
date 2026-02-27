// Electron main process (ESM)
// Loads Vite build from build/index.html

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const kiosk = String(process.env.ELECTRON_KIOSK || '').toLowerCase() === 'true';

  const win = new BrowserWindow({
    width: kiosk ? 800 : 1280,
    height: kiosk ? 600 : 800,
    kiosk,
    fullscreen: kiosk,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Disable sandbox to prevent freezing with database operations
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: true // Keep dev tools available for debugging
    }
  });

  // Load the built frontend
  const indexPath = path.join(__dirname, 'build', 'index.html');
  win.loadFile(indexPath);

  // Optional: open external links in default browser
  // Allow internal windows (like print dialogs) but block external URLs
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Allow about:blank and blob URLs for printing
    if (url.startsWith('about:') || url.startsWith('blob:') || url.startsWith('data:')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false // Disable sandbox for print windows
          }
        }
      };
    }
    // Open external URLs in system browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Dev tools in development
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle silent print requests from renderer
  ipcMain.handle('print', async (event, options = {}) => {
    const webContents = event.sender;
    return new Promise((resolve, reject) => {
      try {
        webContents.print({
          silent: false, // Show print dialog to avoid freezing
          printBackground: true,
          ...options,
        }, (success, failureReason) => {
          if (success) resolve(true);
          else reject(new Error(failureReason || 'Print failed'));
        });
      } catch (err) {
        console.error('Print error:', err);
        reject(err);
      }
    });
  });

  // Prevent unhandled exceptions from freezing the app
  win.webContents.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  win.webContents.on('responsive', () => {
    console.log('Window became responsive again');
  });

  // Handle renderer process crashes
  win.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details);
    if (details.reason !== 'clean-exit') {
      // Reload the window if it crashed
      win.reload();
    }
  });
}

// Global error handlers to prevent freezing
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Don't exit - try to continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit - try to continue running
});

// Basic app lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Quit on all platforms (including mac) for kiosk-like behavior
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
