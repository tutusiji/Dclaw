import type { KeyboardEvent } from 'react';
import { SCHEDULE_SUGGESTION_KEYS } from '../ui-shell-data';
import { useI18n } from '../i18n';

interface ScheduleCenterPageProps {
  busy: string | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onApplySuggestion: (value: string) => void;
}

export function ScheduleCenterPage({ busy, draft, onDraftChange, onSubmit, onApplySuggestion }: ScheduleCenterPageProps) {
  const { t } = useI18n();
  const canSubmit = draft.trim().length > 0 && !busy;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && canSubmit) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <section className="h-full overflow-y-auto rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,#fffdf9_0%,#fbf3ea_100%)] p-6 shadow-[0_24px_80px_rgba(96,66,34,0.12)]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
        <div className="rounded-[36px] border border-[#efdfcf] bg-white/88 p-6 shadow-[0_20px_40px_rgba(151,107,69,0.08)]">
          <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#fff8ee_0%,#fff0de_56%,#fff7ec_100%)] p-6">
            <div className="pointer-events-none absolute left-[-20px] top-[-16px] h-24 w-24 rounded-full bg-[#ffd9b4]/70 blur-xl" />
            <div className="pointer-events-none absolute bottom-[-18px] right-[-8px] h-24 w-24 rounded-full bg-[#ffe8d4]/65 blur-xl" />
            <div className="relative max-w-[44rem]">
              <div className="text-sm font-semibold tracking-[0.16em] text-[#a58468]">{t('shell.schedule.page.eyebrow')}</div>
              <h1 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.04em] text-[#241914]">{t('shell.schedule.page.title')}</h1>
              <p className="mt-4 text-sm leading-7 text-[#776353]">{t('shell.schedule.page.description')}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[32px] border border-[#efdfcf] bg-[#fffaf5] p-6">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#fff0e1] text-[#ba793b]">
                <span className="i-lucide-clock-3 h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#241914]">{t('shell.schedule.page.formTitle')}</div>
                <textarea
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={7}
                  placeholder={t('shell.schedule.page.placeholder')}
                  className="mt-3 w-full rounded-[24px] border border-[#ead9c6] bg-white px-4 py-4 text-sm leading-7 text-[#241914] outline-none transition focus:border-[#d8b492] focus:ring-4 focus:ring-[#efd9c0]"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="max-w-[38rem] text-xs leading-6 text-[#8e7764]">{t('shell.schedule.page.helper')}</div>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    className={[
                      'rounded-full px-5 py-3 text-sm font-semibold transition',
                      canSubmit
                        ? 'border border-[#e6bb8f] bg-[#241b17] text-[#fff5ec] shadow-[0_14px_24px_rgba(42,30,20,0.18)] hover:translate-y-[-1px]'
                        : 'cursor-not-allowed border border-[#ebe0d2] bg-[#f6efe7] text-[#b19b86]'
                    ].join(' ')}
                  >
                    {t('shell.schedule.page.submit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 self-start xl:sticky xl:top-0">
          <section className="rounded-[32px] bg-[linear-gradient(180deg,#2b231e_0%,#3a2a1e_100%)] p-5 text-[#fff7ef] shadow-[0_22px_38px_rgba(44,31,21,0.24)]">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-white/12 text-[#f3c58c]">
                <span className="i-lucide-calendar-range h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold">{t('shell.schedule.page.formTitle')}</div>
                <p className="mt-2 text-sm leading-7 text-[#e2d0bf]">{t('shell.schedule.page.helper')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a58468]">{t('shell.schedule.page.suggestionLabel')}</div>
            <div className="mt-4 space-y-3">
              {SCHEDULE_SUGGESTION_KEYS.map((suggestionKey) => (
                <button
                  key={suggestionKey}
                  type="button"
                  onClick={() => onApplySuggestion(t(suggestionKey))}
                  className="w-full rounded-[24px] border border-[#efdfcf] bg-[#fff8f1] p-4 text-left transition hover:translate-y-[-1px] hover:bg-white"
                >
                  <div className="text-sm leading-7 text-[#715d4d]">{t(suggestionKey)}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
