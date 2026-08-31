import PDFDocument from 'pdfkit';
import { reportsService } from './reports.service';
import { machinesService } from '../machines/machines.service';
import type { ReportQueryInput } from './reports.validation';
import { fmtDate, fmtMoney, MAINT_STATUS, MACHINE_STATUS, ALERT_TYPE, ALERT_SEVERITY, lbl } from './pdf.service';
import { maintenanceTypeLabel } from './maint-types';
import { maintenanceTechniciansLabel } from './maint-technicians';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 45;
const CONTENT_W = PAGE_W - MARGIN * 2;
const TOP = 40;
const BOTTOM = PAGE_H - 85;

const RED = '#DC2626';
const DARK = '#111827';
const GRAY = '#6B7280';
const MUTED = '#9CA3AF';
const HDR_FILL = '#FEF2F2';
const HDR_TEXT = '#7F1D1D';
const HDR_BORDER = '#FECACA';
const ROW_BORDER = '#F3F4F6';
const ZEBRA = '#FAFAFA';
const CARD_BORDER = '#FECACA';
const BODY_TEXT = '#374151';

const BADGES: Record<string, { bg: string; fg: string }> = {
  green: { bg: '#DCFCE7', fg: '#166534' },
  yellow: { bg: '#FEF9C3', fg: '#854D0E' },
  red: { bg: '#FEE2E2', fg: '#991B1B' },
  gray: { bg: '#F3F4F6', fg: '#374151' },
  blue: { bg: '#DBEAFE', fg: '#1E40AF' },
};

export type Cell = string | number | { b: string; t: string };

export function maintBadge(status: string): Cell {
  const b =
    status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : status === 'CANCELLED' ? 'gray' : 'yellow';
  return { b, t: lbl(MAINT_STATUS, status) };
}

export function machineBadge(status: string): Cell {
  const b =
    status === 'ACTIVE' ? 'green' : status === 'IN_MAINTENANCE' ? 'yellow' : status === 'DECOMMISSIONED' ? 'gray' : 'red';
  return { b, t: lbl(MACHINE_STATUS, status) };
}

interface TableCol {
  w: number;
  align?: 'left' | 'right' | 'center';
}

interface TableOpts {
  headers: string[];
  cols: TableCol[];
  rows: Cell[][];
  totals?: Cell[][];
  indent?: number;
}

interface TableState {
  x0: number;
  width: number;
  widths: number[];
  cols: TableCol[];
  headers: string[];
  indent: number;
}

const reportSubtitle = (query: ReportQueryInput) => `Período: ${fmtDate(query.startDate)} — ${fmtDate(query.endDate)}`;

export class PdfBuilder {
  readonly doc: InstanceType<typeof PDFDocument>;
  y = TOP;

  constructor(title: string) {
    this.doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    const brandW = this.doc.widthOfString('SOLUCIONES ', { font: 'Helvetica-Bold', size: 17 } as any);
    this.doc.font('Helvetica-Bold').fontSize(17).fillColor(RED).text('SOLUCIONES ', MARGIN, TOP);
    this.doc.fillColor(DARK).text('EL INCA', MARGIN + brandW, TOP);
    this.doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text(title, MARGIN, TOP + 22, { width: CONTENT_W, align: 'right' });
    this.doc.font('Helvetica').fontSize(8.5).fillColor(GRAY).text(`Generado: ${fmtDate(new Date())}`, MARGIN, TOP + 36, {
      width: CONTENT_W,
      align: 'right',
    });
    this.y = TOP + 52;
    this.doc.moveTo(MARGIN, this.y).lineTo(PAGE_W - MARGIN, this.y).lineWidth(2.25).strokeColor(RED).stroke();
    this.y += 20;
  }

  ensure(h: number) {
    if (this.y + h > BOTTOM) {
      this.doc.addPage();
      this.y = TOP;
    }
    return this;
  }

  gap(h: number) {
    this.y += h;
    return this;
  }

  title(text: string, subtitle?: string) {
    this.ensure(38);
    this.doc.font('Helvetica-Bold').fontSize(19).fillColor(DARK).text(text, MARGIN, this.y);
    this.y += 22;
    if (subtitle) {
      this.doc.font('Helvetica').fontSize(10.5).fillColor(GRAY).text(subtitle, MARGIN, this.y);
      this.y += 16;
    }
    return this;
  }

