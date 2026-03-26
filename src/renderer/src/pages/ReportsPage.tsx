import type { Dispatch, SetStateAction } from 'react';
import type { AiReportTemplate } from '../reporting';
import type { GitReportResult, GitRepository, OpenClawAgentSummary, OpenClawConfig } from '@shared/types';
import { Panel } from '../components/Panel';
import { useI18n } from '../i18n';

interface ReportsPageProps {
  busy: string | null;
  gitSourceMode: 'repository' | 'workspace';
  setGitSourceMode: Dispatch<SetStateAction<'repository' | 'workspace'>>;
  gitSourcePath: string;
  setGitSourcePath: Dispatch<SetStateAction<string>>;
  gitDepth: string;
  setGitDepth: Dispatch<SetStateAction<string>>;
  gitPreset: 'week' | 'month' | 'custom';
  setGitPreset: Dispatch<SetStateAction<'week' | 'month' | 'custom'>>;
  gitStartDate: string;
  setGitStartDate: Dispatch<SetStateAction<string>>;
  gitEndDate: string;
  setGitEndDate: Dispatch<SetStateAction<string>>;
  gitAuthor: string;
  setGitAuthor: Dispatch<SetStateAction<string>>;
  gitReportPath: string;
  setGitReportPath: Dispatch<SetStateAction<string>>;
  gitRepositories: GitRepository[];
  gitReport: GitReportResult | null;
  gitAiTemplate: AiReportTemplate;
  setGitAiTemplate: Dispatch<SetStateAction<AiReportTemplate>>;
  gitAiContext: string;
  setGitAiContext: Dispatch<SetStateAction<string>>;
  gitAiOutputPath: string;
  setGitAiOutputPath: Dispatch<SetStateAction<string>>;
  gitAiMarkdown: string;
  openClawAgents: OpenClawAgentSummary[];
  openClawAgentId: string;
  setOpenClawAgentId: Dispatch<SetStateAction<string>>;
  openClawConfig: OpenClawConfig;
  onPickDirectory: (setter: (value: string) => void) => Promise<void>;
  onPickSavePath: (
    setter: (value: string) => void,
    defaultPath: string,
    filters: Array<{ name: string; extensions: string[] }>
  ) => Promise<void>;
  onFindGitRepositories: () => Promise<void>;
  onGenerateGitReport: () => Promise<void>;
  onSaveGitReport: () => Promise<void>;
  onGenerateOpenClawGitReport: () => Promise<void>;
  onSaveOpenClawGitReport: () => Promise<void>;
  getAiTemplateLabel: (template: AiReportTemplate, report: GitReportResult) => string;
}

