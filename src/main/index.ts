import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers } from './ipc';
import { OpenClawBridge } from './services/openclaw-bridge';

let mainWindow: BrowserWindow | null = null;
const __dirname = fileURLToPath(new URL('.', import.meta.url));

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#f3ede2',
    title: 'Dclaw',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, '../../dist/renderer/index.html'));
  }
}

app.whenReady().then(() => {
  const bridge = new OpenClawBridge(join(app.getPath('userData'), 'openclaw.config.json'));
  registerIpcHandlers(bridge);
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
