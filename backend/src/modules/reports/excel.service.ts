import ExcelJS from 'exceljs';
import { ReportQueryInput } from './reports.validation';
import { reportsService } from './reports.service';
import { machinesService } from '../machines/machines.service';
import { maintenanceTypeLabel } from './maint-types';
import { maintenanceTechniciansLabel } from './maint-technicians';
import { parseLocalDate } from '../../shared/utils/dates';

const MAINT_STATUS: Record<string, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};
const MACHINE_STATUS: Record<string, string> = {
  ACTIVE: 'Activa',
  IN_MAINTENANCE: 'En Mantenimiento',
  INACTIVE: 'Inactiva',
  DECOMMISSIONED: 'Decomisionada',
};

const lbl = (map: Record<string, string>, v?: string | null) => (v ? map[v] || v : '-');
const dateOnlyRe = /^\d{4}-\d{2}-\d{2}$/;
const fmtD = (d: string | Date | null | undefined) => {
  if (!d) return '-';
  const asDate = typeof d === 'string' && dateOnlyRe.test(d) ? parseLocalDate(d) : new Date(d);
  return asDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const money = (n: number | null | undefined) => Number(n ?? 0).toFixed(2);

const RED = 'DC2626';
const HEADER_FILL = 'FEF2F2';
const TOTAL_FILL = 'FEF2F2';
const COMPANY = 'SOLUCIONES EL INCA';

interface Options {
  title: string;
  subtitle?: string;
  filename: string;
}

function buildWorkbook({ title, subtitle }: Options): { wb: ExcelJS.Workbook; ws: ExcelJS.Worksheet; lastCol: number } {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Reporte');

  // Encabezado empresa + título
  ws.columns = [{ width: 30 }, { width: 25 }, { width: 25 }, { width: 25 }, { width: 25 }];

  ws.mergeCells(1, 1, 1, 5);
  const brandCell = ws.getCell(1, 1);
  brandCell.value = COMPANY;
  brandCell.font = { bold: true, size: 18, color: { argb: RED } };
  brandCell.alignment = { vertical: 'middle' };

  ws.mergeCells(2, 1, 2, 5);
  const titleCell = ws.getCell(2, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14, color: { argb: '111827' } };

  if (subtitle) {
    ws.mergeCells(3, 1, 3, 5);
    const subCell = ws.getCell(3, 1);
    subCell.value = subtitle;
    subCell.font = { size: 10, color: { argb: '6B7280' } };
  }

  ws.mergeCells(4, 1, 4, 5);
  const genCell = ws.getCell(4, 1);
  genCell.value = `Generado: ${fmtD(new Date())}`;
  genCell.font = { size: 9, color: { argb: '9CA3AF' } };

  ws.addRow([]);
  return { wb, ws, lastCol: 5 };
}

function addHeaderRow(ws: ExcelJS.Worksheet, columns: string[]): number {
  const row = ws.addRow(columns);
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.font = { bold: true, color: { argb: '7F1D1D' }, size: 10 };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FECACA' } },
      top: { style: 'thin', color: { argb: 'FECACA' } },
    };
  });
  return row.number;
}

function addDataRows(ws: ExcelJS.Worksheet, rows: (string | number)[][]): number {
  rows.forEach((values) => {
    const row = ws.addRow(values);
    row.eachCell((cell) => {
      cell.font = { size: 10 };
      cell.border = { bottom: { style: 'thin', color: { argb: 'F3F4F6' } } };
    });
  });
  return rows.length;
}

async function toBuffer(wb: ExcelJS.Workbook): Promise<Buffer> {
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf as ArrayBuffer);
}

export async function buildReportExcel(type: string, query: ReportQueryInput): Promise<{ buffer: Buffer; filename: string }> {
  const subtitle = `Período: ${fmtD(query.startDate)} — ${fmtD(query.endDate)}`;

  switch (type) {
    case 'maintenance':
      return buildMaintenance(query, subtitle);
    case 'machine':
      return buildMachine(query, subtitle);
    case 'technician':
      return buildTechnician(query, subtitle);
    case 'cost':
      return buildCost(query, subtitle);
    default:
      throw new Error('Tipo de reporte no soportado');
  }
}

