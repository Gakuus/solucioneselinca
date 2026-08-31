import { ReportQueryInput } from './reports.validation';
import { reportsService } from './reports.service';
import { machinesService } from '../machines/machines.service';
import { pageShell, escapeHtml, fmtDate, fmtMoney, MAINT_STATUS, MACHINE_STATUS, statusBadge, ALERT_TYPE, ALERT_SEVERITY, lbl } from './pdf.service';

export async function buildReportHtml(type: string, query: ReportQueryInput): Promise<string> {
  const subtitle = `Período: ${fmtDate(query.startDate)} — ${fmtDate(query.endDate)}`;

  switch (type) {
    case 'maintenance':
      return buildMaintenanceHtml(query, subtitle);
    case 'machine':
      return buildMachineHtml(query, subtitle);
    case 'technician':
      return buildTechnicianHtml(query, subtitle);
    case 'cost':
      return buildCostHtml(query, subtitle);
    default:
      throw new Error('Tipo de reporte no soportado');
  }
}

async function buildMaintenanceHtml(query: ReportQueryInput, subtitle: string): Promise<string> {
  const report = await reportsService.getMaintenanceReport(query);
  const s = report.stats;

  const cards = [
    { k: 'Total', v: s.total },
    { k: 'Programados', v: s.byStatus.scheduled },
    { k: 'En Progreso', v: s.byStatus.inProgress },
    { k: 'Completados', v: s.byStatus.completed },
    { k: 'Cancelados', v: s.byStatus.cancelled },
    { k: 'Costo Total', v: fmtMoney(s.totalCost) },
  ]
    .map((c) => `<div class="card"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`)
    .join('');

  const rows = report.data
    .map((m: any) => {
      const cost = (m.items || []).reduce((sum: number, i: any) => sum + (i.unitCost || 0) * i.quantity, 0);
      const itemRows = (m.items || [])
        .map(
          (i: any) => `<tr class="sub-item">
            <td>${escapeHtml(i.name)}</td>
            <td>${escapeHtml(i.category || '-')}</td>
            <td class="right">${i.quantity}</td>
            <td class="right">${fmtMoney(i.unitCost)}</td>
            <td class="right">${fmtMoney((i.unitCost || 0) * i.quantity)}</td>
            <td>${escapeHtml(i.supplier || '-')}</td>
          </tr>`
        )
        .join('');
      const hasItems = (m.items || []).length > 0;
      return `
      <tr>
        <td><strong>${escapeHtml(m.machine?.name)}</strong><br/><span class="muted">${escapeHtml(m.machine?.code)}</span></td>
        <td>${escapeHtml(m.maintenanceType?.name)}</td>
        <td>${escapeHtml(m.technician?.name)}</td>
        <td>${fmtDate(m.receivedDate)}</td>
        <td>${statusBadge(MAINT_STATUS, m.status)}</td>
        <td class="right">${(m.items || []).length}</td>
        <td class="right">${fmtMoney(cost)}</td>
      </tr>
      ${
        hasItems
          ? `<tr class="sub-detail"><td colspan="7">
              <table class="report-table sub-table">
                <thead><tr><th>Ítem</th><th>Categoría</th><th class="right">Cant.</th><th class="right">Costo Unit.</th><th class="right">Subtotal</th><th>Proveedor</th></tr></thead>
                <tbody>${itemRows}<tr class="total-row"><td colspan="4">Total ítems</td><td class="right">${fmtMoney(cost)}</td><td></td></tr></tbody>
              </table>
            </td></tr>`
          : ''
      }`;
    })
    .join('');

  const body = `
    <div class="section">
      <div class="cards">${cards}</div>
    </div>
    <div class="section">
      <div class="section-title">Detalle de Mantenimientos</div>
      <table class="report-table">
        <thead><tr><th>Máquina</th><th>Tipo</th><th>Técnico</th><th>Fecha</th><th>Estado</th><th class="right">Ítems</th><th class="right">Costo</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7" class="muted">Sin resultados en el período.</td></tr>`}</tbody>
      </table>
    </div>`;

  return pageShell('Reporte de Mantenimientos', subtitle, body);
}

async function buildMachineHtml(query: ReportQueryInput, subtitle: string): Promise<string> {
  const report = await reportsService.getMachineReport(query);

  const rows = report
    .map((m) => `<tr>
      <td><strong>${escapeHtml(m.code)}</strong></td>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.type)}</td>
      <td>${statusBadge(MACHINE_STATUS, m.status)}</td>
      <td class="right">${m.totalMaintenances}</td>
      <td class="right">${m.preventiveCount}</td>
      <td class="right">${m.correctiveCount}</td>
      <td class="right">${fmtMoney(m.totalCost)}</td>
    </tr>`)
    .join('');

  const totals = report.reduce(
    (acc, m) => ({
      count: acc.count + m.totalMaintenances,
      prev: acc.prev + m.preventiveCount,
      corr: acc.corr + m.correctiveCount,
      cost: acc.cost + m.totalCost,
    }),
    { count: 0, prev: 0, corr: 0, cost: 0 }
  );

  const body = `
    <div class="section">
      <div class="cards">
        <div class="card"><div class="k">Máquinas</div><div class="v">${report.length}</div></div>
        <div class="card"><div class="k">Mantenimientos</div><div class="v">${totals.count}</div></div>
        <div class="card"><div class="k">Preventivos</div><div class="v">${totals.prev}</div></div>
        <div class="card"><div class="k">Correctivos</div><div class="v">${totals.corr}</div></div>
        <div class="card"><div class="k">Costo Total</div><div class="v">${fmtMoney(totals.cost)}</div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Detalle por Máquina</div>
      <table class="report-table">
        <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Estado</th><th class="right">Total</th><th class="right">Prev.</th><th class="right">Corr.</th><th class="right">Costo</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="8" class="muted">Sin resultados en el período.</td></tr>`}</tbody>
      </table>
    </div>`;

  return pageShell('Reporte de Máquinas', subtitle, body);
}

