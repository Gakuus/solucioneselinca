import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { machinesApi, MachineHistory } from '../services/machines';
import { MAINTENANCE_STATUS, MACHINE_STATUS, ALERT_TYPE, ALERT_SEVERITY, label } from '../utils/labels';
import { maintenanceTypesLabel, maintenanceTechniciansLabel } from '../utils/maintenance';

export function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<MachineHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<null | 'pdf' | 'xlsx'>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadHistory(id);
    }
  }, [id]);

  const loadHistory = async (machineId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await machinesApi.getHistory(machineId);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el historial de la máquina');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    if (!id) return;
    try {
      setIsExporting(format);
      setError(null);
      const blob =
        format === 'pdf'
          ? await machinesApi.exportHistoryPDF(id)
          : await machinesApi.exportHistoryExcel(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ficha_${history?.machine?.code || id}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar la ficha de la máquina');
    } finally {
      setIsExporting(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Cargando historial...</div>;
  }

  if (error || !history) {
    return (
      <div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600 text-center py-8">{error || 'Máquina no encontrada'}</p>
          <div className="text-center">
            <button
              onClick={() => navigate('/machines')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Volver a Máquinas
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { machine, stats, maintenances, alerts, schedules } = history;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/machines')} className="text-gray-500 hover:text-gray-700 text-sm mb-2">
            ← Volver a Máquinas
          </button>
          <h1 className="text-2xl font-bold">{machine.name}</h1>
          <p className="text-gray-500 text-sm">
            {machine.code} · {machine.machineType || 'Sin tipo'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm rounded-full bg-gray-100">{getStatusBadge(machine.status)}</span>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!isExporting}
            className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:opacity-50"
          >
            {isExporting === 'pdf' ? 'Generando PDF...' : 'Exportar PDF'}
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={!!isExporting}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
          >
            {isExporting === 'xlsx' ? 'Generando Excel...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {/* Datos de la máquina */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3">Datos de la Máquina</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Marca</div>
            <div className="font-medium">{machine.brand || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">Modelo</div>
            <div className="font-medium">{machine.model || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">N° Serie</div>
            <div className="font-medium">{machine.serialNumber || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">Año</div>
            <div className="font-medium">{machine.year || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">Horas diarias prom.</div>
            <div className="font-medium">{machine.dailyHoursAverage}</div>
          </div>
          <div>
            <div className="text-gray-500">Registrada desde</div>
            <div className="font-medium">{new Date(machine.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <StatCard label="Mantenimientos" value={stats.totalMaintenances} />
        <StatCard label="Preventivos" value={stats.preventiveCount} color="text-blue-600" />
        <StatCard label="Correctivos" value={stats.correctiveCount} color="text-orange-600" />
        <StatCard label="Costo Total" value={`$${stats.totalCost.toFixed(2)}`} color="text-red-600" />
        <StatCard label="Costo Prom./Mant." value={`$${stats.avgCostPerMaintenance.toFixed(2)}`} />
      </div>

      {/* Próximos mantenimientos programados */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Próximos Mantenimientos Programados</h2>
          <div className="flex flex-wrap gap-2">
            {schedules.map((s) => (
              <span key={s.id} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">
                {s.maintenanceType?.name || 'Mantenimiento'} · {new Date(s.nextExecution).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Alertas Recientes</h2>
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Severidad</th>
                  <th className="px-4 py-3">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(alert.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{label(ALERT_TYPE, alert.type)}</td>
                    <td className="px-4 py-3 text-sm">{alertSeverityBadge(alert.severity)}</td>
                    <td className="px-4 py-3 text-sm">{alert.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historial de mantenimientos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 pt-4 pb-2">
          <h2 className="font-semibold text-gray-700">Historial de Mantenimientos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3">Ítems</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay mantenimientos registrados para esta máquina.
                  </td>
                </tr>
              )}
              {maintenances.map((m) => {
                const cost = m.items.reduce((s, i) => s + (i.unitCost || 0) * i.quantity, 0);
                return (
                  <tr>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(m.receivedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{maintenanceTypesLabel(m)}</td>
                    <td className="px-4 py-3 text-sm">{m.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}</td>
                    <td className="px-4 py-3 text-sm">{maintenanceTechniciansLabel(m) || '-'}</td>
                    <td className="px-4 py-3 text-sm">{m.items.length}</td>
                    <td className="px-4 py-3 text-sm">${cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{label(MAINTENANCE_STATUS, m.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'text-gray-900',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">{label(MACHINE_STATUS, status)}</span>;
    case 'IN_MAINTENANCE':
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{label(MACHINE_STATUS, status)}</span>;
    case 'DECOMMISSIONED':
      return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">{label(MACHINE_STATUS, status)}</span>;
    default:
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">{label(MACHINE_STATUS, status)}</span>;
  }
}

function alertSeverityBadge(severity: string) {
  const text = label(ALERT_SEVERITY, severity);
  switch (severity) {
    case 'CRITICAL':
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">{text}</span>;
    case 'HIGH':
      return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">{text}</span>;
    case 'LOW':
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">{text}</span>;
    default:
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{text}</span>;
  }
}
