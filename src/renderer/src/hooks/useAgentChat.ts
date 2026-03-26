import { useState } from 'react';
import type { OpenClawConfig, OpenClawThinkingLevel } from '@shared/types';
import type { ChatMessage } from '../app-types';
import { formatJson } from '../app-utils';
import type { TranslateFn } from '../i18n';
import type { RunTask } from './useTaskRunner';

interface UseAgentChatOptions {
  t: TranslateFn;
  runTask: RunTask;
  openClawConfig: OpenClawConfig;
  openClawAgentId: string;
  openClawSessionId: string;
  openClawThinking: OpenClawThinkingLevel;
  openClawLocal: boolean;
  openClawTimeoutSeconds: string;
  setOpenClawResult: (value: string) => void;
}

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function collectTextCandidates(value: unknown, depth = 0): string[] {
  if (depth > 5 || value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextCandidates(item, depth + 1));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const preferredKeys = ['markdown', 'content', 'text', 'reply', 'message', 'outputText', 'answer'];
    const preferred = preferredKeys.flatMap((key) => collectTextCandidates(record[key], depth + 1));
    if (preferred.length > 0) {
      return preferred;
    }

    return Object.values(record).flatMap((item) => collectTextCandidates(item, depth + 1));
  }

  return [];
}

function extractOpenClawText(value: unknown): string {
  const candidates = collectTextCandidates(value)
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

export function useAgentChat({
  t,
  runTask,
  openClawConfig,
  openClawAgentId,
  openClawSessionId,
  openClawThinking,
  openClawLocal,
  openClawTimeoutSeconds,
  setOpenClawResult
}: UseAgentChatOptions) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function applyPrompt(message: string) {
    setDraft(message);
  }

  function clearConversation() {
    setMessages([]);
  }

  async function sendMessage() {
    const message = draft.trim();
    if (!message) {
      return;
    }

    setDraft('');
    setMessages((current) => [...current, createMessage('user', message)]);

    await runTask('task.runOpenClawAgentTurn', async () => {
      if (openClawConfig.mode !== 'cli') {
        const errorMessage = t('chat.error.cliModeRequired');
        setMessages((current) => [...current, createMessage('system', errorMessage)]);
        throw new Error(errorMessage);
      }

      const result = await window.dclaw.openclaw.runAgentTurn({
        message,
        agentId: openClawAgentId || undefined,
        sessionId: openClawSessionId || undefined,
        thinking: openClawThinking,
        timeoutSeconds: Number(openClawTimeoutSeconds) || 180,
        local: openClawLocal
      });

      setOpenClawResult(formatJson(result));

      if (!result.ok) {
        const errorMessage = result.error ?? result.stderr ?? t('chat.error.responseFailed');
        setMessages((current) => [...current, createMessage('system', errorMessage)]);
        throw new Error(errorMessage);
      }

      const reply = extractOpenClawText(result.output ?? result.stdout ?? result) || t('chat.emptyResponse');
      setMessages((current) => [...current, createMessage('assistant', reply)]);
    });
  }

  return {
    draft,
    setDraft,
    messages,
    applyPrompt,
    clearConversation,
    sendMessage
  };
}
