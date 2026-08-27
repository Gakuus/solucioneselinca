import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { alertsApi, Alert, AlertStats } from '../services/alerts';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [currentPage, search, typeFilter, severityFilter, readFilter]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await alertsApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        type: typeFilter || undefined,
        severity: severityFilter || undefined,
        isRead: readFilter === '' ? undefined : readFilter === 'true',
      });
      setAlerts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar alertas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await alertsApi.getStats();
      setStats(data);
    } catch {
      // Ignore error
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      loadAlerts();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      loadAlerts();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta alerta?')) return;

    try {
      await alertsApi.delete(id);
      loadAlerts();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar alerta');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[severity] || 'bg-gray-100'}`}>
        {labels[severity] || severity}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      UPCOMING: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CUSTOM: 'bg-purple-100 text-purple-800',
    };

    const labels: Record<string, string> = {
      UPCOMING: 'Próximo',
      OVERDUE: 'Vencido',
      CUSTOM: 'Personalizado',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[type] || 'bg-gray-100'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alertas</h1>
        <div className="flex space-x-2">
          {stats && stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Marcar todas como leídas ({stats.unread})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-gray-500">No leídas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.bySeverity?.HIGH || 0}</div>
            <div className="text-sm text-gray-500">Alta prioridad</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.byType?.CUSTOM || 0}</div>
            <div className="text-sm text-gray-500">Personalizadas</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Buscar por mensaje..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="UPCOMING">Próximo</option>
            <option value="OVERDUE">Vencido</option>
            <option value="CUSTOM">Personalizado</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las severidades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
          <select
            value={readFilter}
            onChange={(e) => {
              setReadFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="false">No leídas</option>
            <option value="true">Leídas</option>
          </select>
          <button
            onClick={() => {
              setSearch('');
              setTypeFilter('');
              setSeverityFilter('');
              setReadFilter('');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron alertas</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máquina</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id} className={`hover:bg-gray-50 ${!alert.isRead ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{alert.machine?.code}</div>
                    <div className="text-sm text-gray-500">{alert.machine?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-md truncate">{alert.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(alert.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getSeverityBadge(alert.severity)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.isRead ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {alert.isRead ? 'Leída' : 'No leída'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Marcar leída
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
