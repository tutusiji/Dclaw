import type { Dispatch, SetStateAction } from 'react';
import type { OfficeCapabilityMatrix } from '@shared/types';
import { Panel } from '../components/Panel';
import { useI18n } from '../i18n';

interface AutomationPageProps {
  busy: string | null;
  capabilities: OfficeCapabilityMatrix;
  directoryPath: string;
  setDirectoryPath: Dispatch<SetStateAction<string>>;
  directoryEntries: string[];
  textFilesText: string;
  setTextFilesText: Dispatch<SetStateAction<string>>;
  textSeparator: string;
  setTextSeparator: Dispatch<SetStateAction<string>>;
  textOutputPath: string;
  setTextOutputPath: Dispatch<SetStateAction<string>>;
  textMergePreview: string;
  csvFilesText: string;
  setCsvFilesText: Dispatch<SetStateAction<string>>;
  csvOutputPath: string;
  setCsvOutputPath: Dispatch<SetStateAction<string>>;
  csvDedupeKeys: string;
  setCsvDedupeKeys: Dispatch<SetStateAction<string>>;
  csvPreview: string;
  excelFilesText: string;
  setExcelFilesText: Dispatch<SetStateAction<string>>;
  excelOutputPath: string;
  setExcelOutputPath: Dispatch<SetStateAction<string>>;
  excelResult: string;
  wordTitle: string;
  setWordTitle: Dispatch<SetStateAction<string>>;
  wordParagraphsText: string;
  setWordParagraphsText: Dispatch<SetStateAction<string>>;
  wordOutputPath: string;
  setWordOutputPath: Dispatch<SetStateAction<string>>;
  wordResult: string;
  pptTitle: string;
  setPptTitle: Dispatch<SetStateAction<string>>;
  pptBulletsText: string;
  setPptBulletsText: Dispatch<SetStateAction<string>>;
  pptOutputPath: string;
  setPptOutputPath: Dispatch<SetStateAction<string>>;
  pptResult: string;
  onPickDirectory: (setter: (value: string) => void) => Promise<void>;
  onPickFiles: (setter: (value: string) => void, filters: Array<{ name: string; extensions: string[] }>) => Promise<void>;
  onPickSavePath: (
    setter: (value: string) => void,
    defaultPath: string,
    filters: Array<{ name: string; extensions: string[] }>
  ) => Promise<void>;
  onScanDirectory: () => Promise<void>;
  onMergeTextFiles: () => Promise<void>;
  onMergeCsvFiles: () => Promise<void>;
  onRefreshOfficeCapabilities: () => Promise<void>;
  onMergeExcel: () => Promise<void>;
  onGenerateWord: () => Promise<void>;
  onGeneratePpt: () => Promise<void>;
}

