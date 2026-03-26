import type { KeyboardEvent } from 'react';
import type { OpenClawConfig } from '@shared/types';
import type { ConversationRecord } from '../hooks/useConversationCenter';
import type { LaunchCard } from '../ui-shell-data';
import { BrandMark } from '../components/BrandMark';
import { useI18n } from '../i18n';

interface ConversationHomePageProps {
  busy: string | null;
  activity: string;
  openClawConfig: OpenClawConfig;
  selectedConversation: ConversationRecord | null;
  draft: string;
  launchCards: LaunchCard[];
  onDraftChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  onApplyPrompt: (prompt: string) => void;
  onActivateLaunchCard: (launchCardId: string) => void;
  onOpenStudio: () => void;
  onOpenBridge: () => void;
}

const QUICK_PROMPT_KEYS = [
  'shell.home.quickPrompt.one',
  'shell.home.quickPrompt.two',
  'shell.home.quickPrompt.three'
] as const;

const HOME_STEPS = [
  {
    titleKey: 'shell.home.step.one.title',
    descriptionKey: 'shell.home.step.one.description'
  },
  {
    titleKey: 'shell.home.step.two.title',
    descriptionKey: 'shell.home.step.two.description'
  },
  {
    titleKey: 'shell.home.step.three.title',
    descriptionKey: 'shell.home.step.three.description'
  }
] as const;

