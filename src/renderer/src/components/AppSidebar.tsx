import type { AppNavItem, AppView } from '../app-types';
import { useI18n } from '../i18n';

interface AppSidebarProps {
  activeView: AppView;
  navItems: AppNavItem[];
  onSelectView: (view: AppView) => void;
}

export function AppSidebar({ activeView, navItems, onSelectView }: AppSidebarProps) {
  const { t } = useI18n();

  return (
    <aside className="h-fit rounded-[28px] border border-white/60 bg-[rgba(255,252,246,0.84)] p-4 shadow-[0_24px_46px_rgba(21,34,48,0.08)] backdrop-blur-[18px] xl:sticky xl:top-6">
      <div className="mb-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgba(183,103,57,0.12)] px-3 py-1 text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#8b4d2f]">
            <span className="i-lucide-sparkles h-3.5 w-3.5" />
            <span>{t('sidebar.navigation')}</span>
          </div>
          <h3 className="m-0 text-[1.15rem] font-semibold text-[#18212f]">{t('sidebar.mainAreas')}</h3>
          <p className="mt-2 text-sm leading-6 text-[#5b6778]">{t('sidebar.description')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              activeView === item.id
                ? 'w-full rounded-[22px] border border-[#18212f] bg-[#18212f] px-4 py-3 text-left text-[#f7f2e8] shadow-[0_18px_36px_rgba(24,33,47,0.18)]'
                : 'w-full rounded-[22px] border border-[rgba(24,33,47,0.08)] bg-white/72 px-4 py-3 text-left text-[#18212f] hover:border-[rgba(47,100,120,0.22)] hover:bg-white/92'
            }
            onClick={() => onSelectView(item.id)}
          >
            <div className="flex items-center gap-3">
              <span
                className={`${item.iconClass} h-5 w-5 ${
                  activeView === item.id ? 'text-[#f0c59a]' : 'text-[#b76739]'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{t(item.labelKey)}</div>
                <div className={`mt-1 text-xs leading-5 ${activeView === item.id ? 'text-[#d7c7b0]' : 'text-[#5b6778]'}`}>
                  {t(item.descriptionKey)}
                </div>
              </div>
              <span className={`i-lucide-chevrons-right h-4 w-4 ${activeView === item.id ? 'text-[#f0c59a]' : 'text-[#9ba8b8]'}`} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] bg-[#18212f] p-4 text-[#f7f2e8] shadow-[0_18px_34px_rgba(24,33,47,0.18)]">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <span className="i-lucide-file-stack h-4 w-4 text-[#f0c59a]" />
          <span>{t('sidebar.currentFocus')}</span>
        </div>
        <p className="m-0 text-sm leading-6 text-[#d7c7b0]">
          {activeView === 'overview'
            ? t('sidebar.currentFocusOverview')
            : t(navItems.find((item) => item.id === activeView)?.descriptionKey ?? 'sidebar.currentFocusOverview')}
        </p>
      </div>
    </aside>
  );
}
