import type { InspirationItem } from '../ui-shell-data';
import { useI18n } from '../i18n';

interface InspirationDetailModalProps {
  item: InspirationItem | null;
  onClose: () => void;
  onUsePrompt: (prompt: string) => void;
}

export function InspirationDetailModal({ item, onClose, onUsePrompt }: InspirationDetailModalProps) {
  const { t } = useI18n();

  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1612]/40 p-6 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-[780px] overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,#fffaf5_0%,#fff5ea_100%)] shadow-[0_36px_96px_rgba(69,44,20,0.26)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 pb-5 pt-6" style={{ background: item.accent }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-[0.14em] text-[#9c6b42]">{t(`shell.inspiration.category.${item.categoryId}`)}</div>
              <h3 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.02em] text-[#211713]">{t(item.titleKey)}</h3>
              <p className="mt-3 max-w-[42rem] text-sm leading-7 text-[#6e5b4c]">{t(item.descriptionKey)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/60 bg-white/58 text-[#6e5b4c] transition hover:bg-white/82"
            >
              <span className="i-lucide-x h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <section className="rounded-[28px] border border-[#efdfcf] bg-white/80 p-5 shadow-[0_18px_30px_rgba(151,107,69,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#fcebd8] text-xl">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-[#241914]">{t('shell.inspiration.modal.usageTitle')}</div>
                <div className="mt-1 text-xs text-[#9a806a]">{t('shell.inspiration.modal.usageDescription')}</div>
              </div>
            </div>
            <div className="mt-4 rounded-[20px] bg-[#fff7ef] px-4 py-4 text-sm leading-7 text-[#5b493d]">{t(item.promptKey)}</div>
          </section>

          <section className="rounded-[28px] border border-[#efdfcf] bg-white/80 p-5 shadow-[0_18px_30px_rgba(151,107,69,0.08)]">
            <div className="text-sm font-semibold text-[#241914]">{t(item.scenarioTitleKey)}</div>
            <p className="mt-3 text-sm leading-7 text-[#6e5b4c]">{t(item.scenarioDescriptionKey)}</p>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#ead7c5] bg-white px-5 py-3 text-sm font-semibold text-[#7b614f] transition hover:bg-[#fff7ef]"
            >
              {t('shell.inspiration.modal.close')}
            </button>
            <button
              type="button"
              onClick={() => onUsePrompt(t(item.promptKey))}
              className="rounded-full border border-[#e7bb8c] bg-[#231b17] px-5 py-3 text-sm font-semibold text-[#fff5ec] shadow-[0_16px_28px_rgba(42,30,20,0.2)] transition hover:translate-y-[-1px]"
            >
              {t('shell.inspiration.modal.useNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
