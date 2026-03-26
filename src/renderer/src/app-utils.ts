import type { DclawTaskTemplate } from '@shared/types';
import type { TranslateFn } from './i18n';

export interface FileDialogLikeFilter {
  name: string;
  extensions: string[];
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitArgs(value: string): string[] {
  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatJson(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

export function getClientTaskTemplateSeed(templateId: string, templates: DclawTaskTemplate[] = []): string {
  const template = templates.find((item) => item.id === templateId);
  return JSON.stringify(template?.defaultInputs ?? {}, null, 2);
}

export function getClientTaskTemplateOutputConfig(templateId: string, t: TranslateFn): {
  defaultPath: string;
  filters: FileDialogLikeFilter[];
} | null {
  switch (templateId) {
    case 'dclaw.task-template.weekly-report':
      return {
        defaultPath: t('defaults.fileName.weeklyReport'),
        filters: [{ name: t('common.fileFilter.markdown'), extensions: ['md'] }]
      };
    case 'dclaw.task-template.monthly-report':
      return {
        defaultPath: t('defaults.fileName.monthlyReport'),
        filters: [{ name: t('common.fileFilter.markdown'), extensions: ['md'] }]
      };
    case 'dclaw.task-template.summarize-folder':
      return {
        defaultPath: t('defaults.fileName.folderSummary'),
        filters: [{ name: t('common.fileFilter.markdown'), extensions: ['md'] }]
      };
    case 'dclaw.task-template.merge-excel':
      return {
        defaultPath: t('defaults.fileName.mergedWorkbook'),
        filters: [{ name: t('common.fileFilter.excelWorkbook'), extensions: ['xlsx'] }]
      };
    default:
      return null;
  }
}
