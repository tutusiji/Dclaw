import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import type {
  ExcelMergeRequest,
  OfficeCapabilityMatrix,
  OfficeTaskResult,
  PptSummaryRequest,
  WordSummaryRequest
} from '../../shared/types';

const moduleRequire = createRequire(import.meta.url);

function hasOptionalPackage(packageName: string): boolean {
  try {
    moduleRequire.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

function ensurePackage(packageName: string, featureName: string): void {
  if (!hasOptionalPackage(packageName)) {
    throw new Error(
      `${featureName} requires the optional package "${packageName}". Run "pnpm install" first.`
    );
  }
}

export async function getOfficeCapabilities(): Promise<OfficeCapabilityMatrix> {
  return {
    xlsx: hasOptionalPackage('xlsx'),
    docx: hasOptionalPackage('docx'),
    pptx: hasOptionalPackage('pptxgenjs')
  };
}

export async function mergeExcelFiles(request: ExcelMergeRequest): Promise<OfficeTaskResult> {
  ensurePackage('xlsx', 'Excel merge');
  const xlsx = await import('xlsx');
  const workbook = xlsx.utils.book_new();
  const rows: unknown[][] = [];
  const sheetName = request.sheetName ?? 'MergedData';

  for (const file of request.files) {
    const source = xlsx.readFile(file);
    for (const worksheetName of source.SheetNames) {
      const worksheet = source.Sheets[worksheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
      rows.push([`# ${file} :: ${worksheetName}`]);
      rows.push(...data);
      rows.push([]);
    }
  }

  const worksheet = xlsx.utils.aoa_to_sheet(rows);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  xlsx.writeFile(workbook, request.outputPath);

  return {
    ok: true,
    outputPath: request.outputPath,
    message: `Merged ${request.files.length} Excel files into ${request.outputPath}.`
  };
}

export async function generateWordSummary(request: WordSummaryRequest): Promise<OfficeTaskResult> {
  ensurePackage('docx', 'Word generation');
  const docx = await import('docx');

  const doc = new docx.Document({
    sections: [
      {
        children: [
          new docx.Paragraph({
            text: request.title,
            heading: docx.HeadingLevel.HEADING_1
          }),
          ...request.paragraphs.map(
            (paragraph) =>
              new docx.Paragraph({
                text: paragraph,
                spacing: {
                  after: 240
                }
              })
          )
        ]
      }
    ]
  });

  const buffer = await docx.Packer.toBuffer(doc);
  await fs.writeFile(request.outputPath, buffer);

  return {
    ok: true,
    outputPath: request.outputPath,
    message: `Generated Word summary at ${request.outputPath}.`
  };
}

export async function generatePptSummary(request: PptSummaryRequest): Promise<OfficeTaskResult> {
  ensurePackage('pptxgenjs', 'PPT generation');
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();

  slide.background = { color: 'F7F2E8' };
  slide.addText(request.title, {
    x: 0.7,
    y: 0.5,
    w: 8.5,
    h: 0.6,
    fontFace: 'Aptos Display',
    fontSize: 24,
    bold: true,
    color: '18212F'
  });

  slide.addText(
    request.bullets.map((bullet) => ({
      text: bullet,
      options: { bullet: { indent: 14 } }
    })),
    {
      x: 0.9,
      y: 1.4,
      w: 8.2,
      h: 4.5,
      fontFace: 'Aptos',
      fontSize: 16,
      color: '243447',
      breakLine: true
    }
  );

  await pptx.writeFile({ fileName: request.outputPath });

  return {
    ok: true,
    outputPath: request.outputPath,
    message: `Generated PPT summary at ${request.outputPath}.`
  };
}
