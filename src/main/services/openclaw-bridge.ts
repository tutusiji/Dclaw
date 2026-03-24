import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type {
  OpenClawConfig,
  OpenClawTaskRequest,
  OpenClawTaskResponse
} from '../../shared/types';
import { runCommand } from './process-utils';

const DEFAULT_CONFIG: OpenClawConfig = {
  mode: 'http',
  baseUrl: 'http://127.0.0.1:6917'
};

export class OpenClawBridge {
  constructor(private readonly configPath: string) {}

  async getConfig(): Promise<OpenClawConfig> {
    try {
      const raw = await fs.readFile(this.configPath, 'utf8');
      return {
        ...DEFAULT_CONFIG,
        ...JSON.parse(raw)
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  async saveConfig(config: OpenClawConfig): Promise<OpenClawConfig> {
    await fs.mkdir(dirname(this.configPath), { recursive: true });
    const normalized = {
      ...DEFAULT_CONFIG,
      ...config
    };
    await fs.writeFile(this.configPath, JSON.stringify(normalized, null, 2), 'utf8');
    return normalized;
  }

  async healthCheck(): Promise<OpenClawTaskResponse> {
    const config = await this.getConfig();

    if (config.mode === 'http') {
      try {
        const baseUrl = config.baseUrl?.replace(/\/$/, '') ?? DEFAULT_CONFIG.baseUrl!;
        const response = await fetch(`${baseUrl}/health`, {
          headers: config.apiKey
            ? {
                Authorization: `Bearer ${config.apiKey}`
              }
            : undefined
        });

        const text = await response.text();
        let output: unknown = text;
        try {
          output = JSON.parse(text);
        } catch {}

        return {
          ok: response.ok,
          status: response.status,
          output
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'OpenClaw health check failed.'
        };
      }
    }

    if (!config.binaryPath) {
      return {
        ok: false,
        error: 'Missing binaryPath for command mode.'
      };
    }

    try {
      await fs.access(resolve(config.binaryPath));
      return {
        ok: true,
        output: {
          binaryPath: config.binaryPath,
          workingDirectory: config.workingDirectory
        }
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to access binary.'
      };
    }
  }

  async execute(request: OpenClawTaskRequest): Promise<OpenClawTaskResponse> {
    const config = await this.getConfig();

    if (config.mode === 'http') {
      try {
        const baseUrl = config.baseUrl?.replace(/\/$/, '') ?? DEFAULT_CONFIG.baseUrl!;
        const method = request.method ?? 'POST';
        const endpoint = request.path ?? '/api/tasks';
        const response = await fetch(
          `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
          {
            method,
            headers: {
              'content-type': 'application/json',
              ...(config.apiKey
                ? {
                    Authorization: `Bearer ${config.apiKey}`
                  }
                : {})
            },
            body: request.payload === undefined || method === 'GET' ? undefined : JSON.stringify(request.payload)
          }
        );

        const text = await response.text();
        let output: unknown = text;
        try {
          output = JSON.parse(text);
        } catch {}

        return {
          ok: response.ok,
          status: response.status,
          output
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'OpenClaw request failed.'
        };
      }
    }

    if (!config.binaryPath) {
      return {
        ok: false,
        error: 'Missing binaryPath for command mode.'
      };
    }

    try {
      const result = await runCommand(config.binaryPath, [...(config.defaultArgs ?? []), ...(request.args ?? [])], {
        cwd: config.workingDirectory,
        timeoutMs: request.timeoutMs ?? 120_000,
        env: {
          ...process.env,
          DCLAW_TASK_PAYLOAD: JSON.stringify(request.payload ?? null)
        }
      });

      return {
        ok: true,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'OpenClaw command execution failed.'
      };
    }
  }
}
