import puppeteer, { Browser } from 'puppeteer';
import { parseLocalDate } from '../../shared/utils/dates';

let browserPromise: Promise<Browser> | null = null;

export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise;
    await b.close();
    browserPromise = null;
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const dateOnlyRe = /^\d{4}-\d{2}-\d{2}$/;

export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return '-';
  const asDate = typeof d === 'string' && dateOnlyRe.test(d) ? parseLocalDate(d) : new Date(d);
  return asDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const fmtMoney = (n: number | null | undefined) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n ?? 0);

export const MAINT_STATUS: Record<string, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const MACHINE_STATUS: Record<string, string> = {
  ACTIVE: 'Activa',
  IN_MAINTENANCE: 'En Mantenimiento',
  INACTIVE: 'Inactiva',
  DECOMMISSIONED: 'Decomisionada',
};

export const ALERT_TYPE: Record<string, string> = { UPCOMING: 'Próximo', OVERDUE: 'Vencido', CUSTOM: 'Personalizado' };

export const ALERT_SEVERITY: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const lbl = (map: Record<string, string>, v?: string | null) => (v ? map[v] || v : '-');

export function pageShell(title: string, subtitle: string, body: string, footerText = ''): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<style>
  @page { margin: 22mm 16mm 20mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; font-size: 14px; line-height: 1.4; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #dc2626; padding-bottom: 12px; margin-bottom: 16px; }
  .header .brand { font-size: 24px; font-weight: 800; color: #dc2626; letter-spacing: 0.5px; }
  .header .brand span { color: #111827; }
  .header .meta { text-align: right; font-size: 13px; color: #6b7280; }
  h1 { font-size: 26px; margin: 0 0 4px; color: #111827; }
  .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 18px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 17px; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #dc2626; padding-left: 8px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #fef2f2; color: #7f1d1d; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.4px; padding: 10px 8px; border-bottom: 2px solid #fecaca; }
  td { padding: 9px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; }
  .right { text-align: right; }
  .total-row td { font-weight: 700; background: #fef2f2 !important; border-top: 2px solid #fecaca; }
  .cards { display: flex; gap: 10px; margin-bottom: 16px; }
  .card { flex: 1; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; background: #fff7f7; }
  .card .k { font-size: 12px; text-transform: uppercase; color: #7f1d1d; letter-spacing: 0.4px; }
  .card .v { font-size: 24px; font-weight: 800; color: #111827; margin-top: 2px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .b-green { background: #dcfce7; color: #166534; }
  .b-red { background: #fee2e2; color: #991b1b; }
  .b-yellow { background: #fef9c3; color: #854d0e; }
  .b-gray { background: #f3f4f6; color: #374151; }
  .b-blue { background: #dbeafe; color: #1e40af; }
  .grid2 { display: flex; gap: 28px; }
  .kv { margin-bottom: 6px; }
  .kv .k { font-size: 12px; text-transform: uppercase; color: #6b7280; }
  .kv .v { font-size: 16px; font-weight: 600; color: #111827; }
  .footer { position: fixed; bottom: -16mm; left: 0; right: 0; text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 6px; }
  .muted { color: #6b7280; }
  .report-table { margin-top: 4px; }
  .sub-detail td { padding: 4px 8px 12px 16px; background: #f9fafb !important; }
  .sub-table { margin-left: 8px; }
  .sub-table th { background: #f3f4f6; color: #374151; font-size: 10px; }
  .sub-item td { font-size: 12px; }
  .watermark { position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: -1; display: flex; align-items: center; justify-content: center; }
  .watermark span { font-size: 52px; font-weight: 800; color: rgba(220, 38, 38, 0.06); white-space: nowrap; transform: rotate(-35deg); letter-spacing: 2px; }
</style>
</head>
<body>
  <div class="watermark"><span>SOLUCIONES EL INCA</span></div>
  <div class="header">
    <div class="brand">SOLUCIONES <span>EL INCA</span></div>
    <div class="meta">
      <div><strong>${escapeHtml(title)}</strong></div>
      <div>Generado: ${fmtDate(new Date())}</div>
    </div>
  </div>
  ${subtitle ? `<h1>${escapeHtml(title)}</h1><div class="subtitle">${escapeHtml(subtitle)}</div>` : ''}
  ${body}
  <div class="footer">${escapeHtml(footerText || 'Soluciones El Inca · Sistema de Gestión de Mantenimiento')}</div>
</body>
</html>`;
}

export function statusBadge(map: Record<string, string>, value: string): string {
  const text = lbl(map, value);
  if (map === MAINT_STATUS) {
    const cls =
      value === 'COMPLETED' ? 'b-green' : value === 'IN_PROGRESS' ? 'b-blue' : value === 'CANCELLED' ? 'b-gray' : 'b-yellow';
    return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
  }
  const cls =
    value === 'ACTIVE' ? 'b-green' : value === 'IN_MAINTENANCE' ? 'b-yellow' : value === 'DECOMMISSIONED' ? 'b-gray' : 'b-red';
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

export async function renderPdf(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
  return pdf;
}