  sectionTitle(text: string) {
    this.ensure(26);
    this.y += 5;
    this.doc.save();
    this.doc.fillColor(RED);
    this.doc.rect(MARGIN, this.y, 3, 11).fill();
    this.doc.restore();
    this.doc.font('Helvetica-Bold').fontSize(13).fillColor(RED).text(text.toUpperCase(), MARGIN + 8, this.y);
    this.y += 20;
    return this;
  }

  cards(items: Array<{ k: string; v: string | number }>) {
    if (items.length === 0) return this;
    const perRow = Math.min(6, Math.max(2, Math.round(CONTENT_W / 118)));
    const gap = 10;
    const w = (CONTENT_W - gap * (perRow - 1)) / perRow;
    for (let i = 0; i < items.length; i += perRow) {
      const slice = items.slice(i, i + perRow);
      const h = 60;
      this.ensure(h);
      slice.forEach((it, j) => {
        const x = MARGIN + j * (w + gap);
        this.doc.save();
        this.doc.roundedRect(x, this.y, w, h, 5).strokeColor(CARD_BORDER).lineWidth(1).stroke();
        this.doc.restore();
        this.doc.font('Helvetica-Bold').fontSize(8.5).fillColor(HDR_TEXT).text(it.k.toUpperCase(), x + 8, this.y + 8, {
          width: w - 16,
        });
        const v = String(it.v);
        let fs = 15;
        const maxW = w - 16;
        while (fs > 9 && this.doc.widthOfString(v, { font: 'Helvetica-Bold', size: fs } as any) > maxW) fs -= 1;
        this.doc.font('Helvetica-Bold').fontSize(fs).fillColor(DARK).text(v, x + 8, this.y + 27, { width: maxW });
      });
      this.y += h + 12;
    }
    return this;
  }

  kv(pairs: Array<{ k: string; v: string | number }>, badge?: Cell) {
    const perRow = 2;
    const gap = 28;
    const w = (CONTENT_W - gap) / perRow;
    const h = 30;
    const lines = Math.ceil(pairs.length / perRow);
    for (let i = 0; i < pairs.length; i += perRow) {
      const slice = pairs.slice(i, i + perRow);
      this.ensure(h);
      slice.forEach((p, j) => {
        const x = MARGIN + j * (w + gap);
        this.doc.font('Helvetica-Bold').fontSize(8.5).fillColor(GRAY).text(p.k.toUpperCase(), x, this.y, { width: w });
        this.doc.font('Helvetica-Bold').fontSize(11.5).fillColor(DARK).text(String(p.v), x, this.y + 13, { width: w });
      });
      this.y += h;
    }
    if (badge) {
      this.doc.save();
      this.doc.font('Helvetica-Bold').fontSize(8.5).fillColor(GRAY).text('ESTADO'.toUpperCase(), MARGIN, this.y - lines * h);
      this.doc.restore();
      this.drawCell(badge, MARGIN + 52, this.y - lines * h, w - 52);
    }
    return this;
  }

  layout(opts: TableOpts): TableState {
    const indent = opts.indent ?? 0;
    const x0 = MARGIN + indent;
    const width = CONTENT_W - indent;
    const totalW = opts.cols.reduce((s, c) => s + c.w, 0);
    const widths = opts.cols.map((c) => (c.w * width) / totalW);
    return { x0, width, widths, cols: opts.cols, headers: opts.headers, indent };
  }

  tableHeader(st: TableState) {
    this.ensure(30);
    this.doc.save();
    this.doc.rect(st.x0, this.y, st.width, 28).fill(HDR_FILL);
    this.doc.restore();
    let x = st.x0;
    st.headers.forEach((h, i) => {
      const align = st.cols[i].align === 'right' ? 'right' : 'left';
      this.doc.font('Helvetica-Bold').fontSize(9).fillColor(HDR_TEXT).text(h.toUpperCase(), x + 4, this.y + 9, {
        width: st.widths[i] - 8,
        align,
      });
      x += st.widths[i];
    });
    this.doc.moveTo(st.x0, this.y + 28).lineTo(st.x0 + st.width, this.y + 28).lineWidth(1).strokeColor(HDR_BORDER).stroke();
    this.y += 28;
  }

