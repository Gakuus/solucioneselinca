import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import type { MaintenanceQueryInput } from './maintenances.validation';
import { PdfBuilder, maintBadge } from '../reports/pdf-render';
import { maintenanceTypeLabel } from '../reports/maint-types';
import { maintenanceTechniciansLabel } from '../reports/maint-technicians';
import { parseLocalDate, endOfLocalDay } from '../../shared/utils/dates';
import {
  pageShell,
  escapeHtml,
  fmtDate,
  fmtMoney,
  MAINT_STATUS,
  statusBadge,
  lbl,
} from '../reports/pdf.service';

const MACHINE_STATUS: Record<string, string> = {
  ACTIVE: 'Activa',
  IN_MAINTENANCE: 'En Mantenimiento',
  INACTIVE: 'Inactiva',
  DECOMMISSIONED: 'Decomisionada',
};

function whereFrom(query: Partial<MaintenanceQueryInput>) {
  const { search, status, machineId, technicianId, maintenanceTypeId, category, startDate, endDate, includeDeleted } =
    query;

  const where: any = {};

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { machine: { code: { contains: search, mode: 'insensitive' } } },
      { machine: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status) {
    where.status = status;
  }
  if (machineId) {
    where.machineId = machineId;
  }
  if (technicianId) {
    where.technicianId = technicianId;
  }
  if (maintenanceTypeId) {
    where.maintenanceTypeId = maintenanceTypeId;
  }
  if (category) {
    where.maintenanceType = { isPreventive: category === 'PREVENTIVE' };
  }
  if (startDate || endDate) {
    where.receivedDate = {};
    if (startDate) {
      where.receivedDate.gte = parseLocalDate(startDate);
    }
    if (endDate) {
      where.receivedDate.lte = endOfLocalDay(endDate);
    }
  }

  return where;
}

export async function listMaintenances(
  query: Partial<MaintenanceQueryInput> = {}
): Promise<
  Array<{
    id: string;
    machineName: string;
    machineCode: string;
    type: string;
    types: string[];
    isPreventive: boolean;
    technician: string;
    technicians: string[];
    status: string;
    receivedDate: Date | null;
    maintenanceDate: Date | null;
    currentHours: number | null;
    description: string | null;
    totalCost: number;
  }>
