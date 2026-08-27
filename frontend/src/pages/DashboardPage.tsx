import { useState, useEffect } from 'react';
import { reportsApi, DashboardStats } from '../services/reports';
import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const { user } = useAuthStore();

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await reportsApi.getDashboardStats(period);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mes</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Año</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Cerrar
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalMachines}</div>
              <div className="text-sm text-gray-500">Total Máquinas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.activeMachines}</div>
              <div className="text-sm text-gray-500">Activas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMaintenances}</div>
              <div className="text-sm text-gray-500">Mantenimientos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completedMaintenances}</div>
              <div className="text-sm text-gray-500">Completados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingMaintenances}</div>
              <div className="text-sm text-gray-500">Pendientes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdueAlerts}</div>
              <div className="text-sm text-gray-500">Alertas Vencidas</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Mantenimientos Recientes</h2>
              {stats.recentMaintenances.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay mantenimientos recientes</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentMaintenances.map((maintenance) => (
                    <div key={maintenance.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{maintenance.machine?.code}</div>
                          <div className="text-sm text-gray-500">{maintenance.maintenanceType?.name}</div>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            maintenance.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : maintenance.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {maintenance.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Técnico: {maintenance.technician?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Estado de Mantenimientos</h2>
              <div className="space-y-4">
                {Object.entries(stats.maintenancesByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <div className="w-32 text-sm">
                      {status === 'SCHEDULED'
                        ? 'Programados'
                        : status === 'IN_PROGRESS'
                        ? 'En Progreso'
                        : status === 'COMPLETED'
                        ? 'Completados'
                        : 'Cancelados'}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            status === 'COMPLETED'
                              ? 'bg-green-500'
                              : status === 'IN_PROGRESS'
                              ? 'bg-yellow-500'
                              : status === 'SCHEDULED'
                              ? 'bg-blue-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${
                              stats.totalMaintenances > 0
                                ? (count / stats.totalMaintenances) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