  rowHeight(cells: Cell[], st: TableState, bold: boolean): number {
    const font = bold ? 'Helvetica-Bold' : 'Helvetica';
    const lh = this.lineHeight(font, 10.5);
    let h = 22;
    cells.forEach((c, i) => {
      if (typeof c === 'object') {
        h = Math.max(h, 22);
      } else {
        const n = this.textLines(String(c ?? ''), st.widths[i] - 8, 10.5, font);
        h = Math.max(h, n * lh + 10);
      }
    });
    return h;
  }

  private lineHeight(font: string, size: number): number {
    this.doc.font(font).fontSize(size);
    try {
      return this.doc.currentLineHeight(true);
    } catch {
      return size * 1.15625;
    }
  }

  private textLines(text: string, width: number, size: number, font = 'Helvetica'): number {
    const wo = String(text ?? '').trim();
    if (!wo) return 1;
    if (width <= 0) return 1;
    this.doc.font(font).fontSize(size);
    let lines = 1;
    let cur = '';
    for (const w of wo.split(/\s+/)) {
      const trial = cur ? `${cur} ${w}` : w;
      if (this.doc.widthOfString(trial) <= width) {
        cur = trial;
        continue;
      }
      if (!cur) {
        const ww = this.doc.widthOfString(w);
        lines += Math.ceil(ww / width) - 1;
        cur = w;
        continue;
      }
      lines += 1;
      const ww = this.doc.widthOfString(w);
      if (ww > width) {
        lines += Math.ceil(ww / width) - 1;
      }
      cur = w;
    }
    return lines;
  }

  dataRow(cells: Cell[], st: TableState, fill: string | null, bold: boolean) {
    const h = this.rowHeight(cells, st, bold);
    if (this.y + h > BOTTOM) {
      this.doc.addPage();
      this.y = TOP;
      this.tableHeader(st);
    }
    if (fill) {
      this.doc.save();
      this.doc.rect(st.x0, this.y, st.width, h).fill(fill);
      this.doc.restore();
    }
    let x = st.x0;
    cells.forEach((c, i) => {
      if (typeof c === 'object') {
        this.drawCell(c, x, this.y + 3, st.widths[i] - 4);
      } else {
        this.doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10.5).fillColor(bold ? DARK : BODY_TEXT);
        const align = st.cols[i].align === 'right' ? 'right' : 'left';
        this.doc.text(String(c ?? ''), x + 4, this.y + 4, { width: st.widths[i] - 8, align });
      }
      x += st.widths[i];
    });
    this.doc.moveTo(st.x0, this.y + h).lineTo(st.x0 + st.width, this.y + h).lineWidth(0.5).strokeColor(ROW_BORDER).stroke();
    this.y += h;
  }

  table(opts: TableOpts) {
    const st = this.layout(opts);
    this.tableHeader(st);
    opts.rows.forEach((r, i) => this.dataRow(r, st, i % 2 === 1 ? ZEBRA : null, false));
    (opts.totals ?? []).forEach((r) => this.dataRow(r, st, HDR_FILL, true));
    this.y += 12;
    return this;
  }

  description(text: string | null | undefined, st: TableState, indent = 0) {
    const label = text?.trim();
    if (!label) return this;
    const x0 = st.x0 + indent;
    const width = st.width - indent;
    const n = this.textLines(label, width - 8, 10, 'Helvetica-Oblique');
    const h = n * this.lineHeight('Helvetica-Oblique', 10);
    if (this.y + h + 12 > BOTTOM) {
      this.doc.addPage();
      this.y = TOP;
      this.tableHeader(st);
    }
    this.doc.font('Helvetica-Oblique').fontSize(10).fillColor('#6b7280');
    this.doc.text(label, x0 + 4, this.y + 3, { width: width - 8 });
    this.y += h + 12;
    return this;
  }

  drawCell(c: Cell, x: number, y: number, maxW: number) {
    if (typeof c !== 'object') {
      this.doc.font('Helvetica').fontSize(10.5).fillColor(BODY_TEXT).text(String(c), x + 4, y + 3, { width: maxW - 8 });
      return;
    }
    const { bg, fg } = BADGES[c.b] || BADGES.gray;
    const tw = this.doc.widthOfString(c.t, { font: 'Helvetica-Bold', fontSize: 8.5 } as any);
    const fw = Math.min(tw + 14, maxW);
    this.doc.save();
    this.doc.fillColor(bg);
    this.doc.roundedRect(x + 2, y, fw, 15, 7.5).fill();
    this.doc.fillColor(fg).font('Helvetica-Bold').fontSize(8.5);
    this.doc.text(c.t, x + 2 + (fw - tw) / 2, y + 3, { width: tw, align: 'center', lineBreak: false });
    this.doc.restore();
  }

  async toBuffer(): Promise<Buffer> {
    const range = this.doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      this.doc.switchToPage(i);
      this.decoratePage(i, range.count);
    }
    const chunks: Buffer[] = [];
    const done = new Promise<void>((resolve, reject) => {
      this.doc.on('end', () => resolve());
      this.doc.on('error', reject);
    });
    this.doc.on('data', (c: Buffer) => chunks.push(c));
    this.doc.end();
    await done;
    return Buffer.concat(chunks);
  }

  private decoratePage(index: number, total: number) {
    this.doc.font('Helvetica').fontSize(8.5).fillColor(MUTED);
    this.doc.text(`Página ${index + 1} de ${total}`, MARGIN, PAGE_H - 72, {
      width: CONTENT_W,
      align: 'center',
      lineBreak: false,
    });
    this.doc.text('Soluciones El Inca · Sistema de Gestión de Mantenimiento', MARGIN, PAGE_H - 62, {
      width: CONTENT_W,
      align: 'center',
      lineBreak: false,
    });
  }
}

