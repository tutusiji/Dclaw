import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';
import type { ChatMessage } from '../app-types';
import type { OpenClawAgentSummary, OpenClawConfig, OpenClawThinkingLevel } from '@shared/types';
import { Panel } from '../components/Panel';
import { useI18n } from '../i18n';

interface ChatPageProps {
  busy: string | null;
  openClawConfig: OpenClawConfig;
  openClawAgents: OpenClawAgentSummary[];
  openClawAgentId: string;
  setOpenClawAgentId: Dispatch<SetStateAction<string>>;
  openClawSessionId: string;
  setOpenClawSessionId: Dispatch<SetStateAction<string>>;
  openClawThinking: OpenClawThinkingLevel;
  setOpenClawThinking: Dispatch<SetStateAction<OpenClawThinkingLevel>>;
  openClawLocal: boolean;
  setOpenClawLocal: Dispatch<SetStateAction<boolean>>;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  messages: ChatMessage[];
  onLoadAgents: () => Promise<void>;
  onSendMessage: () => Promise<void>;
  onClearConversation: () => void;
  onApplyPrompt: (message: string) => void;
  onOpenBridge: () => void;
}

function formatTimestamp(value: string, locale: string): string {
  try {
    return new Date(value).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
}

export function ChatPage({
  busy,
  openClawConfig,
  openClawAgents,
  openClawAgentId,
  setOpenClawAgentId,
  openClawSessionId,
  setOpenClawSessionId,
  openClawThinking,
  setOpenClawThinking,
  openClawLocal,
  setOpenClawLocal,
  draft,
  setDraft,
  messages,
  onLoadAgents,
  onSendMessage,
  onClearConversation,
  onApplyPrompt,
  onOpenBridge
}: ChatPageProps) {
  const { locale, t } = useI18n();
  const canSend = openClawConfig.mode === 'cli' && draft.trim().length > 0 && !busy;
  const promptKeys = [
    'chat.prompt.workspace',
    'chat.prompt.weekly',
    'chat.prompt.automation',
    'chat.prompt.nextStep'
  ] as const;

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && canSend) {
      event.preventDefault();
      void onSendMessage();
    }
  }

  return (
    <Panel eyebrow={t('chat.eyebrow')} title={t('chat.title')} subtitle={t('chat.subtitle')} className="panel--wide">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="rounded-[24px] border border-[rgba(24,33,47,0.08)] bg-[rgba(255,255,255,0.58)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[rgba(24,33,47,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#18212f]">
              {t('chat.connectionMode')}: {t(`bridge.mode.${openClawConfig.mode}`)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                openClawConfig.mode === 'cli' ? 'bg-[rgba(45,122,82,0.12)] text-[#2d7a52]' : 'bg-[rgba(174,75,61,0.12)] text-[#ae4b3d]'
              }`}
            >
              {openClawConfig.mode === 'cli' ? t('chat.cliReady') : t('chat.cliRequired')}
            </span>
            <span className="inline-flex items-center rounded-full bg-[rgba(47,100,120,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6478]">
              {t('chat.agentCount', { count: openClawAgents.length })}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[rgba(24,33,47,0.14)] bg-[linear-gradient(160deg,rgba(255,250,244,0.92),rgba(241,247,248,0.82))] p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="i-lucide-messages-square h-6 w-6 text-[#b76739]" />
                <h3 className="m-0 text-[1.16rem] font-semibold text-[#18212f]">{t('chat.empty.title')}</h3>
              </div>
              <p className="m-0 max-w-[48rem] text-sm leading-7 text-[#5b6778]">{t('chat.empty.description')}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {promptKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="rounded-[18px] border border-[rgba(24,33,47,0.08)] bg-white/80 px-4 py-3 text-left shadow-[0_12px_22px_rgba(21,34,48,0.06)]"
                    onClick={() => onApplyPrompt(t(key))}
                  >
                    <span className="text-sm font-semibold text-[#18212f]">{t(key)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 max-h-[520px] space-y-4 overflow-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] rounded-[22px] px-4 py-3 shadow-[0_16px_28px_rgba(21,34,48,0.08)] ${
                    message.role === 'user'
                      ? 'ml-auto bg-[#18212f] text-[#f7f2e8]'
                      : message.role === 'assistant'
                        ? 'bg-[rgba(255,251,244,0.92)] text-[#18212f]'
                        : 'bg-[rgba(174,75,61,0.12)] text-[#7f3429]'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.12em]">
                    <span>
                      {message.role === 'user'
                        ? t('chat.message.you')
                        : message.role === 'assistant'
                          ? t('chat.message.agent')
                          : t('chat.message.system')}
                    </span>
                    <span className={message.role === 'user' ? 'text-[#d7c7b0]' : 'text-[#7b8797]'}>
                      {formatTimestamp(message.createdAt, locale)}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-7">{message.content}</div>
                </div>
              ))}
            </div>
          )}

          <label className="field mb-0">
            <span>{t('chat.composer.label')}</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={6}
              placeholder={openClawConfig.mode === 'cli' ? t('chat.composer.placeholder') : t('chat.composer.cliPlaceholder')}
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#5b6778]">{t('chat.composer.shortcut')}</span>
            <div className="button-row m-0">
              <button className="button button--ghost" onClick={onClearConversation} disabled={Boolean(busy) || messages.length === 0}>
                {t('chat.composer.clear')}
              </button>
              <button className="button" onClick={() => void onSendMessage()} disabled={!canSend}>
                {t('chat.composer.send')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h3>{t('chat.session.title')}</h3>
              <span className="muted">{t('chat.session.description')}</span>
            </div>
            <label className="field">
              <span>{t('chat.session.agent')}</span>
              <input
                list="chat-openclaw-agents"
                value={openClawAgentId}
                onChange={(event) => setOpenClawAgentId(event.target.value)}
                placeholder={t('defaults.openClawAgentId')}
              />
              <datalist id="chat-openclaw-agents">
                {openClawAgents.map((agent) => (
                  <option key={agent.id} value={agent.id} />
                ))}
              </datalist>
            </label>
            <label className="field">
              <span>{t('chat.session.sessionId')}</span>
              <input
                value={openClawSessionId}
                onChange={(event) => setOpenClawSessionId(event.target.value)}
                placeholder={t('chat.session.sessionIdPlaceholder')}
              />
            </label>
            <label className="field">
              <span>{t('chat.session.thinking')}</span>
              <select value={openClawThinking} onChange={(event) => setOpenClawThinking(event.target.value as OpenClawThinkingLevel)}>
                <option value="off">{t('bridge.thinkingLevel.off')}</option>
                <option value="minimal">{t('bridge.thinkingLevel.minimal')}</option>
                <option value="low">{t('bridge.thinkingLevel.low')}</option>
                <option value="medium">{t('bridge.thinkingLevel.medium')}</option>
                <option value="high">{t('bridge.thinkingLevel.high')}</option>
                <option value="xhigh">{t('bridge.thinkingLevel.xhigh')}</option>
              </select>
            </label>
            <button
              type="button"
              className={`pill ${openClawLocal ? 'pill--ok' : 'pill--off'}`}
              onClick={() => setOpenClawLocal((current) => !current)}
            >
              {t('chat.session.local')}: {openClawLocal ? t('bridge.on') : t('bridge.off')}
            </button>

            <div className="button-row">
              <button className="button button--ghost" onClick={() => void onLoadAgents()} disabled={Boolean(busy) || openClawConfig.mode !== 'cli'}>
                {t('chat.session.loadAgents')}
              </button>
              <button className="button button--ghost" onClick={onOpenBridge} disabled={Boolean(busy)}>
                {t('chat.session.configureBridge')}
              </button>
            </div>
          </div>

          <div className="card">
            <h3>{t('chat.prompt.title')}</h3>
            <div className="space-y-2">
              {promptKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="w-full rounded-[18px] border border-[rgba(24,33,47,0.08)] bg-white/82 px-4 py-3 text-left"
                  onClick={() => onApplyPrompt(t(key))}
                >
                  <span className="text-sm font-semibold text-[#18212f]">{t(key)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>{t('chat.guidance.title')}</h3>
            <div className="space-y-2 text-sm leading-6 text-[#5b6778]">
              <p className="m-0">{t('chat.guidance.pointOne')}</p>
              <p className="m-0">{t('chat.guidance.pointTwo')}</p>
              <p className="m-0">{t('chat.guidance.pointThree')}</p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