async function buildMaintenance(query: ReportQueryInput, subtitle: string) {
  const report = await reportsService.getMaintenanceReport(query);
  const s = report.stats;
  const { wb, ws, lastCol } = buildWorkbook({ title: 'Reporte de Mantenimientos', subtitle, filename: 'mantenimientos' });

  addHeaderRow(ws, ['Total', 'Programados', 'En Progreso', 'Completados', 'Cancelados']);
  addDataRows(ws, [[s.total, s.byStatus.scheduled, s.byStatus.inProgress, s.byStatus.completed, s.byStatus.cancelled]]);

  ws.addRow([]);
  addHeaderRow(ws, ['Máquina', 'Tipo', 'Técnico', 'Fecha', 'Estado', 'Ítem', 'Categoría', 'Cant.', 'Costo Unit.', 'Subtotal', 'Proveedor']);

  report.data.forEach((m: any) => {
    const items = m.items || [];
    const cost = items.reduce((sum: number, i: any) => sum + (i.unitCost || 0) * i.quantity, 0);
    if (items.length === 0) {
      addDataRows(ws, [[
        m.machine?.name || '',
        maintenanceTypeLabel(m),
        maintenanceTechniciansLabel(m),
        fmtD(m.receivedDate),
        lbl(MAINT_STATUS, m.status),
        'Sin ítems',
        '',
        '',
        '',
        Number(cost.toFixed(2)),
        '',
      ]]);
    } else {
      items.forEach((i: any) => {
        addDataRows(ws, [[
          m.machine?.name || '',
          maintenanceTypeLabel(m),
          maintenanceTechniciansLabel(m),
          fmtD(m.receivedDate),
          lbl(MAINT_STATUS, m.status),
          i.name || '',
          i.category || '',
          i.quantity,
          Number((i.unitCost || 0).toFixed(2)),
          Number(((i.unitCost || 0) * i.quantity).toFixed(2)),
          i.supplier || '',
        ]]);
      });
    }
  });

  ws.addRow(['', '', '', '', `${s.total} mantenimientos`, '', '', '', '', 'Costo total', Number(s.totalCost.toFixed(2))]);
  const totalRow = ws.lastRow!;
  totalRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL_FILL } };
    cell.font = { bold: true, size: 10 };
  });

  return { buffer: await toBuffer(wb), filename: `reporte_mantenimientos.xlsx` };
}

async function buildMachine(query: ReportQueryInput, subtitle: string) {
  const report = await reportsService.getMachineReport(query);
  const totals = report.reduce(
    (acc, m) => ({ count: acc.count + m.totalMaintenances, prev: acc.prev + m.preventiveCount, corr: acc.corr + m.correctiveCount, cost: acc.cost + m.totalCost }),
    { count: 0, prev: 0, corr: 0, cost: 0 }
  );
  const { wb, ws, lastCol } = buildWorkbook({ title: 'Reporte de Máquinas', subtitle, filename: 'maquinas' });

  addHeaderRow(ws, ['Máquinas', 'Mantenimientos', 'Preventivos', 'Correctivos', 'Costo Total']);
  addDataRows(ws, [[report.length, totals.count, totals.prev, totals.corr, Number(totals.cost.toFixed(2))]]);

  ws.addRow([]);
  addHeaderRow(ws, ['Código', 'Nombre', 'Tipo', 'Estado', 'Total Mant.', 'Preventivos', 'Correctivos', 'Costo']);
  const rows = report.map((m) => [
    m.code,
    m.name,
    m.type || '',
    lbl(MACHINE_STATUS, m.status),
    m.totalMaintenances,
    m.preventiveCount,
    m.correctiveCount,
    Number(m.totalCost.toFixed(2)),
  ]);
  addDataRows(ws, rows);
  addTotalRow(ws, lastCol, ['', '', '', '', totals.count, totals.prev, totals.corr, Number(totals.cost.toFixed(2))]);

  return { buffer: await toBuffer(wb), filename: `reporte_maquinas.xlsx` };
}

