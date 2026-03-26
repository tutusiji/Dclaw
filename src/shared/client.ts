export type DclawPackageType = 'skill' | 'agent' | 'workflow' | 'task_template' | 'connector' | 'template';
export type DclawPackageVisibility = 'private' | 'team' | 'public';
export type DclawInstallSourceKind = 'built-in' | 'local-dir' | 'zip' | 'hub';
export type DclawRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
export type DclawTaskSourceType = 'chat' | 'task_template' | 'schedule' | 'manual' | 'system';
export type DclawTaskCategory = 'reporting' | 'files' | 'office' | 'automation' | 'general';
export type DclawWorkflowStepKind = 'skill' | 'agent' | 'task';
export type DclawPermissionKey =
  | 'filesystem.read'
  | 'filesystem.write'
  | 'filesystem.watch'
  | 'git.read'
  | 'office.excel'
  | 'office.word'
  | 'office.ppt'
  | 'image.read'
  | 'image.process'
  | 'model.invoke'
  | 'network.http'
  | 'system.command'
  | 'schedule.create'
  | 'background.run';

export interface DclawJsonSchema {
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';
  description?: string;
  properties?: Record<string, DclawJsonSchema>;
  items?: DclawJsonSchema;
  required?: string[];
  enum?: string[];
  default?: unknown;
  additionalProperties?: boolean;
}

export interface DclawPermissionSet {
  keys: DclawPermissionKey[];
  pathScopes?: string[];
  networkDomains?: string[];
  requiresConfirmation?: boolean;
}

export interface DclawPackagePublisher {
  id: string;
  name: string;
  kind: 'official' | 'developer' | 'organization' | 'user';
  verified?: boolean;
}

export interface DclawPackageEntry {
  runtime: 'builtin' | 'node' | 'http' | 'connector';
  module?: string;
  exportName?: string;
}

export interface DclawPackageManifest {
  schemaVersion: string;
  id: string;
  name: string;
  type: DclawPackageType;
  version: string;
  publisher: DclawPackagePublisher;
  description: string;
  entry: DclawPackageEntry;
  permissions: DclawPermissionSet;
  tags: string[];
  visibility: DclawPackageVisibility;
}

export interface DclawSkillDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  packageId: string;
  entrypoint: string;
  permissions: DclawPermissionSet;
  inputSchema?: DclawJsonSchema;
  outputSchema?: DclawJsonSchema;
  tags: string[];
  enabled: boolean;
}

export interface DclawAgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  packageId: string;
  systemPrompt: string;
  availableSkillIds: string[];
  defaultModel?: string;
  connectorId?: string;
  tags: string[];
  enabled: boolean;
}

export interface DclawWorkflowStep {
  id: string;
  kind: DclawWorkflowStepKind;
  targetId: string;
  description: string;
  input?: Record<string, unknown>;
}

export interface DclawWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  packageId: string;
  requiredSkillIds: string[];
  steps: DclawWorkflowStep[];
  inputSchema?: DclawJsonSchema;
  outputSchema?: DclawJsonSchema;
  tags: string[];
  enabled: boolean;
}

export interface DclawTaskTemplate {
  id: string;
  name: string;
  description: string;
  workflowId: string;
  category: DclawTaskCategory;
  formSchema?: DclawJsonSchema;
  defaultInputs?: Record<string, unknown>;
  enabled: boolean;
}

export interface DclawTaskArtifact {
  label: string;
  path?: string;
  mimeType?: string;
}

export interface DclawTaskRun {
  id: string;
  sourceType: DclawTaskSourceType;
  sourceId?: string;
  status: DclawRunStatus;
  agentId?: string;
  workflowId?: string;
  skillIds: string[];
  startedAt: string;
  finishedAt?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  artifacts: DclawTaskArtifact[];
  logs: string[];
  error?: string;
}

export interface DclawTaskTemplateExecutionRequest {
  taskTemplateId: string;
  inputs?: Record<string, unknown>;
}

export interface DclawTaskExecutionResult {
  run: DclawTaskRun;
  outputs?: Record<string, unknown>;
  artifacts: DclawTaskArtifact[];
  logs: string[];
}

export interface DclawSchedule {
  id: string;
  taskTemplateId: string;
  cron: string;
  timezone: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface DclawInstallation {
  packageId: string;
  version: string;
  packageType: DclawPackageType;
  installSource: DclawInstallSourceKind;
  installedAt: string;
  grantedPermissions: DclawPermissionSet;
  enabled: boolean;
}

export interface DclawRegistrySummary {
  skills: number;
  agents: number;
  workflows: number;
  taskTemplates: number;
  installations: number;
  taskRuns: number;
}

export interface DclawClientRuntimeSnapshot {
  rootPath: string;
  packageRoot: string;
  stateRoot: string;
  registries: DclawRegistrySummary;
  connectors: string[];
}