export function AutomationPage({
  busy,
  capabilities,
  directoryPath,
  setDirectoryPath,
  directoryEntries,
  textFilesText,
  setTextFilesText,
  textSeparator,
  setTextSeparator,
  textOutputPath,
  setTextOutputPath,
  textMergePreview,
  csvFilesText,
  setCsvFilesText,
  csvOutputPath,
  setCsvOutputPath,
  csvDedupeKeys,
  setCsvDedupeKeys,
  csvPreview,
  excelFilesText,
  setExcelFilesText,
  excelOutputPath,
  setExcelOutputPath,
  excelResult,
  wordTitle,
  setWordTitle,
  wordParagraphsText,
  setWordParagraphsText,
  wordOutputPath,
  setWordOutputPath,
  wordResult,
  pptTitle,
  setPptTitle,
  pptBulletsText,
  setPptBulletsText,
  pptOutputPath,
  setPptOutputPath,
  pptResult,
  onPickDirectory,
  onPickFiles,
  onPickSavePath,
  onScanDirectory,
  onMergeTextFiles,
  onMergeCsvFiles,
  onRefreshOfficeCapabilities,
  onMergeExcel,
  onGenerateWord,
  onGeneratePpt
}: AutomationPageProps) {
  const { t } = useI18n();

  return (
    <Panel eyebrow={t('automation.eyebrow')} title={t('automation.title')} subtitle={t('automation.subtitle')} className="panel--wide">
      <div className="local-grid">
        <div className="card">
          <h3>{t('automation.directory.title')}</h3>
          <label className="field">
            <span>{t('automation.directory.path')}</span>
            <div className="inline-field">
              <input value={directoryPath} onChange={(event) => setDirectoryPath(event.target.value)} placeholder={t('defaults.path.workspaceExample')} />
              <button className="button button--ghost" onClick={() => void onPickDirectory(setDirectoryPath)} disabled={Boolean(busy)}>
                {t('automation.directory.browse')}
              </button>
            </div>
          </label>
          <button className="button" onClick={() => void onScanDirectory()} disabled={Boolean(busy)}>
            {t('automation.directory.scan')}
          </button>
          <div className="list-box">
            {directoryEntries.length === 0 ? (
              <span className="muted">{t('automation.directory.empty')}</span>
            ) : (
              directoryEntries.slice(0, 18).map((entry) => <div key={entry}>{entry}</div>)
            )}
          </div>
        </div>

        <div className="card">
          <h3>{t('automation.text.title')}</h3>
          <label className="field">
            <span>{t('automation.text.inputFiles')}</span>
            <textarea
              value={textFilesText}
              onChange={(event) => setTextFilesText(event.target.value)}
              rows={5}
              placeholder={t('automation.text.inputFilesPlaceholder')}
            />
          </label>
          <div className="button-row">
            <button
              className="button button--ghost"
              onClick={() => void onPickFiles(setTextFilesText, [{ name: t('common.fileFilter.text'), extensions: ['txt', 'md', 'log', 'json', 'csv'] }])}
              disabled={Boolean(busy)}
            >
              {t('automation.text.selectFiles')}
            </button>
            <button
              className="button button--ghost"
              onClick={() =>
                void onPickSavePath(setTextOutputPath, t('defaults.fileName.mergedText'), [{ name: t('common.fileFilter.text'), extensions: ['txt', 'md'] }])
              }
              disabled={Boolean(busy)}
            >
              {t('automation.text.selectOutput')}
            </button>
          </div>
          <label className="field">
            <span>{t('automation.text.separator')}</span>
            <textarea value={textSeparator} onChange={(event) => setTextSeparator(event.target.value)} rows={3} />
          </label>
          <label className="field">
            <span>{t('automation.text.outputPath')}</span>
            <input value={textOutputPath} onChange={(event) => setTextOutputPath(event.target.value)} placeholder={t('common.optional')} />
          </label>
          <button className="button" onClick={() => void onMergeTextFiles()} disabled={Boolean(busy)}>
            {t('automation.text.merge')}
          </button>
          <pre className="result-box result-box--compact">{textMergePreview || t('automation.text.previewEmpty')}</pre>
        </div>

        <div className="card">
          <h3>{t('automation.csv.title')}</h3>
          <label className="field">
            <span>{t('automation.csv.files')}</span>
            <textarea
              value={csvFilesText}
              onChange={(event) => setCsvFilesText(event.target.value)}
              rows={5}
              placeholder={t('automation.csv.filesPlaceholder')}
            />
          </label>
          <div className="button-row">
            <button
              className="button button--ghost"
              onClick={() => void onPickFiles(setCsvFilesText, [{ name: t('common.fileFilter.csv'), extensions: ['csv'] }])}
              disabled={Boolean(busy)}
            >
              {t('automation.csv.selectFiles')}
            </button>
            <button
              className="button button--ghost"
              onClick={() =>
                void onPickSavePath(setCsvOutputPath, t('defaults.fileName.mergedCsv'), [{ name: t('common.fileFilter.csv'), extensions: ['csv'] }])
              }
              disabled={Boolean(busy)}
            >
              {t('automation.csv.selectOutput')}
            </button>
          </div>
          <label className="field">
            <span>{t('automation.csv.dedupeKeys')}</span>
            <input
              value={csvDedupeKeys}
              onChange={(event) => setCsvDedupeKeys(event.target.value)}
              placeholder={t('automation.csv.dedupeKeysPlaceholder')}
            />
          </label>
          <label className="field">
            <span>{t('automation.csv.outputPath')}</span>
            <input value={csvOutputPath} onChange={(event) => setCsvOutputPath(event.target.value)} placeholder={t('common.optional')} />
          </label>
          <button className="button" onClick={() => void onMergeCsvFiles()} disabled={Boolean(busy)}>
            {t('automation.csv.merge')}
          </button>
          <pre className="result-box result-box--compact">{csvPreview || t('automation.csv.previewEmpty')}</pre>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{t('automation.office.title')}</h3>
            <button className="button button--ghost" onClick={() => void onRefreshOfficeCapabilities()} disabled={Boolean(busy)}>
              {t('automation.office.refresh')}
            </button>
          </div>
          <div className="pill-row">
            <span className={`pill ${capabilities.xlsx ? 'pill--ok' : 'pill--off'}`}>xlsx</span>
            <span className={`pill ${capabilities.docx ? 'pill--ok' : 'pill--off'}`}>docx</span>
            <span className={`pill ${capabilities.pptx ? 'pill--ok' : 'pill--off'}`}>pptx</span>
          </div>

          <div className="subsection">
            <h4>{t('automation.office.excel.title')}</h4>
            <textarea
              value={excelFilesText}
              onChange={(event) => setExcelFilesText(event.target.value)}
              rows={4}
              placeholder={t('automation.office.excel.filesPlaceholder')}
            />
            <div className="button-row">
              <button
                className="button button--ghost"
                onClick={() => void onPickFiles(setExcelFilesText, [{ name: t('common.fileFilter.excel'), extensions: ['xlsx'] }])}
                disabled={Boolean(busy)}
              >
                {t('automation.office.excel.selectFiles')}
              </button>
              <button
                className="button button--ghost"
                onClick={() =>
                  void onPickSavePath(setExcelOutputPath, t('defaults.fileName.mergedExcel'), [{ name: t('common.fileFilter.excel'), extensions: ['xlsx'] }])
                }
                disabled={Boolean(busy)}
              >
                {t('automation.office.excel.selectOutput')}
              </button>
            </div>
            <input
              value={excelOutputPath}
              onChange={(event) => setExcelOutputPath(event.target.value)}
              placeholder={t('automation.office.excel.outputPathPlaceholder')}
            />
            <button className="button" onClick={() => void onMergeExcel()} disabled={Boolean(busy)}>
              {t('automation.office.excel.build')}
            </button>
            <pre className="result-box result-box--compact">{excelResult || t('automation.office.excel.resultEmpty')}</pre>
          </div>

          <div className="subsection">
            <h4>{t('automation.office.word.title')}</h4>
            <input value={wordTitle} onChange={(event) => setWordTitle(event.target.value)} placeholder={t('automation.office.word.documentTitlePlaceholder')} />
            <textarea
              value={wordParagraphsText}
              onChange={(event) => setWordParagraphsText(event.target.value)}
              rows={4}
              placeholder={t('automation.office.word.paragraphsPlaceholder')}
            />
            <div className="button-row">
              <button
                className="button button--ghost"
                onClick={() =>
                  void onPickSavePath(setWordOutputPath, t('defaults.fileName.wordSummary'), [{ name: t('common.fileFilter.word'), extensions: ['docx'] }])
                }
                disabled={Boolean(busy)}
              >
                {t('automation.office.word.selectOutput')}
              </button>
            </div>
            <input
              value={wordOutputPath}
              onChange={(event) => setWordOutputPath(event.target.value)}
              placeholder={t('automation.office.word.outputPathPlaceholder')}
            />
            <button className="button" onClick={() => void onGenerateWord()} disabled={Boolean(busy)}>
              {t('automation.office.word.generate')}
            </button>
            <pre className="result-box result-box--compact">{wordResult || t('automation.office.word.resultEmpty')}</pre>
          </div>

          <div className="subsection">
            <h4>{t('automation.office.ppt.title')}</h4>
            <input value={pptTitle} onChange={(event) => setPptTitle(event.target.value)} placeholder={t('automation.office.ppt.presentationTitlePlaceholder')} />
            <textarea
              value={pptBulletsText}
              onChange={(event) => setPptBulletsText(event.target.value)}
              rows={4}
              placeholder={t('automation.office.ppt.bulletsPlaceholder')}
            />
            <div className="button-row">
              <button
                className="button button--ghost"
                onClick={() =>
                  void onPickSavePath(setPptOutputPath, t('defaults.fileName.pptSummary'), [
                    { name: t('common.fileFilter.powerpoint'), extensions: ['pptx'] }
                  ])
                }
                disabled={Boolean(busy)}
              >
                {t('automation.office.ppt.selectOutput')}
              </button>
            </div>
            <input
              value={pptOutputPath}
              onChange={(event) => setPptOutputPath(event.target.value)}
              placeholder={t('automation.office.ppt.outputPathPlaceholder')}
            />
            <button className="button" onClick={() => void onGeneratePpt()} disabled={Boolean(busy)}>
              {t('automation.office.ppt.generate')}
            </button>
            <pre className="result-box result-box--compact">{pptResult || t('automation.office.ppt.resultEmpty')}</pre>
          </div>
        </div>
      </div>
    </Panel>
  );
}