export async function buildReportPdf(type: string, query: ReportQueryInput): Promise<Buffer> {
  switch (type) {
    case 'maintenance':
      return buildMaintenancePdf(query);
    case 'machine':
      return buildMachineReportPdf(query);
    case 'technician':
      return buildTechnicianPdf(query);
    case 'cost':
      return buildCostPdf(query);
    default:
      throw new Error('Tipo de reporte no soportado');
  }
}

async function buildMaintenancePdf(query: ReportQueryInput): Promise<Buffer> {
  const report = await reportsService.getMaintenanceReport(query);
  const s = report.stats;
  const p = new PdfBuilder('Reporte de Mantenimientos');
  p.title('Reporte de Mantenimientos', reportSubtitle(query));
  p.cards([
    { k: 'Total', v: s.total },
    { k: 'Programados', v: s.byStatus.scheduled },
    { k: 'En Progreso', v: s.byStatus.inProgress },
    { k: 'Completados', v: s.byStatus.completed },
    { k: 'Cancelados', v: s.byStatus.cancelled },
    { k: 'Costo Total', v: fmtMoney(s.totalCost) },
  ]);
  p.sectionTitle('Detalle de Mantenimientos');

  const main: TableOpts = {
    headers: ['Máquina', 'Tipo', 'Técnico', 'Fecha', 'Estado', 'Ítems', 'Costo'],
    cols: [
      { w: 120 },
      { w: 62 },
      { w: 68 },
      { w: 60 },
      { w: 66 },
      { w: 38, align: 'right' },
      { w: 66, align: 'right' },
    ],
    rows: [],
  };
  const st = p.layout(main);
  p.tableHeader(st);

  for (const m of report.data as any[]) {
    const cost = (m.items || []).reduce((sum: number, i: any) => sum + (i.unitCost || 0) * i.quantity, 0);
    const machineName = [m.machine?.name, m.machine?.code].filter(Boolean).join('  ·  ') || '-';
    p.dataRow(
      [machineName, maintenanceTypeLabel(m), maintenanceTechniciansLabel(m), fmtDate(m.receivedDate), maintBadge(m.status), (m.items || []).length, fmtMoney(cost)],
      st,
      null,
      false,
    );
    p.description(m.description, st);
    if ((m.items || []).length > 0) {
      const nested: TableOpts = {
        headers: ['Ítem', 'Categoría', 'Cant.', 'Costo Unit.', 'Subtotal', 'Proveedor'],
        cols: [
          { w: 130 },
          { w: 76 },
          { w: 34, align: 'right' },
          { w: 70, align: 'right' },
          { w: 80, align: 'right' },
          { w: 90 },
        ],
        rows: (m.items as any[]).map((i) => [
          i.name,
          i.category || '-',
          i.quantity,
          fmtMoney(i.unitCost),
          fmtMoney((i.unitCost || 0) * i.quantity),
          i.supplier || '-',
        ]),
        totals: [['', '', '', 'Total ítems', fmtMoney(cost), '']],
        indent: 12,
      };
      p.table(nested);
    }
  }
  return p.toBuffer();
}

