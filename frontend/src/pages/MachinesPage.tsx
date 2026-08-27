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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    loadMachines();
    loadMachineTypes();
  }, [currentPage, search, statusFilter]);

  const loadMachines = async () => {
    try {
      setIsLoading(true);
      const response = await machinesApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      RETIRED: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      MAINTENANCE: 'Mantenimiento',
      RETIRED: 'Retirada',
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Máquinas</h1>
        {canEdit && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Nueva Máquina
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por código, nombre o marca..."
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
            <option value="ACTIVE">Activa</option>
            <option value="INACTIVE">Inactiva</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="RETIRED">Retirada</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            {machineTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : machines.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron máquinas</div>
        ) : (
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
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                    {canEdit && (
                      <button className="text-gray-600 hover:text-gray-900 mr-3">Editar</button>
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
