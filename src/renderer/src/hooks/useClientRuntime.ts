import { useState } from 'react';
import type {
  DclawAgentDefinition,
  DclawInstallation,
  DclawSkillDefinition,
  DclawTaskRun,
  DclawTaskTemplate,
  DclawWorkflowDefinition,
  EnvironmentInfo
} from '@shared/types';
import { formatJson, getClientTaskTemplateOutputConfig, getClientTaskTemplateSeed } from '../app-utils';
import type { TranslateFn } from '../i18n';
import type { RunTask } from './useTaskRunner';

interface ClientRuntimeBootstrapData {
  skills: DclawSkillDefinition[];
  agents: DclawAgentDefinition[];
  workflows: DclawWorkflowDefinition[];
  taskTemplates: DclawTaskTemplate[];
  installations: DclawInstallation[];
  taskRuns: DclawTaskRun[];
}

interface UseClientRuntimeOptions {
  environment: EnvironmentInfo | null;
  setEnvironment: (environment: EnvironmentInfo) => void;
  t: TranslateFn;
  setActivity: (value: string) => void;
  runTask: RunTask;
}

export function useClientRuntime({ environment, setEnvironment, t, setActivity, runTask }: UseClientRuntimeOptions) {
  const [skills, setSkills] = useState<DclawSkillDefinition[]>([]);
  const [agents, setAgents] = useState<DclawAgentDefinition[]>([]);
  const [workflows, setWorkflows] = useState<DclawWorkflowDefinition[]>([]);
  const [installations, setInstallations] = useState<DclawInstallation[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<DclawTaskTemplate[]>([]);
  const [taskRuns, setTaskRuns] = useState<DclawTaskRun[]>([]);
  const [selectedTaskTemplateId, setSelectedTaskTemplateId] = useState('dclaw.task-template.weekly-report');
  const [taskInputsText, setTaskInputsText] = useState(getClientTaskTemplateSeed('dclaw.task-template.weekly-report'));
  const [taskResult, setTaskResult] = useState('');

  function hydrateRuntime(data: ClientRuntimeBootstrapData) {
    setSkills(data.skills);
    setAgents(data.agents);
    setWorkflows(data.workflows);
    setTaskTemplates(data.taskTemplates);
    setInstallations(data.installations);
    setTaskRuns(data.taskRuns);

    if (data.taskTemplates.some((template) => template.id === selectedTaskTemplateId)) {
      setTaskInputsText(getClientTaskTemplateSeed(selectedTaskTemplateId, data.taskTemplates));
      return;
    }

    if (data.taskTemplates[0]) {
      setSelectedTaskTemplateId(data.taskTemplates[0].id);
      setTaskInputsText(getClientTaskTemplateSeed(data.taskTemplates[0].id, data.taskTemplates));
    }
  }

  async function refreshRuntime() {
    const [skills, agents, workflows, taskTemplates, installations, taskRuns, environment] = await Promise.all([
      window.dclaw.client.listSkills(),
      window.dclaw.client.listAgents(),
      window.dclaw.client.listWorkflows(),
      window.dclaw.client.listTaskTemplates(),
      window.dclaw.client.listInstallations(),
      window.dclaw.client.listTaskRuns(8),
      window.dclaw.app.getEnvironment()
    ]);

    hydrateRuntime({
      skills,
      agents,
      workflows,
      taskTemplates,
      installations,
      taskRuns
    });
    setEnvironment(environment);
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTaskTemplateId(templateId);
    setTaskInputsText(getClientTaskTemplateSeed(templateId, taskTemplates));
  }

  function resetInputs() {
    setTaskInputsText(getClientTaskTemplateSeed(selectedTaskTemplateId, taskTemplates));
  }

  function selectWeeklyTemplate() {
    setSelectedTaskTemplateId('dclaw.task-template.weekly-report');
    setTaskInputsText(getClientTaskTemplateSeed('dclaw.task-template.weekly-report', taskTemplates));
  }

  function parseTaskInputs(): Record<string, unknown> {
    if (!taskInputsText.trim()) {
      return {};
    }

    const parsed = JSON.parse(taskInputsText) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(t('error.clientTaskInputsObject'));
    }

    return parsed as Record<string, unknown>;
  }

  function updateTaskInputs(patch: Record<string, unknown>) {
    try {
      const currentInputs = parseTaskInputs();
      setTaskInputsText(JSON.stringify({ ...currentInputs, ...patch }, null, 2));
      setActivity(t('activity.clientInputsPrepared', { templateId: selectedTaskTemplateId }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknownError');
      setActivity(t('activity.clientInputsUpdateFailed', { message }));
    }
  }

  async function useCurrentWorkspaceForTask() {
    if (!environment?.cwd) {
      setActivity(t('activity.currentWorkspaceUnavailable'));
      return;
    }

    if (selectedTaskTemplateId === 'dclaw.task-template.summarize-folder') {
      updateTaskInputs({ path: environment.cwd });
      return;
    }

    updateTaskInputs({
      sourcePath: environment.cwd,
      sourceMode: 'workspace'
    });
  }

  async function pickTaskDirectoryInput(field: 'sourcePath' | 'path') {
    const path = await window.dclaw.app.pickDirectory();
    if (path) {
      updateTaskInputs({ [field]: path });
    }
  }

  async function pickTaskFilesInput() {
    const files = await window.dclaw.app.pickFiles([{ name: t('common.fileFilter.excelWorkbook'), extensions: ['xlsx', 'xls', 'xlsm'] }]);
    if (files.length > 0) {
      updateTaskInputs({ files });
    }
  }

  async function pickTaskOutputPath() {
    const outputConfig = getClientTaskTemplateOutputConfig(selectedTaskTemplateId, t);
    if (!outputConfig) {
      setActivity(t('activity.outputPickerUnavailable', { templateId: selectedTaskTemplateId }));
      return;
    }

    const outputPath = await window.dclaw.app.pickSavePath(outputConfig.defaultPath, outputConfig.filters);
    if (outputPath) {
      updateTaskInputs({ outputPath });
    }
  }

  async function runTemplate() {
    await runTask('task.runClientTask', async () => {
      const inputs = parseTaskInputs();
      const result = await window.dclaw.client.runTaskTemplate({
        taskTemplateId: selectedTaskTemplateId,
        inputs
      });

      setTaskResult(formatJson(result));
      await refreshRuntime();
    });
  }

  return {
    skills,
    agents,
    workflows,
    installations,
    taskTemplates,
    taskRuns,
    selectedTaskTemplateId,
    taskInputsText,
    taskResult,
    setTaskInputsText,
    hydrateRuntime,
    refreshRuntime,
    handleTemplateChange,
    resetInputs,
    selectWeeklyTemplate,
    useCurrentWorkspaceForTask,
    pickTaskDirectoryInput,
    pickTaskFilesInput,
    pickTaskOutputPath,
    runTemplate
  };
}
