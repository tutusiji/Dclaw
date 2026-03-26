import type { GitReportResult } from '@shared/types';
import { getMessage, type Locale } from './i18n';

export type AiReportTemplate = 'auto_cn' | 'weekly_cn' | 'monthly_cn' | 'leadership_cn';

interface PromptOptions {
  locale: Locale;
  report: GitReportResult;
  template: AiReportTemplate;
  sourcePath: string;
  sourceMode: 'repository' | 'workspace';
  extraContext?: string;
  today: string;
}

const TEMPLATE_LABEL_KEYS: Record<Exclude<AiReportTemplate, 'auto_cn'>, string> = {
  weekly_cn: 'reports.weeklyCn',
  monthly_cn: 'reports.monthlyCn',
  leadership_cn: 'reports.leadershipCn'
};

const TEMPLATE_INSTRUCTION_KEYS: Record<Exclude<AiReportTemplate, 'auto_cn'>, string> = {
  weekly_cn: 'reports.prompt.weekly.instructions',
  monthly_cn: 'reports.prompt.monthly.instructions',
  leadership_cn: 'reports.prompt.leadership.instructions'
};

function resolveTemplate(template: AiReportTemplate, report: GitReportResult): Exclude<AiReportTemplate, 'auto_cn'> {
  if (template !== 'auto_cn') {
    return template;
  }

  return report.title.includes('Monthly') ? 'monthly_cn' : 'weekly_cn';
}

function getTemplateInstructions(locale: Locale, template: Exclude<AiReportTemplate, 'auto_cn'>): string[] {
  return getMessage(locale, TEMPLATE_INSTRUCTION_KEYS[template])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getAiTemplateLabel(locale: Locale, template: AiReportTemplate, report: GitReportResult): string {
  return getMessage(locale, TEMPLATE_LABEL_KEYS[resolveTemplate(template, report)]);
}

export function buildOpenClawReportPrompt(options: PromptOptions): string {
  const template = resolveTemplate(options.template, options.report);
  const templateLabel = getAiTemplateLabel(options.locale, template, options.report);
  const instructions = getTemplateInstructions(options.locale, template);
  const sourceModeLabel = getMessage(options.locale, options.sourceMode === 'workspace' ? 'reports.workspace' : 'reports.repository');
  const sourcePath = options.sourcePath || getMessage(options.locale, 'reports.prompt.sourcePathMissing');
  const extraContext = options.extraContext?.trim()
    ? getMessage(options.locale, 'reports.prompt.extraContext.withValue', {
        extraContext: options.extraContext.trim()
      })
    : getMessage(options.locale, 'reports.prompt.extraContext.none');

  return [
    getMessage(options.locale, 'reports.prompt.header.today', { today: options.today }),
    getMessage(options.locale, 'reports.prompt.header.template', { templateLabel }),
    getMessage(options.locale, 'reports.prompt.header.sourcePath', { sourcePath }),
    getMessage(options.locale, 'reports.prompt.header.sourceMode', { sourceMode: sourceModeLabel }),
    getMessage(options.locale, 'reports.prompt.header.period', { periodLabel: options.report.periodLabel }),
    '',
    ...instructions,
    '',
    extraContext,
    '',
    getMessage(options.locale, 'reports.prompt.rawReportIntro'),
    '',
    options.report.markdown
  ].join('\n');
}

function collectTextCandidates(value: unknown, depth = 0): string[] {
  if (depth > 5 || value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextCandidates(item, depth + 1));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const preferredKeys = ['markdown', 'content', 'text', 'reply', 'message', 'outputText', 'answer'];
    const preferred = preferredKeys.flatMap((key) => collectTextCandidates(record[key], depth + 1));
    if (preferred.length > 0) {
      return preferred;
    }

    return Object.values(record).flatMap((item) => collectTextCandidates(item, depth + 1));
  }

  return [];
}

export function extractOpenClawReportText(value: unknown): string {
  const candidates = collectTextCandidates(value)
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
}
