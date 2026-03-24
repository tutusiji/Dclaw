import type { GitReportResult } from '@shared/types';

export type AiReportTemplate = 'auto_cn' | 'weekly_cn' | 'monthly_cn' | 'leadership_cn';

interface PromptOptions {
  report: GitReportResult;
  template: AiReportTemplate;
  sourcePath: string;
  sourceMode: 'repository' | 'workspace';
  extraContext?: string;
  today: string;
}

const TEMPLATE_LABELS: Record<Exclude<AiReportTemplate, 'auto_cn'>, string> = {
  weekly_cn: '中文周报',
  monthly_cn: '中文月报',
  leadership_cn: '中文领导摘要'
};

function resolveTemplate(template: AiReportTemplate, report: GitReportResult): Exclude<AiReportTemplate, 'auto_cn'> {
  if (template !== 'auto_cn') {
    return template;
  }

  return report.title.includes('Monthly') ? 'monthly_cn' : 'weekly_cn';
}

export function getAiTemplateLabel(template: AiReportTemplate, report: GitReportResult): string {
  return TEMPLATE_LABELS[resolveTemplate(template, report)];
}

export function buildOpenClawReportPrompt(options: PromptOptions): string {
  const template = resolveTemplate(options.template, options.report);
  const instructions =
    template === 'monthly_cn'
      ? [
          '请把下面的 Git 工作报告整理成一份适合团队内部同步或向主管汇报的中文月报。',
          '输出必须是中文 Markdown，不要输出 YAML、JSON、代码块围栏或解释前缀。',
          '标题中必须写出精确日期区间。',
          '如果材料不足，请明确写“待补充”而不是编造。',
          '优先保留可交付成果、重点仓库进展、风险问题、下月计划。',
          '建议结构：',
          '1. 本月概览',
          '2. 关键成果',
          '3. 重点项目 / 仓库进展',
          '4. 风险与问题',
          '5. 下月计划',
          '6. 需要协作 / 决策支持'
        ]
      : template === 'leadership_cn'
        ? [
            '请把下面的 Git 工作报告整理成一份更适合给管理层看的中文工作摘要。',
            '输出必须是中文 Markdown，不要输出 YAML、JSON、代码块围栏或解释前缀。',
            '标题中必须写出精确日期区间。',
            '重点写成果、影响、节奏、风险、下阶段安排，弱化纯技术细节堆砌。',
            '如果材料不足，请明确写“待补充”而不是编造。',
            '建议结构：',
            '1. 本期核心结论',
            '2. 已完成的关键事项',
            '3. 对业务 / 团队的影响',
            '4. 当前风险与依赖',
            '5. 下一阶段计划'
          ]
        : [
            '请把下面的 Git 工作报告整理成一份适合团队内部同步的中文周报。',
            '输出必须是中文 Markdown，不要输出 YAML、JSON、代码块围栏或解释前缀。',
            '标题中必须写出精确日期区间。',
            '如果材料不足，请明确写“待补充”而不是编造。',
            '优先保留本周完成事项、重点仓库进展、风险阻塞、下周计划。',
            '建议结构：',
            '1. 本周概览',
            '2. 已完成事项',
            '3. 重点项目 / 仓库进展',
            '4. 风险与阻塞',
            '5. 下周计划',
            '6. 需要协作 / 支持'
          ];

  return [
    `今天是 ${options.today}。`,
    `当前要生成的报告类型：${TEMPLATE_LABELS[template]}。`,
    `源路径：${options.sourcePath || '未提供'}。`,
    `源模式：${options.sourceMode === 'workspace' ? '工作区扫描' : '单仓库'}。`,
    `报告区间：${options.report.periodLabel}。`,
    '',
    ...instructions,
    '',
    options.extraContext?.trim() ? `补充业务上下文：\n${options.extraContext.trim()}` : '补充业务上下文：无',
    '',
    '以下是基于 Git 记录生成的原始工作报告，请严格基于这些内容整理，不要虚构未出现的成果：',
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