> {
  const where = whereFrom(query);

  const rows = await prisma.maintenance.findMany({
    where,
    include: {
      machine: { select: { id: true, code: true, name: true, brand: true, model: true } },
      maintenanceType: { select: { id: true, name: true, isPreventive: true } },
      technician: { select: { id: true, name: true, email: true } },
      technicianAssignments: {
        include: {
          technician: { select: { id: true, name: true, email: true } },
        },
        orderBy: { order: 'asc' },
      },
      items: true,
      typeAssignments: {
        include: {
          maintenanceType: { select: { id: true, name: true, isPreventive: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { receivedDate: 'desc' },
  });

  return rows.map((m: any) => {
    const totalCost = (m.items || []).reduce(
      (sum: number, i: any) => sum + (i.unitCost || 0) * (i.quantity || 0),
      0
    );
    return {
      id: m.id,
      machineName: m.machine ? `${m.machine.name || ''}${m.machine.code ? ` (${m.machine.code})` : ''}` : '-',
      machineCode: m.machine?.code || '-',
      type: maintenanceTypeLabel(m),
      isPreventive: m.maintenanceType?.isPreventive ?? false,
      types: (m.typeAssignments || []).map((a: any) => a.maintenanceType?.name).filter(Boolean),
      technician: maintenanceTechniciansLabel(m),
      technicians: (m.technicianAssignments || []).map((a: any) => a.technician?.name).filter(Boolean),
      status: m.status || 'SCHEDULED',
      receivedDate: m.receivedDate ? new Date(m.receivedDate) : null,
      maintenanceDate: m.maintenanceDate ? new Date(m.maintenanceDate) : null,
      currentHours: m.currentHours ?? null,
      description: m.description ?? null,
      totalCost,
    };
  });
}

export async function buildMaintenancesListHtml(query: Partial<MaintenanceQueryInput> = {}): Promise<string> {
  const rows = await listMaintenances(query);
  const periodStart = query.startDate ? fmtDate(query.startDate) : '—';
  const periodEnd = query.endDate ? fmtDate(query.endDate) : '—';

  const tbody = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.machineName)}</td>
        <td>${escapeHtml(r.type)}</td>
        <td>${r.isPreventive ? 'Preventivo' : 'Correctivo'}</td>
        <td>${escapeHtml(r.technician || '-')}</td>
        <td>${r.receivedDate ? fmtDate(r.receivedDate) : '-'}</td>
        <td>${statusBadge(MAINT_STATUS, r.status)}</td>
        <td style="text-align:right">${fmtMoney(r.totalCost)}</td>
      </tr>`
    )
    .join('');

  const body = `
    <div class="section-title">Resumen</div>
    <div class="grid2" style="margin-bottom:20px">
      <div class="kv"><div class="k">Total de Mantenimientos</div><div class="v">${rows.length}</div></div>
      <div class="kv"><div class="k">Período</div><div class="v">${escapeHtml(periodStart)} — ${escapeHtml(periodEnd)}</div></div>
    </div>
    <table class="report-table">
      <thead>
        <tr>
          <th>Máquina</th>
          <th>Tipo</th>
          <th>Modalidad</th>
          <th>Técnico</th>
          <th>Recepción</th>
          <th>Estado</th>
          <th>Costo</th>
        </tr>
      </thead>
      <tbody>${tbody || '<tr><td colspan="7" style="text-align:center;color:#9ca3af">Sin resultados</td></tr>'}</tbody>
    </table>`;

  const html = pageShell('Listado de Mantenimientos', 'Soluciones El Inca · Gestión de Mantenimiento', body);
  return html;
}

export async function buildMaintenancesListPdf(
  query: Partial<MaintenanceQueryInput> = {}
): Promise<Uint8Array> {
  const rows = await listMaintenances(query);
  const periodStart = query.startDate ? fmtDate(query.startDate) : '—';
  const periodEnd = query.endDate ? fmtDate(query.endDate) : '—';
  const p = new PdfBuilder('Listado de Mantenimientos');
  p.title('Listado de Mantenimientos', 'Soluciones El Inca · Gestión de Mantenimiento');
  p.sectionTitle('Resumen');
  p.kv([
    { k: 'Total de Mantenimientos', v: rows.length },
    { k: 'Período', v: `${periodStart} — ${periodEnd}` },
  ]);
  p.sectionTitle('Detalle');
  p.table({
    headers: ['Máquina', 'Tipo', 'Modalidad', 'Técnico', 'Recepción', 'Estado', 'Costo'],
    cols: [
      { w: 110 },
      { w: 68 },
      { w: 62 },
      { w: 70 },
      { w: 66 },
      { w: 64 },
      { w: 65, align: 'right' },
    ],
    rows: rows.map((r) => [
      r.machineName,
      r.type,
      r.isPreventive ? 'Preventivo' : 'Correctivo',
      r.technician || '-',
      r.receivedDate ? fmtDate(r.receivedDate) : '-',
      maintBadge(r.status),
      fmtMoney(r.totalCost),
    ]),
  });
  return p.toBuffer();
}

export async function buildMaintenancesListExcel(
  query: Partial<MaintenanceQueryInput> = {}
): Promise<{ buffer: Buffer; filename: string }> {
  const rows = await listMaintenances(query);
  const statusLabels = MAINT_STATUS;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Mantenimientos');
  ws.columns = [
    { width: 34 },
    { width: 24 },
    { width: 16 },
    { width: 24 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
  ];
  const lastCol = 8;

  ws.mergeCells(1, 1, 1, lastCol);
  const brand = ws.getCell(1, 1);
  brand.value = 'SOLUCIONES EL INCA';
  brand.font = { bold: true, size: 18, color: { argb: 'DC2626' } };

  ws.mergeCells(2, 1, 2, lastCol);
  const title = ws.getCell(2, 1);
  title.value = 'Listado de Mantenimientos';
  title.font = { bold: true, size: 14, color: { argb: '111827' } };

  ws.mergeCells(3, 1, 3, lastCol);
  const generated = ws.getCell(3, 1);
  generated.value = `Generado: ${new Date().toLocaleDateString('es-ES')}`;
  generated.font = { size: 9, color: { argb: '9CA3AF' } };

  ws.addRow([]);

  const headerRow = ws.addRow(['Máquina', 'Tipo', 'Modalidad', 'Técnico', 'Recepción', 'Estado', 'Costo']);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
    cell.font = { bold: true, color: { argb: '7F1D1D' }, size: 10 };
  });

  rows.forEach((r) => {
    const row = ws.addRow([
      r.machineName,
      r.type,
      r.isPreventive ? 'Preventivo' : 'Correctivo',
      r.technician || '-',
      r.receivedDate ? fmtDate(r.receivedDate) : '-',
      lbl(statusLabels, r.status),
      Number(r.totalCost).toFixed(2),
    ]);
    row.eachCell((cell) => {
      cell.font = { size: 10 };
      cell.border = { bottom: { style: 'thin', color: { argb: 'F3F4F6' } } };
    });
  });

  const buffer = Buffer.from((await wb.xlsx.writeBuffer()) as ArrayBuffer);
  return { buffer, filename: 'mantenimientos.xlsx' };
}

export { MACHINE_STATUS };
