export type OpenClawMode = 'http' | 'command';
export type ReportPreset = 'week' | 'month' | 'custom';

export interface EnvironmentInfo {
  platform: string;
  arch: string;
  versions: Record<string, string>;
  cwd: string;
  home: string;
  optionalOfficePackages: string[];
}

export interface FileDialogFilter {
  name: string;
  extensions: string[];
}

export interface FileEntry {
  path: string;
  name: string;
  kind: 'file' | 'directory';
  size: number;
  modifiedAt: string;
}

export interface TextMergeRequest {
  files: string[];
  outputPath?: string;
  separator?: string;
}

export interface TextWriteRequest {
  path: string;
  content: string;
}

export interface TextMergeResult {
  outputPath?: string;
  content: string;
  mergedFiles: string[];
}

export interface CsvMergeRequest {
  files: string[];
  outputPath?: string;
  dedupeBy?: string[];
}

export interface CsvMergeResult {
  outputPath?: string;
  header: string[];
  rows: number;
  preview: string[][];
}

export interface OfficeCapabilityMatrix {
  xlsx: boolean;
  docx: boolean;
  pptx: boolean;
}

export interface ExcelMergeRequest {
  files: string[];
  outputPath: string;
  sheetName?: string;
}

export interface WordSummaryRequest {
  title: string;
  paragraphs: string[];
  outputPath: string;
}

export interface PptSummaryRequest {
  title: string;
  bullets: string[];
  outputPath: string;
}

export interface OfficeTaskResult {
  ok: boolean;
  outputPath?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface GitRepository {
  name: string;
  rootPath: string;
  branch: string;
  worktreeClean: boolean;
}

export interface GitCommitRecord {
  hash: string;
  author: string;
  email: string;
  committedAt: string;
  title: string;
  body: string;
  files: string[];
}

export interface GitReportRequest {
  sourcePath: string;
  sourceMode: 'repository' | 'workspace';
  preset: ReportPreset;
  startDate?: string;
  endDate?: string;
  author?: string;
  depth?: number;
}

export interface GitReportSection {
  repository: GitRepository;
  commitCount: number;
  authors: string[];
  dailyActivity: Record<string, number>;
  topFiles: Array<{ path: string; hits: number }>;
  highlights: string[];
  commits: GitCommitRecord[];
}

export interface GitReportResult {
  title: string;
  periodLabel: string;
  generatedAt: string;
  markdown: string;
  repositories: GitReportSection[];
}

export interface OpenClawConfig {
  mode: OpenClawMode;
  baseUrl?: string;
  apiKey?: string;
  binaryPath?: string;
  defaultArgs?: string[];
  workingDirectory?: string;
}

export interface OpenClawTaskRequest {
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  args?: string[];
  timeoutMs?: number;
}

export interface OpenClawTaskResponse {
  ok: boolean;
  status?: number;
  output?: unknown;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export interface DclawApi {
  app: {
    getEnvironment(): Promise<EnvironmentInfo>;
    pickFiles(filters?: FileDialogFilter[]): Promise<string[]>;
    pickDirectory(): Promise<string | null>;
    pickSavePath(defaultPath?: string, filters?: FileDialogFilter[]): Promise<string | null>;
  };
  files: {
    listDirectory(path: string): Promise<FileEntry[]>;
    readText(path: string): Promise<string>;
    writeText(request: TextWriteRequest): Promise<{ path: string }>;
    mergeText(request: TextMergeRequest): Promise<TextMergeResult>;
    mergeCsv(request: CsvMergeRequest): Promise<CsvMergeResult>;
  };
  office: {
    getCapabilities(): Promise<OfficeCapabilityMatrix>;
    mergeExcel(request: ExcelMergeRequest): Promise<OfficeTaskResult>;
    generateWord(request: WordSummaryRequest): Promise<OfficeTaskResult>;
    generatePpt(request: PptSummaryRequest): Promise<OfficeTaskResult>;
  };
  git: {
    listRepositories(path: string, depth?: number): Promise<GitRepository[]>;
    generateReport(request: GitReportRequest): Promise<GitReportResult>;
  };
  openclaw: {
    getConfig(): Promise<OpenClawConfig>;
    saveConfig(config: OpenClawConfig): Promise<OpenClawConfig>;
    healthCheck(): Promise<OpenClawTaskResponse>;
    execute(request: OpenClawTaskRequest): Promise<OpenClawTaskResponse>;
  };
}
