import { useState } from 'react';
import type { OpenClawAgentSummary, OpenClawConfig, OpenClawThinkingLevel } from '@shared/types';
import { formatJson, splitArgs, splitLines } from '../app-utils';
import type { TranslateFn } from '../i18n';
import type { RunTask } from './useTaskRunner';

const DEFAULT_OPENCLAW_CONFIG: OpenClawConfig = {
  mode: 'cli',
  cliPath: 'openclaw',
  defaultAgentId: 'main'
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UseOpenClawBridgeOptions {
  t: TranslateFn;
  runTask: RunTask;
}

export function useOpenClawBridge({ t, runTask }: UseOpenClawBridgeOptions) {
  const [openClawConfig, setOpenClawConfig] = useState<OpenClawConfig>(DEFAULT_OPENCLAW_CONFIG);
  const [openClawAgents, setOpenClawAgents] = useState<OpenClawAgentSummary[]>([]);
  const [openClawAgentId, setOpenClawAgentId] = useState('main');
  const [openClawSessionId, setOpenClawSessionId] = useState('');
  const [openClawRecipient, setOpenClawRecipient] = useState('');
  const [openClawChannel, setOpenClawChannel] = useState('');
  const [openClawThinking, setOpenClawThinking] = useState<OpenClawThinkingLevel>('medium');
  const [openClawTimeoutSeconds, setOpenClawTimeoutSeconds] = useState(t('defaults.timeoutSeconds'));
  const [openClawMessage, setOpenClawMessage] = useState(t('defaults.openClawMessage'));
  const [openClawLocal, setOpenClawLocal] = useState(false);
  const [openClawDeliver, setOpenClawDeliver] = useState(false);
  const [defaultArgsText, setDefaultArgsText] = useState('');
  const [openClawRequestPath, setOpenClawRequestPath] = useState(t('defaults.openClawRequestPath'));
  const [openClawMethod, setOpenClawMethod] = useState<HttpMethod>('POST');
  const [openClawPayload, setOpenClawPayload] = useState(t('defaults.openClawPayload'));
  const [openClawArgsText, setOpenClawArgsText] = useState(t('defaults.openClawArgsText'));
  const [openClawResult, setOpenClawResult] = useState('');

  function hydrateConfig(config: OpenClawConfig) {
    setOpenClawConfig(config);
    setOpenClawAgentId(config.defaultAgentId ?? 'main');
    setDefaultArgsText((config.defaultArgs ?? []).join('\n'));
  }

  async function saveConfig() {
    await runTask('task.saveOpenClawConfig', async () => {
      const saved = await window.dclaw.openclaw.saveConfig({
        ...openClawConfig,
        defaultArgs: splitLines(defaultArgsText)
      });

      setOpenClawConfig(saved);
      setOpenClawAgentId(saved.defaultAgentId ?? openClawAgentId);
      setDefaultArgsText((saved.defaultArgs ?? []).join('\n'));
    });
  }

  async function syncLocalInstall() {
    await runTask('task.syncOpenClawInstall', async () => {
      const synced = await window.dclaw.openclaw.syncLocalInstall();
      setOpenClawConfig(synced);
      setOpenClawAgentId(synced.defaultAgentId ?? 'main');
      setDefaultArgsText((synced.defaultArgs ?? []).join('\n'));
    });
  }

  async function checkHealth() {
    await runTask('task.checkOpenClawHealth', async () => {
      const result = await window.dclaw.openclaw.healthCheck();
      setOpenClawResult(formatJson(result));
    });
  }

  async function inspectStatus() {
    await runTask('task.inspectOpenClawGateway', async () => {
      const snapshot = await window.dclaw.openclaw.getStatus();
      setOpenClawResult(formatJson(snapshot));
      setOpenClawAgents(snapshot.agents);

      if (!snapshot.inferredConfig) {
        return;
      }

      setOpenClawConfig((current) => ({
        ...current,
        ...snapshot.inferredConfig,
        mode: 'cli'
      }));

      if (snapshot.inferredConfig.defaultAgentId) {
        setOpenClawAgentId(snapshot.inferredConfig.defaultAgentId);
      }
    });
  }

  async function loadAgents() {
    await runTask('task.loadOpenClawAgents', async () => {
      const agents = await window.dclaw.openclaw.listAgents();
      setOpenClawAgents(agents);
      const defaultAgent = agents.find((agent) => agent.isDefault)?.id ?? openClawConfig.defaultAgentId ?? 'main';
      setOpenClawAgentId((current) => current || defaultAgent);
    });
  }

  async function runAgent() {
    await runTask('task.runOpenClawAgentTurn', async () => {
      const result = await window.dclaw.openclaw.runAgentTurn({
        message: openClawMessage,
        agentId: openClawAgentId || undefined,
        sessionId: openClawSessionId || undefined,
        to: openClawRecipient || undefined,
        channel: openClawChannel || undefined,
        deliver: openClawDeliver,
        local: openClawLocal,
        thinking: openClawThinking,
        timeoutSeconds: Number(openClawTimeoutSeconds) || 180
      });

      setOpenClawResult(formatJson(result));
    });
  }

  async function executeTask() {
    await runTask('task.executeOpenClawTask', async () => {
      const payload = openClawPayload.trim() ? JSON.parse(openClawPayload) : undefined;
      const result = await window.dclaw.openclaw.execute({
        path: openClawRequestPath,
        method: openClawMethod,
        payload,
        args: splitArgs(openClawArgsText)
      });

      setOpenClawResult(formatJson(result));
    });
  }

  return {
    openClawConfig,
    setOpenClawConfig,
    openClawAgents,
    setOpenClawAgents,
    openClawAgentId,
    setOpenClawAgentId,
    openClawSessionId,
    setOpenClawSessionId,
    openClawRecipient,
    setOpenClawRecipient,
    openClawChannel,
    setOpenClawChannel,
    openClawThinking,
    setOpenClawThinking,
    openClawTimeoutSeconds,
    setOpenClawTimeoutSeconds,
    openClawMessage,
    setOpenClawMessage,
    openClawLocal,
    setOpenClawLocal,
    openClawDeliver,
    setOpenClawDeliver,
    defaultArgsText,
    setDefaultArgsText,
    openClawRequestPath,
    setOpenClawRequestPath,
    openClawMethod,
    setOpenClawMethod,
    openClawPayload,
    setOpenClawPayload,
    openClawArgsText,
    setOpenClawArgsText,
    openClawResult,
    setOpenClawResult,
    hydrateConfig,
    saveConfig,
    syncLocalInstall,
    checkHealth,
    inspectStatus,
    loadAgents,
    runAgent,
    executeTask
  };
}