export function ReportsPage({
  busy,
  gitSourceMode,
  setGitSourceMode,
  gitSourcePath,
  setGitSourcePath,
  gitDepth,
  setGitDepth,
  gitPreset,
  setGitPreset,
  gitStartDate,
  setGitStartDate,
  gitEndDate,
  setGitEndDate,
  gitAuthor,
  setGitAuthor,
  gitReportPath,
  setGitReportPath,
  gitRepositories,
  gitReport,
  gitAiTemplate,
  setGitAiTemplate,
  gitAiContext,
  setGitAiContext,
  gitAiOutputPath,
  setGitAiOutputPath,
  gitAiMarkdown,
  openClawAgents,
  openClawAgentId,
  setOpenClawAgentId,
  openClawConfig,
  onPickDirectory,
  onPickSavePath,
  onFindGitRepositories,
  onGenerateGitReport,
  onSaveGitReport,
  onGenerateOpenClawGitReport,
  onSaveOpenClawGitReport,
  getAiTemplateLabel
}: ReportsPageProps) {
  const { t } = useI18n();

  return (
    <Panel eyebrow={t('reports.eyebrow')} title={t('reports.title')} subtitle={t('reports.subtitle')} className="panel--wide">
      <div className="subgrid two-up">
        <label className="field">
          <span>{t('reports.sourceMode')}</span>
          <select value={gitSourceMode} onChange={(event) => setGitSourceMode(event.target.value as typeof gitSourceMode)}>
            <option value="workspace">{t('reports.workspace')}</option>
            <option value="repository">{t('reports.repository')}</option>
          </select>
        </label>
        <label className="field">
          <span>{t('reports.depth')}</span>
          <input value={gitDepth} onChange={(event) => setGitDepth(event.target.value)} placeholder={t('defaults.directoryScanDepth')} />
        </label>
      </div>

      <label className="field">
        <span>{t('reports.sourcePath')}</span>
        <div className="inline-field">
          <input value={gitSourcePath} onChange={(event) => setGitSourcePath(event.target.value)} placeholder={t('defaults.path.workspaceExample')} />
          <button className="button button--ghost" onClick={() => void onPickDirectory(setGitSourcePath)} disabled={Boolean(busy)}>
            {t('reports.browse')}
          </button>
        </div>
      </label>

      <div className="subgrid three-up">
        <label className="field">
          <span>{t('reports.preset')}</span>
          <select value={gitPreset} onChange={(event) => setGitPreset(event.target.value as typeof gitPreset)}>
            <option value="week">{t('reports.currentWeek')}</option>
            <option value="month">{t('reports.currentMonth')}</option>
            <option value="custom">{t('reports.customRange')}</option>
          </select>
        </label>
        <label className="field">
          <span>{t('reports.startDate')}</span>
          <input type="date" value={gitStartDate} onChange={(event) => setGitStartDate(event.target.value)} disabled={gitPreset !== 'custom'} />
        </label>
        <label className="field">
          <span>{t('reports.endDate')}</span>
          <input type="date" value={gitEndDate} onChange={(event) => setGitEndDate(event.target.value)} disabled={gitPreset !== 'custom'} />
        </label>
      </div>

      <label className="field">
        <span>{t('reports.authorFilter')}</span>
        <input value={gitAuthor} onChange={(event) => setGitAuthor(event.target.value)} placeholder={t('reports.authorFilterPlaceholder')} />
      </label>

      <label className="field">
        <span>{t('reports.reportOutputPath')}</span>
        <div className="inline-field">
          <input value={gitReportPath} onChange={(event) => setGitReportPath(event.target.value)} placeholder={t('reports.outputPathPlaceholder')} />
          <button
            className="button button--ghost"
            onClick={() =>
              void onPickSavePath(setGitReportPath, t('defaults.fileName.workReport'), [{ name: t('common.fileFilter.markdown'), extensions: ['md'] }])
            }
            disabled={Boolean(busy)}
          >
            {t('reports.selectOutput')}
          </button>
        </div>
      </label>

      <div className="button-row">
        <button className="button button--ghost" onClick={() => void onFindGitRepositories()} disabled={Boolean(busy)}>
          {t('reports.findRepos')}
        </button>
        <button className="button" onClick={() => void onGenerateGitReport()} disabled={Boolean(busy)}>
          {t('reports.generateReport')}
        </button>
        <button className="button button--ghost" onClick={() => void onSaveGitReport()} disabled={Boolean(busy) || !gitReport || !gitReportPath}>
          {t('reports.saveMarkdown')}
        </button>
      </div>

      <div className="subsection">
        <h4>{t('reports.openClawCnTitle')}</h4>
        <div className="subgrid three-up">
          <label className="field">
            <span>{t('reports.template')}</span>
            <select value={gitAiTemplate} onChange={(event) => setGitAiTemplate(event.target.value as AiReportTemplate)}>
              <option value="auto_cn">{t('reports.autoTemplate')}</option>
              <option value="weekly_cn">{t('reports.weeklyCn')}</option>
              <option value="monthly_cn">{t('reports.monthlyCn')}</option>
              <option value="leadership_cn">{t('reports.leadershipCn')}</option>
            </select>
          </label>
          <label className="field">
            <span>{t('reports.openClawAgent')}</span>
            <input
              list="openclaw-agents"
              value={openClawAgentId}
              onChange={(event) => setOpenClawAgentId(event.target.value)}
              placeholder={openClawConfig.defaultAgentId ?? t('defaults.openClawAgentId')}
            />
            <datalist id="openclaw-agents">
              {openClawAgents.map((agent) => (
                <option key={agent.id} value={agent.id} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>{t('reports.aiOutputPath')}</span>
            <div className="inline-field">
              <input value={gitAiOutputPath} onChange={(event) => setGitAiOutputPath(event.target.value)} placeholder={t('reports.outputPathPlaceholder')} />
              <button
                className="button button--ghost"
                onClick={() =>
                  void onPickSavePath(setGitAiOutputPath, t('defaults.fileName.openClawReport'), [
                    { name: t('common.fileFilter.markdown'), extensions: ['md'] }
                  ])
                }
                disabled={Boolean(busy)}
              >
                {t('reports.pick')}
              </button>
            </div>
          </label>
        </div>

        <label className="field">
          <span>{t('reports.businessContext')}</span>
          <textarea
            value={gitAiContext}
            onChange={(event) => setGitAiContext(event.target.value)}
            rows={4}
            placeholder={t('reports.businessContextPlaceholder')}
          />
        </label>

        <div className="button-row">
          <button className="button" onClick={() => void onGenerateOpenClawGitReport()} disabled={Boolean(busy)}>
            {t('reports.generateWithOpenClaw')}
          </button>
          <button className="button button--ghost" onClick={() => void onSaveOpenClawGitReport()} disabled={Boolean(busy) || !gitAiMarkdown || !gitAiOutputPath}>
            {t('reports.saveAiReport')}
          </button>
        </div>
        <p className="muted">
          {t('reports.currentTemplate')}: {gitReport ? getAiTemplateLabel(gitAiTemplate, gitReport) : t('reports.currentTemplatePending')}.
        </p>
      </div>

      <div className="list-box">
        {gitRepositories.length === 0 ? (
          <span className="muted">{t('reports.empty.noRepositories')}</span>
        ) : (
          gitRepositories.map((repository) => (
            <div key={repository.rootPath}>
              <strong>{repository.name}</strong> <span className="muted">{repository.branch}</span>
            </div>
          ))
        )}
      </div>

      <pre className="result-box">{gitReport?.markdown ?? t('reports.empty.markdown')}</pre>
      <pre className="result-box">{gitAiMarkdown || t('reports.empty.aiMarkdown')}</pre>
    </Panel>
  );
}
