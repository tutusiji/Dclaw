import { useI18n } from '../i18n';

interface LocaleToggleProps {
  onToggle: () => void;
}

export function LocaleToggle({ onToggle }: LocaleToggleProps) {
  const { locale, t } = useI18n();

  return (
    <button
      type="button"
      aria-label={t('locale.switch.ariaLabel')}
      className="inline-flex items-center rounded-full border border-[rgba(24,33,47,0.12)] bg-white/88 px-3 py-1.5 text-sm font-semibold text-[#18212f] shadow-[0_12px_28px_rgba(21,34,48,0.08)] backdrop-blur-[16px] transition hover:border-[rgba(47,100,120,0.22)] hover:bg-white"
      onClick={onToggle}
    >
      {locale === 'zh-CN' ? t('locale.switch.toEnglish') : t('locale.switch.toChinese')}
    </button>
  );
}