async function buildMachineReportPdf(query: ReportQueryInput): Promise<Buffer> {
  const report = await reportsService.getMachineReport(query);
  const totals = report.reduce(
    (acc, m) => ({
      count: acc.count + m.totalMaintenances,
      prev: acc.prev + m.preventiveCount,
      corr: acc.corr + m.correctiveCount,
      cost: acc.cost + m.totalCost,
    }),
    { count: 0, prev: 0, corr: 0, cost: 0 },
  );
  const p = new PdfBuilder('Reporte de Máquinas');
  p.title('Reporte de Máquinas', reportSubtitle(query));
  p.cards([
    { k: 'Máquinas', v: report.length },
    { k: 'Mantenimientos', v: totals.count },
    { k: 'Preventivos', v: totals.prev },
    { k: 'Correctivos', v: totals.corr },
    { k: 'Costo Total', v: fmtMoney(totals.cost) },
  ]);
  p.sectionTitle('Detalle por Máquina');
  p.table({
    headers: ['Código', 'Nombre', 'Tipo', 'Estado', 'Total', 'Prev.', 'Corr.', 'Costo'],
    cols: [
      { w: 56 },
      { w: 98 },
      { w: 80 },
      { w: 80 },
      { w: 38, align: 'right' },
      { w: 38, align: 'right' },
      { w: 38, align: 'right' },
      { w: 83, align: 'right' },
    ],
    rows: report.map((m) => [
      m.code,
      m.name,
      m.type || '-',
      machineBadge(m.status),
      m.totalMaintenances,
      m.preventiveCount,
      m.correctiveCount,
      fmtMoney(m.totalCost),
    ]),
    totals: [['', '', '', '', totals.count, totals.prev, totals.corr, fmtMoney(totals.cost)]],
  });
  return p.toBuffer();
}

async function buildTechnicianPdf(query: ReportQueryInput): Promise<Buffer> {
  const report = await reportsService.getTechnicianReport(query);
  const total = report.reduce((a, t) => a + t.totalMaintenances, 0);
  const p = new PdfBuilder('Reporte de Técnicos');
  p.title('Reporte de Técnicos', reportSubtitle(query));
  p.cards([
    { k: 'Técnicos', v: report.length },
    { k: 'Mantenimientos', v: total },
  ]);
  p.sectionTitle('Desempeño por Técnico');
  p.table({
    headers: ['Nombre', 'Email', 'Total', 'Completados', 'Tasa', 'Prom. Días'],
    cols: [
      { w: 110 },
      { w: 150 },
      { w: 45, align: 'right' },
      { w: 78, align: 'right' },
      { w: 40, align: 'right' },
      { w: 64, align: 'right' },
    ],
    rows: report.map((t) => [
      t.name,
      t.email,
      t.totalMaintenances,
      t.completedMaintenances,
      `${t.completionRate.toFixed(1)}%`,
      t.avgCompletionDays,
    ]),
  });
  return p.toBuffer();
}

