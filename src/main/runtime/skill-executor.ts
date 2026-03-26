import { extname } from 'node:path';
import type { DclawTaskArtifact } from '../../shared/types';
import { listDirectory, readText, writeText } from '../services/file-service';
import { generateReport } from '../services/git-report-service';
import { mergeExcelFiles } from '../services/office-service';

export interface DclawSkillExecutionRequest {
  skillId: string;
  inputs: Record<string, unknown>;
  workflowId?: string;
  stepId?: string;
}

export interface DclawSkillExecutionResult {
  outputs: Record<string, unknown>;
  artifacts: DclawTaskArtifact[];
  logs: string[];
}

function requireString(inputs: Record<string, unknown>, key: string): string {
  const value = inputs[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required string input: ${key}`);
  }
  return value.trim();
}

function optionalString(inputs: Record<string, unknown>, key: string): string | undefined {
  const value = inputs[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function requireStringArray(inputs: Record<string, unknown>, key: string): string[] {
  const value = inputs[key];
  if (!Array.isArray(value)) {
    throw new Error(`Missing required string array input: ${key}`);
  }

  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    throw new Error(`Missing required string array input: ${key}`);
  }

  return normalized;
}

function optionalNumber(inputs: Record<string, unknown>, key: string): number | undefined {
  const value = inputs[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

export class DclawSkillExecutor {
  async execute(request: DclawSkillExecutionRequest): Promise<DclawSkillExecutionResult> {
    switch (request.skillId) {
      case 'dclaw.skill.git-report':
        return this.executeGitReport(request.inputs);
      case 'dclaw.skill.office':
        return this.executeOffice(request.inputs);
      case 'dclaw.skill.filesystem':
        return this.executeFilesystem(request.inputs);
      default:
        throw new Error(`Unsupported skill execution: ${request.skillId}`);
    }
  }

  private async executeGitReport(inputs: Record<string, unknown>): Promise<DclawSkillExecutionResult> {
    const presetInput = optionalString(inputs, 'preset');
    const preset = presetInput === 'month' ? 'month' : presetInput === 'custom' ? 'custom' : 'week';
    const sourcePath = requireString(inputs, 'sourcePath');
    const sourceModeInput = optionalString(inputs, 'sourceMode');
    const outputPath = optionalString(inputs, 'outputPath');
    const request = {
      sourcePath,
      sourceMode: sourceModeInput === 'repository' ? 'repository' : 'workspace',
      preset,
      author: optionalString(inputs, 'author'),
      depth: optionalNumber(inputs, 'depth'),
      startDate: optionalString(inputs, 'startDate'),
      endDate: optionalString(inputs, 'endDate')
    } as const;

    const logs = [`git-report:preset=${preset}`, `git-report:source=${request.sourceMode}:${sourcePath}`];
    const report = await generateReport(request);
    const artifacts: DclawTaskArtifact[] = [];

    if (outputPath) {
      await writeText({
        path: outputPath,
        content: report.markdown
      });
      artifacts.push({
        label: `${preset === 'month' ? 'Monthly' : 'Weekly'} markdown report`,
        path: outputPath,
        mimeType: 'text/markdown'
      });
      logs.push(`git-report:saved=${outputPath}`);
    }

    return {
      outputs: {
        title: report.title,
        periodLabel: report.periodLabel,
        markdown: report.markdown,
        repositories: report.repositories.length,
        outputPath
      },
      artifacts,
      logs
    };
  }

  private async executeOffice(inputs: Record<string, unknown>): Promise<DclawSkillExecutionResult> {
    const operation = optionalString(inputs, 'operation') ?? 'merge-excel';

    if (operation !== 'merge-excel') {
      throw new Error(`Unsupported office operation: ${operation}`);
    }

    const files = requireStringArray(inputs, 'files');
    const outputPath = requireString(inputs, 'outputPath');
    const sheetName = optionalString(inputs, 'sheetName');
    const result = await mergeExcelFiles({
      files,
      outputPath,
      sheetName
    });

    return {
      outputs: {
        ok: result.ok,
        message: result.message,
        outputPath: result.outputPath
      },
      artifacts: [
        {
          label: 'Merged Excel workbook',
          path: outputPath,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ],
      logs: [`office:${operation}`, `office:files=${files.length}`, `office:output=${outputPath}`]
    };
  }

  private async executeFilesystem(inputs: Record<string, unknown>): Promise<DclawSkillExecutionResult> {
    const operation = optionalString(inputs, 'operation') ?? 'list-directory';

    if (operation === 'list-directory') {
      const path = requireString(inputs, 'path');
      const entries = await listDirectory(path);
      return {
        outputs: {
          path,
          entries
        },
        artifacts: [],
        logs: [`filesystem:list-directory:${path}`, `filesystem:entries=${entries.length}`]
      };
    }

    if (operation === 'summarize-folder') {
      const path = requireString(inputs, 'path');
      const outputPath = optionalString(inputs, 'outputPath');
      const entries = await listDirectory(path);
      const textExtensions = new Set(['.txt', '.md', '.json', '.csv', '.log']);
      const textFiles = entries.filter(
        (entry) => entry.kind === 'file' && textExtensions.has(extname(entry.name).toLowerCase())
      );

      const previews = await Promise.all(
        textFiles.slice(0, 6).map(async (entry) => {
          const content = await readText(entry.path);
          return {
            path: entry.path,
            preview: content.slice(0, 300).trim()
          };
        })
      );

      const markdown = [
        `# Folder Summary`,
        '',
        `- Path: ${path}`,
        `- Total entries: ${entries.length}`,
        `- Text files sampled: ${previews.length}`,
        '',
        ...previews.flatMap((preview) => [`## ${preview.path}`, '', preview.preview || '(empty file)', ''])
      ].join('\n');

      const artifacts: DclawTaskArtifact[] = [];
      const logs = [`filesystem:${operation}:${path}`, `filesystem:sampled-files=${previews.length}`];

      if (outputPath) {
        await writeText({ path: outputPath, content: markdown });
        artifacts.push({
          label: 'Folder summary markdown',
          path: outputPath,
          mimeType: 'text/markdown'
        });
        logs.push(`filesystem:saved=${outputPath}`);
      }

      return {
        outputs: {
          path,
          scannedEntries: entries.length,
          sampledFiles: previews.length,
          markdown,
          outputPath
        },
        artifacts,
        logs
      };
    }

    throw new Error(`Unsupported filesystem operation: ${operation}`);
  }
}
