import { useState, useEffect } from 'react';
import { Pencil, ToggleLeft, Play, ArchiveX, RefreshCw, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { schedulingApi, Schedule } from '../services/scheduling';
import { machinesApi, Machine } from '../services/machines';
import { catalogsApi, MaintenanceType } from '../services/catalogs';
import { useToast } from '../components/ui/toast';
import { MobileCard, MobileRow, MobileBadgeRow } from '../components/ui/mobile-card';
import { todayInputDate } from '../utils/date';

export function SchedulingPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadSchedules();
    loadMachines();
    loadMaintenanceTypes();
  }, [currentPage, search, frequencyFilter, activeFilter, showInactive]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await schedulingApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        frequency: frequencyFilter || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter === 'true',
        includeDeleted: showInactive,
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
    if (!confirm('¿Estás seguro de desactivar esta programación? Podrás reactivarla más tarde.')) return;

    try {
      await schedulingApi.delete(id);
      toast('success', 'Programación desactivada correctamente');
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al desactivar programación');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await schedulingApi.restore(id);
      toast('success', 'Programación reactivada correctamente');
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al reactivar programación');
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
        ) : schedules.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">No se encontraron programaciones</div>
        ) : (
          schedules.map((schedule) => (
            <MobileCard key={schedule.id} inactive={!!schedule.deletedAt}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base">{schedule.machine?.name}</div>
                  <div className="text-sm text-gray-500">{schedule.machine?.code}</div>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full shrink-0 ${
                  schedule.deletedAt ? 'bg-gray-100 text-gray-800' : schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {schedule.deletedAt ? 'Eliminado' : schedule.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <MobileRow label="Tipo">{schedule.maintenanceType?.name || '-'}</MobileRow>
              <MobileRow label="Categoría">
                {schedule.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}
              </MobileRow>
              <MobileBadgeRow label="Frecuencia">
                <span className="flex items-center gap-2">
                  {getFrequencyBadge(schedule.frequency)}
                  <span className="text-sm text-gray-600">Cada {schedule.interval}</span>
                </span>
              </MobileBadgeRow>
              <MobileRow label="Próx. ejecución">{new Date(schedule.nextExecution).toLocaleDateString()}</MobileRow>
              <div className="mt-2 flex flex-wrap gap-2">
                {canEdit && schedule.deletedAt && (
                  <button
                    onClick={() => handleRestore(schedule.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg"
                  >
                    <RefreshCw size={15} /> Reactivar
                  </button>
                )}
                {canEdit && !schedule.deletedAt && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsFormOpen(true);
                      }}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg"
                    >
                      <Pencil size={15} /> Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(schedule)}
                      className={`flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg ${
                        schedule.isActive ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                      }`}
                    >
                      <ToggleLeft size={15} /> {schedule.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleExecute(schedule)}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                    >
                      <Play size={15} /> Ejecutar
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                    >
                      <ArchiveX size={15} /> Desactivar
                    </button>
                  </>
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
        ) : schedules.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron programaciones</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Máquina</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Frecuencia</th>
                <th className="px-6 py-3">Próxima Ejecución</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className={`${schedule.deletedAt ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{schedule.machine?.code}</div>
                    <div className="text-sm text-gray-500">{schedule.machine?.name}</div>
                    {schedule.deletedAt && <div className="text-xs text-gray-500">Eliminado</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{schedule.maintenanceType?.name}</div>
                    <div className="text-sm text-gray-500">
                      {schedule.maintenanceType?.isPreventive ? 'Preventivo' : 'Correctivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getFrequencyBadge(schedule.frequency)}
                    <div className="text-sm text-gray-500">Cada {schedule.interval}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(schedule.nextExecution).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        schedule.deletedAt ? 'bg-gray-100 text-gray-800' : schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {schedule.deletedAt ? 'Eliminado' : schedule.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {canEdit && schedule.deletedAt ? (
                      <button
                        onClick={() => handleRestore(schedule.id)}
                        className="action-btn action-btn-success"
                      >
                        <RefreshCw size={15} />
                        Reactivar
                      </button>
                    ) : canEdit && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsFormOpen(true);
                          }}
                            className="action-btn action-btn-danger"
                          >
                            <Pencil size={15} />
                            Editar
                          </button>
                        <button
                          onClick={() => handleToggleActive(schedule)}
                          className={`${
                            schedule.isActive ? 'action-btn action-btn-warning' : 'action-btn action-btn-success'
                          }`}
                        >
                          <ToggleLeft size={15} />
                          {schedule.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleExecute(schedule)}
                          className="action-btn action-btn-info hidden sm:inline"
                        >
                          <Play size={15} />
                          Ejecutar
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="action-btn action-btn-danger hidden sm:inline"
                        >
                          <ArchiveX size={15} />
                          Desactivar
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
    startDate: schedule?.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : todayInputDate(),
    endDate: schedule?.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
    nextExecution: schedule?.nextExecution ? new Date(schedule.nextExecution).toISOString().split('T')[0] : todayInputDate(),
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {schedule ? 'Editar Programación' : 'Nueva Programación'}
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Máquina</label>
            <select
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Ejecución</label>
            <input
              type="date"
              value={formData.nextExecution}
              onChange={(e) => setFormData({ ...formData, nextExecution: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center min-h-[44px]">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
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
              disabled={isLoading}
              className="px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