async function buildCostPdf(query: ReportQueryInput): Promise<Buffer> {
  const report = await reportsService.getCostReport(query);
  const p = new PdfBuilder('Reporte de Costos');
  p.title('Reporte de Costos', reportSubtitle(query));
  p.cards([
    { k: 'Costo Total', v: fmtMoney(report.totalCost) },
    { k: 'Preventivos', v: fmtMoney(report.byCategory.preventive) },
    { k: 'Correctivos', v: fmtMoney(report.byCategory.corrective) },
    { k: 'Ítems', v: report.itemCount },
  ]);
  p.sectionTitle('Costos por Proveedor');
  const rows = Object.entries(report.bySupplier)
    .sort(([, a], [, b]) => b - a)
    .map(([name, cost]) => [name, fmtMoney(cost)]);
  p.table({
    headers: ['Proveedor', 'Costo'],
    cols: [{ w: 320 }, { w: 90, align: 'right' }],
    rows: rows.length ? rows : [['Sin costos registrados', '']],
    totals: [['TOTAL', fmtMoney(report.totalCost)]],
  });
  return p.toBuffer();
}

export async function buildMachineHistoryPdf(machineId: string): Promise<Buffer> {
  const { machine, stats, maintenances, alerts, schedules } = await machinesService.getHistory(machineId);
  const p = new PdfBuilder(`Ficha de Máquina — ${machine.name}`);
  p.title(`Ficha de Máquina — ${machine.name}`, `Código: ${machine.code}`);

  p.sectionTitle('Información de la Máquina');
  p.kv(
    [
      { k: 'Código', v: machine.code },
      { k: 'Tipo', v: machine.machineType || '-' },
      { k: 'Marca', v: machine.brand || '-' },
      { k: 'Modelo', v: machine.model || '-' },
      { k: 'N° Serie', v: machine.serialNumber || '-' },
      { k: 'Año', v: machine.year ?? '-' },
      { k: 'Horas/día', v: machine.dailyHoursAverage ?? '-' },
      { k: 'Registrada', v: fmtDate(machine.createdAt) },
    ],
    machineBadge(machine.status as string),
  );

  p.cards([
    { k: 'Mantenimientos', v: stats.totalMaintenances },
    { k: 'Preventivos', v: stats.preventiveCount },
    { k: 'Correctivos', v: stats.correctiveCount },
    { k: 'Costo Total', v: fmtMoney(stats.totalCost) },
    { k: 'Costo Prom.', v: fmtMoney(stats.avgCostPerMaintenance) },
  ]);

  if (schedules.length > 0) {
    p.sectionTitle('Próximos Mantenimientos Programados');
    p.table({
      headers: ['Tipo', 'Próxima fecha'],
      cols: [{ w: 320 }, { w: 100 }],
      rows: schedules.map((s: any) => [s.maintenanceType?.name || 'Mantenimiento', fmtDate(s.nextExecution)]),
    });
  }

  if (alerts.length > 0) {
    p.sectionTitle('Alertas Recientes');
    p.table({
      headers: ['Fecha', 'Tipo', 'Severidad', 'Mensaje'],
      cols: [{ w: 70 }, { w: 80 }, { w: 70 }, { w: 240 }],
      rows: alerts.map((a: any) => [
        fmtDate(a.createdAt),
        lbl(ALERT_TYPE, a.type),
        lbl(ALERT_SEVERITY, a.severity),
        a.message ?? '',
      ]),
    });
  }

  p.sectionTitle('Historial de Mantenimientos');
  const histTable: TableOpts = {
    headers: ['Fecha', 'Tipo', 'Categoría', 'Técnico', 'Ítems', 'Costo', 'Estado'],
    cols: [
      { w: 70 },
      { w: 92 },
      { w: 66 },
      { w: 82 },
      { w: 36, align: 'right' },
      { w: 74, align: 'right' },
      { w: 66 },
    ],
    rows: [],
  };
  const st = p.layout(histTable);
  p.tableHeader(st);
  for (const m of maintenances as any[]) {
    const cost = m.items.reduce((sum: number, i: any) => sum + (i.unitCost || 0) * i.quantity, 0);
    p.dataRow(
      [
        fmtDate(m.receivedDate),
        maintenanceTypeLabel(m),
        m.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo',
        maintenanceTechniciansLabel(m),
        m.items.length,
        fmtMoney(cost),
        maintBadge(m.status),
      ],
      st,
      null,
      false,
    );
    p.description(m.description, st);
  }
  p.y += 10;

  return p.toBuffer();
}