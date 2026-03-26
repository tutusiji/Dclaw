import { useState } from 'react';
import type { GitReportResult, GitRepository, OpenClawConfig, OpenClawThinkingLevel } from '@shared/types';
import { formatJson } from '../app-utils';
import { buildOpenClawReportPrompt, extractOpenClawReportText, type AiReportTemplate } from '../reporting';
import type { Locale, TranslateFn } from '../i18n';
import type { RunTask } from './useTaskRunner';

interface UseGitReportsOptions {
  locale: Locale;
  t: TranslateFn;
  runTask: RunTask;
  openClawConfig: OpenClawConfig;
  openClawAgentId: string;
  openClawThinking: OpenClawThinkingLevel;
  openClawTimeoutSeconds: string;
  openClawLocal: boolean;
  setOpenClawResult: (value: string) => void;
}

export function useGitReports({
  locale,
  t,
  runTask,
  openClawConfig,
  openClawAgentId,
  openClawThinking,
  openClawTimeoutSeconds,
  openClawLocal,
  setOpenClawResult
}: UseGitReportsOptions) {
  const [gitSourceMode, setGitSourceMode] = useState<'repository' | 'workspace'>('workspace');
  const [gitSourcePath, setGitSourcePath] = useState('');
  const [gitDepth, setGitDepth] = useState(t('defaults.directoryScanDepth'));
  const [gitPreset, setGitPreset] = useState<'week' | 'month' | 'custom'>('week');
  const [gitStartDate, setGitStartDate] = useState('');
  const [gitEndDate, setGitEndDate] = useState('');
  const [gitAuthor, setGitAuthor] = useState('');
  const [gitReportPath, setGitReportPath] = useState('');
  const [gitRepositories, setGitRepositories] = useState<GitRepository[]>([]);
  const [gitReport, setGitReport] = useState<GitReportResult | null>(null);
  const [gitAiTemplate, setGitAiTemplate] = useState<AiReportTemplate>('auto_cn');
  const [gitAiContext, setGitAiContext] = useState('');
  const [gitAiOutputPath, setGitAiOutputPath] = useState('');
  const [gitAiMarkdown, setGitAiMarkdown] = useState('');

  function buildGitReportRequest() {
    return {
      sourceMode: gitSourceMode,
      sourcePath: gitSourcePath,
      preset: gitPreset,
      startDate: gitPreset === 'custom' ? gitStartDate : undefined,
      endDate: gitPreset === 'custom' ? gitEndDate : undefined,
      author: gitAuthor || undefined,
      depth: gitSourceMode === 'workspace' ? Number(gitDepth) || 3 : undefined
    } as const;
  }

  async function findGitRepositories() {
    await runTask('task.scanGitRepositories', async () => {
      const repositories = await window.dclaw.git.listRepositories(gitSourcePath, Number(gitDepth) || 3);
      setGitRepositories(repositories);
    });
  }

  async function generateGitReport() {
    await runTask('task.generateGitReport', async () => {
      const report = await window.dclaw.git.generateReport(buildGitReportRequest());
      setGitReport(report);
      setGitRepositories(report.repositories.map((section) => section.repository));
    });
  }

  async function saveGitReport() {
    if (!gitReport || !gitReportPath) {
      return;
    }

    await runTask('task.saveGitReport', async () => {
      await window.dclaw.files.writeText({
        path: gitReportPath,
        content: gitReport.markdown
      });
    });
  }

  async function generateOpenClawGitReport() {
    await runTask('task.generateOpenClawGitReport', async () => {
      const baseReport = await window.dclaw.git.generateReport(buildGitReportRequest());
      setGitReport(baseReport);
      setGitRepositories(baseReport.repositories.map((section) => section.repository));

      const prompt = buildOpenClawReportPrompt({
        locale,
        report: baseReport,
        template: gitAiTemplate,
        sourcePath: gitSourcePath,
        sourceMode: gitSourceMode,
        extraContext: gitAiContext,
        today: new Date().toISOString().slice(0, 10)
      });

      const result = await window.dclaw.openclaw.runAgentTurn({
        message: prompt,
        agentId: openClawAgentId || openClawConfig.defaultAgentId || 'main',
        thinking: openClawThinking,
        timeoutSeconds: Number(openClawTimeoutSeconds) || 180,
        local: openClawLocal
      });

      setOpenClawResult(formatJson(result));
      if (!result.ok) {
        throw new Error(result.error ?? t('error.openClawAiReportFailed'));
      }

      const aiMarkdown = extractOpenClawReportText(result.output ?? result.stdout ?? result);
      setGitAiMarkdown(aiMarkdown);
    });
  }

  async function saveOpenClawGitReport() {
    if (!gitAiMarkdown || !gitAiOutputPath) {
      return;
    }

    await runTask('task.saveOpenClawReport', async () => {
      await window.dclaw.files.writeText({
        path: gitAiOutputPath,
        content: gitAiMarkdown
      });
    });
  }

  return {
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
    findGitRepositories,
    generateGitReport,
    saveGitReport,
    generateOpenClawGitReport,
    saveOpenClawGitReport
  };
}
