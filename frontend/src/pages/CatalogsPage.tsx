import { useState, useEffect } from 'react';
import { Pencil, ArchiveX, RefreshCw, X } from 'lucide-react';
import { catalogsApi, MachineType, MaintenanceType } from '../services/catalogs';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/toast';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export function CatalogsPage() {
  const [activeTab, setActiveTab] = useState<'machine-types' | 'maintenance-types'>('machine-types');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Catálogos</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-12">
            No tienes permisos para acceder a los catálogos del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Catálogos</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('machine-types')}
              className={`border-b-2 py-4 text-sm font-medium ${
                activeTab === 'machine-types'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tipos de Máquina
            </button>
            <button
              onClick={() => setActiveTab('maintenance-types')}
              className={`border-b-2 py-4 text-sm font-medium ${
                activeTab === 'maintenance-types'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tipos de Mantenimiento
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'machine-types' && <MachineTypesTab />}
          {activeTab === 'maintenance-types' && <MaintenanceTypesTab />}
        </div>
      </div>
    </div>
  );
}

function MachineTypesTab() {
  const [types, setTypes] = useState<MachineType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MachineType | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadTypes();
  }, [showInactive]);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const data = await catalogsApi.getMachineTypes(showInactive);
      setTypes(data);
    } catch (error) {
      console.error('Error loading machine types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await catalogsApi.deleteMachineType(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Tipo de máquina desactivado correctamente');
      loadTypes();
    } catch (error: any) {
      toast('error', error.message || 'Error al desactivar');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await catalogsApi.restoreMachineType(id);
      toast('success', 'Tipo de máquina reactivado correctamente');
      loadTypes();
    } catch (error: any) {
      toast('error', error.message || 'Error al reactivar');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tipos de Máquina</h2>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            Mostrar inactivos
          </label>
          <button
            onClick={() => {
              setSelectedType(null);
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Nuevo Tipo
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : types.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay tipos de máquina registrados</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Máquinas</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} className={`${type.deletedAt ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {type.name}
                    {type.deletedAt && <div className="text-xs text-gray-500">Inactivo</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type._count?.machines || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        type.deletedAt ? 'bg-gray-100 text-gray-800' : type.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {type.deletedAt ? 'Eliminado' : type.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type.deletedAt ? (
                      <button
                        onClick={() => handleRestore(type.id)}
                          className="action-btn action-btn-success"
                        >
                          <RefreshCw size={15} />
                          Reactivar
                        </button>
                    ) : (
                      <>
                      <button
                        onClick={() => {
                          setSelectedType(type);
                          setIsFormOpen(true);
                        }}
                          className="action-btn action-btn-danger mr-3"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: type.id })}
                          className="action-btn action-btn-danger"
                        >
                          <ArchiveX size={15} />
                          Desactivar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <MachineTypeFormModal
          type={selectedType}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedType(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedType(null);
            toast('success', selectedType ? 'Tipo actualizado correctamente' : 'Tipo creado correctamente');
            loadTypes();
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactivar tipo de máquina"
        message="¿Estás seguro de desactivar este tipo? Podrás reactivarlo más tarde."
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}

function MachineTypeFormModal({
  type,
  onClose,
  onSave,
}: {
  type: MachineType | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: type?.name || '',
    description: type?.description || '',
    isActive: type?.isActive ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (type) {
        await catalogsApi.updateMachineType(type.id, formData);
      } else {
        await catalogsApi.createMachineType(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {type ? 'Editar Tipo' : 'Nuevo Tipo de Máquina'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              rows={3}
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

function MaintenanceTypesTab() {
  const [types, setTypes] = useState<MaintenanceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MaintenanceType | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadTypes();
  }, [showInactive]);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const data = await catalogsApi.getMaintenanceTypes(showInactive);
      setTypes(data);
    } catch (error) {
      console.error('Error loading maintenance types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await catalogsApi.deleteMaintenanceType(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Tipo de mantenimiento desactivado correctamente');
      loadTypes();
    } catch (error: any) {
      toast('error', error.message || 'Error al desactivar');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await catalogsApi.restoreMaintenanceType(id);
      toast('success', 'Tipo de mantenimiento reactivado correctamente');
      loadTypes();
    } catch (error: any) {
      toast('error', error.message || 'Error al reactivar');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tipos de Mantenimiento</h2>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            Mostrar inactivos
          </label>
          <button
            onClick={() => {
              setSelectedType(null);
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Nuevo Tipo
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : types.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay tipos de mantenimiento registrados</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Horas Est.</th>
                <th className="px-6 py-3">Mantenimientos</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} className={`${type.deletedAt ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {type.name}
                    {type.deletedAt && <div className="text-xs text-gray-500">Inactivo</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        type.isPreventive ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {type.isPreventive ? 'Preventivo' : 'Correctivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type.estimatedHours || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type._count?.maintenances || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type.deletedAt ? (
                      <button
                        onClick={() => handleRestore(type.id)}
                          className="action-btn action-btn-success"
                        >
                          <RefreshCw size={15} />
                          Reactivar
                        </button>
                    ) : (
                      <>
                      <button
                        onClick={() => {
                          setSelectedType(type);
                          setIsFormOpen(true);
                        }}
                          className="action-btn action-btn-danger mr-3"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: type.id })}
                          className="action-btn action-btn-danger"
                        >
                          <ArchiveX size={15} />
                          Desactivar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <MaintenanceTypeFormModal
          type={selectedType}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedType(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedType(null);
            toast('success', selectedType ? 'Tipo actualizado correctamente' : 'Tipo creado correctamente');
            loadTypes();
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactivar tipo de mantenimiento"
        message="¿Estás seguro de desactivar este tipo? Podrás reactivarlo más tarde."
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}

function MaintenanceTypeFormModal({
  type,
  onClose,
  onSave,
}: {
  type: MaintenanceType | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: type?.name || '',
    description: type?.description || '',
    isPreventive: type?.isPreventive ?? true,
    estimatedHours: type?.estimatedHours || '',
    isActive: type?.isActive ?? true,
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
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
      };

      if (type) {
        await catalogsApi.updateMaintenanceType(type.id, data);
      } else {
        await catalogsApi.createMaintenanceType(data as any);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {type ? 'Editar Tipo' : 'Nuevo Tipo de Mantenimiento'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={formData.isPreventive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isPreventive: e.target.value === 'true' })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
            >
              <option value="true">Preventivo</option>
              <option value="false">Correctivo</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
              min="0"
              step="0.5"
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
