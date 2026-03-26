import { useEffect, useState } from 'react';
import type { OpenClawConfig, OpenClawThinkingLevel } from '@shared/types';
import { formatJson } from '../app-utils';
import type { Locale, TranslateFn } from '../i18n';
import type { RunTask } from './useTaskRunner';

export type ConversationBucket = 'today' | 'week' | 'month';
export type ConversationMessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  title: string;
  bucket: ConversationBucket;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

const DRAFT_CONVERSATION_ID = '__new__';
const SEED_CONVERSATION_IDS = ['skillhub-check', 'wechat-service', 'github-fun'] as const;

function createMessage(role: ConversationMessageRole, content: string): ConversationMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function createSeedConversation(
  id: string,
  title: string,
  bucket: ConversationBucket,
  userPrompt: string,
  assistantReply: string
): ConversationRecord {
  const createdAt = new Date().toISOString();
  return {
    id,
    title,
    bucket,
    createdAt,
    updatedAt: createdAt,
    messages: [createMessage('user', userPrompt), createMessage('assistant', assistantReply)]
  };
}

function buildInitialConversations(t: TranslateFn): ConversationRecord[] {
  return [
    createSeedConversation(
      'skillhub-check',
      t('shell.seed.skillhub.title'),
      'week',
      t('shell.seed.skillhub.userPrompt'),
      t('shell.seed.skillhub.assistantReply')
    ),
    createSeedConversation(
      'wechat-service',
      t('shell.seed.wechat.title'),
      'month',
      t('shell.seed.wechat.userPrompt'),
      t('shell.seed.wechat.assistantReply')
    ),
    createSeedConversation(
      'github-fun',
      t('shell.seed.github.title'),
      'month',
      t('shell.seed.github.userPrompt'),
      t('shell.seed.github.assistantReply')
    )
  ];
}

function buildTitle(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 18) {
    return trimmed;
  }
  return `${trimmed.slice(0, 18)}...`;
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

function extractResponseText(value: unknown): string {
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

function containsOnlySeedConversations(conversations: ConversationRecord[]) {
  return (
    conversations.length === SEED_CONVERSATION_IDS.length &&
    conversations.every((conversation) => SEED_CONVERSATION_IDS.includes(conversation.id as (typeof SEED_CONVERSATION_IDS)[number]))
  );
}

interface UseConversationCenterOptions {
  locale: Locale;
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

export function useConversationCenter({
  locale,
  t,
  runTask,
  openClawConfig,
  openClawAgentId,
  openClawSessionId,
  openClawThinking,
  openClawLocal,
  openClawTimeoutSeconds,
  setOpenClawResult
}: UseConversationCenterOptions) {
  const [conversations, setConversations] = useState<ConversationRecord[]>(() => buildInitialConversations(t));
  const [selectedConversationId, setSelectedConversationId] = useState<string>(DRAFT_CONVERSATION_ID);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const localizedSeedConversations = buildInitialConversations(t);
    setConversations((current) => (containsOnlySeedConversations(current) ? localizedSeedConversations : current));
  }, [locale, t]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  function createConversation() {
    setSelectedConversationId(DRAFT_CONVERSATION_ID);
    setDraft('');
  }

  function appendMessage(conversationId: string, message: ConversationMessage) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              updatedAt: message.createdAt,
              messages: [...conversation.messages, message]
            }
          : conversation
      )
    );
  }

  function applyPrompt(prompt: string) {
    setSelectedConversationId(DRAFT_CONVERSATION_ID);
    setDraft(prompt);
  }

  async function sendMessage() {
    const content = draft.trim();
    if (!content) {
      return;
    }

    let conversationId = selectedConversationId;
    const userMessage = createMessage('user', content);

    if (conversationId === DRAFT_CONVERSATION_ID) {
      const record: ConversationRecord = {
        id: `conversation-${Date.now()}`,
        title: buildTitle(content),
        bucket: 'today',
        createdAt: userMessage.createdAt,
        updatedAt: userMessage.createdAt,
        messages: [userMessage]
      };
      conversationId = record.id;
      setConversations((current) => [record, ...current]);
      setSelectedConversationId(record.id);
    } else {
      appendMessage(conversationId, userMessage);
    }

    setDraft('');

    if (openClawConfig.mode !== 'cli') {
      appendMessage(conversationId, createMessage('system', t('shell.conversation.system.cliRequired')));
      return;
    }

    await runTask('task.runOpenClawAgentTurn', async () => {
      const result = await window.dclaw.openclaw.runAgentTurn({
        message: content,
        agentId: openClawAgentId || undefined,
        sessionId: openClawSessionId || undefined,
        thinking: openClawThinking,
        timeoutSeconds: Number(openClawTimeoutSeconds) || 180,
        local: openClawLocal
      });

      setOpenClawResult(formatJson(result));

      if (!result.ok) {
        appendMessage(conversationId, createMessage('system', result.error ?? result.stderr ?? t('shell.conversation.system.runFailed')));
        throw new Error(result.error ?? t('shell.conversation.system.runFailed'));
      }

      const assistantText = extractResponseText(result.output ?? result.stdout ?? result) || t('shell.conversation.system.emptyReply');
      appendMessage(conversationId, createMessage('assistant', assistantText));
    });
  }

  return {
    conversations,
    selectedConversationId,
    selectedConversation,
    draft,
    setDraft,
    setSelectedConversationId,
    createConversation,
    applyPrompt,
    sendMessage
  };
}
