import { spawn, type ChildProcess } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { Socket } from 'node:net';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { app } from 'electron';
import type { OpenClawConfig } from '../../shared/types';

const DCLAW_SIDECAR_PORT = 19617;
const STARTUP_TIMEOUT_MS = 20_000;

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export class OpenClawSidecarManager {
  private child: ChildProcess | null = null;
  private shuttingDown = false;

  constructor(
    private readonly userDataPath: string,
    private readonly logger: Pick<Console, 'info' | 'warn' | 'error'> = console
  ) {}

  private getRuntimeRoot(): string {
    return app.isPackaged
      ? join(process.resourcesPath, 'openclaw-runtime', 'openclaw')
      : join(app.getAppPath(), 'vendor', 'openclaw-runtime', 'openclaw');
  }

  private getCliEntryPath(): string {
    return join(this.getRuntimeRoot(), 'openclaw.mjs');
  }

  private getStateDir(): string {
    return join(this.userDataPath, 'openclaw-sidecar');
  }

  private getConfigPath(): string {
    return join(this.getStateDir(), 'openclaw.json');
  }

  private getWorkspaceDir(): string {
    return join(this.getStateDir(), 'workspace');
  }

  private getLogPath(): string {
    return join(this.getStateDir(), 'gateway.log');
  }

  async isBundledRuntimeAvailable(): Promise<boolean> {
    return exists(this.getCliEntryPath());
  }

  async prepareState(): Promise<void> {
    await fs.mkdir(this.getStateDir(), { recursive: true });
    await fs.mkdir(this.getWorkspaceDir(), { recursive: true });

    const configPath = this.getConfigPath();
    if (await exists(configPath)) {
      return;
    }

    const legacyConfigPath = join(homedir(), '.openclaw', 'openclaw.json');
    if (await exists(legacyConfigPath)) {
      await fs.copyFile(legacyConfigPath, configPath);
      return;
    }

    const initialConfig = {
      agents: {
        defaults: {
          workspace: this.getWorkspaceDir()
        }
      },
      gateway: {
        mode: 'local',
        auth: {
          mode: 'password'
        }
      }
    };

    await fs.writeFile(configPath, JSON.stringify(initialConfig, null, 2), 'utf8');
  }

  getBridgeConfigOverride(): Partial<OpenClawConfig> {
    return {
      mode: 'cli',
      cliPath: this.getCliEntryPath(),
      cliEntryPath: this.getCliEntryPath(),
      cliUseElectronNode: true,
      gatewayPort: DCLAW_SIDECAR_PORT,
      gatewayUrl: `ws://127.0.0.1:${DCLAW_SIDECAR_PORT}`,
      configPath: this.getConfigPath(),
      workspacePath: this.getWorkspaceDir(),
      workingDirectory: this.getStateDir(),
      defaultAgentId: 'main'
    };
  }

  private async waitUntilReady(): Promise<void> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
      if (!this.child || this.child.exitCode !== null) {
        throw new Error('Bundled OpenClaw sidecar exited before the gateway became ready.');
      }

      try {
        await new Promise<void>((resolve, reject) => {
          const socket = new Socket();
          const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error('timeout'));
          }, 1_000);

          socket.once('error', (error) => {
            clearTimeout(timeout);
            socket.destroy();
            reject(error);
          });

          socket.connect(DCLAW_SIDECAR_PORT, '127.0.0.1', () => {
            clearTimeout(timeout);
            socket.end();
            resolve();
          });
        });
        return;
      } catch {}

      await wait(500);
    }

    throw new Error('Timed out while waiting for the bundled OpenClaw sidecar to start.');
  }

  async start(): Promise<boolean> {
    if (!(await this.isBundledRuntimeAvailable())) {
      this.logger.info('[dclaw] bundled OpenClaw runtime not found, falling back to system CLI');
      return false;
    }

    if (this.child && this.child.exitCode === null) {
      return true;
    }

    await this.prepareState();
    const logPath = this.getLogPath();
    const logHandle = await fs.open(logPath, 'a');
    const config = this.getBridgeConfigOverride();

    this.shuttingDown = false;

    const child = spawn(
      process.execPath,
      [config.cliEntryPath!, 'gateway', '--bind', 'loopback', '--port', String(DCLAW_SIDECAR_PORT)],
      {
        cwd: this.getStateDir(),
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          OPENCLAW_GATEWAY_PORT: String(DCLAW_SIDECAR_PORT),
          OPENCLAW_GATEWAY_BIND: 'loopback',
          OPENCLAW_CONFIG_PATH: this.getConfigPath(),
          OPENCLAW_STATE_DIR: this.getStateDir(),
          DCLAW_MANAGED_OPENCLAW: '1'
        },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    child.stdout?.on('data', async (chunk) => {
      await logHandle.appendFile(chunk);
    });
    child.stderr?.on('data', async (chunk) => {
      await logHandle.appendFile(chunk);
    });

    child.on('exit', async (code, signal) => {
      this.logger.warn(`[dclaw] bundled OpenClaw sidecar exited code=${code ?? 'null'} signal=${signal ?? 'null'}`);
      this.child = null;
      await logHandle.close();

      if (!this.shuttingDown) {
        setTimeout(() => {
          void this.start().catch((error) => {
            this.logger.error('[dclaw] failed to restart bundled OpenClaw sidecar', error);
          });
        }, 2_000);
      }
    });

    this.child = child;

    await this.waitUntilReady().catch((error) => {
      this.logger.warn('[dclaw] sidecar readiness probe did not complete cleanly', error);
    });

    return true;
  }

  async stop(): Promise<void> {
    this.shuttingDown = true;

    if (!this.child || this.child.exitCode !== null) {
      this.child = null;
      return;
    }

    const child = this.child;
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
      }, 5_000);

      child.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      child.kill('SIGTERM');
    });

    this.child = null;
  }
}
