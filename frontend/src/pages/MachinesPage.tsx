import { useState, useEffect } from 'react';
import { machinesApi, Machine, MachineType } from '../services/machines';
import { useAuthStore } from '../stores/authStore';

export function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadMachines();
    loadMachineTypes();
  }, [currentPage, search, statusFilter, typeFilter]);

  const loadMachines = async () => {
    try {
      setIsLoading(true);
      const response = await machinesApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        machineTypeId: typeFilter || undefined,
      });
      setMachines(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar máquinas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMachineTypes = async () => {
    try {
      const types = await machinesApi.getTypes();
      setMachineTypes(types);
    } catch {
      // Ignore error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta máquina?')) return;

    try {
      await machinesApi.delete(id);
      loadMachines();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar máquina');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await machinesApi.exportCSV({
        search: search || undefined,
        status: statusFilter || undefined,
        machineTypeId: typeFilter || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'maquinas.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar');
    }
  };

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!selectedMachine) return;

    try {
      await machinesApi.changeStatus(selectedMachine.id, newStatus, reason);
      setIsStatusModalOpen(false);
      setSelectedMachine(null);
      loadMachines();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      IN_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      DECOMMISSIONED: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      IN_MAINTENANCE: 'Mantenimiento',
      DECOMMISSIONED: 'Retirada',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Máquinas</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Exportar CSV
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setSelectedMachine(null);
                alert('Formulario de creación no disponible aún');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              + Nueva Máquina
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por código, nombre, marca..."
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
            <option value="ACTIVE">Activa</option>
            <option value="INACTIVE">Inactiva</option>
            <option value="IN_MAINTENANCE">Mantenimiento</option>
            <option value="DECOMMISSIONED">Retirada</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los tipos</option>
            {machineTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setTypeFilter('');
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
        ) : machines.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron máquinas</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{machine.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{machine.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{machine.machineType?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{machine.brand || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(machine.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-red-600 hover:text-red-900 mr-3">Ver</button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedMachine(machine);
                            alert('Formulario de edición no disponible aún');
                          }}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMachine(machine);
                            setIsStatusModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Estado
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(machine.id)}
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
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
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
                      className={`px-3 py-1 border rounded ${
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

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedMachine && (
        <StatusChangeModal
          machine={selectedMachine}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedMachine(null);
          }}
          onChange={handleStatusChange}
        />
      )}
    </div>
  );
}

function StatusChangeModal({
  machine,
  onClose,
  onChange,
}: {
  machine: Machine;
  onClose: () => void;
  onChange: (status: string, reason?: string) => void;
}) {
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');

  const VALID_TRANSITIONS: Record<string, string[]> = {
    ACTIVE: ['INACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED'],
    INACTIVE: ['ACTIVE'],
    IN_MAINTENANCE: ['ACTIVE', 'INACTIVE'],
    DECOMMISSIONED: [],
  };

  const allowedTransitions = VALID_TRANSITIONS[machine.status] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(status, reason || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-semibold mb-4">Cambiar Estado</h2>
        <p className="text-sm text-gray-600 mb-4">
          Máquina: {machine.code} - {machine.name}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Estado actual: <span className="font-medium">{machine.status}</span>
        </p>

        {allowedTransitions.length === 0 ? (
          <p className="text-red-600 mb-4">
            Este máquina está en estado final y no puede cambiar de estado.
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Seleccionar estado</option>
                {allowedTransitions.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ACTIVE' ? 'Activa' : s === 'INACTIVE' ? 'Inactiva' : s === 'IN_MAINTENANCE' ? 'Mantenimiento' : 'Retirada'}
                  </option>
                ))}
              </select>
            </div>

            {status === 'DECOMMISSIONED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (obligatorio)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  required
                />
              </div>
            )}

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
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
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
