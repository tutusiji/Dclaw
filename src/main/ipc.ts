import { app, dialog, ipcMain } from 'electron';
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
  TextMergeRequest,
  TextWriteRequest,
  WordSummaryRequest
} from '../shared/types';
import { listDirectory, mergeCsv, mergeText, readText, writeText } from './services/file-service';
import { generateReport, listRepositories } from './services/git-report-service';
import { getOfficeCapabilities, generatePptSummary, generateWordSummary, mergeExcelFiles } from './services/office-service';
import { OpenClawBridge } from './services/openclaw-bridge';

export function registerIpcHandlers(openClawBridge: OpenClawBridge): void {
  const handle = <TArgs extends unknown[]>(
    channel: string,
    listener: (_event: Electron.IpcMainInvokeEvent, ...args: TArgs) => unknown | Promise<unknown>
  ) => {
    ipcMain.removeHandler(channel);
    ipcMain.handle(channel, listener);
  };

  const handlers: DclawApi = {
    app: {
      async getEnvironment() {
        const office = await getOfficeCapabilities();
        return {
          platform: process.platform,
          arch: process.arch,
          versions: process.versions as Record<string, string>,
          cwd: process.cwd(),
          home: app.getPath('home'),
          optionalOfficePackages: Object.entries(office)
            .filter(([, installed]) => installed)
            .map(([name]) => name)
        };
      },
      async pickFiles(filters) {
        const result = await dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filters
        });
        return result.canceled ? [] : result.filePaths;
      },
      async pickDirectory() {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        });
        return result.canceled ? null : result.filePaths[0] ?? null;
      },
      async pickSavePath(defaultPath, filters) {
        const result = await dialog.showSaveDialog({
          defaultPath,
          filters
        });
        return result.canceled ? null : result.filePath ?? null;
      }
    },
    files: {
      listDirectory,
      readText,
      writeText,
      mergeText,
      mergeCsv
    },
    office: {
      getCapabilities: getOfficeCapabilities,
      mergeExcel: mergeExcelFiles,
      generateWord: generateWordSummary,
      generatePpt: generatePptSummary
    },
    git: {
      listRepositories,
      generateReport
    },
    openclaw: {
      getConfig: () => openClawBridge.getConfig(),
      syncLocalInstall: () => openClawBridge.syncLocalInstall(),
      saveConfig: (config) => openClawBridge.saveConfig(config),
      listAgents: () => openClawBridge.listAgents(),
      getStatus: () => openClawBridge.getStatus(),
      runAgentTurn: (request) => openClawBridge.runAgentTurn(request),
      healthCheck: () => openClawBridge.healthCheck(),
      execute: (request) => openClawBridge.execute(request)
    }
  };

  handle('app:getEnvironment', () => handlers.app.getEnvironment());
  handle('app:pickFiles', (_event, filters: FileDialogFilter[] | undefined) => handlers.app.pickFiles(filters));
  handle('app:pickDirectory', () => handlers.app.pickDirectory());
  handle('app:pickSavePath', (_event, defaultPath: string | undefined, filters: FileDialogFilter[] | undefined) =>
    handlers.app.pickSavePath(defaultPath, filters)
  );
  handle('files:listDirectory', (_event, path: string) => handlers.files.listDirectory(path));
  handle('files:readText', (_event, path: string) => handlers.files.readText(path));
  handle('files:writeText', (_event, request: TextWriteRequest) => handlers.files.writeText(request));
  handle('files:mergeText', (_event, request: TextMergeRequest) => handlers.files.mergeText(request));
  handle('files:mergeCsv', (_event, request: CsvMergeRequest) => handlers.files.mergeCsv(request));
  handle('office:getCapabilities', () => handlers.office.getCapabilities());
  handle('office:mergeExcel', (_event, request: ExcelMergeRequest) => handlers.office.mergeExcel(request));
  handle('office:generateWord', (_event, request: WordSummaryRequest) => handlers.office.generateWord(request));
  handle('office:generatePpt', (_event, request: PptSummaryRequest) => handlers.office.generatePpt(request));
  handle('git:listRepositories', (_event, path: string, depth?: number) =>
    handlers.git.listRepositories(path, depth)
  );
  handle('git:generateReport', (_event, request: GitReportRequest) => handlers.git.generateReport(request));
  handle('openclaw:getConfig', () => handlers.openclaw.getConfig());
  handle('openclaw:syncLocalInstall', () => handlers.openclaw.syncLocalInstall());
  handle('openclaw:saveConfig', (_event, config: OpenClawConfig) => handlers.openclaw.saveConfig(config));
  handle('openclaw:listAgents', () => handlers.openclaw.listAgents());
  handle('openclaw:getStatus', () => handlers.openclaw.getStatus());
  handle('openclaw:runAgentTurn', (_event, request: OpenClawAgentTurnRequest) =>
    handlers.openclaw.runAgentTurn(request)
  );
  handle('openclaw:healthCheck', () => handlers.openclaw.healthCheck());
  handle('openclaw:execute', (_event, request: OpenClawTaskRequest) => handlers.openclaw.execute(request));
}
