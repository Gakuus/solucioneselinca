import { useState, useEffect } from 'react';
import { dashboardApi, DashboardStats, RecentMaintenance, RecentMachine } from '../services/dashboard';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMaintenances, setRecentMaintenances] = useState<RecentMaintenance[]>([]);
  const [recentMachines, setRecentMachines] = useState<RecentMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [statsData, maintenancesData, machinesData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentMaintenances(),
        dashboardApi.getRecentMachines(),
      ]);
      setStats(statsData);
      setRecentMaintenances(maintenancesData);
      setRecentMachines(machinesData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Máquinas</p>
                <p className="text-2xl font-semibold">{stats.machines.total}</p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-600">{stats.machines.active} activas</span>
              <span className="mx-2">·</span>
              <span className="text-yellow-600">{stats.machines.maintenance} en mtto.</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Mantenimientos</p>
                <p className="text-2xl font-semibold">{stats.maintenances.total}</p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-blue-600">{stats.maintenances.pending} pendientes</span>
              <span className="mx-2">·</span>
              <span className="text-green-600">{stats.maintenances.completed} completados</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Usuarios</p>
                <p className="text-2xl font-semibold">{stats.users.total}</p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-600">{stats.users.active} activos</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Alertas</p>
                <p className="text-2xl font-semibold">{stats.alerts.total}</p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-red-600">{stats.alerts.unread} sin leer</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenances */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Mantenimientos Recientes</h2>
          </div>
          <div className="p-4">
            {recentMaintenances.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay mantenimientos recientes</p>
            ) : (
              <div className="space-y-3">
                {recentMaintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{maintenance.machine.code} - {maintenance.machine.name}</p>
                      <p className="text-sm text-gray-500">{maintenance.maintenanceType.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      maintenance.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      maintenance.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {maintenance.status === 'COMPLETED' ? 'Completado' :
                       maintenance.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Machines */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Máquinas Recientes</h2>
          </div>
          <div className="p-4">
            {recentMachines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay máquinas registradas</p>
            ) : (
              <div className="space-y-3">
                {recentMachines.map((machine) => (
                  <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{machine.code} - {machine.name}</p>
                      <p className="text-sm text-gray-500">{machine.machineType.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      machine.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      machine.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {machine.status === 'ACTIVE' ? 'Activa' :
                       machine.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactiva'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
