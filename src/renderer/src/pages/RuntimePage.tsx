import type {
  DclawAgentDefinition,
  DclawInstallation,
  DclawSkillDefinition,
  DclawTaskRun,
  DclawTaskTemplate,
  DclawWorkflowDefinition,
  EnvironmentInfo
} from '@shared/types';
import { Panel } from '../components/Panel';
import { getClientTaskTemplateOutputConfig } from '../app-utils';
import { useI18n } from '../i18n';
import {
  getAgentName,
  getCategoryLabel,
  getInstallSourceLabel,
  getPackageTypeLabel,
  getRunStatusLabel,
  getSkillName,
  getTaskTemplateDescription,
  getTaskTemplateName,
  getWorkflowName
} from '../i18n/entity-labels';

interface RuntimePageProps {
  environment: EnvironmentInfo | null;
  busy: string | null;
  taskTemplates: DclawTaskTemplate[];
  selectedTaskTemplateId: string;
  taskInputsText: string;
  taskResult: string;
  taskRuns: DclawTaskRun[];
  skills: DclawSkillDefinition[];
  agents: DclawAgentDefinition[];
  workflows: DclawWorkflowDefinition[];
  installations: DclawInstallation[];
  onTemplateChange: (templateId: string) => void;
  onTaskInputsChange: (value: string) => void;
  onRunTemplate: () => Promise<void>;
  onRefreshRuntime: () => Promise<void>;
  onResetInputs: () => void;
  onUseCurrentWorkspace: () => Promise<void>;
  onPickReportSource: () => Promise<void>;
  onPickFolder: () => Promise<void>;
  onPickExcelFiles: () => Promise<void>;
  onPickOutputPath: () => Promise<void>;
}

