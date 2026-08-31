import { useState, useEffect } from 'react';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { alertsApi, Alert, AlertStats } from '../services/alerts';
import { useToast } from '../components/ui/toast';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { MobileCard, MobileRow } from '../components/ui/mobile-card';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [currentPage, search, typeFilter, severityFilter, readFilter, showInactive]);

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
        includeDeleted: showInactive,
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
      toast('success', 'Alerta marcada como leída');
      loadAlerts();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      toast('success', 'Todas las alertas marcadas como leídas');
      loadAlerts();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertsApi.delete(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Alerta eliminada correctamente');
      loadAlerts();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al eliminar alerta');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await alertsApi.restore(id);
      toast('success', 'Alerta restaurada correctamente');
      loadAlerts();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al restaurar alerta');
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
      UPCOMING: 'bg-red-100 text-red-800',
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Alertas</h1>
        <div className="flex flex-wrap gap-2">
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
        <label className="inline-flex items-center mt-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => {
              setShowInactive(e.target.checked);
              setCurrentPage(1);
            }}
            className="mr-2"
          />
          Mostrar inactivos
        </label>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">Cargando...</div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">No se encontraron alertas</div>
        ) : (
          alerts.map((alert) => (
            <MobileCard key={alert.id} inactive={!!alert.deletedAt}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base">{alert.machine?.code || 'Sistema'}</div>
                  {!alert.isRead && !alert.deletedAt && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> No leída
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {getSeverityBadge(alert.severity)}
                  {getTypeBadge(alert.type)}
                </div>
              </div>
              <div className="text-sm text-gray-700 py-1.5 break-words">{alert.message}</div>
              <MobileRow label="Fecha">{new Date(alert.createdAt).toLocaleDateString()}</MobileRow>
              {!alert.deletedAt && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg"
                    >
                      <Check size={15} /> Marcar leída
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteConfirm({ open: true, id: alert.id })}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                    >
                      <Trash2 size={15} /> Eliminar
                    </button>
                  )}
                </div>
              )}
              {alert.deletedAt && isAdmin && (
                <div className="mt-2">
                  <button
                    onClick={() => handleRestore(alert.id)}
                    className="w-full inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg"
                  >
                    <RefreshCw size={15} /> Restaurar
                  </button>
                </div>
              )}
            </MobileCard>
          ))
        )}
      </div>

      {/* Table (md+) */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron alertas</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Alerta</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Severidad</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className={`${alert.deletedAt ? 'opacity-50 bg-gray-100' : `hover:bg-gray-50 ${!alert.isRead ? 'bg-red-50' : ''}`}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{alert.machine?.code}</div>
                    <div className="text-xs text-gray-500 max-w-[180px] truncate">{alert.message}</div>
                    {alert.deletedAt && <div className="text-xs text-gray-500">Eliminada</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(alert.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getSeverityBadge(alert.severity)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.deletedAt ? 'bg-gray-100 text-gray-800' : alert.isRead ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {alert.deletedAt ? 'Eliminada' : alert.isRead ? 'Leída' : 'No leída'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {alert.deletedAt ? (
                      isAdmin && (
                        <button
                          onClick={() => handleRestore(alert.id)}
                          className="action-btn action-btn-success"
                        >
                          <RefreshCw size={15} />
                          Restaurar
                        </button>
                      )
                    ) : (
                      <>
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="action-btn action-btn-success mr-3"
                      >
                        <Check size={15} />
                        Marcar leída
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: alert.id })}
                        className="action-btn action-btn-danger"
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Anterior
              </button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Siguiente
              </button>
            </div>
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
                      className={`px-3 py-2 border rounded ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Eliminar alerta"
        message="¿Estás seguro de eliminar esta alerta? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}
