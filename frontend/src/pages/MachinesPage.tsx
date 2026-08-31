import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, ToggleLeft, ArchiveX, RefreshCw, X, Upload, FileText } from 'lucide-react';
import { machinesApi, Machine, MachineType } from '../services/machines';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/toast';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { MobileCard, MobileRow } from '../components/ui/mobile-card';
import { MACHINE_STATUS, label } from '../utils/labels';

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function MachinesPage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadMachines();
    loadMachineTypes();
  }, [currentPage, search, statusFilter, typeFilter, showInactive]);

  const loadMachines = async () => {
    try {
      setIsLoading(true);
      const response = await machinesApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        machineTypeId: typeFilter || undefined,
        includeDeleted: showInactive,
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
    try {
      await machinesApi.delete(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Máquina desactivada correctamente');
      loadMachines();
    } catch (err: any) {
      toast('error', err.message || 'Error al desactivar máquina');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await machinesApi.restore(id);
      toast('success', 'Máquina reactivada correctamente');
      loadMachines();
    } catch (err: any) {
      toast('error', err.message || 'Error al reactivar máquina');
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    try {
      const filters = {
        search: search || undefined,
        status: statusFilter || undefined,
        machineTypeId: typeFilter || undefined,
      };
      const blob =
        format === 'pdf'
          ? await machinesApi.exportPDF(filters)
          : await machinesApi.exportExcel(filters);
      downloadBlob(blob, format === 'pdf' ? 'maquinas.pdf' : 'maquinas.xlsx');
      toast('success', format === 'pdf' ? 'PDF exportado correctamente' : 'Excel exportado correctamente');
    } catch (err: any) {
      toast('error', err.message || 'Error al exportar');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const result = await machinesApi.importExcel(file);
      toast(
        'success',
        `Importación completada: ${result.imported} creadas, ${result.updated} actualizadas${result.errors.length ? `, ${result.errors.length} errores` : ''}`
      );
      if (result.errors.length > 0) {
        setError(result.errors.slice(0, 10).join(' • '));
      }
      setCurrentPage(1);
      loadMachines();
    } catch (err: any) {
      toast('error', err.message || 'Error al importar');
    }
  };

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!selectedMachine) return;

    try {
      await machinesApi.changeStatus(selectedMachine.id, newStatus, reason);
      setIsStatusModalOpen(false);
      setSelectedMachine(null);
      toast('success', 'Estado actualizado correctamente');
      loadMachines();
    } catch (err: any) {
      toast('error', err.message || 'Error al cambiar estado');
    }
  };

  const handleSave = async () => {
    setIsFormOpen(false);
    setSelectedMachine(null);
    loadMachines();
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
          {canEdit && (
            <>
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
                setSelectedMachine(null);
                setIsFormOpen(true);
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
        ) : machines.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">No se encontraron máquinas</div>
        ) : (
          machines.map((machine) => (
            <MobileCard key={machine.id} inactive={!!machine.deletedAt} onClick={() => navigate(`/machines/${machine.id}`)}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base">{machine.name}</div>
                  <div className="text-sm text-gray-500">{machine.code}</div>
                </div>
                {getStatusBadge(machine.status)}
              </div>
              <MobileRow label="Tipo">{machine.machineType?.name || '-'}</MobileRow>
              <MobileRow label="Marca">{machine.brand || '-'}</MobileRow>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/machines/${machine.id}`);
                  }}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg"
                >
                  <Eye size={15} /> Ver
                </button>
                {machine.deletedAt ? (
                  canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(machine.id);
                      }}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg"
                    >
                      <RefreshCw size={15} /> Reactivar
                    </button>
                  )
                ) : (
                  <>
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMachine(machine);
                          setIsFormOpen(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                      >
                        <Pencil size={15} /> Editar
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMachine(machine);
                          setIsStatusModalOpen(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg"
                      >
                        <ToggleLeft size={15} /> Estado
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ open: true, id: machine.id });
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                      >
                        <ArchiveX size={15} /> Desactivar
                      </button>
                    )}
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
        ) : machines.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron máquinas</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Máquina</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Marca</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id} className={`${machine.deletedAt ? 'opacity-50 bg-gray-100' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{machine.code}</div>
                    <div className="text-sm text-gray-500">{machine.name}</div>
                    {machine.deletedAt && (
                      <div className="text-xs text-gray-500">Inactiva</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{machine.machineType?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{machine.brand || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(machine.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                    <button
                      onClick={() => navigate(`/machines/${machine.id}`)}
                      className="action-btn action-btn-danger"
                    >
                      <Eye size={15} />
                      Ver
                    </button>
                    {machine.deletedAt ? (
                      canDelete && (
                        <button
                          onClick={() => handleRestore(machine.id)}
                          className="action-btn action-btn-success"
                        >
                          <RefreshCw size={15} />
                          Reactivar
                        </button>
                      )
                    ) : (
                    <>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedMachine(machine);
                            setIsFormOpen(true);
                          }}
                          className="action-btn action-btn-secondary"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMachine(machine);
                            setIsStatusModalOpen(true);
                          }}
                          className="action-btn action-btn-warning"
                        >
                          <ToggleLeft size={15} />
                          Estado
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: machine.id })}
                        className="action-btn action-btn-danger"
                      >
                        <ArchiveX size={15} />
                        Desactivar
                      </button>
                    )}
                    </>
                    )}
                    </div>
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
                className="relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 min-h-[44px]"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 min-h-[44px]"
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
        <MachineFormModal
          machine={selectedMachine}
          machineTypes={machineTypes}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedMachine(null);
          }}
          onSave={handleSave}
        />
      )}

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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactivar máquina"
        message="¿Estás seguro de desactivar esta máquina? Podrás reactivarla más tarde."
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}

