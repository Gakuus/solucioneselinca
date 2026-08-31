import { useState, useEffect, useRef } from 'react';
import { Eye, Pencil, ToggleLeft, ArchiveX, RefreshCw, X, Upload, FileText } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { maintenancesApi, Maintenance, MaintenanceItem, MaintenanceStats } from '../services/maintenances';
import { catalogsApi, MaintenanceType } from '../services/catalogs';
import { machinesApi, Machine } from '../services/machines';
import { usersApi, User } from '../services/users';
import { useToast } from '../components/ui/toast';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { MobileCard, MobileRow } from '../components/ui/mobile-card';
import { MAINTENANCE_STATUS, label } from '../utils/labels';
import { maintenanceTypesLabel, maintenanceTechniciansLabel } from '../utils/maintenance';
import { todayInputDate } from '../utils/date';

function typeLabel(maintenance: Maintenance): string {
  return maintenanceTypesLabel(maintenance);
}

function techniciansLabel(maintenance: Maintenance): string {
  return maintenanceTechniciansLabel(maintenance);
}

export function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const getExportParams = () => ({
    search: search || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    includeDeleted: showInactive || undefined,
  });

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    try {
      const blob =
        format === 'pdf'
          ? await maintenancesApi.exportPDF(getExportParams())
          : await maintenancesApi.exportExcel(getExportParams());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'pdf' ? 'mantenimientos.pdf' : 'mantenimientos.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast('success', format === 'pdf' ? 'PDF exportado correctamente' : 'Excel exportado correctamente');
    } catch (err: any) {
      toast('error', err.message || 'Error al exportar');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const result = await maintenancesApi.importExcel(file);
      toast(
        'success',
        `Importación completada: ${result.imported} creados${result.errors.length ? `, ${result.errors.length} errores` : ''}`
      );
      if (result.errors.length > 0) {
        setError(result.errors.slice(0, 10).join(' • '));
      }
      setCurrentPage(1);
      loadMaintenances();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al importar');
    }
  };

  useEffect(() => {
    loadMaintenances();
    loadStats();
  }, [currentPage, search, statusFilter, categoryFilter, showInactive]);

  const loadMaintenances = async () => {
    try {
      setIsLoading(true);
      const response = await maintenancesApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        includeDeleted: showInactive,
      });
      setMaintenances(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mantenimientos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await maintenancesApi.getStats();
      setStats(data);
    } catch {
      // Ignore error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await maintenancesApi.delete(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Mantenimiento desactivado correctamente');
      loadMaintenances();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al desactivar mantenimiento');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await maintenancesApi.restore(id);
      toast('success', 'Mantenimiento reactivado correctamente');
      loadMaintenances();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al reactivar mantenimiento');
    }
  };

  const handleStatusChange = async (status: string, reason?: string, completedHours?: number, observations?: string) => {
    if (!selectedMaintenance) return;

    try {
      await maintenancesApi.changeStatus(selectedMaintenance.id, status, reason, completedHours, observations);
      setIsStatusModalOpen(false);
      setSelectedMaintenance(null);
      toast('success', 'Estado actualizado correctamente');
      loadMaintenances();
      loadStats();
    } catch (err: any) {
      toast('error', err.message || 'Error al cambiar estado');
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedMaintenance(null);
    toast('success', 'Mantenimiento guardado correctamente');
    loadMaintenances();
    loadStats();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      SCHEDULED: 'Programado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR' || user?.role === 'TECHNICIAN';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Mantenimientos</h1>
        <div className="flex flex-wrap gap-2">
          {canDelete && (
            <>
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center gap-1.5 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800"
              >
                <FileText size={16} />
                Exportar PDF
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="inline-flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
              >
                Exportar Excel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
              >
                <Upload size={16} />
                Importar Excel
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                  e.target.value = '';
                }}
              />
            </>
          )}
          {canEdit && (
            <button
              onClick={() => {
                setSelectedMaintenance(null);
                setIsFormOpen(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              + Nuevo Mantenimiento
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-500">Programados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">En Progreso</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-500">Cancelados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-500">Próximos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
            <div className="text-sm text-gray-500">Vencidos</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por descripción, código..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los estados</option>
            <option value="SCHEDULED">Programado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todas las categorías</option>
            <option value="PREVENTIVE">Preventivo</option>
            <option value="CORRECTIVE">Correctivo</option>
          </select>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setCategoryFilter('');
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
        ) : maintenances.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">No se encontraron mantenimientos</div>
        ) : (
          maintenances.map((maintenance) => (
            <MobileCard key={maintenance.id} inactive={!!maintenance.deletedAt}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base">{maintenance.machine?.name}</div>
                  <div className="text-sm text-gray-500">{maintenance.machine?.code}</div>
                </div>
                {maintenance.deletedAt ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Eliminado</span>
                ) : (
                  getStatusBadge(maintenance.status)
                )}
              </div>
              <MobileRow label="Tipo">
                {typeLabel(maintenance)}
              </MobileRow>
              <MobileRow label="Categoría">
                {maintenance.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}
              </MobileRow>
              <MobileRow label="Técnico">{techniciansLabel(maintenance)}</MobileRow>
              <MobileRow label="Fecha">{new Date(maintenance.receivedDate).toLocaleDateString()}</MobileRow>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedMaintenance(maintenance);
                    setIsDetailOpen(true);
                  }}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg"
                >
                  <Eye size={15} /> Ver
                </button>
                {!maintenance.deletedAt && canEdit && maintenance.status !== 'CANCELLED' && (
                  <>
                    {maintenance.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setSelectedMaintenance(maintenance);
                          setIsStatusModalOpen(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg"
                      >
                        <ToggleLeft size={15} /> Estado
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMaintenance(maintenance);
                        setIsFormOpen(true);
                      }}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                    >
                      <Pencil size={15} /> Editar
                    </button>
                  </>
                )}
                {!maintenance.deletedAt && canDelete && maintenance.status === 'SCHEDULED' && (
                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: maintenance.id })}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg"
                  >
                    <ArchiveX size={15} /> Desactivar
                  </button>
                )}
                {maintenance.deletedAt && canDelete && (
                  <button
                    onClick={() => handleRestore(maintenance.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg"
                  >
                    <RefreshCw size={15} /> Reactivar
                  </button>
                )}
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Table (md+) */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : maintenances.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron mantenimientos</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Máquina</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Técnico</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((maintenance) => (
                <tr key={maintenance.id} className={`${maintenance.deletedAt ? 'opacity-50 bg-gray-100' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{maintenance.machine?.code}</div>
                    <div className="text-sm text-gray-500">{maintenance.machine?.name}</div>
                    {maintenance.deletedAt && <div className="text-xs text-gray-500">Eliminado</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{typeLabel(maintenance)}</div>
                    <div className="text-sm text-gray-500">
                      {maintenance.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
{techniciansLabel(maintenance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(maintenance.receivedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {maintenance.deletedAt ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Eliminado
                      </span>
                    ) : (
                      getStatusBadge(maintenance.status)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {maintenance.deletedAt ? (
                      canDelete && (
                        <button
                          onClick={() => handleRestore(maintenance.id)}
                          className="action-btn action-btn-success"
                        >
                          <RefreshCw size={15} />
                          Reactivar
                        </button>
                      )
                    ) : (
                    <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedMaintenance(maintenance);
                        setIsDetailOpen(true);
                      }}
                      className="action-btn action-btn-danger"
                    >
                      <Eye size={15} />
                      Ver
                    </button>
                    {canEdit && maintenance.status !== 'CANCELLED' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedMaintenance(maintenance);
                            setIsFormOpen(true);
                          }}
                          className="action-btn action-btn-secondary"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>
                        {maintenance.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setSelectedMaintenance(maintenance);
                              setIsStatusModalOpen(true);
                            }}
                            className="action-btn action-btn-warning"
                          >
                            <ToggleLeft size={15} />
                            Estado
                          </button>
                        )}
                      </>
                    )}
                    {canDelete && maintenance.status === 'SCHEDULED' && (
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: maintenance.id })}
                        className="action-btn action-btn-danger"
                      >
                        <ArchiveX size={15} />
                        Desactivar
                      </button>
                    )}
                    </div>
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
                className="relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 min-h-[44px]">
                Anterior
              </button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 min-h-[44px]">
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

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <MaintenanceFormModal
          maintenance={selectedMaintenance}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedMaintenance(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedMaintenance && (
        <StatusChangeModal
          maintenance={selectedMaintenance}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedMaintenance(null);
          }}
          onChange={handleStatusChange}
        />
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedMaintenance && (
        <MaintenanceDetailModal
          maintenance={selectedMaintenance}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedMaintenance(null);
          }}
          onItemsChanged={loadMaintenances}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactivar mantenimiento"
        message="¿Estás seguro de desactivar este mantenimiento? Podrás reactivarlo más tarde."
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}

function MaintenanceFormModal({
  maintenance,
  onClose,
  onSave,
}: {
  maintenance: Maintenance | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditing = !!maintenance;

  const [machines, setMachines] = useState<Machine[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    machineId: maintenance?.machineId || '',
    receivedDate: maintenance?.receivedDate ? maintenance.receivedDate.split('T')[0] : todayInputDate(),
    currentHours: maintenance?.currentHours?.toString() || '',
    description: maintenance?.description || '',
    observations: maintenance?.observations || '',
    hoursUntilNext: maintenance?.hoursUntilNext?.toString() || '',
    nextMaintenanceDate: maintenance?.nextMaintenanceDate ? maintenance.nextMaintenanceDate.split('T')[0] : '',
    estimatedNextDate: maintenance?.estimatedNextDate ? maintenance.estimatedNextDate.split('T')[0] : '',
  });

  const initialTypeIds = maintenance
    ? (maintenance.typeAssignments && maintenance.typeAssignments.length > 0
        ? [...maintenance.typeAssignments].sort((a, b) => a.order - b.order).map((a) => a.maintenanceType.id)
        : maintenance.maintenanceTypeId
        ? [maintenance.maintenanceTypeId]
        : [])
    : [];

  const initialTechnicianIds = maintenance
    ? (maintenance.technicianAssignments && maintenance.technicianAssignments.length > 0
        ? [...maintenance.technicianAssignments].sort((a, b) => a.order - b.order).map((a) => a.technician.id)
        : maintenance.technicianId
        ? [maintenance.technicianId]
        : [])
    : [];

  const [maintenanceTypeIds, setMaintenanceTypeIds] = useState<string[]>(initialTypeIds);
  const [technicianIds, setTechnicianIds] = useState<string[]>(initialTechnicianIds);

  const [items, setItems] = useState<Array<{
    name: string;
    quantity: string;
    unitCost: string;
    supplier: string;
    category: string;
  }>>(
    maintenance?.items?.map((item) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      unitCost: item.unitCost?.toString() || '',
      supplier: item.supplier || '',
      category: item.category || '',
    })) || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [machinesData, typesData, usersData] = await Promise.all([
          machinesApi.getAll({ limit: 100 }),
          catalogsApi.getMaintenanceTypes(),
          usersApi.getAll({ limit: 100, role: 'TECHNICIAN' }),
        ]);
        setMachines(machinesData.data);
        setMaintenanceTypes(typesData);
        setTechnicians(usersData.data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (maintenanceTypeIds.length === 0) {
        setError('Debe seleccionar al menos un tipo de mantenimiento');
        setIsSaving(false);
        return;
      }
      if (technicianIds.length === 0) {
        setError('Debe asignar al menos un técnico');
        setIsSaving(false);
        return;
      }
      const payload = {
        ...formData,
        maintenanceTypeIds,
        technicianIds,
        currentHours: parseFloat(formData.currentHours) || 0,
        hoursUntilNext: formData.hoursUntilNext ? parseFloat(formData.hoursUntilNext) : undefined,
        nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
        estimatedNextDate: formData.estimatedNextDate || undefined,
        observations: formData.observations || undefined,
        items: items
          .filter((item) => item.name.trim())
          .map((item) => ({
            name: item.name,
            quantity: parseInt(item.quantity) || 1,
            unitCost: item.unitCost ? parseFloat(item.unitCost) : undefined,
            supplier: item.supplier || undefined,
            category: item.category || undefined,
          })),
      };

      if (isEditing) {
        await maintenancesApi.update(maintenance.id, payload);
      } else {
        await maintenancesApi.create(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: '1', unitCost: '', supplier: '', category: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  if (isLoadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4">
          <div className="text-center text-gray-500 py-4">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-2xl sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máquina *</label>
              <select
                value={formData.machineId}
                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                required
                disabled={isEditing}
              >
                <option value="">Seleccionar máquina</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipos de Mantenimiento *</label>
              <div className="border border-gray-300 rounded-md px-3 py-2 min-h-[44px]">
                {maintenanceTypes.map((t) => {
                  const checked = maintenanceTypeIds.includes(t.id);
                  const isPrimary = maintenanceTypeIds[0] === t.id;
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 py-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setMaintenanceTypeIds(maintenanceTypeIds.filter((id) => id !== t.id));
                          } else {
                            setMaintenanceTypeIds([...maintenanceTypeIds, t.id]);
                          }
                        }}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-sm text-gray-800">{t.name}</span>
                      <span className="text-xs text-gray-400">({t.isPreventive ? 'Preventivo' : 'Correctivo'})</span>
                      {isPrimary && <span className="ml-auto text-xs font-semibold text-red-600">Principal</span>}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">El primero seleccionado se usa como tipo principal.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnicos Asignados *</label>
              <div className="border border-gray-300 rounded-md px-3 py-2 min-h-[44px]">
                {technicians.map((t) => {
                  const checked = technicianIds.includes(t.id);
                  const isPrimary = technicianIds[0] === t.id;
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 py-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setTechnicianIds(technicianIds.filter((id) => id !== t.id));
                          } else {
                            setTechnicianIds([...technicianIds, t.id]);
                          }
                        }}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-sm text-gray-800">{t.name}</span>
                      <span className="text-xs text-gray-400">({t.email})</span>
                      {isPrimary && <span className="ml-auto text-xs font-semibold text-red-600">Principal</span>}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">Puedes asignar varios; el primero seleccionado es el principal.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Recepción *</label>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Actuales *</label>
              <input
                type="number"
                value={formData.currentHours}
                onChange={(e) => setFormData({ ...formData, currentHours: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Hasta Próximo</label>
              <input
                type="number"
                value={formData.hoursUntilNext}
                onChange={(e) => setFormData({ ...formData, hoursUntilNext: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Próximo Mantenimiento</label>
              <input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada Final</label>
              <input
                type="date"
                value={formData.estimatedNextDate}
                onChange={(e) => setFormData({ ...formData, estimatedNextDate: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
            />
          </div>

          {/* Items Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Ítems / Repuestos</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-red-600 hover:text-red-800"
              >
                + Agregar Ítem
              </button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end md:items-center border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <input
                        type="number"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        placeholder="Costo"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                        className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Proveedor"
                        value={item.supplier}
                        onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                        className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        placeholder="Categoría"
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                      />
                    </div>
                    <div className="md:col-span-1 flex md:justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Quitar ítem"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2 sm:space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
            >
              {isSaving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusChangeModal({
  maintenance,
  onClose,
  onChange,
}: {
  maintenance: Maintenance;
  onClose: () => void;
  onChange: (status: string, reason?: string, completedHours?: number, observations?: string) => void;
}) {
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [completedHours, setCompletedHours] = useState(maintenance.currentHours.toString());
  const [observations, setObservations] = useState('');

  const VALID_TRANSITIONS: Record<string, string[]> = {
    SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowedTransitions = VALID_TRANSITIONS[maintenance.status] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(
      status,
      reason || undefined,
      status === 'COMPLETED' ? parseFloat(completedHours) : undefined,
      observations || undefined
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cambiar Estado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Mantenimiento: {maintenance.machine?.code} - {typeLabel(maintenance)}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Estado actual: <span className="font-medium">{label(MAINTENANCE_STATUS, maintenance.status)}</span>
        </p>

        {allowedTransitions.length === 0 ? (
          <p className="text-red-600 mb-4">
            Este mantenimiento está en estado final y no puede cambiar de estado.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                required
              >
                <option value="">Seleccionar estado</option>
                {allowedTransitions.map((s) => (
                  <option key={s} value={s}>
                    {s === 'IN_PROGRESS' ? 'En Progreso' : s === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                  </option>
                ))}
              </select>
            </div>

            {status === 'COMPLETED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas al Completar
                </label>
                <input
                  type="number"
                  value={completedHours}
                  onChange={(e) => setCompletedHours(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
            )}

            {status === 'CANCELLED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (obligatorio)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2 sm:space-x-reverse">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!status}
                className="px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
              >
                Cambiar Estado
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function MaintenanceDetailModal({
  maintenance,
  onClose,
  onItemsChanged,
}: {
  maintenance: Maintenance;
  onClose: () => void;
  onItemsChanged?: () => void;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<MaintenanceItem[]>(maintenance.items || []);
  const [isBusy, setIsBusy] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: '1', unitCost: '', supplier: '', category: '' });
  const [error, setError] = useState<string | null>(null);

  const canEdit = maintenance.status !== 'CANCELLED';
  const totalCost = items.reduce((sum, i) => sum + (i.unitCost || 0) * i.quantity, 0);

  const refresh = async () => {
    try {
      const fresh = await maintenancesApi.getById(maintenance.id);
      setItems(fresh.items || []);
      onItemsChanged?.();
    } catch {
      // ignore
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre del ítem es obligatorio');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await maintenancesApi.addItem(maintenance.id, {
        name: form.name,
        quantity: parseInt(form.quantity) || 1,
        unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined,
        supplier: form.supplier || undefined,
        category: form.category || undefined,
      });
      setForm({ name: '', quantity: '1', unitCost: '', supplier: '', category: '' });
      toast('success', 'Ítem agregado correctamente');
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Error al agregar ítem');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ítem?')) return;
    setIsBusy(true);
    setError(null);
    try {
      await maintenancesApi.deleteItem(maintenance.id, itemId);
      toast('success', 'Ítem eliminado correctamente');
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar ítem');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-2xl sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalle del Mantenimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Máquina</label>
            <p className="text-sm">{maintenance.machine?.code} - {maintenance.machine?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo</label>
            <p className="text-sm">{typeLabel(maintenance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Técnico</label>
            <p className="text-sm">{techniciansLabel(maintenance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <p className="text-sm">{label(MAINTENANCE_STATUS, maintenance.status)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha Recibida</label>
            <p className="text-sm">{new Date(maintenance.receivedDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Horas Actuales</label>
            <p className="text-sm">{maintenance.currentHours} hrs</p>
          </div>
          {maintenance.nextMaintenanceDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Próximo Mantenimiento</label>
              <p className="text-sm">{new Date(maintenance.nextMaintenanceDate).toLocaleDateString()}</p>
            </div>
          )}
          {maintenance.hoursUntilNext && (
            <div>
              <label className="text-sm font-medium text-gray-500">Horas Hasta Próximo</label>
              <p className="text-sm">{maintenance.hoursUntilNext} hrs</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-500">Descripción</label>
          <p className="text-sm">{maintenance.description}</p>
        </div>

        {maintenance.observations && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-500">Observaciones</label>
            <p className="text-sm">{maintenance.observations}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-500">Ítems / Repuestos Utilizados</label>
            <span className="text-sm font-bold text-gray-700">Total: ${totalCost.toFixed(2)}</span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">No se registraron ítems para este mantenimiento.</p>
          ) : (
            <div className="overflow-x-auto mb-3">
              <table className="table-shell text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-right">Cantidad</th>
                    <th className="px-3 py-2 text-right">Costo Unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                    <th className="px-3 py-2 text-left">Proveedor</th>
                    {canEdit && <th className="px-3 py-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">{item.category || '-'}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.unitCost != null ? `$${Number(item.unitCost).toFixed(2)}` : '-'}</td>
                      <td className="px-3 py-2 text-right font-medium">${((item.unitCost || 0) * item.quantity).toFixed(2)}</td>
                      <td className="px-3 py-2">{item.supplier || '-'}</td>
                      {canEdit && (
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isBusy}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canEdit && (
            <form onSubmit={handleAddItem} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    placeholder="Ej. Filtro de aceite"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cant.</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    min="1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Costo Unit.</label>
                  <input
                    type="number"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                    className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    placeholder="Ej. Mobil"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-2 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    placeholder="Ej. Filtros, Lubricantes"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full px-3 py-2.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 min-h-[44px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
