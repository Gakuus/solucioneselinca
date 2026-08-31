import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import type { MachineQueryInput } from './machines.validation';
import { PdfBuilder, machineBadge } from '../reports/pdf-render';
import { pageShell, escapeHtml, fmtDate, MACHINE_STATUS, statusBadge, lbl } from '../reports/pdf.service';

function whereFrom(query: Partial<MachineQueryInput>) {
  const { search, status, machineTypeId, sortBy, sortOrder, includeDeleted } = query;

  const where: any = {};

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (machineTypeId) {
    where.machineTypeId = machineTypeId;
  }

  return { where, sortBy: (sortBy || 'code') as string, sortOrder: (sortOrder || 'asc') as 'asc' | 'desc' };
}

export async function listMachines(
  query: Partial<MachineQueryInput> = {}
): Promise<
  Array<{
    id: string;
    code: string;
    name: string;
    type: string | null;
    brand: string | null;
    model: string | null;
    year: number | null;
    serialNumber: string | null;
    status: string;
    createdAt: Date;
  }>
> {
  const { where, sortBy, sortOrder } = whereFrom(query);

  const rows = await prisma.machine.findMany({
    where,
    include: {
      machineType: { select: { name: true } },
    },
    orderBy: { [sortBy]: sortOrder },
  });

  return rows.map((m) => ({
    id: m.id,
    code: m.code,
    name: m.name,
    type: m.machineType?.name || null,
    brand: m.brand || null,
    model: m.model || null,
    year: m.year ?? null,
    serialNumber: m.serialNumber || null,
    status: m.status,
    createdAt: m.createdAt,
  }));
}

export async function buildMachinesListHtml(query: Partial<MachineQueryInput> = {}): Promise<string> {
  const rows = await listMachines(query);

  const tbody = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.code)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.type || '-')}</td>
        <td>${escapeHtml(r.brand || '-')}</td>
        <td>${escapeHtml(r.model || '-')}</td>
        <td>${r.year || '-'}</td>
        <td>${statusBadge(MACHINE_STATUS, r.status)}</td>
      </tr>`
    )
    .join('');

  const body = `
    <div class="section-title">Resumen</div>
    <div class="grid2" style="margin-bottom:20px">
      <div class="kv"><div class="k">Total de Máquinas</div><div class="v">${rows.length}</div></div>
    </div>
    <table class="report-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>${tbody || '<tr><td colspan="7" style="text-align:center;color:#9ca3af">Sin resultados</td></tr>'}</tbody>
    </table>`;

  const html = pageShell('Listado de Máquinas', 'Soluciones El Inca · Gestión de Mantenimiento', body);
  return html;
}

export async function buildMachinesListPdf(query: Partial<MachineQueryInput> = {}): Promise<Uint8Array> {
  const rows = await listMachines(query);
  const p = new PdfBuilder('Listado de Máquinas');
  p.title('Listado de Máquinas', 'Soluciones El Inca · Gestión de Mantenimiento');
  p.sectionTitle('Resumen');
  p.kv([{ k: 'Total de Máquinas', v: rows.length }]);
  p.sectionTitle('Detalle');
  p.table({
    headers: ['Código', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Año', 'Estado'],
    cols: [
      { w: 56 },
      { w: 104 },
      { w: 80 },
      { w: 84 },
      { w: 84 },
      { w: 36, align: 'right' },
      { w: 66 },
    ],
    rows: rows.map((r) => [
      r.code,
      r.name,
      r.type || '-',
      r.brand || '-',
      r.model || '-',
      r.year ?? '-',
      machineBadge(r.status),
    ]),
  });
  return p.toBuffer();
}

export async function buildMachinesListExcel(
  query: Partial<MachineQueryInput> = {}
): Promise<{ buffer: Buffer; filename: string }> {
  const rows = await listMachines(query);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Máquinas');
  ws.columns = [
    { width: 14 },
    { width: 28 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 8 },
    { width: 16 },
  ];
  const lastCol = 7;

  ws.mergeCells(1, 1, 1, lastCol);
  const brand = ws.getCell(1, 1);
  brand.value = 'SOLUCIONES EL INCA';
  brand.font = { bold: true, size: 18, color: { argb: 'DC2626' } };

  ws.mergeCells(2, 1, 2, lastCol);
  const title = ws.getCell(2, 1);
  title.value = 'Listado de Máquinas';
  title.font = { bold: true, size: 14, color: { argb: '111827' } };

  ws.mergeCells(3, 1, 3, lastCol);
  const generated = ws.getCell(3, 1);
  generated.value = `Generado: ${fmtDate(new Date())}`;
  generated.font = { size: 9, color: { argb: '9CA3AF' } };

  ws.addRow([]);

  const headerRow = ws.addRow(['Código', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Año', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
    cell.font = { bold: true, color: { argb: '7F1D1D' }, size: 10 };
  });

  rows.forEach((r) => {
    const row = ws.addRow([
      r.code,
      r.name,
      r.type || '',
      r.brand || '',
      r.model || '',
      r.year?.toString() || '',
      lbl(MACHINE_STATUS, r.status),
    ]);
    row.eachCell((cell) => {
      cell.font = { size: 10 };
      cell.border = { bottom: { style: 'thin', color: { argb: 'F3F4F6' } } };
    });
  });

  const buffer = Buffer.from((await wb.xlsx.writeBuffer()) as ArrayBuffer);
  return { buffer, filename: 'maquinas.xlsx' };
}