function MachineFormModal({
  machine,
  machineTypes,
  onClose,
  onSave,
}: {
  machine: Machine | null;
  machineTypes: MachineType[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditing = !!machine;

  const [formData, setFormData] = useState({
    code: machine?.code || '',
    name: machine?.name || '',
    machineTypeId: machine?.machineTypeId || '',
    brand: machine?.brand || '',
    model: machine?.model || '',
    year: machine?.year?.toString() || '',
    serialNumber: machine?.serialNumber || '',
    status: (machine?.status || 'ACTIVE') as string,
    purchaseDate: machine?.purchaseDate ? machine.purchaseDate.split('T')[0] : '',
    warrantyExpiration: machine?.warrantyExpiration ? machine.warrantyExpiration.split('T')[0] : '',
    location: machine?.location || '',
    notes: machine?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        machineTypeId: formData.machineTypeId,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        serialNumber: formData.serialNumber || undefined,
        status: isEditing ? undefined : formData.status,
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiration: formData.warrantyExpiration || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      };

      if (isEditing) {
        await machinesApi.update(machine.id, payload);
      } else {
        await machinesApi.create(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-2xl sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Máquina' : 'Nueva Máquina'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: MQ-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Máquina *</label>
              <select
                value={formData.machineTypeId}
                onChange={(e) => setFormData({ ...formData, machineTypeId: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Seleccionar tipo</option>
                {machineTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Motoniveladora CAT 140K"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isEditing}
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
                <option value="IN_MAINTENANCE">Mantenimiento</option>
                <option value="DECOMMISSIONED">Retirada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Caterpillar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: 140K"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Serie</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: CAT0140K12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento de Garantía</label>
              <input
                type="date"
                value={formData.warrantyExpiration}
                onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Planta Norte"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto sm:max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cambiar Estado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Máquina: {machine.code} - {machine.name}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Estado actual: <span className="font-medium">{label(MACHINE_STATUS, machine.status)}</span>
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  required
                />
              </div>
            )}

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
