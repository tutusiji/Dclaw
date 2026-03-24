import { promises as fs } from 'node:fs';
import { join, basename } from 'node:path';
import type {
  GitCommitRecord,
  GitReportRequest,
  GitReportResult,
  GitReportSection,
  GitRepository
} from '../../shared/types';
import { runCommand } from './process-utils';

const COMMIT_SEPARATOR = '\u001e';
const FIELD_SEPARATOR = '\u001f';

interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function isGitRepository(path: string): Promise<boolean> {
  return exists(join(path, '.git'));
}

async function getRepositoryMeta(rootPath: string): Promise<GitRepository> {
  const [{ stdout: branch }, { stdout: status }] = await Promise.all([
    runCommand('git', ['-C', rootPath, 'rev-parse', '--abbrev-ref', 'HEAD']),
    runCommand('git', ['-C', rootPath, 'status', '--porcelain'])
  ]);

  return {
    name: basename(rootPath),
    rootPath,
    branch,
    worktreeClean: status.length === 0
  };
}

async function scanRepositories(rootPath: string, depth: number): Promise<string[]> {
  if (await isGitRepository(rootPath)) {
    return [rootPath];
  }

  if (depth < 0) {
    return [];
  }

  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(async (entry) => scanRepositories(join(rootPath, entry.name), depth - 1))
  );

  return nested.flat();
}

function getTimeRange(request: GitReportRequest): TimeRange {
  const now = new Date();

  if (request.preset === 'custom') {
    if (!request.startDate || !request.endDate) {
      throw new Error('Custom reports require startDate and endDate.');
    }

    return {
      start: new Date(`${request.startDate}T00:00:00`),
      end: new Date(`${request.endDate}T23:59:59`),
      label: `${request.startDate} to ${request.endDate}`
    };
  }

  if (request.preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start,
      end: now,
      label: `${start.toISOString().slice(0, 10)} to ${now.toISOString().slice(0, 10)}`
    };
  }

  const weekday = now.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  const start = new Date(now);
  start.setDate(now.getDate() + offset);
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end: now,
    label: `${start.toISOString().slice(0, 10)} to ${now.toISOString().slice(0, 10)}`
  };
}

function parseGitLog(output: string): GitCommitRecord[] {
  return output
    .split(COMMIT_SEPARATOR)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [header, ...fileLines] = chunk.split('\n');
      const [hash, author, email, committedAt, title] = header.split(FIELD_SEPARATOR);
      const files = fileLines
        .map((line) => line.trim())
        .filter(Boolean);

      return {
        hash,
        author,
        email,
        committedAt,
        title,
        body: '',
        files
      };
    });
}

function buildSection(repository: GitRepository, commits: GitCommitRecord[]): GitReportSection {
  const authors = Array.from(new Set(commits.map((commit) => commit.author)));
  const dailyActivity = commits.reduce<Record<string, number>>((result, commit) => {
    const day = commit.committedAt.slice(0, 10);
    result[day] = (result[day] ?? 0) + 1;
    return result;
  }, {});

  const fileHits = new Map<string, number>();
  commits.forEach((commit) => {
    commit.files.forEach((file) => {
      fileHits.set(file, (fileHits.get(file) ?? 0) + 1);
    });
  });

  const topFiles = Array.from(fileHits.entries())
    .map(([path, hits]) => ({ path, hits }))
    .sort((left, right) => right.hits - left.hits)
    .slice(0, 8);

  const highlights = commits
    .slice(0, 6)
    .map((commit) => commit.title)
    .filter((title, index, collection) => collection.indexOf(title) === index);

  return {
    repository,
    commitCount: commits.length,
    authors,
    dailyActivity,
    topFiles,
    highlights,
    commits
  };
}

function buildMarkdown(range: TimeRange, sections: GitReportSection[]): string {
  const lines = [
    `# Dclaw Work Report`,
    '',
    `- Period: ${range.label}`,
    `- Generated: ${new Date().toISOString()}`,
    `- Repositories: ${sections.length}`,
    `- Total commits: ${sections.reduce((total, section) => total + section.commitCount, 0)}`,
    ''
  ];

  for (const section of sections) {
    lines.push(`## ${section.repository.name}`);
    lines.push('');
    lines.push(`- Path: ${section.repository.rootPath}`);
    lines.push(`- Branch: ${section.repository.branch}`);
    lines.push(`- Commits: ${section.commitCount}`);
    lines.push(`- Authors: ${section.authors.join(', ') || 'N/A'}`);
    lines.push('');

    if (section.highlights.length > 0) {
      lines.push(`### Highlights`);
      lines.push('');
      section.highlights.forEach((highlight) => {
        lines.push(`- ${highlight}`);
      });
      lines.push('');
    }

    if (section.topFiles.length > 0) {
      lines.push(`### Hot Files`);
      lines.push('');
      section.topFiles.forEach((file) => {
        lines.push(`- ${file.path} (${file.hits} changes)`);
      });
      lines.push('');
    }

    lines.push(`### Daily Activity`);
    lines.push('');
    Object.entries(section.dailyActivity)
      .sort(([left], [right]) => left.localeCompare(right))
      .forEach(([day, count]) => {
        lines.push(`- ${day}: ${count} commit(s)`);
      });
    lines.push('');
  }

  return lines.join('\n');
}

export async function listRepositories(rootPath: string, depth = 3): Promise<GitRepository[]> {
  const repositories = await scanRepositories(rootPath, depth);
  const unique = Array.from(new Set(repositories));
  const metas = await Promise.all(unique.map((repository) => getRepositoryMeta(repository)));
  return metas.sort((left, right) => left.name.localeCompare(right.name));
}

export async function generateReport(request: GitReportRequest): Promise<GitReportResult> {
  const range = getTimeRange(request);
  const repoPaths =
    request.sourceMode === 'repository'
      ? [request.sourcePath]
      : await scanRepositories(request.sourcePath, request.depth ?? 3);

  if (repoPaths.length === 0) {
    throw new Error('No git repositories were found under the provided path.');
  }

  const sections = await Promise.all(
    repoPaths.map(async (repoPath) => {
      const repository = await getRepositoryMeta(repoPath);
      const args = [
        '-C',
        repoPath,
        'log',
        `--since=${range.start.toISOString()}`,
        `--until=${range.end.toISOString()}`,
        '--date=iso-strict',
        `--pretty=format:${COMMIT_SEPARATOR}%H${FIELD_SEPARATOR}%an${FIELD_SEPARATOR}%ae${FIELD_SEPARATOR}%ad${FIELD_SEPARATOR}%s`,
        '--name-only'
      ];

      if (request.author) {
        args.push(`--author=${request.author}`);
      }

      const { stdout } = await runCommand('git', args);
      const commits = parseGitLog(stdout);

      return buildSection(repository, commits);
    })
  );

  const nonEmptySections = sections.filter((section) => section.commitCount > 0);
  const markdown = buildMarkdown(range, nonEmptySections);

  return {
    title: request.preset === 'month' ? 'Monthly Work Report' : 'Weekly Work Report',
    periodLabel: range.label,
    generatedAt: new Date().toISOString(),
    markdown,
    repositories: nonEmptySections
  };
}
