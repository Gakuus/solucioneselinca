import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { reportsApi, DashboardStats } from '../services/reports';
import { MAINTENANCE_STATUS, label } from '../utils/labels';
import { maintenanceTypesLabel, maintenanceTechniciansLabel } from '../utils/maintenance';
import { useCountUp } from '../hooks/useCountUp';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programados',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completados',
  CANCELLED: 'Cancelados',
};

function StatCard({
  value,
  label,
  color = 'text-gray-900',
  delay,
}: {
  value: number;
  label: string;
  color?: string;
  delay: number;
}) {
  const animatedValue = useCountUp(value);
  return (
    <div
      className="stat-card bg-white rounded-lg shadow p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`text-2xl font-bold ${color}`}>
        {Math.round(animatedValue)}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setStats(null);
      const data = await reportsApi.getDashboardStats(period);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const cardConfig = useMemo(
    () => [
      {
        key: 'totalMachines',
        value: stats?.totalMachines ?? 0,
        label: 'Total Máquinas',
        color: 'text-gray-900',
      },
      {
        key: 'activeMachines',
        value: stats?.activeMachines ?? 0,
        label: 'Activas',
        color: 'text-green-600',
      },
      {
        key: 'totalMaintenances',
        value: stats?.totalMaintenances ?? 0,
        label: 'Mantenimientos',
        color: 'text-red-600',
      },
      {
        key: 'completedMaintenances',
        value: stats?.completedMaintenances ?? 0,
        label: 'Completados',
        color: 'text-green-600',
      },
      {
        key: 'pendingMaintenances',
        value: stats?.pendingMaintenances ?? 0,
        label: 'Pendientes',
        color: 'text-yellow-600',
      },
      {
        key: 'overdueAlerts',
        value: stats?.overdueAlerts ?? 0,
        label: 'Alertas Vencidas',
        color: 'text-red-600',
      },
    ],
    [stats]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mes</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Año</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded animate-fade-in">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Cerrar
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 animate-fade-in">
          Cargando...
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div
            key={period}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
          >
            {cardConfig.map((card, i) => (
              <StatCard
                key={card.key}
                value={card.value}
                label={card.label}
                color={card.color}
                delay={i * 80}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div
            key={`recent-${period}`}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Mantenimientos Recientes
              </h2>
              {stats.recentMaintenances.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay mantenimientos recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentMaintenances.map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="recent-item border-b pb-3 last:border-0 transition-colors duration-200 hover:bg-gray-50 rounded px-1"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {maintenance.machine?.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maintenanceTypesLabel(maintenance)}
                          </div>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            maintenance.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : maintenance.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {label(MAINTENANCE_STATUS, maintenance.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Técnico: {maintenanceTechniciansLabel(maintenance)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Estado de Mantenimientos
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.maintenancesByStatus).map(([status, count]) => {
                  const pct =
                    stats.totalMaintenances > 0
                      ? (count / stats.totalMaintenances) * 100
                      : 0;
                  const barColor =
                    status === 'COMPLETED'
                      ? 'bg-green-500'
                      : status === 'IN_PROGRESS'
                      ? 'bg-yellow-500'
                      : 'bg-red-500';
                  return (
                    <div key={status} className="flex items-center">
                      <div className="w-32 text-sm">
                        {STATUS_LABELS[status] ?? status}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} animate-grow-width`}
                            style={
                              {
                                '--bar-value': `${pct}%`,
                              } as CSSProperties
                            }
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
