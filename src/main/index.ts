import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers } from './ipc';
import { DclawClientRuntime } from './runtime/dclaw-client-runtime';
import { OpenClawBridge } from './services/openclaw-bridge';
import { OpenClawSidecarManager } from './services/openclaw-sidecar';

let mainWindow: BrowserWindow | null = null;
let sidecarManager: OpenClawSidecarManager | null = null;
let clientRuntime: DclawClientRuntime | null = null;
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
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, '../../dist/renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  clientRuntime = await DclawClientRuntime.bootstrap(app.getPath('userData'));
  const bridge = new OpenClawBridge(join(app.getPath('userData'), 'openclaw.config.json'));
  sidecarManager = new OpenClawSidecarManager(app.getPath('userData'));

  await sidecarManager
    .start()
    .then((started) => {
      if (started) {
        bridge.setRuntimeOverride(sidecarManager!.getBridgeConfigOverride());
      }
    })
    .catch((error) => {
      console.warn('[dclaw] failed to start bundled OpenClaw sidecar, using fallback integration', error);
    });

  registerIpcHandlers(bridge, clientRuntime);
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

app.on('before-quit', () => {
  if (sidecarManager) {
    void sidecarManager.stop();
  }
});
