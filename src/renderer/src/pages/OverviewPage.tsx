import type { DclawTaskRun, DclawTaskTemplate, EnvironmentInfo, OpenClawMode } from '@shared/types';
import type { AppView } from '../app-types';
import { getRunStatusLabel } from '../i18n/entity-labels';
import { useI18n } from '../i18n';

interface OverviewPageProps {
  environment: EnvironmentInfo | null;
  clientTaskRuns: DclawTaskRun[];
  onSelectView: (view: AppView) => void;
  onOpenChat: () => void;
  onOpenWeeklyTemplate: () => void;
  onOpenAutomation: () => void;
  onOpenBridge: () => void;
  clientTaskTemplates: DclawTaskTemplate[];
  clientSkillCount: number;
  clientAgentCount: number;
  openClawAgentCount: number;
  openClawMode: OpenClawMode;
}

function formatDateTime(value: string, locale: string) {
  try {
    return new Date(value).toLocaleString(locale, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
}

export function OverviewPage({
  environment,
  clientTaskRuns,
  onSelectView,
  onOpenChat,
  onOpenWeeklyTemplate,
  onOpenAutomation,
  onOpenBridge,
  clientTaskTemplates,
  clientSkillCount,
  clientAgentCount,
  openClawAgentCount,
  openClawMode
}: OverviewPageProps) {
  const { locale, t } = useI18n();

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-[32px] border border-[rgba(24,33,47,0.08)] bg-[linear-gradient(140deg,rgba(255,251,244,0.95),rgba(236,245,247,0.86))] p-6 shadow-[0_24px_48px_rgba(21,34,48,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div>
            <span className="inline-flex rounded-full bg-[rgba(183,103,57,0.12)] px-3 py-1 text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#8b4d2f]">
              {t('overview.dashboard.eyebrow')}
            </span>
            <h3 className="mt-4 text-[2rem] leading-tight tracking-[-0.04em] text-[#18212f]">{t('overview.dashboard.title')}</h3>
            <p className="mt-3 max-w-[46rem] text-sm leading-7 text-[#5b6778]">{t('overview.dashboard.description')}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="button" onClick={onOpenChat}>
                {t('overview.dashboard.primaryAction')}
              </button>
              <button type="button" className="button button--ghost" onClick={() => onSelectView('runtime')}>
                {t('overview.dashboard.secondaryAction')}
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.dashboard.chatMode')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{t(`bridge.mode.${openClawMode}`)}</div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#2f6478]">{t('overview.dashboard.connectedAgents')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{openClawAgentCount}</div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#2d7a52]">{t('overview.dashboard.templatesReady')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{clientTaskTemplates.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-[rgba(24,33,47,0.08)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_46px_rgba(21,34,48,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="i-lucide-layout-dashboard h-5 w-5 text-[#b76739]" />
            <h3 className="m-0 text-[1.18rem] font-semibold text-[#18212f]">{t('overview.snapshot.title')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.snapshot.connectors')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">
                {environment?.clientRuntime?.connectors.join(', ') || t('overview.snapshot.loading')}
              </div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.snapshot.recentRuns')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{clientTaskRuns.length}</div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.snapshot.skills')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{environment?.clientRuntime?.registries.skills ?? clientSkillCount}</div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.snapshot.taskTemplates')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">
                {environment?.clientRuntime?.registries.taskTemplates ?? clientTaskTemplates.length}
              </div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.snapshot.clientAgents')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{environment?.clientRuntime?.registries.agents ?? clientAgentCount}</div>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#8b4d2f]">{t('overview.snapshot.openClawAgents')}</div>
              <div className="mt-2 text-lg font-semibold text-[#18212f]">{openClawAgentCount}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[rgba(24,33,47,0.08)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_46px_rgba(21,34,48,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="i-lucide-sparkles h-5 w-5 text-[#2f6478]" />
            <h3 className="m-0 text-[1.18rem] font-semibold text-[#18212f]">{t('overview.quickActions.title')}</h3>
          </div>
          <div className="space-y-3">
            <button type="button" className="w-full rounded-[20px] border border-[rgba(24,33,47,0.08)] bg-white/82 px-4 py-3 text-left" onClick={onOpenChat}>
              <div className="text-sm font-semibold text-[#18212f]">{t('overview.quickActions.chat.title')}</div>
              <div className="mt-1 text-xs leading-5 text-[#5b6778]">{t('overview.quickActions.chat.description')}</div>
            </button>
            <button type="button" className="w-full rounded-[20px] border border-[rgba(24,33,47,0.08)] bg-white/82 px-4 py-3 text-left" onClick={onOpenWeeklyTemplate}>
              <div className="text-sm font-semibold text-[#18212f]">{t('overview.quickActions.weekly.title')}</div>
              <div className="mt-1 text-xs leading-5 text-[#5b6778]">{t('overview.quickActions.weekly.description')}</div>
            </button>
            <button type="button" className="w-full rounded-[20px] border border-[rgba(24,33,47,0.08)] bg-white/82 px-4 py-3 text-left" onClick={onOpenAutomation}>
              <div className="text-sm font-semibold text-[#18212f]">{t('overview.quickActions.automation.title')}</div>
              <div className="mt-1 text-xs leading-5 text-[#5b6778]">{t('overview.quickActions.automation.description')}</div>
            </button>
            <button type="button" className="w-full rounded-[20px] border border-[rgba(24,33,47,0.08)] bg-white/82 px-4 py-3 text-left" onClick={onOpenBridge}>
              <div className="text-sm font-semibold text-[#18212f]">{t('overview.quickActions.bridge.title')}</div>
              <div className="mt-1 text-xs leading-5 text-[#5b6778]">{t('overview.quickActions.bridge.description')}</div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-[rgba(24,33,47,0.08)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_46px_rgba(21,34,48,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="i-lucide-store h-5 w-5 text-[#2d7a52]" />
            <h3 className="m-0 text-[1.18rem] font-semibold text-[#18212f]">{t('overview.roadmap.title')}</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-[22px] border border-[rgba(24,33,47,0.08)] bg-white/82 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <strong className="text-[#18212f]">{t('overview.roadmap.agentHub.title')}</strong>
                <span className="rounded-full bg-[rgba(47,100,120,0.1)] px-3 py-1 text-xs font-semibold text-[#2f6478]">{t('overview.roadmap.planned')}</span>
              </div>
              <p className="m-0 text-sm leading-6 text-[#5b6778]">{t('overview.roadmap.agentHub.description')}</p>
            </div>
            <div className="rounded-[22px] border border-[rgba(24,33,47,0.08)] bg-white/82 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <strong className="text-[#18212f]">{t('overview.roadmap.skillStore.title')}</strong>
                <span className="rounded-full bg-[rgba(183,103,57,0.1)] px-3 py-1 text-xs font-semibold text-[#8b4d2f]">{t('overview.roadmap.planned')}</span>
              </div>
              <p className="m-0 text-sm leading-6 text-[#5b6778]">{t('overview.roadmap.skillStore.description')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[rgba(24,33,47,0.08)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_46px_rgba(21,34,48,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="i-lucide-history h-5 w-5 text-[#2f6478]" />
            <h3 className="m-0 text-[1.18rem] font-semibold text-[#18212f]">{t('overview.activity.title')}</h3>
          </div>
          <div className="space-y-3">
            {clientTaskRuns.length === 0 ? (
              <div className="rounded-[22px] border border-[rgba(24,33,47,0.08)] bg-white/82 p-4 text-sm leading-6 text-[#5b6778]">
                {t('overview.activity.empty')}
              </div>
            ) : (
              clientTaskRuns.slice(0, 4).map((run) => (
                <div key={run.id} className="rounded-[22px] border border-[rgba(24,33,47,0.08)] bg-white/82 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <strong className="text-[#18212f]">{run.sourceId ?? run.workflowId ?? run.id}</strong>
                    <span className="rounded-full bg-[rgba(24,33,47,0.08)] px-3 py-1 text-xs font-semibold text-[#18212f]">
                      {getRunStatusLabel(t, run.status)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-[#5b6778]">
                    {t('overview.activity.startedAt')}: {formatDateTime(run.startedAt, locale)}
                  </div>
                  <div className="mt-1 text-sm text-[#5b6778]">
                    {t('overview.activity.skills')}: {run.skillIds.length}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
