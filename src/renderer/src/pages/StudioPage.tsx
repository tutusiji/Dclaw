import type { PropsWithChildren } from 'react';
import type { EnvironmentInfo, OpenClawConfig } from '@shared/types';
import { useI18n } from '../i18n';

export type StudioSection = 'runtime' | 'automation' | 'reports' | 'bridge';

interface StudioPageProps extends PropsWithChildren {
  activeSection: StudioSection;
  environment: EnvironmentInfo | null;
  busy: string | null;
  activity: string;
  clientSkillCount: number;
  clientAgentCount: number;
  taskRunCount: number;
  openClawAgentCount: number;
  openClawMode: OpenClawConfig['mode'];
  onSelectSection: (section: StudioSection) => void;
  onRefreshRuntime: () => Promise<void>;
  onLoadAgents: () => Promise<void>;
  onCheckOpenClaw: () => Promise<void>;
}

interface StudioTabItem {
  id: StudioSection;
  labelKey: string;
  descriptionKey: string;
  iconClass: string;
}

const STUDIO_TABS: StudioTabItem[] = [
  {
    id: 'runtime',
    labelKey: 'shell.studio.tab.runtime.label',
    descriptionKey: 'shell.studio.tab.runtime.description',
    iconClass: 'i-lucide-bot'
  },
  {
    id: 'automation',
    labelKey: 'shell.studio.tab.automation.label',
    descriptionKey: 'shell.studio.tab.automation.description',
    iconClass: 'i-lucide-folder-cog'
  },
  {
    id: 'reports',
    labelKey: 'shell.studio.tab.reports.label',
    descriptionKey: 'shell.studio.tab.reports.description',
    iconClass: 'i-lucide-chart-column-big'
  },
  {
    id: 'bridge',
    labelKey: 'shell.studio.tab.bridge.label',
    descriptionKey: 'shell.studio.tab.bridge.description',
    iconClass: 'i-lucide-plug-zap'
  }
];

export function StudioPage({
  activeSection,
  environment,
  busy,
  activity,
  clientSkillCount,
  clientAgentCount,
  taskRunCount,
  openClawAgentCount,
  openClawMode,
  onSelectSection,
  onRefreshRuntime,
  onLoadAgents,
  onCheckOpenClaw,
  children
}: StudioPageProps) {
  const { t } = useI18n();

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,#fffdf9_0%,#fbf3ea_100%)] p-6 shadow-[0_24px_80px_rgba(96,66,34,0.12)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold tracking-[0.14em] text-[#a58468]">{t('shell.studio.page.eyebrow')}</div>
            <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-[#241914]">{t('shell.studio.page.title')}</h1>
            <p className="mt-3 max-w-[46rem] text-sm leading-7 text-[#766352]">{t('shell.studio.page.description')}</p>
          </div>

          <div className="rounded-[28px] border border-[#efdfcf] bg-white/74 p-2 shadow-[0_12px_24px_rgba(151,107,69,0.06)]">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void onRefreshRuntime()}
                disabled={Boolean(busy)}
                className="rounded-full border border-[#ead7c5] bg-white px-4 py-2 text-sm font-semibold text-[#715b4b] transition hover:bg-[#fff7ef] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('shell.studio.page.refreshRuntime')}
              </button>
              <button
                type="button"
                onClick={() => void onLoadAgents()}
                disabled={Boolean(busy)}
                className="rounded-full border border-[#ead7c5] bg-white px-4 py-2 text-sm font-semibold text-[#715b4b] transition hover:bg-[#fff7ef] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('shell.studio.page.loadAgents')}
              </button>
              <button
                type="button"
                onClick={() => void onCheckOpenClaw()}
                disabled={Boolean(busy)}
                className="rounded-full border border-[#e6bb8f] bg-[#241b17] px-4 py-2 text-sm font-semibold text-[#fff5ec] shadow-[0_14px_24px_rgba(42,30,20,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('shell.studio.page.checkHealth')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a7896c]">{t('shell.studio.metric.platform')}</div>
            <div className="mt-3 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#231815]">
              {environment ? `${environment.platform} / ${environment.arch}` : t('shell.common.detecting')}
            </div>
            <div className="mt-2 text-sm leading-6 text-[#7c6655]">
              {environment?.optionalOfficePackages && environment.optionalOfficePackages.length > 0
                ? t('shell.studio.metric.officeInstalled', { packages: environment.optionalOfficePackages.join(' / ') })
                : t('shell.studio.metric.officeMissing')}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a7896c]">{t('shell.studio.metric.catalog')}</div>
            <div className="mt-3 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#231815]">
              {clientSkillCount} / {clientAgentCount}
            </div>
            <div className="mt-2 text-sm leading-6 text-[#7c6655]">{t('shell.studio.metric.catalogDescription')}</div>
          </div>

          <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a7896c]">{t('shell.studio.metric.bridge')}</div>
            <div className="mt-3 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#231815]">{t(`bridge.mode.${openClawMode}`)}</div>
            <div className="mt-2 text-sm leading-6 text-[#7c6655]">{t('shell.studio.metric.bridgeDescription', { count: openClawAgentCount })}</div>
          </div>

          <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a7896c]">{t('shell.studio.metric.runs')}</div>
            <div className="mt-3 text-[1.4rem] font-semibold tracking-[-0.03em] text-[#231815]">{taskRunCount}</div>
            <div className="mt-2 text-sm leading-6 text-[#7c6655]">{busy ? t('shell.app.status.runningShort', { label: busy }) : activity}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-4">
          {STUDIO_TABS.map((tab) => {
            const active = tab.id === activeSection;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectSection(tab.id)}
                className={[
                  'flex w-full items-center gap-3 rounded-[24px] border px-4 py-3.5 text-left transition-all duration-200',
                  active
                    ? 'border-[#efbf8a] bg-[#fff1e1] text-[#241914] shadow-[0_12px_24px_rgba(177,114,54,0.1)]'
                    : 'border-[#ead7c5] bg-white/80 text-[#745f50] hover:bg-[#fff7ef]'
                ].join(' ')}
              >
                <span className={['rounded-[16px] p-2', active ? 'bg-[#241914] text-white' : 'bg-[#f3e6da] text-[#9a693f]'].join(' ')}>
                  <span className={`${tab.iconClass} h-4 w-4`} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t(tab.labelKey)}</span>
                  <span className="mt-1 block text-xs text-[#9a816c]">{t(tab.descriptionKey)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
    </section>
  );
}