async function buildTechnicianHtml(query: ReportQueryInput, subtitle: string): Promise<string> {
  const report = await reportsService.getTechnicianReport(query);

  const rows = report
    .map((t) => `<tr>
      <td><strong>${escapeHtml(t.name)}</strong></td>
      <td>${escapeHtml(t.email)}</td>
      <td class="right">${t.totalMaintenances}</td>
      <td class="right">${t.completedMaintenances}</td>
      <td class="right">${t.completionRate.toFixed(1)}%</td>
      <td class="right">${t.avgCompletionDays}</td>
    </tr>`)
    .join('');

  const total = report.reduce((a, t) => a + t.totalMaintenances, 0);

  const body = `
    <div class="section">
      <div class="cards">
        <div class="card"><div class="k">Técnicos</div><div class="v">${report.length}</div></div>
        <div class="card"><div class="k">Mantenimientos</div><div class="v">${total}</div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Desempeño por Técnico</div>
      <table class="report-table">
        <thead><tr><th>Nombre</th><th>Email</th><th class="right">Total</th><th class="right">Completados</th><th class="right">Tasa</th><th class="right">Prom. Días</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="muted">Sin resultados en el período.</td></tr>`}</tbody>
      </table>
    </div>`;

  return pageShell('Reporte de Técnicos', subtitle, body);
}

async function buildCostHtml(query: ReportQueryInput, subtitle: string): Promise<string> {
  const report = await reportsService.getCostReport(query);

  const supplierRows = Object.entries(report.bySupplier)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([name, cost]) =>
        `<tr><td>${escapeHtml(name)}</td><td class="right">${fmtMoney(cost)}</td></tr>`
    )
    .join('');

  const body = `
    <div class="section">
      <div class="cards">
        <div class="card"><div class="k">Costo Total</div><div class="v">${fmtMoney(report.totalCost)}</div></div>
        <div class="card"><div class="k">Preventivos</div><div class="v">${fmtMoney(report.byCategory.preventive)}</div></div>
        <div class="card"><div class="k">Correctivos</div><div class="v">${fmtMoney(report.byCategory.corrective)}</div></div>
        <div class="card"><div class="k">Ítems</div><div class="v">${report.itemCount}</div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Costos por Proveedor</div>
      <table class="report-table">
        <thead><tr><th>Proveedor</th><th class="right">Costo</th></tr></thead>
        <tbody>
          ${supplierRows || `<tr><td colspan="2" class="muted">Sin costos registrados.</td></tr>`}
          <tr class="total-row"><td>TOTAL</td><td class="right">${fmtMoney(report.totalCost)}</td></tr>
        </tbody>
      </table>
    </div>`;

  return pageShell('Reporte de Costos', subtitle, body);
}

export async function buildMachineHistoryHtml(machineId: string): Promise<string> {
  const { machine, stats, maintenances, alerts, schedules } = await machinesService.getHistory(machineId);

  const machStatus = statusBadge(MACHINE_STATUS, machine.status);

  const infoRows = [
    { k: 'Código', v: machine.code },
    { k: 'Tipo', v: machine.machineType },
    { k: 'Marca', v: machine.brand },
    { k: 'Modelo', v: machine.model },
    { k: 'N° Serie', v: machine.serialNumber },
    { k: 'Año', v: machine.year },
    { k: 'Horas/día', v: machine.dailyHoursAverage },
    { k: 'Registrada', v: fmtDate(machine.createdAt) },
  ]
    .map((r) => `<div class="kv"><div class="k">${r.k}</div><div class="v">${escapeHtml(r.v ?? '-')}</div></div>`)
    .join('');

  const cards = [
    { k: 'Mantenimientos', v: stats.totalMaintenances },
    { k: 'Preventivos', v: stats.preventiveCount },
    { k: 'Correctivos', v: stats.correctiveCount },
    { k: 'Costo Total', v: fmtMoney(stats.totalCost) },
    { k: 'Costo Prom.', v: fmtMoney(stats.avgCostPerMaintenance) },
  ]
    .map((c) => `<div class="card"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`)
    .join('');

  const maintRows = maintenances
    .map((m: any) => {
      const cost = m.items.reduce((sum: number, i: any) => sum + (i.unitCost || 0) * i.quantity, 0);
      return `<tr>
        <td>${fmtDate(m.receivedDate)}</td>
        <td>${escapeHtml(m.maintenanceType?.name)}</td>
        <td>${m.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}</td>
        <td>${escapeHtml(m.technician?.name)}</td>
        <td class="right">${m.items.length}</td>
        <td class="right">${fmtMoney(cost)}</td>
        <td>${statusBadge(MAINT_STATUS, m.status)}</td>
      </tr>`;
    })
    .join('');

  const scheduleHtml =
    schedules.length > 0
      ? `<div class="section"><div class="section-title">Próximos Mantenimientos Programados</div>
         <table class="report-table"><thead><tr><th>Tipo</th><th>Próxima fecha</th></tr></thead><tbody>
         ${schedules
           .map(
             (s: any) =>
               `<tr><td>${escapeHtml(s.maintenanceType?.name)}</td><td>${fmtDate(s.nextExecution)}</td></tr>`
           )
           .join('')}
         </tbody></table></div>`
      : '';

  const alertHtml =
    alerts.length > 0
      ? `<div class="section"><div class="section-title">Alertas Recientes</div>
         <table class="report-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Severidad</th><th>Mensaje</th></tr></thead><tbody>
         ${alerts
           .map(
             (a: any) =>
               `<tr><td>${fmtDate(a.createdAt)}</td><td>${lbl(ALERT_TYPE, a.type)}</td><td>${lbl(
                 ALERT_SEVERITY,
                 a.severity
               )}</td><td>${escapeHtml(a.message)}</td></tr>`
           )
           .join('')}
         </tbody></table></div>`
      : '';

  const body = `
    <div class="section">
      <div class="section-title">Información de la Máquina</div>
      <div class="grid2">
        <div>${infoRows}</div>
        <div style="text-align:right">${machStatus}</div>
      </div>
    </div>
    <div class="section">
      <div class="cards">${cards}</div>
    </div>
    ${scheduleHtml}
    ${alertHtml}
    <div class="section">
      <div class="section-title">Historial de Mantenimientos</div>
      <table class="report-table">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Técnico</th><th class="right">Ítems</th><th class="right">Costo</th><th>Estado</th></tr></thead>
        <tbody>${maintRows || `<tr><td colspan="7" class="muted">No hay mantenimientos registrados.</td></tr>`}</tbody>
      </table>
    </div>`;

  return pageShell(`Ficha de Máquina — ${machine.name}`, `Código: ${machine.code}`, body);
}
