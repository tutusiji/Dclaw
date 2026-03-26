import { useState } from 'react';
import type { OfficeCapabilityMatrix } from '@shared/types';
import { formatJson, splitArgs, splitLines } from '../app-utils';
import type { TranslateFn } from '../i18n';
import type { RunTask } from './useTaskRunner';

interface UseAutomationWorkspaceOptions {
  t: TranslateFn;
  runTask: RunTask;
}

export function useAutomationWorkspace({ t, runTask }: UseAutomationWorkspaceOptions) {
  const [capabilities, setCapabilities] = useState<OfficeCapabilityMatrix>({
    xlsx: false,
    docx: false,
    pptx: false
  });
  const [directoryPath, setDirectoryPath] = useState('');
  const [directoryEntries, setDirectoryEntries] = useState<string[]>([]);
  const [textFilesText, setTextFilesText] = useState('');
  const [textSeparator, setTextSeparator] = useState('\n\n---\n\n');
  const [textOutputPath, setTextOutputPath] = useState('');
  const [textMergePreview, setTextMergePreview] = useState('');
  const [csvFilesText, setCsvFilesText] = useState('');
  const [csvOutputPath, setCsvOutputPath] = useState('');
  const [csvDedupeKeys, setCsvDedupeKeys] = useState('');
  const [csvPreview, setCsvPreview] = useState('');
  const [excelFilesText, setExcelFilesText] = useState('');
  const [excelOutputPath, setExcelOutputPath] = useState('');
  const [excelResult, setExcelResult] = useState('');
  const [wordTitle, setWordTitle] = useState(t('defaults.wordTitle'));
  const [wordParagraphsText, setWordParagraphsText] = useState(t('defaults.wordParagraphsText'));
  const [wordOutputPath, setWordOutputPath] = useState('');
  const [wordResult, setWordResult] = useState('');
  const [pptTitle, setPptTitle] = useState(t('defaults.pptTitle'));
  const [pptBulletsText, setPptBulletsText] = useState(t('defaults.pptBulletsText'));
  const [pptOutputPath, setPptOutputPath] = useState('');
  const [pptResult, setPptResult] = useState('');

  async function scanDirectory() {
    await runTask('task.scanDirectory', async () => {
      const entries = await window.dclaw.files.listDirectory(directoryPath);
      setDirectoryEntries(
        entries.map(
          (entry) =>
            `${entry.kind === 'directory' ? t('automation.directory.entry.directory') : t('automation.directory.entry.file')} ${entry.name}`
        )
      );
    });
  }

  async function mergeTextFiles() {
    await runTask('task.mergeTextFiles', async () => {
      const result = await window.dclaw.files.mergeText({
        files: splitLines(textFilesText),
        separator: textSeparator,
        outputPath: textOutputPath || undefined
      });

      setTextMergePreview(result.content);
    });
  }

  async function mergeCsvFiles() {
    await runTask('task.mergeCsvFiles', async () => {
      const result = await window.dclaw.files.mergeCsv({
        files: splitLines(csvFilesText),
        outputPath: csvOutputPath || undefined,
        dedupeBy: splitArgs(csvDedupeKeys)
      });

      setCsvPreview(formatJson(result));
    });
  }

  async function refreshOfficeCapabilities() {
    await runTask('task.refreshOfficeCapabilities', async () => {
      const office = await window.dclaw.office.getCapabilities();
      setCapabilities(office);
    });
  }

  async function mergeExcel() {
    await runTask('task.mergeExcelFiles', async () => {
      const result = await window.dclaw.office.mergeExcel({
        files: splitLines(excelFilesText),
        outputPath: excelOutputPath,
        sheetName: t('automation.office.excel.defaultSheetName')
      });

      setExcelResult(formatJson(result));
    });
  }

  async function generateWord() {
    await runTask('task.generateWordSummary', async () => {
      const result = await window.dclaw.office.generateWord({
        title: wordTitle,
        paragraphs: splitLines(wordParagraphsText),
        outputPath: wordOutputPath
      });

      setWordResult(formatJson(result));
    });
  }

  async function generatePpt() {
    await runTask('task.generatePptSummary', async () => {
      const result = await window.dclaw.office.generatePpt({
        title: pptTitle,
        bullets: splitLines(pptBulletsText),
        outputPath: pptOutputPath
      });

      setPptResult(formatJson(result));
    });
  }

  return {
    capabilities,
    setCapabilities,
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
    scanDirectory,
    mergeTextFiles,
    mergeCsvFiles,
    refreshOfficeCapabilities,
    mergeExcel,
    generateWord,
    generatePpt
  };
}
