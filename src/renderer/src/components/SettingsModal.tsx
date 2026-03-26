import type { EnvironmentInfo, OpenClawConfig } from '@shared/types';
import { INSTALLED_SKILLS, SETTINGS_SECTIONS, type SettingsSectionId } from '../ui-shell-data';
import { useI18n } from '../i18n';

interface SettingsModalProps {
  activeSection: SettingsSectionId;
  environment: EnvironmentInfo | null;
  openClawConfig: OpenClawConfig;
  clientSkillCount: number;
  clientAgentCount: number;
  taskTemplateCount: number;
  taskRunCount: number;
  onSelectSection: (section: SettingsSectionId) => void;
  onClose: () => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  note: string;
}

function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a7896c]">{label}</div>
      <div className="mt-3 text-[1.9rem] font-semibold tracking-[-0.03em] text-[#231815]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-[#7c6655]">{note}</div>
    </div>
  );
}

export function SettingsModal({
  activeSection,
  environment,
  openClawConfig,
  clientSkillCount,
  clientAgentCount,
  taskTemplateCount,
  taskRunCount,
  onSelectSection,
  onClose
}: SettingsModalProps) {
  const { locale, t } = useI18n();
  const workspaceLabel = environment?.cwd ?? t('shell.settings.workspaceUnknown');
  const officePackages =
    environment?.optionalOfficePackages && environment.optionalOfficePackages.length > 0
      ? environment.optionalOfficePackages.join(' / ')
      : t('shell.settings.officeMissing');

  function getRemotePrimaryValue() {
    if (openClawConfig.mode === 'cli') {
      return openClawConfig.cliPath ?? 'openclaw';
    }

    if (openClawConfig.mode === 'http') {
      return openClawConfig.baseUrl ?? t('shell.common.notConfigured');
    }

    return openClawConfig.binaryPath ?? t('shell.common.notConfigured');
  }

  const currentLanguageLabel = locale === 'zh-CN' ? t('shell.locale.zhFull') : t('shell.locale.enFull');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1813]/40 p-6 backdrop-blur-md" onClick={onClose}>
      <div
        className="flex h-[min(840px,92vh)] w-full max-w-[1200px] overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,#fff9f3_0%,#fff4e9_100%)] shadow-[0_34px_96px_rgba(69,44,20,0.26)]"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="flex w-[272px] shrink-0 flex-col border-r border-[#ebd9c6] bg-[linear-gradient(180deg,#fff6ef_0%,#f4e6d7_100%)] p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#aa896d]">{t('shell.settings.modalLabel')}</div>
            <h2 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.03em] text-[#241914]">{t('shell.settings.title')}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7b6656]">{t('shell.settings.description')}</p>
          </div>

          <div className="mt-6 space-y-2">
            {SETTINGS_SECTIONS.map((section) => {
              const active = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition',
                    active
                      ? 'border-[#efbf8a] bg-[#fff1e1] text-[#241914] shadow-[0_12px_24px_rgba(177,114,54,0.1)]'
                      : 'border-transparent bg-white/58 text-[#745f50] hover:border-[#ead6c1] hover:bg-white/80'
                  ].join(' ')}
                >
                  <span className={['rounded-[16px] p-2', active ? 'bg-[#241914] text-white' : 'bg-[#f3e6da] text-[#9a693f]'].join(' ')}>
                    <span className={`${section.icon} h-4 w-4`} />
                  </span>
                  <span className="text-sm font-semibold">{t(section.labelKey)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto rounded-[24px] border border-[#ead7c4] bg-white/72 p-4">
            <div className="text-sm font-semibold text-[#241914]">{t('shell.settings.workspaceTitle')}</div>
            <div className="mt-2 break-all text-xs leading-6 text-[#85705e]">{workspaceLabel}</div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto bg-white/18 p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold tracking-[0.14em] text-[#a48669]">{t('shell.settings.headerLabel')}</div>
              <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-[#231815]">
                {t(SETTINGS_SECTIONS.find((section) => section.id === activeSection)?.labelKey ?? 'shell.settings.section.general')}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[#ead8c5] bg-white/82 text-[#6f5b4c] transition hover:bg-[#fff7ef]"
            >
              <span className="i-lucide-x h-5 w-5" />
            </button>
          </div>

          {activeSection === 'general' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard label={t('shell.settings.general.interfaceLanguage.label')} value={currentLanguageLabel} note={t('shell.settings.general.interfaceLanguage.note')} />
              <StatCard
                label={t('shell.settings.general.platform.label')}
                value={environment ? `${environment.platform} / ${environment.arch}` : t('shell.common.detecting')}
                note={t('shell.settings.general.platform.note')}
              />
              <StatCard label={t('shell.settings.general.office.label')} value={officePackages} note={t('shell.settings.general.office.note')} />
              <StatCard label={t('shell.settings.general.workspace.label')} value={workspaceLabel} note={t('shell.settings.general.workspace.note')} />
            </div>
          ) : null}

          {activeSection === 'stats' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label={t('shell.settings.stats.skills.label')} value={clientSkillCount} note={t('shell.settings.stats.skills.note')} />
              <StatCard label={t('shell.settings.stats.agents.label')} value={clientAgentCount} note={t('shell.settings.stats.agents.note')} />
              <StatCard label={t('shell.settings.stats.templates.label')} value={taskTemplateCount} note={t('shell.settings.stats.templates.note')} />
              <StatCard label={t('shell.settings.stats.runs.label')} value={taskRunCount} note={t('shell.settings.stats.runs.note')} />
            </div>
          ) : null}

          {activeSection === 'skills' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {INSTALLED_SKILLS.map((skill) => (
                <article key={skill.id} className="rounded-[24px] border border-[#efdfcf] bg-white/84 p-5 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#fff0e2] text-2xl">{skill.icon}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#241914]">{skill.displayNameKey ? t(skill.displayNameKey) : skill.name}</div>
                        <div className="mt-1 text-xs text-[#9b826d]">
                          {skill.builtIn ? t('shell.settings.skill.sourceBuiltIn') : t('shell.settings.skill.sourceCommunity')}
                        </div>
                      </div>
                    </div>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        skill.enabled ? 'bg-[#e9f7ec] text-[#2f7b50]' : 'bg-[#f6e8e5] text-[#9e5349]'
                      ].join(' ')}
                    >
                      {skill.enabled ? t('shell.settings.skill.enabled') : t('shell.settings.skill.disabled')}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#715d4d]">{t(skill.descriptionKey)}</p>
                </article>
              ))}
            </div>
          ) : null}

          {activeSection === 'remote' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard label={t('shell.settings.remote.mode.label')} value={t(`bridge.mode.${openClawConfig.mode}`)} note={t('shell.settings.remote.mode.note')} />
              <StatCard label={t('shell.settings.remote.primary.label')} value={getRemotePrimaryValue()} note={t('shell.settings.remote.primary.note')} />
              <StatCard
                label={t('shell.settings.remote.agent.label')}
                value={openClawConfig.defaultAgentId ?? 'main'}
                note={t('shell.settings.remote.agent.note')}
              />
              <StatCard
                label={t('shell.settings.remote.workspace.label')}
                value={openClawConfig.workspacePath ?? openClawConfig.workingDirectory ?? t('shell.common.notConfigured')}
                note={t('shell.settings.remote.workspace.note')}
              />
            </div>
          ) : null}

          {activeSection === 'about' ? (
            <div className="space-y-4">
              <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-6 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
                <div className="text-sm font-semibold text-[#241914]">{t('shell.settings.about.positioning.title')}</div>
                <p className="mt-3 text-sm leading-7 text-[#715d4d]">{t('shell.settings.about.positioning.body')}</p>
              </div>
              <div className="rounded-[26px] border border-[#efdfcf] bg-white/84 p-6 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
                <div className="text-sm font-semibold text-[#241914]">{t('shell.settings.about.next.title')}</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[#715d4d]">
                  <p className="m-0">{t('shell.settings.about.next.one')}</p>
                  <p className="m-0">{t('shell.settings.about.next.two')}</p>
                  <p className="m-0">{t('shell.settings.about.next.three')}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
