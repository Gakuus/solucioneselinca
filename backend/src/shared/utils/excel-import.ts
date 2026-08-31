import ExcelJS from 'exceljs';
import { BadRequestError } from '../errors/AppError';

export interface ParsedSheetResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Reads the first worksheet of an Excel/CSV buffer and returns an array of
 * row objects keyed by the header text (normalized: lowercase, no accents,
 * trimmed). Rows fully empty are skipped.
 */
export async function parseExcelSheet(buffer: Buffer): Promise<ParsedSheetResult> {
  let wb: ExcelJS.Workbook;
  try {
    wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);
  } catch (err) {
    throw new BadRequestError('El archivo no es un Excel válido (.xlsx)');
  }

  const ws = wb.worksheets[0];
  if (!ws) {
    throw new BadRequestError('El archivo no contiene hojas de cálculo');
  }

  let headerRowNumber: number | null = null;
  let headers: string[] = [];
  const rows: Record<string, string>[] = [];

  ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (headerRowNumber === null) {
      const cells = (row.values as any[]).slice(1).map((c: any) =>
        c === null || c === undefined ? '' : String(c).trim()
      );
      if (cells.some((c) => c !== '')) {
        headerRowNumber = rowNumber;
        headers = cells;
      }
    } else if (rowNumber > headerRowNumber) {
      const values = (row.values as any[]).slice(1).map((c: any) =>
        c === null || c === undefined ? '' : String(c).trim()
      );
      if (!values.every((v) => v === '')) {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          if (h) {
            obj[normalizeHeader(h)] = values[i] ?? '';
          }
        });
        rows.push(obj);
      }
    }
  });

  return { headers, rows };
}

/** Normalize a header string for fuzzy matching: lowercase, accent-insensitive, collapse spaces. */
export function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function getValue(row: Record<string, string>, keys: string[]): string | undefined {
  const squashedKeyMap = new Map<string, string>();
  for (const existingKey of Object.keys(row)) {
    squashedKeyMap.set(existingKey.replace(/\s+/g, ' ').trim(), existingKey);
    squashedKeyMap.set(existingKey.replace(/\s+/g, ''), existingKey);
  }
  for (const k of keys) {
    const norm = normalizeHeader(k);
    const direct = row[norm];
    if (direct !== undefined && direct !== '') {
      return direct;
    }
    const squashedMatch = squashedKeyMap.get(norm);
    if (squashedMatch !== undefined) {
      const v = row[squashedMatch];
      if (v !== undefined && v !== '') {
        return v;
      }
    }
  }
  return undefined;
}

export function parseBool(v: string | undefined): boolean | undefined {
  if (v === undefined || v === '') return undefined;
  return ['si', 'sí', '1', 'true', 'x', 'yes', 'verdadero'].includes(v.toLowerCase());
}

export function parseNumber(v: string | undefined): number | undefined {
  if (v === undefined || v === '') return undefined;
  const cleaned = String(v).replace(/[.,](?=\d{3}$)/g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isNaN(n) ? undefined : n;
}

export function parseDate(v: string | undefined): Date | null {
  if (v === undefined || v === '') return null;
  const cleaned = String(v).trim();
  let d: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    d = new Date(`${cleaned}T00:00:00`);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
    const [dd, mm, yyyy] = cleaned.split('/');
    d = new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T00:00:00`);
  } else {
    d = new Date(cleaned);
  }
  return Number.isNaN(d.getTime()) ? null : d;
}