async function buildTechnician(query: ReportQueryInput, subtitle: string) {
  const report = await reportsService.getTechnicianReport(query);
  const { wb, ws } = buildWorkbook({ title: 'Reporte de Técnicos', subtitle, filename: 'tecnicos' });

  addHeaderRow(ws, ['Nombre', 'Email', 'Total Mant.', 'Completados', 'Tasa Éxito', 'Prom. Días']);
  const rows = report.map((t) => [
    t.name,
    t.email,
    t.totalMaintenances,
    t.completedMaintenances,
    Number(t.completionRate.toFixed(1)),
    t.avgCompletionDays,
  ]);
  addDataRows(ws, rows);

  return { buffer: await toBuffer(wb), filename: `reporte_tecnicos.xlsx` };
}

async function buildCost(query: ReportQueryInput, subtitle: string) {
  const report = await reportsService.getCostReport(query);
  const { wb, ws, lastCol } = buildWorkbook({ title: 'Reporte de Costos', subtitle, filename: 'costos' });

  addHeaderRow(ws, ['Costo Total', 'Preventivos', 'Correctivos', 'Ítems']);
  addDataRows(ws, [[Number(report.totalCost.toFixed(2)), Number(report.byCategory.preventive.toFixed(2)), Number(report.byCategory.corrective.toFixed(2)), report.itemCount]]);

  ws.addRow([]);
  addHeaderRow(ws, ['Proveedor', 'Costo']);
  const rows = Object.entries(report.bySupplier)
    .sort(([, a], [, b]) => b - a)
    .map(([name, cost]) => [name, Number(cost.toFixed(2))]);
  addDataRows(ws, rows);
  addTotalRow(ws, lastCol, ['TOTAL', Number(report.totalCost.toFixed(2))]);

  return { buffer: await toBuffer(wb), filename: `reporte_costos.xlsx` };
}

export async function buildMachineHistoryExcel(machineId: string): Promise<{ buffer: Buffer; filename: string }> {
  const { machine, stats, maintenances, alerts, schedules } = await machinesService.getHistory(machineId);
  const { wb, ws } = buildWorkbook({
    title: `Ficha de Máquina — ${machine.name}`,
    subtitle: `Código: ${machine.code}`,
    filename: `ficha_${machine.code}`,
  });

  addHeaderRow(ws, ['Código', 'Tipo', 'Marca', 'Modelo', 'Serie', 'Año', 'Horas/día', 'Estado']);
  addDataRows(ws, [[
    machine.code,
    machine.machineType || '',
    machine.brand || '',
    machine.model || '',
    machine.serialNumber || '',
    machine.year ?? '',
    machine.dailyHoursAverage,
    lbl(MACHINE_STATUS, machine.status as string),
  ]]);

  ws.addRow([]);
  addHeaderRow(ws, ['Mantenimientos', 'Preventivos', 'Correctivos', 'Costo Total', 'Costo Prom.']);
  addDataRows(ws, [[
    stats.totalMaintenances,
    stats.preventiveCount,
    stats.correctiveCount,
    Number(stats.totalCost.toFixed(2)),
    Number(stats.avgCostPerMaintenance.toFixed(2)),
  ]]);

  if (schedules.length > 0) {
    ws.addRow([]);
    addHeaderRow(ws, ['Próximos Mantenimientos', 'Fecha']);
    addDataRows(ws, schedules.map((s: any) => [s.maintenanceType?.name || 'Mantenimiento', fmtD(s.nextExecution)]));
  }

  ws.addRow([]);
  addHeaderRow(ws, ['Fecha', 'Tipo', 'Técnico', 'Ítems', 'Costo', 'Estado']);
  addDataRows(ws, maintenances.map((m: any) => {
    const cost = m.items.reduce((sum: number, i: any) => sum + (i.unitCost || 0) * i.quantity, 0);
    return [
      fmtD(m.receivedDate),
      maintenanceTypeLabel(m),
      maintenanceTechniciansLabel(m),
      m.items.length,
      Number(cost.toFixed(2)),
      lbl(MAINT_STATUS, m.status),
    ];
  }));

  if (alerts.length > 0) {
    ws.addRow([]);
    addHeaderRow(ws, ['Alertas', '', '']);
    addDataRows(ws, alerts.map((a: any) => [fmtD(a.createdAt), lbl(MACHINE_STATUS, a.type), a.message]));
  }

  return { buffer: await toBuffer(wb), filename: `ficha_${machine.code}.xlsx` };
}

function addTotalRow(ws: ExcelJS.Worksheet, _lastCol: number, values: (string | number)[]) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL_FILL } };
    cell.font = { bold: true, size: 10 };
  });
}
