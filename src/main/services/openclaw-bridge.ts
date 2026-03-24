import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import type {
  OpenClawAgentSummary,
  OpenClawAgentTurnRequest,
  OpenClawConfig,
  OpenClawStatusSnapshot,
  OpenClawTaskRequest,
  OpenClawTaskResponse
} from '../../shared/types';
import { runCommand } from './process-utils';

type JsonObject = Record<string, unknown>;

const DEFAULT_CONFIG: OpenClawConfig = {
  mode: 'cli',
  cliPath: 'openclaw',
  defaultAgentId: 'main'
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function getProfileConfigPath(profile?: string): string {
  return profile ? join(homedir(), `.openclaw-${profile}`, 'openclaw.json') : join(homedir(), '.openclaw', 'openclaw.json');
}

function extractGatewayPort(status: unknown): number | undefined {
  if (!isObject(status)) {
    return undefined;
  }

  const gateway = status.gateway;
  if (isObject(gateway) && typeof gateway.port === 'number') {
    return gateway.port;
  }

  const service = status.service;
  if (!isObject(service)) {
    return undefined;
  }

  const command = service.command;
  if (!isObject(command) || !Array.isArray(command.programArguments)) {
    return undefined;
  }

  const portIndex = command.programArguments.findIndex((item) => item === '--port');
  if (portIndex >= 0) {
    const candidate = Number(command.programArguments[portIndex + 1]);
    return Number.isFinite(candidate) ? candidate : undefined;
  }

  return undefined;
}

function extractGatewayUrl(status: unknown): string | undefined {
  if (!isObject(status)) {
    return undefined;
  }

  const gateway = status.gateway;
  if (isObject(gateway) && typeof gateway.probeUrl === 'string') {
    return gateway.probeUrl;
  }

  const rpc = status.rpc;
  if (isObject(rpc) && typeof rpc.url === 'string') {
    return rpc.url;
  }

  return undefined;
}

function extractWorkspacePath(config: unknown): string | undefined {
  if (!isObject(config)) {
    return undefined;
  }

  const agents = config.agents;
  if (!isObject(agents)) {
    return undefined;
  }

  const defaults = agents.defaults;
  if (!isObject(defaults) || typeof defaults.workspace !== 'string') {
    return undefined;
  }

  return defaults.workspace;
}

function parseCliOutput(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return stdout;
    }
  }

  return stdout;
}

export class OpenClawBridge {
  private runtimeOverride: Partial<OpenClawConfig> = {};

  constructor(private readonly configPath: string) {}

  setRuntimeOverride(override: Partial<OpenClawConfig>): void {
    this.runtimeOverride = {
      ...override
    };
  }

  private async readStoredConfig(): Promise<Partial<OpenClawConfig>> {
    try {
      const raw = await fs.readFile(this.configPath, 'utf8');
      return parseJson<Partial<OpenClawConfig>>(raw);
    } catch {
      return {};
    }
  }

  private normalizeConfig(config: Partial<OpenClawConfig>): OpenClawConfig {
    return {
      ...DEFAULT_CONFIG,
      ...config
    };
  }

  private async resolveCliPath(cliPath?: string): Promise<string> {
    if (cliPath) {
      return cliPath;
    }

    try {
      const result = await runCommand('/bin/bash', ['-lc', 'command -v openclaw || true']);
      return result.stdout || DEFAULT_CONFIG.cliPath!;
    } catch {
      return DEFAULT_CONFIG.cliPath!;
    }
  }

  private async resolveCliProgram(config: OpenClawConfig): Promise<{ program: string; argsPrefix: string[]; env: NodeJS.ProcessEnv }> {
    const cliPath = await this.resolveCliPath(config.cliPath);
    const cliEntryPath = config.cliEntryPath ?? (cliPath.endsWith('.mjs') ? cliPath : undefined);

    if (config.cliUseElectronNode && cliEntryPath) {
      return {
        program: process.execPath,
        argsPrefix: [cliEntryPath],
        env: {
          ELECTRON_RUN_AS_NODE: '1'
        }
      };
    }

    return {
      program: cliPath,
      argsPrefix: [],
      env: {}
    };
  }

  private getCliEnv(config: OpenClawConfig, extraEnv: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
    return {
      ...process.env,
      ...(config.gatewayPort
        ? {
            OPENCLAW_GATEWAY_PORT: String(config.gatewayPort)
          }
        : {}),
      ...extraEnv
    };
  }

  private getCliArgs(config: OpenClawConfig, args: string[]): string[] {
    if (config.profile) {
      return ['--profile', config.profile, ...args];
    }

    return args;
  }

