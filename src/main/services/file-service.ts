import { promises as fs } from 'node:fs';
import { basename, join } from 'node:path';
import type {
  CsvMergeRequest,
  CsvMergeResult,
  FileEntry,
  TextMergeRequest,
  TextMergeResult,
  TextWriteRequest
} from '../../shared/types';

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((value) => value.trim());
}

function stringifyCsvLine(cells: string[]): string {
  return cells
    .map((cell) => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replaceAll('"', '""')}"`;
      }

      return cell;
    })
    .join(',');
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  const entries = await fs.readdir(path, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(path, entry.name);
      const stats = await fs.stat(fullPath);
      return {
        path: fullPath,
        name: entry.name,
        kind: entry.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modifiedAt: stats.mtime.toISOString()
      } satisfies FileEntry;
    })
  );

  return files.sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'directory' ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

export async function readText(path: string): Promise<string> {
  return fs.readFile(path, 'utf8');
}

export async function writeText(request: TextWriteRequest): Promise<{ path: string }> {
  await fs.writeFile(request.path, request.content, 'utf8');
  return {
    path: request.path
  };
}

export async function mergeText(request: TextMergeRequest): Promise<TextMergeResult> {
  if (request.files.length === 0) {
    throw new Error('At least one text file is required.');
  }

  const chunks = await Promise.all(request.files.map((file) => fs.readFile(file, 'utf8')));
  const content = chunks.join(request.separator ?? '\n\n');

  if (request.outputPath) {
    await fs.writeFile(request.outputPath, content, 'utf8');
  }

  return {
    outputPath: request.outputPath,
    content,
    mergedFiles: request.files.map((file) => basename(file))
  };
}

export async function mergeCsv(request: CsvMergeRequest): Promise<CsvMergeResult> {
  if (request.files.length === 0) {
    throw new Error('At least one CSV file is required.');
  }

  const header = new Set<string>();
  const rows: Array<Record<string, string>> = [];

  for (const file of request.files) {
    const raw = await fs.readFile(file, 'utf8');
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean);

    if (lines.length === 0) {
      continue;
    }

    const fileHeader = parseCsvLine(lines[0]);
    fileHeader.forEach((column) => header.add(column));

    for (const line of lines.slice(1)) {
      const values = parseCsvLine(line);
      const record: Record<string, string> = {};
      fileHeader.forEach((column, index) => {
        record[column] = values[index] ?? '';
      });
      rows.push(record);
    }
  }

  const headerColumns = Array.from(header);
  const dedupedRows =
    request.dedupeBy && request.dedupeBy.length > 0
      ? Array.from(
          new Map(
            rows.map((row) => [request.dedupeBy!.map((key) => row[key] ?? '').join('::'), row])
          ).values()
        )
      : rows;

  const serialized = [
    stringifyCsvLine(headerColumns),
    ...dedupedRows.map((row) => stringifyCsvLine(headerColumns.map((column) => row[column] ?? '')))
  ].join('\n');

  if (request.outputPath) {
    await fs.writeFile(request.outputPath, serialized, 'utf8');
  }

  return {
    outputPath: request.outputPath,
    header: headerColumns,
    rows: dedupedRows.length,
    preview: dedupedRows.slice(0, 8).map((row) => headerColumns.map((column) => row[column] ?? ''))
  };
}
