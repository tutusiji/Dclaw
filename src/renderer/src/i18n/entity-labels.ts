import type {
  DclawAgentDefinition,
  DclawInstallation,
  DclawTaskRun,
  DclawTaskTemplate,
  DclawWorkflowDefinition,
  DclawSkillDefinition
} from '@shared/types';
import type { TranslateFn } from './index';

const TASK_TEMPLATE_KEYS: Record<string, { name: string; description: string }> = {
  'dclaw.task-template.weekly-report': {
    name: 'entity.taskTemplate.weeklyReport.name',
    description: 'entity.taskTemplate.weeklyReport.description'
  },
  'dclaw.task-template.monthly-report': {
    name: 'entity.taskTemplate.monthlyReport.name',
    description: 'entity.taskTemplate.monthlyReport.description'
  },
  'dclaw.task-template.merge-excel': {
    name: 'entity.taskTemplate.mergeExcel.name',
    description: 'entity.taskTemplate.mergeExcel.description'
  },
  'dclaw.task-template.summarize-folder': {
    name: 'entity.taskTemplate.summarizeFolder.name',
    description: 'entity.taskTemplate.summarizeFolder.description'
  }
};

const WORKFLOW_NAME_KEYS: Record<string, string> = {
  'dclaw.workflow.weekly-report': 'entity.workflow.weeklyReport.name',
  'dclaw.workflow.monthly-report': 'entity.workflow.monthlyReport.name',
  'dclaw.workflow.merge-excel': 'entity.workflow.mergeExcel.name',
  'dclaw.workflow.summarize-folder': 'entity.workflow.summarizeFolder.name'
};

const SKILL_NAME_KEYS: Record<string, string> = {
  'dclaw.skill.filesystem': 'entity.skill.filesystem.name',
  'dclaw.skill.office': 'entity.skill.office.name',
  'dclaw.skill.git-report': 'entity.skill.gitReport.name'
};

const AGENT_NAME_KEYS: Record<string, string> = {
  'dclaw.agent.general-assistant': 'entity.agent.generalAssistant.name',
  'dclaw.agent.file-assistant': 'entity.agent.fileAssistant.name',
  'dclaw.agent.report-assistant': 'entity.agent.reportAssistant.name'
};

export function getTaskTemplateName(t: TranslateFn, template: DclawTaskTemplate): string {
  const keys = TASK_TEMPLATE_KEYS[template.id];
  return keys ? t(keys.name, undefined, template.name) : template.name;
}

export function getTaskTemplateDescription(t: TranslateFn, template: DclawTaskTemplate): string {
  const keys = TASK_TEMPLATE_KEYS[template.id];
  return keys ? t(keys.description, undefined, template.description) : template.description;
}

export function getWorkflowName(t: TranslateFn, workflow: DclawWorkflowDefinition): string {
  const key = WORKFLOW_NAME_KEYS[workflow.id];
  return key ? t(key, undefined, workflow.name) : workflow.name;
}

export function getSkillName(t: TranslateFn, skill: DclawSkillDefinition): string {
  const key = SKILL_NAME_KEYS[skill.id];
  return key ? t(key, undefined, skill.name) : skill.name;
}

export function getAgentName(t: TranslateFn, agent: DclawAgentDefinition): string {
  const key = AGENT_NAME_KEYS[agent.id];
  return key ? t(key, undefined, agent.name) : agent.name;
}

export function getCategoryLabel(t: TranslateFn, category: DclawTaskTemplate['category']): string {
  switch (category) {
    case 'reporting':
      return t('common.category.reporting');
    case 'files':
      return t('common.category.files');
    case 'office':
      return t('common.category.office');
    case 'automation':
      return t('common.category.automation');
    default:
      return t('common.category.general');
  }
}

export function getInstallSourceLabel(t: TranslateFn, source: DclawInstallation['installSource']): string {
  return t(`common.installSource.${source}`, undefined, source);
}

export function getPackageTypeLabel(t: TranslateFn, type: DclawInstallation['packageType']): string {
  return t(`common.packageType.${type}`, undefined, type);
}

export function getRunStatusLabel(t: TranslateFn, status: DclawTaskRun['status']): string {
  return t(`common.runStatus.${status}`, undefined, status);
}