  private async runCli(
    config: OpenClawConfig,
    args: string[],
    timeoutMs = 30_000,
    extraEnv: NodeJS.ProcessEnv = {}
  ): Promise<{ stdout: string; stderr: string }> {
    const resolved = await this.resolveCliProgram(config);
    return runCommand(resolved.program, [...resolved.argsPrefix, ...this.getCliArgs(config, args)], {
      cwd: config.workingDirectory ?? config.workspacePath,
      timeoutMs,
      env: this.getCliEnv(config, {
        ...resolved.env,
        ...extraEnv
      })
    });
  }

  private async runCliJson<T>(
    config: OpenClawConfig,
    args: string[],
    timeoutMs = 30_000,
    extraEnv: NodeJS.ProcessEnv = {}
  ): Promise<T> {
    const result = await this.runCli(config, args, timeoutMs, extraEnv);
    return parseJson<T>(result.stdout);
  }

  private async discoverCliConfig(seed: Partial<OpenClawConfig> = {}): Promise<Partial<OpenClawConfig>> {
    const cliPath = await this.resolveCliPath(seed.cliPath);
    const cliEntryPath = seed.cliEntryPath ?? (cliPath.endsWith('.mjs') ? cliPath : undefined);
    const configPath = seed.configPath ?? getProfileConfigPath(seed.profile);
    let diskConfig: JsonObject = {};

    try {
      diskConfig = parseJson<JsonObject>(await fs.readFile(configPath, 'utf8'));
    } catch {}

    let gatewayStatus: JsonObject | undefined;
    try {
      gatewayStatus = await this.runCliJson<JsonObject>(
        this.normalizeConfig({
          ...seed,
          cliPath,
          mode: 'cli',
          configPath
        }),
        ['gateway', 'status', '--json']
      );
    } catch {}

    return {
      mode: 'cli',
      cliPath,
      cliEntryPath,
      cliUseElectronNode: seed.cliUseElectronNode,
      configPath,
      gatewayPort: seed.gatewayPort ?? extractGatewayPort(gatewayStatus),
      gatewayUrl: seed.gatewayUrl ?? extractGatewayUrl(gatewayStatus),
      defaultAgentId: seed.defaultAgentId ?? DEFAULT_CONFIG.defaultAgentId,
      workspacePath: seed.workspacePath ?? extractWorkspacePath(diskConfig),
      workingDirectory: seed.workingDirectory ?? extractWorkspacePath(diskConfig)
    };
  }

  private async getResolvedConfig(): Promise<OpenClawConfig> {
    const stored = await this.readStoredConfig();
    const mergedSeed = {
      ...stored,
      ...this.runtimeOverride
    };

    if ((mergedSeed.mode ?? 'cli') === 'cli') {
      const discovered = await this.discoverCliConfig(mergedSeed);
      return this.normalizeConfig({
        ...stored,
        ...discovered,
        ...this.runtimeOverride,
        mode: 'cli'
      });
    }

    return this.normalizeConfig({
      ...stored,
      ...this.runtimeOverride
    });
  }

  async getConfig(): Promise<OpenClawConfig> {
    return this.getResolvedConfig();
  }

