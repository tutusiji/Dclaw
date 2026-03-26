import { contextBridge, ipcRenderer } from 'electron';
import type {
  CsvMergeRequest,
  DclawApi,
  ExcelMergeRequest,
  FileDialogFilter,
  GitReportRequest,
  OpenClawAgentTurnRequest,
  OpenClawConfig,
  OpenClawTaskRequest,
  PptSummaryRequest,
  DclawTaskTemplateExecutionRequest,
  TextMergeRequest,
  WordSummaryRequest
} from '../shared/types';

const api: DclawApi = {
  app: {
    getEnvironment: () => ipcRenderer.invoke('app:getEnvironment'),
    pickFiles: (filters?: FileDialogFilter[]) => ipcRenderer.invoke('app:pickFiles', filters),
    pickDirectory: () => ipcRenderer.invoke('app:pickDirectory'),
    pickSavePath: (defaultPath?: string, filters?: FileDialogFilter[]) =>
      ipcRenderer.invoke('app:pickSavePath', defaultPath, filters)
  },
  client: {
    getRuntimeSnapshot: () => ipcRenderer.invoke('client:getRuntimeSnapshot'),
    listSkills: () => ipcRenderer.invoke('client:listSkills'),
    listAgents: () => ipcRenderer.invoke('client:listAgents'),
    listWorkflows: () => ipcRenderer.invoke('client:listWorkflows'),
    listTaskTemplates: () => ipcRenderer.invoke('client:listTaskTemplates'),
    listInstallations: () => ipcRenderer.invoke('client:listInstallations'),
    listTaskRuns: (limit?: number) => ipcRenderer.invoke('client:listTaskRuns', limit),
    runTaskTemplate: (request: DclawTaskTemplateExecutionRequest) => ipcRenderer.invoke('client:runTaskTemplate', request)
  },
  files: {
    listDirectory: (path) => ipcRenderer.invoke('files:listDirectory', path),
    readText: (path) => ipcRenderer.invoke('files:readText', path),
    writeText: (request) => ipcRenderer.invoke('files:writeText', request),
    mergeText: (request: TextMergeRequest) => ipcRenderer.invoke('files:mergeText', request),
    mergeCsv: (request: CsvMergeRequest) => ipcRenderer.invoke('files:mergeCsv', request)
  },
  office: {
    getCapabilities: () => ipcRenderer.invoke('office:getCapabilities'),
    mergeExcel: (request: ExcelMergeRequest) => ipcRenderer.invoke('office:mergeExcel', request),
    generateWord: (request: WordSummaryRequest) => ipcRenderer.invoke('office:generateWord', request),
    generatePpt: (request: PptSummaryRequest) => ipcRenderer.invoke('office:generatePpt', request)
  },
  git: {
    listRepositories: (path, depth) => ipcRenderer.invoke('git:listRepositories', path, depth),
    generateReport: (request: GitReportRequest) => ipcRenderer.invoke('git:generateReport', request)
  },
  openclaw: {
    getConfig: () => ipcRenderer.invoke('openclaw:getConfig'),
    syncLocalInstall: () => ipcRenderer.invoke('openclaw:syncLocalInstall'),
    saveConfig: (config: OpenClawConfig) => ipcRenderer.invoke('openclaw:saveConfig', config),
    listAgents: () => ipcRenderer.invoke('openclaw:listAgents'),
    getStatus: () => ipcRenderer.invoke('openclaw:getStatus'),
    runAgentTurn: (request: OpenClawAgentTurnRequest) => ipcRenderer.invoke('openclaw:runAgentTurn', request),
    healthCheck: () => ipcRenderer.invoke('openclaw:healthCheck'),
    execute: (request: OpenClawTaskRequest) => ipcRenderer.invoke('openclaw:execute', request)
  }
};

contextBridge.exposeInMainWorld('dclaw', api);
