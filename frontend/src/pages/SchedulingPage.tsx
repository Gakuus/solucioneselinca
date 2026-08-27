import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { schedulingApi, Schedule } from '../services/scheduling';
import { machinesApi, Machine } from '../services/machines';
import { catalogsApi, MaintenanceType } from '../services/catalogs';

export function SchedulingPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadSchedules();
    loadMachines();
    loadMaintenanceTypes();
  }, [currentPage, search, frequencyFilter, activeFilter]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await schedulingApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        frequency: frequencyFilter || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter === 'true',
      });
      setSchedules(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar programaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMachines = async () => {
    try {
      const response = await machinesApi.getAll({ limit: 100 });
      setMachines(response.data);
    } catch {
      // Ignore error
    }
  };

  const loadMaintenanceTypes = async () => {
    try {
      const data = await catalogsApi.getMaintenanceTypes();
      setMaintenanceTypes(data);
    } catch {
      // Ignore error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta programación?')) return;

    try {
      await schedulingApi.delete(id);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar programación');
    }
  };

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      await schedulingApi.toggleActive(schedule.id);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const handleExecute = async (schedule: Schedule) => {
    if (!confirm('¿Desea ejecutar esta programación ahora?')) return;

    try {
      await schedulingApi.execute(schedule.id);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar programación');
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const styles: Record<string, string> = {
      DAILY: 'bg-red-100 text-red-800',
      WEEKLY: 'bg-green-100 text-green-800',
      MONTHLY: 'bg-yellow-100 text-yellow-800',
      QUARTERLY: 'bg-orange-100 text-orange-800',
      YEARLY: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      DAILY: 'Diario',
      WEEKLY: 'Semanal',
      MONTHLY: 'Mensual',
      QUARTERLY: 'Trimestral',
      YEARLY: 'Anual',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[frequency] || 'bg-gray-100'}`}>
        {labels[frequency] || frequency}
      </span>
    );
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Programación de Mantenimientos</h1>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedSchedule(null);
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Nueva Programación
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por máquina, descripción..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={frequencyFilter}
            onChange={(e) => {
              setFrequencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todas las frecuencias</option>
            <option value="DAILY">Diario</option>
            <option value="WEEKLY">Semanal</option>
            <option value="MONTHLY">Mensual</option>
            <option value="QUARTERLY">Trimestral</option>
            <option value="YEARLY">Anual</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <button
            onClick={() => {
              setSearch('');
              setFrequencyFilter('');
              setActiveFilter('');
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
        ) : schedules.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron programaciones</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máquina</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frecuencia</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima Ejecución</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{schedule.machine?.code}</div>
                    <div className="text-sm text-gray-500 sm:hidden">{schedule.machine?.name}</div>
                    <div className="hidden sm:table-cell text-sm text-gray-500">{schedule.machine?.name}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div>{schedule.maintenanceType?.name}</div>
                    <div className="text-sm text-gray-500">
                      {schedule.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getFrequencyBadge(schedule.frequency)}
                    <div className="text-sm text-gray-500">Cada {schedule.interval}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(schedule.nextExecution).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {schedule.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {canEdit && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsFormOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(schedule)}
                          className={`${
                            schedule.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {schedule.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleExecute(schedule)}
                          className="text-purple-600 hover:text-purple-900 hidden sm:inline"
                        >
                          Ejecutar
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-900 hidden sm:inline"
                        >
                          Eliminar
                        </button>
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

      {/* Schedule Form Modal */}
      {isFormOpen && (
        <ScheduleFormModal
          schedule={selectedSchedule}
          machines={machines}
          maintenanceTypes={maintenanceTypes}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedSchedule(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedSchedule(null);
            loadSchedules();
          }}
        />
      )}
    </div>
  );
}

function ScheduleFormModal({
  schedule,
  machines,
  maintenanceTypes,
  onClose,
  onSave,
}: {
  schedule: Schedule | null;
  machines: Machine[];
  maintenanceTypes: MaintenanceType[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    machineId: schedule?.machineId || '',
    maintenanceTypeId: schedule?.maintenanceTypeId || '',
    frequency: schedule?.frequency || 'MONTHLY',
    interval: schedule?.interval || 1,
    startDate: schedule?.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: schedule?.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
    nextExecution: schedule?.nextExecution ? new Date(schedule.nextExecution).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    hoursInterval: schedule?.hoursInterval || '',
    isActive: schedule?.isActive ?? true,
    description: schedule?.description || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        hoursInterval: formData.hoursInterval ? parseFloat(formData.hoursInterval as string) : undefined,
        endDate: formData.endDate || undefined,
      };

      if (schedule) {
        await schedulingApi.update(schedule.id, data);
      } else {
        await schedulingApi.create(data);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar programación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {schedule ? 'Editar Programación' : 'Nueva Programación'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Máquina</label>
            <select
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Seleccionar máquina</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.code} - {machine.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mantenimiento</label>
            <select
              value={formData.maintenanceTypeId}
              onChange={(e) => setFormData({ ...formData, maintenanceTypeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              {maintenanceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="DAILY">Diario</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
                <option value="QUARTERLY">Trimestral</option>
                <option value="YEARLY">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo</label>
              <input
                type="number"
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Ejecución</label>
            <input
              type="date"
              value={formData.nextExecution}
              onChange={(e) => setFormData({ ...formData, nextExecution: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
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
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