  async syncLocalInstall(): Promise<OpenClawConfig> {
    const stored = await this.readStoredConfig();
    const discovered = await this.discoverCliConfig({
      ...stored,
      mode: 'cli'
    });
    const merged = this.normalizeConfig({
      ...stored,
      ...discovered,
      mode: 'cli'
    });
    await fs.mkdir(dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  }

  async saveConfig(config: OpenClawConfig): Promise<OpenClawConfig> {
    await fs.mkdir(dirname(this.configPath), { recursive: true });
    const normalized =
      config.mode === 'cli'
        ? await this.discoverCliConfig(config).then((discovered) =>
            this.normalizeConfig({
              ...config,
              ...discovered,
              mode: 'cli'
            })
          )
        : this.normalizeConfig(config);
    await fs.writeFile(this.configPath, JSON.stringify(normalized, null, 2), 'utf8');
    return normalized;
  }

  async listAgents(): Promise<OpenClawAgentSummary[]> {
    const config = await this.getResolvedConfig();
    if (config.mode !== 'cli') {
      return [];
    }

    return this.runCliJson<OpenClawAgentSummary[]>(config, ['agents', 'list', '--json']);
  }

  async getStatus(): Promise<OpenClawStatusSnapshot> {
    const config = await this.getResolvedConfig();
    if (config.mode !== 'cli') {
      return {
        ok: false,
        agents: [],
        error: 'Status snapshot is only available in OpenClaw CLI mode.'
      };
    }

    try {
      const gatewayStatus = await this.runCliJson<JsonObject>(config, ['gateway', 'status', '--json']);
      const runtimeConfig = this.normalizeConfig({
        ...config,
        gatewayPort: config.gatewayPort ?? extractGatewayPort(gatewayStatus),
        gatewayUrl: config.gatewayUrl ?? extractGatewayUrl(gatewayStatus)
      });

      const [runtimeStatus, agents] = await Promise.all([
        this.runCliJson<JsonObject>(runtimeConfig, ['status', '--json']).catch(() => undefined),
        this.runCliJson<OpenClawAgentSummary[]>(runtimeConfig, ['agents', 'list', '--json']).catch(() => [])
      ]);

      return {
        ok: Boolean(isObject(gatewayStatus.rpc) && gatewayStatus.rpc.ok === true),
        gatewayStatus,
        runtimeStatus,
        agents,
        inferredConfig: {
          gatewayPort: runtimeConfig.gatewayPort,
          gatewayUrl: runtimeConfig.gatewayUrl,
          cliPath: runtimeConfig.cliPath,
          cliEntryPath: runtimeConfig.cliEntryPath,
          cliUseElectronNode: runtimeConfig.cliUseElectronNode,
          configPath: runtimeConfig.configPath,
          workspacePath: runtimeConfig.workspacePath,
          workingDirectory: runtimeConfig.workingDirectory,
          defaultAgentId:
            runtimeConfig.defaultAgentId ?? agents.find((agent) => agent.isDefault)?.id ?? DEFAULT_CONFIG.defaultAgentId
        }
      };
    } catch (error) {
      return {
        ok: false,
        agents: [],
        error: error instanceof Error ? error.message : 'Unable to collect OpenClaw status.'
      };
    }
  }

  async runAgentTurn(request: OpenClawAgentTurnRequest): Promise<OpenClawTaskResponse> {
    const config = await this.getResolvedConfig();
    if (config.mode !== 'cli') {
      return {
        ok: false,
        error: 'Agent execution is only available in OpenClaw CLI mode.'
      };
    }

    try {
      const args = ['agent', '--json', '--message', request.message];

      if (request.agentId) {
        args.push('--agent', request.agentId);
      }
      if (request.channel) {
        args.push('--channel', request.channel);
      }
      if (request.sessionId) {
        args.push('--session-id', request.sessionId);
      }
      if (request.to) {
        args.push('--to', request.to);
      }
      if (request.deliver) {
        args.push('--deliver');
      }
      if (request.local) {
        args.push('--local');
      }
      if (request.thinking) {
        args.push('--thinking', request.thinking);
      }
      if (request.timeoutSeconds) {
        args.push('--timeout', String(request.timeoutSeconds));
      }
      if (request.verbose) {
        args.push('--verbose', request.verbose);
      }
      if (request.replyAccount) {
        args.push('--reply-account', request.replyAccount);
      }
      if (request.replyChannel) {
        args.push('--reply-channel', request.replyChannel);
      }
      if (request.replyTo) {
        args.push('--reply-to', request.replyTo);
      }

      const result = await this.runCli(config, args, (request.timeoutSeconds ?? 600) * 1000 + 5_000);
      return {
        ok: true,
        output: parseCliOutput(result.stdout),
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'OpenClaw agent execution failed.'
      };
    }
  }

  async healthCheck(): Promise<OpenClawTaskResponse> {
    const config = await this.getResolvedConfig();

    if (config.mode === 'cli') {
      try {
        const gatewayStatus = await this.runCliJson<JsonObject>(config, ['gateway', 'status', '--json']);
        const rpc = isObject(gatewayStatus.rpc) ? gatewayStatus.rpc : undefined;
        return {
          ok: Boolean(rpc?.ok === true),
          output: {
            gatewayStatus,
            inferredConfig: {
              gatewayPort: extractGatewayPort(gatewayStatus),
              gatewayUrl: extractGatewayUrl(gatewayStatus)
            }
          }
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'OpenClaw health check failed.'
        };
      }
    }

    if (config.mode === 'http') {
      try {
        const baseUrl = config.baseUrl?.replace(/\/$/, '') ?? 'http://127.0.0.1:6917';
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
    const config = await this.getResolvedConfig();

    if (config.mode === 'cli') {
      try {
        const result = await this.runCli(
          config,
          [...(config.defaultArgs ?? []), ...(request.args ?? [])],
          request.timeoutMs ?? 120_000,
          {
            DCLAW_TASK_PAYLOAD: JSON.stringify(request.payload ?? null)
          }
        );

        return {
          ok: true,
          output: parseCliOutput(result.stdout),
          stdout: result.stdout,
          stderr: result.stderr
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'OpenClaw CLI execution failed.'
        };
      }
    }

    if (config.mode === 'http') {
      try {
        const baseUrl = config.baseUrl?.replace(/\/$/, '') ?? 'http://127.0.0.1:6917';
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
        output: parseCliOutput(result.stdout),
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