export function ConversationHomePage({
  busy,
  activity,
  openClawConfig,
  selectedConversation,
  draft,
  launchCards,
  onDraftChange,
  onSendMessage,
  onApplyPrompt,
  onActivateLaunchCard,
  onOpenStudio,
  onOpenBridge
}: ConversationHomePageProps) {
  const { locale, t } = useI18n();
  const messages = selectedConversation?.messages ?? [];
  const hasMessages = messages.length > 0;
  const canSend = draft.trim().length > 0 && !busy;
  const bridgeReady = openClawConfig.mode === 'cli';

  function formatConversationTime(value: string) {
    try {
      return new Date(value).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return value;
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && canSend) {
      event.preventDefault();
      void onSendMessage();
    }
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,#fffdf9_0%,#fbf4eb_100%)] p-6 shadow-[0_24px_80px_rgba(96,66,34,0.12)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)]" />
      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold tracking-[0.14em] text-[#a58468]">{hasMessages ? t('shell.home.activeConversation') : t('shell.home.eyebrow')}</div>
          <h1 className="mt-2 text-[2.15rem] font-semibold tracking-[-0.04em] text-[#241914]">
            {hasMessages ? selectedConversation?.title : t('shell.home.emptyTitle')}
          </h1>
          <p className="mt-3 max-w-[50rem] text-sm leading-7 text-[#766352]">
            {hasMessages
              ? t('shell.home.activeDescription', {
                  time: selectedConversation ? formatConversationTime(selectedConversation.updatedAt) : t('shell.home.justNow')
                })
              : t('shell.home.emptyDescription')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold',
              bridgeReady ? 'bg-[#eaf6eb] text-[#2f7b50]' : 'bg-[#f9ebe7] text-[#a14d42]'
            ].join(' ')}
          >
            {bridgeReady ? t('shell.home.bridgeReady') : t('shell.home.bridgeMode', { mode: t(`bridge.mode.${openClawConfig.mode}`) })}
          </span>
          <button
            type="button"
            onClick={onOpenStudio}
            className="rounded-full border border-[#ead7c5] bg-white px-4 py-2 text-sm font-semibold text-[#715b4b] transition hover:bg-[#fff7ef]"
          >
            {t('shell.home.openStudio')}
          </button>
          <button
            type="button"
            onClick={onOpenBridge}
            className="rounded-full border border-[#e6bc8f] bg-[#241b17] px-4 py-2 text-sm font-semibold text-[#fff5ec] shadow-[0_14px_24px_rgba(42,30,20,0.18)] transition hover:translate-y-[-1px]"
          >
            {t('shell.home.openBridge')}
          </button>
        </div>
      </div>

      {!hasMessages ? (
        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto pb-2 xl:grid-cols-[minmax(0,1.34fr)_360px]">
          <div className="rounded-[34px] border border-[#efdfcf] bg-white/86 p-6 shadow-[0_18px_36px_rgba(153,108,67,0.08)]">
            <div className="relative overflow-hidden rounded-[34px] border border-[#f0dfcf] bg-[linear-gradient(135deg,#fff9f1_0%,#fff1e0_52%,#fff8ef_100%)] p-6">
              <div className="pointer-events-none absolute left-[-18px] top-[-12px] h-24 w-24 rounded-full bg-[#ffd9b4]/75 blur-xl" />
              <div className="pointer-events-none absolute bottom-[-18px] right-[-12px] h-28 w-28 rounded-full bg-[#ffd7c5]/70 blur-xl" />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div className="relative flex h-[228px] w-full max-w-[286px] items-center justify-center overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_top,#ffe8ca_0%,#fff1df_42%,#fff8ef_100%)]">
                    <div className="absolute h-[168px] w-[168px] rounded-full border border-white/70 bg-white/42" />
                    <div className="absolute h-[116px] w-[116px] rounded-full bg-[#231b17] shadow-[0_22px_38px_rgba(43,29,18,0.18)]" />
                    <BrandMark size="lg" className="absolute border border-white/28" />
                    <div className="absolute bottom-6 left-6 rounded-full bg-white/76 px-3 py-1 text-xs font-semibold text-[#8d6847]">{t('shell.home.badgeAssistant')}</div>
                  </div>

                  <div className="max-w-[620px]">
                    <div className="inline-flex rounded-full bg-[#fff1df] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a96f3d]">
                      {t('shell.home.badgeFastLaunch')}
                    </div>
                    <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[#241914]">{t('shell.home.heroTitle')}</h2>
                    <p className="mt-4 text-sm leading-7 text-[#776353]">{t('shell.home.heroDescription')}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {QUICK_PROMPT_KEYS.map((promptKey) => (
                        <button
                          key={promptKey}
                          type="button"
                          onClick={() => onApplyPrompt(t(promptKey))}
                          className="rounded-full border border-[#ead7c5] bg-[#fff7ef] px-4 py-2 text-sm text-[#6f5a49] transition hover:border-[#dfbf9a] hover:bg-white"
                        >
                          {t(promptKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/68 bg-white/68 p-4 shadow-[0_14px_24px_rgba(151,107,69,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#aa7543]">{t('shell.home.badgeFastLaunch')}</div>
                    <div className="mt-2 text-[1.35rem] font-semibold text-[#241914]">{launchCards.length}</div>
                    <div className="mt-1 text-xs leading-5 text-[#7c6655]">{t('shell.home.launchCta')}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/68 bg-white/68 p-4 shadow-[0_14px_24px_rgba(151,107,69,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#aa7543]">{t('shell.home.stepsTitle')}</div>
                    <div className="mt-2 text-[1.35rem] font-semibold text-[#241914]">{HOME_STEPS.length}</div>
                    <div className="mt-1 text-xs leading-5 text-[#7c6655]">{t('shell.home.step.two.title')}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/68 bg-white/68 p-4 shadow-[0_14px_24px_rgba(151,107,69,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#aa7543]">{t('shell.home.bridgeHint.label')}</div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-[#241914]">
                      {bridgeReady ? t('shell.home.bridgeReady') : t('shell.home.bridgeMode', { mode: t(`bridge.mode.${openClawConfig.mode}`) })}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[#7c6655]">{busy ?? activity}</div>
                  </div>
                </div>

                <div className="border-t border-[#edd9c5]/70 pt-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {launchCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => onActivateLaunchCard(card.id)}
                        className="rounded-[28px] border border-[#eedfcc] p-5 text-left shadow-[0_14px_28px_rgba(151,107,69,0.08)] transition hover:translate-y-[-2px] hover:shadow-[0_18px_34px_rgba(151,107,69,0.12)]"
                        style={{ background: card.accent }}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/66 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                          {card.icon}
                        </div>
                        <div className="mt-4 text-base font-semibold text-[#241914]">{t(card.titleKey)}</div>
                        <div className="mt-2 text-sm leading-6 text-[#715d4d]">{t(card.descriptionKey)}</div>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a66935]">
                          {t('shell.home.launchCta')}
                          <span className="i-lucide-arrow-right h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 self-start xl:sticky xl:top-0">
            <section className="rounded-[30px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
              <div className="text-sm font-semibold text-[#241914]">{t('shell.home.stepsTitle')}</div>
              <div className="mt-4 space-y-3">
                {HOME_STEPS.map((step, index) => (
                  <div key={step.titleKey} className="flex gap-3 rounded-[22px] bg-[#fff7ef] px-4 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#241b17] text-sm font-semibold text-[#fff7ef]">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#241914]">{t(step.titleKey)}</div>
                      <div className="mt-2 text-sm leading-6 text-[#7a6553]">{t(step.descriptionKey)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] bg-[linear-gradient(180deg,#2b231e_0%,#3a2a1e_100%)] p-5 text-[#fff7ef] shadow-[0_22px_38px_rgba(44,31,21,0.24)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f3c58c]">
                <span className="i-lucide-plug-zap h-4 w-4" />
                {t('shell.home.bridgeHint.label')}
              </div>
              <h3 className="mt-3 text-lg font-semibold">{bridgeReady ? t('shell.home.bridgeHint.readyTitle') : t('shell.home.bridgeHint.setupTitle')}</h3>
              <p className="mt-3 text-sm leading-7 text-[#e2d0bf]">
                {bridgeReady ? t('shell.home.bridgeHint.readyDescription') : t('shell.home.bridgeHint.setupDescription')}
              </p>
              <button
                type="button"
                onClick={onOpenBridge}
                className="mt-4 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
              >
                {t('shell.home.bridgeHint.button')}
              </button>
            </section>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <div className="space-y-4 rounded-[30px] border border-[#efdfcf] bg-white/52 p-4 pb-2">
            {messages.map((message) => (
              <div key={message.id} className={['flex', message.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}>
                <div
                  className={[
                    'max-w-[84%] rounded-[28px] px-5 py-4 shadow-[0_16px_30px_rgba(153,108,67,0.08)]',
                    message.role === 'user'
                      ? 'bg-[#251c17] text-[#fff6ed]'
                      : message.role === 'assistant'
                        ? 'border border-[#efdfcf] bg-white/90 text-[#241914]'
                        : 'border border-[#f2d5d1] bg-[#fff1ef] text-[#8a4337]'
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.12em]">
                    <span>
                      {message.role === 'user'
                        ? t('shell.home.message.user')
                        : message.role === 'assistant'
                          ? t('shell.home.message.assistant')
                          : t('shell.home.message.system')}
                    </span>
                    <span className={message.role === 'user' ? 'text-[#d9c8b8]' : 'text-[#9f856f]'}>{formatConversationTime(message.createdAt)}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-7">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-[30px] border border-[#efdfcf] bg-white/90 p-4 shadow-[0_18px_34px_rgba(153,108,67,0.08)]">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#fff0e2] text-[#b87438]">
            <span className="i-lucide-feather h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[#241914]">{t('shell.home.composerLabel')}</div>
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={4}
              placeholder={bridgeReady ? t('shell.home.composerPlaceholderReady') : t('shell.home.composerPlaceholderCli')}
              className="mt-3 w-full rounded-[24px] border border-[#ead9c6] bg-[#fffaf5] px-4 py-4 text-sm leading-7 text-[#241914] outline-none transition focus:border-[#d8b492] focus:ring-4 focus:ring-[#efd9c0]"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#8c7663]">
                {busy
                  ? t('shell.home.composerBusy', { busy })
                  : t('shell.home.composerIdle', {
                      activity
                    })}
              </div>
              <button
                type="button"
                onClick={() => void onSendMessage()}
                disabled={!canSend}
                className={[
                  'rounded-full px-5 py-3 text-sm font-semibold transition',
                  canSend
                    ? 'border border-[#e6bb8f] bg-[#241b17] text-[#fff5ec] shadow-[0_14px_24px_rgba(42,30,20,0.18)] hover:translate-y-[-1px]'
                    : 'cursor-not-allowed border border-[#ebe0d2] bg-[#f6efe7] text-[#b19b86]'
                ].join(' ')}
              >
                {t('shell.home.send')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
