import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { maintenancesApi, Maintenance, MaintenanceStats } from '../services/maintenances';
import { catalogsApi, MaintenanceType } from '../services/catalogs';
import { machinesApi, Machine } from '../services/machines';
import { usersApi, User } from '../services/users';

export function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadMaintenances();
    loadStats();
  }, [currentPage, search, statusFilter, categoryFilter]);

  const loadMaintenances = async () => {
    try {
      setIsLoading(true);
      const response = await maintenancesApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
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
    if (!confirm('¿Estás seguro de eliminar este mantenimiento?')) return;

    try {
      await maintenancesApi.delete(id);
      loadMaintenances();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar mantenimiento');
    }
  };

  const handleStatusChange = async (status: string, reason?: string, completedHours?: number, observations?: string) => {
    if (!selectedMaintenance) return;

    try {
      await maintenancesApi.changeStatus(selectedMaintenance.id, status, reason, completedHours, observations);
      setIsStatusModalOpen(false);
      setSelectedMaintenance(null);
      loadMaintenances();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedMaintenance(null);
    loadMaintenances();
    loadStats();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mantenimientos</h1>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedMaintenance(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nuevo Mantenimiento
          </button>
        )}
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
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : maintenances.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron mantenimientos</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máquina</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Recibida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {maintenances.map((maintenance) => (
                <tr key={maintenance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{maintenance.machine?.code}</div>
                    <div className="text-sm text-gray-500">{maintenance.machine?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{maintenance.maintenanceType?.name}</div>
                    <div className="text-sm text-gray-500">
                      {maintenance.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {maintenance.technician?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(maintenance.receivedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(maintenance.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedMaintenance(maintenance);
                        setIsDetailOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver
                    </button>
                    {canEdit && maintenance.status !== 'COMPLETED' && maintenance.status !== 'CANCELLED' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedMaintenance(maintenance);
                            setIsFormOpen(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMaintenance(maintenance);
                            setIsStatusModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Estado
                        </button>
                      </>
                    )}
                    {canDelete && maintenance.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleDelete(maintenance.id)}
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
        />
      )}
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
    maintenanceTypeId: maintenance?.maintenanceTypeId || '',
    technicianId: maintenance?.technicianId || '',
    receivedDate: maintenance?.receivedDate ? maintenance.receivedDate.split('T')[0] : new Date().toISOString().split('T')[0],
    currentHours: maintenance?.currentHours?.toString() || '',
    description: maintenance?.description || '',
    observations: maintenance?.observations || '',
    hoursUntilNext: maintenance?.hoursUntilNext?.toString() || '',
    nextMaintenanceDate: maintenance?.nextMaintenanceDate ? maintenance.nextMaintenanceDate.split('T')[0] : '',
    estimatedNextDate: maintenance?.estimatedNextDate ? maintenance.estimatedNextDate.split('T')[0] : '',
  });

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
      const payload = {
        ...formData,
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="text-center text-gray-500">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máquina *</label>
              <select
                value={formData.machineId}
                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mantenimiento *</label>
              <select
                value={formData.maintenanceTypeId}
                onChange={(e) => setFormData({ ...formData, maintenanceTypeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar tipo</option>
                {maintenanceTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.isPreventive ? 'Preventivo' : 'Correctivo'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado *</label>
              <select
                value={formData.technicianId}
                onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar técnico</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Recepción *</label>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Actuales *</label>
              <input
                type="number"
                value={formData.currentHours}
                onChange={(e) => setFormData({ ...formData, currentHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada Final</label>
              <input
                type="date"
                value={formData.estimatedNextDate}
                onChange={(e) => setFormData({ ...formData, estimatedNextDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Agregar Ítem
              </button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Costo"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Proveedor"
                        value={item.supplier}
                        onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Categoría"
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Cambiar Estado</h2>
        <p className="text-sm text-gray-600 mb-4">
          Mantenimiento: {maintenance.machine?.code} - {maintenance.maintenanceType?.name}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Estado actual: <span className="font-medium">{maintenance.status}</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!status}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
}: {
  maintenance: Maintenance;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalle del Mantenimiento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Máquina</label>
            <p className="text-sm">{maintenance.machine?.code} - {maintenance.machine?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo</label>
            <p className="text-sm">{maintenance.maintenanceType?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Técnico</label>
            <p className="text-sm">{maintenance.technician?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <p className="text-sm">{maintenance.status}</p>
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

        {maintenance.items && maintenance.items.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Ítems</label>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Cantidad</th>
                  <th className="px-3 py-2 text-left">Costo Unit.</th>
                  <th className="px-3 py-2 text-left">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {maintenance.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">{item.unitCost ? `$${item.unitCost}` : '-'}</td>
                    <td className="px-3 py-2">{item.supplier || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