export function RuntimePage({
  environment,
  busy,
  taskTemplates,
  selectedTaskTemplateId,
  taskInputsText,
  taskResult,
  taskRuns,
  skills,
  agents,
  workflows,
  installations,
  onTemplateChange,
  onTaskInputsChange,
  onRunTemplate,
  onRefreshRuntime,
  onResetInputs,
  onUseCurrentWorkspace,
  onPickReportSource,
  onPickFolder,
  onPickExcelFiles,
  onPickOutputPath
}: RuntimePageProps) {
  const { t, locale } = useI18n();
  const selectedTemplate = taskTemplates.find((template) => template.id === selectedTaskTemplateId) ?? null;

  return (
    <Panel eyebrow={t('runtime.eyebrow')} title={t('runtime.title')} subtitle={t('runtime.subtitle')} className="panel--wide">
      <div className="subgrid three-up">
        <div className="metric-card">
          <span>{t('runtime.skillsAgents')}</span>
          <strong>
            {environment?.clientRuntime
              ? `${environment.clientRuntime.registries.skills} / ${environment.clientRuntime.registries.agents}`
              : t('common.loadingEllipsis')}
          </strong>
        </div>
        <div className="metric-card">
          <span>{t('runtime.workflowsTemplates')}</span>
          <strong>
            {environment?.clientRuntime
              ? `${environment.clientRuntime.registries.workflows} / ${environment.clientRuntime.registries.taskTemplates}`
              : t('common.loadingEllipsis')}
          </strong>
        </div>
        <div className="metric-card">
          <span>{t('runtime.packagesRuns')}</span>
          <strong>
            {environment?.clientRuntime
              ? `${environment.clientRuntime.registries.installations} / ${environment.clientRuntime.registries.taskRuns}`
              : t('common.loadingEllipsis')}
          </strong>
        </div>
      </div>

      <div className="subgrid two-up">
        <label className="field">
          <span>{t('runtime.field.taskTemplate')}</span>
          <select value={selectedTaskTemplateId} onChange={(event) => onTemplateChange(event.target.value)}>
            {taskTemplates.length === 0 ? (
              <option value={selectedTaskTemplateId}>{t('runtime.loadingTemplates')}</option>
            ) : (
              taskTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {getTaskTemplateName(t, template)}
                </option>
              ))
            )}
          </select>
        </label>
        <div className="info-card">
          <strong>{selectedTemplate ? getTaskTemplateName(t, selectedTemplate) : t('runtime.templateDetails')}</strong>
          <p>{selectedTemplate ? getTaskTemplateDescription(t, selectedTemplate) : t('runtime.templateFallbackDescription')}</p>
          <p className="muted">
            {t('runtime.field.workflow')}: {selectedTemplate?.workflowId ?? t('common.loadingEllipsis')} · {t('runtime.field.category')}:{' '}
            {selectedTemplate ? getCategoryLabel(t, selectedTemplate.category) : t('common.general')} · {t('runtime.field.connectors')}:{' '}
            {environment?.clientRuntime?.connectors.join(', ') || t('common.loadingEllipsis')}
          </p>
        </div>
      </div>

      <div className="button-row">
        {(selectedTaskTemplateId === 'dclaw.task-template.weekly-report' ||
          selectedTaskTemplateId === 'dclaw.task-template.monthly-report' ||
          selectedTaskTemplateId === 'dclaw.task-template.summarize-folder') && (
          <button className="button button--ghost" onClick={() => void onUseCurrentWorkspace()} disabled={Boolean(busy)}>
            {t('runtime.button.useCurrentWorkspace')}
          </button>
        )}
        {(selectedTaskTemplateId === 'dclaw.task-template.weekly-report' ||
          selectedTaskTemplateId === 'dclaw.task-template.monthly-report') && (
          <button className="button button--ghost" onClick={() => void onPickReportSource()} disabled={Boolean(busy)}>
            {t('runtime.button.pickReportSource')}
          </button>
        )}
        {selectedTaskTemplateId === 'dclaw.task-template.summarize-folder' && (
          <button className="button button--ghost" onClick={() => void onPickFolder()} disabled={Boolean(busy)}>
            {t('runtime.button.pickFolder')}
          </button>
        )}
        {selectedTaskTemplateId === 'dclaw.task-template.merge-excel' && (
          <button className="button button--ghost" onClick={() => void onPickExcelFiles()} disabled={Boolean(busy)}>
            {t('runtime.button.pickExcelFiles')}
          </button>
        )}
        {getClientTaskTemplateOutputConfig(selectedTaskTemplateId, t) && (
          <button className="button button--ghost" onClick={() => void onPickOutputPath()} disabled={Boolean(busy)}>
            {t('runtime.button.pickOutputPath')}
          </button>
        )}
      </div>

      <label className="field">
        <span>{t('runtime.field.taskInputs')}</span>
        <textarea value={taskInputsText} onChange={(event) => onTaskInputsChange(event.target.value)} rows={10} spellCheck={false} />
      </label>

      <div className="button-row">
        <button className="button" onClick={() => void onRunTemplate()} disabled={Boolean(busy)}>
          {t('runtime.button.runTemplate')}
        </button>
        <button className="button button--ghost" onClick={() => void onRefreshRuntime()} disabled={Boolean(busy)}>
          {t('runtime.button.refreshRuntime')}
        </button>
        <button className="button button--ghost" onClick={onResetInputs} disabled={Boolean(busy)}>
          {t('runtime.button.resetInputs')}
        </button>
      </div>

      <div className="subsection">
        <h4>{t('runtime.catalog')}</h4>
        <div className="subgrid two-up">
          <div className="card">
            <div className="card-header">
              <h4>{t('runtime.skills')}</h4>
              <span className="muted">{skills.length}</span>
            </div>
            <div className="list-box">
              {skills.length === 0 ? (
                <span className="muted">{t('runtime.empty.noSkills')}</span>
              ) : (
                skills.map((skill) => (
                  <div key={skill.id}>
                    <strong>{getSkillName(t, skill)}</strong>
                    <span className="muted">
                      {skill.id} · {skill.tags.join(', ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>{t('runtime.agents')}</h4>
              <span className="muted">{agents.length}</span>
            </div>
            <div className="list-box">
              {agents.length === 0 ? (
                <span className="muted">{t('runtime.empty.noAgents')}</span>
              ) : (
                agents.map((agent) => (
                  <div key={agent.id}>
                    <strong>{getAgentName(t, agent)}</strong>
                    <span className="muted">
                      {agent.availableSkillIds.length} · {agent.connectorId ?? t('common.localRuntime')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>{t('runtime.workflows')}</h4>
              <span className="muted">{workflows.length}</span>
            </div>
            <div className="list-box">
              {workflows.length === 0 ? (
                <span className="muted">{t('runtime.empty.noWorkflows')}</span>
              ) : (
                workflows.map((workflow) => (
                  <div key={workflow.id}>
                    <strong>{getWorkflowName(t, workflow)}</strong>
                    <span className="muted">
                      {workflow.steps.length} · {workflow.requiredSkillIds.join(', ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>{t('runtime.installations')}</h4>
              <span className="muted">{installations.length}</span>
            </div>
            <div className="list-box">
              {installations.length === 0 ? (
                <span className="muted">{t('runtime.empty.noInstallations')}</span>
              ) : (
                installations.map((installation) => (
                  <div key={installation.packageId}>
                    <strong>{installation.packageId}</strong>
                    <span className="muted">
                      {getPackageTypeLabel(t, installation.packageType)} · {installation.version} ·{' '}
                      {getInstallSourceLabel(t, installation.installSource)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="subsection">
        <h4>{t('runtime.recentRuns')}</h4>
        <div className="list-box">
          {taskRuns.length === 0 ? (
            <span className="muted">{t('runtime.empty.noRuns')}</span>
          ) : (
            taskRuns.map((run) => (
              <div key={run.id}>
                <strong>{run.workflowId ?? run.sourceId ?? run.id}</strong>{' '}
                <span className="muted">
                  {getRunStatusLabel(t, run.status)} · {new Date(run.startedAt).toLocaleString(locale)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <pre className="result-box">{taskResult || t('runtime.empty.noResult')}</pre>
    </Panel>
  );
}
