import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  RefreshCw,
  History,
  Package,
} from 'lucide-react';
import {
  sparePartsApi,
  SparePart,
  SparePartCategory,
  SparePartUnit,
  SparePartMovementType,
} from '../services/spareParts';
import { machinesApi, MachineType } from '../services/machines';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/toast';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { MobileCard, MobileRow } from '../components/ui/mobile-card';

const CATEGORIES: { value: SparePartCategory; label: string }[] = [
  { value: 'FILTER', label: 'Filtro' },
  { value: 'LUBRICANT', label: 'Lubricante / Aceite' },
  { value: 'HYDRAULIC', label: 'Hidráulico' },
  { value: 'ELECTRICAL', label: 'Eléctrico' },
  { value: 'MECHANICAL', label: 'Mecánico' },
  { value: 'TIRE', label: 'Llantas' },
  { value: 'CHEMICAL', label: 'Químico' },
  { value: 'OTHER', label: 'Otros' },
];

const UNITS: { value: SparePartUnit; label: string }[] = [
  { value: 'UNIT', label: 'Unidad' },
  { value: 'LITER', label: 'Litros (L)' },
  { value: 'KILOGRAM', label: 'Kilogramos (kg)' },
  { value: 'GALLON', label: 'Galones' },
  { value: 'METER', label: 'Metros (m)' },
  { value: 'PACK', label: 'Paquete' },
];

const MOVEMENT_LABELS: Record<SparePartMovementType, string> = {
  IN: 'Entrada',
  OUT: 'Salida',
  ADJUST: 'Ajuste',
};

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

function unitLabel(value: string) {
  return UNITS.find((u) => u.value === value)?.label || value;
}

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return '-';
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStockBadge(part: SparePart) {
  if (part.quantity <= 0) {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Agotado</span>;
  }
  if (part.minStock > 0 && part.quantity <= part.minStock) {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Stock bajo</span>;
  }
  return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>;
}

function MovementTypeBadge({ type }: { type: SparePartMovementType }) {
  const styles: Record<SparePartMovementType, string> = {
    IN: 'bg-green-100 text-green-800',
    OUT: 'bg-red-100 text-red-800',
    ADJUST: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[type]}`}>
      {MOVEMENT_LABELS[type]}
    </span>
  );
}

export function SparePartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [movementPart, setMovementPart] = useState<SparePart | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailPart, setDetailPart] = useState<SparePart | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadParts();
  }, [currentPage, search, categoryFilter, typeFilter, lowStock, showInactive]);

  useEffect(() => {
    loadMachineTypes();
  }, []);

  const loadParts = async () => {
    try {
      setIsLoading(true);
      const response = await sparePartsApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        category: (categoryFilter as SparePartCategory) || undefined,
        machineTypeId: typeFilter || undefined,
        lowStock: lowStock || undefined,
        includeDeleted: showInactive,
      });
      setParts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar repuestos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMachineTypes = async () => {
    try {
      const types = await machinesApi.getTypes();
      setMachineTypes(types);
    } catch {
      // ignore
    }
  };

  const openDetail = async (part: SparePart) => {
    try {
      const full = await sparePartsApi.getById(part.id);
      setDetailPart(full);
      setIsDetailOpen(true);
    } catch (err: any) {
      toast('error', err.message || 'Error al cargar repuesto');
    }
  };

  const openMovement = (part: SparePart) => {
    setMovementPart(part);
    setIsMovementOpen(true);
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedPart(null);
    loadParts();
  };

  const handleDelete = async (id: string) => {
    try {
      await sparePartsApi.delete(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Repuesto desactivado correctamente');
      loadParts();
    } catch (err: any) {
      toast('error', err.message || 'Error al desactivar repuesto');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await sparePartsApi.restore(id);
      toast('success', 'Repuesto reactivado correctamente');
      loadParts();
    } catch (err: any) {
      toast('error', err.message || 'Error al reactivar repuesto');
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR' || user?.role === 'TECHNICIAN';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Repuestos e Insumos</h1>
          <p className="text-sm text-gray-500 mt-1">Control de stock de repuestos, aceites y suministros</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedPart(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Plus size={16} />
            Nuevo Repuesto
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por código, nombre, proveedor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los tipos de máquina</option>
            {machineTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('');
              setTypeFilter('');
              setLowStock(false);
              setShowInactive(false);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => {
                setLowStock(e.target.checked);
                setCurrentPage(1);
              }}
              className="mr-2"
            />
            Solo stock bajo / agotado
          </label>
          <label className="inline-flex items-center text-sm text-gray-700">
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">Cargando...</div>
        ) : parts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">No se encontraron repuestos</div>
        ) : (
          parts.map((part) => (
            <MobileCard key={part.id} inactive={!!part.deletedAt} onClick={() => openDetail(part)}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base">{part.name}</div>
                  <div className="text-sm text-gray-500">
                    {part.code}
                    {part.machineType ? ` • ${part.machineType.name}` : ''}
                  </div>
                </div>
                {getStockBadge(part)}
              </div>
              <MobileRow label="Categoría">{categoryLabel(part.category)}</MobileRow>
              <MobileRow label="Stock">
                <span className="font-semibold">
                  {part.quantity.toLocaleString('es-PE')} {unitLabel(part.unit)}
                </span>
                {part.minStock > 0 && (
                  <span className="text-gray-500"> (mín. {part.minStock.toLocaleString('es-PE')})</span>
                )}
              </MobileRow>
              <MobileRow label="Costo unit.">{formatCurrency(part.unitCost)}</MobileRow>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetail(part);
                  }}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg"
                >
                  <History size={15} /> Historial
                </button>
                {part.deletedAt ? (
                  canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(part.id);
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
                          openMovement(part);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                      >
                        <SlidersHorizontal size={15} /> Movimiento
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPart(part);
                          setIsFormOpen(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg"
                      >
                        <Pencil size={15} /> Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ open: true, id: part.id });
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg"
                      >
                        <X size={15} /> Eliminar
                      </button>
                    )}
                  </>
                )}
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Para máquina</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo unit.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500">No se encontraron repuestos</td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{part.name}</div>
                      <div className="text-sm text-gray-500">{part.code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{categoryLabel(part.category)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{part.machineType?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="font-semibold">{part.quantity.toLocaleString('es-PE')}</span>{' '}
                      {unitLabel(part.unit)}
                      {part.minStock > 0 && (
                        <span className="text-gray-500"> (mín. {part.minStock.toLocaleString('es-PE')})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(part.unitCost)}</td>
                    <td className="px-6 py-4">{getStockBadge(part)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openDetail(part)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Ver historial"
                        >
                          <History size={16} />
                        </button>
                        {part.deletedAt ? (
                          canDelete && (
                            <button
                              onClick={() => handleRestore(part.id)}
                              className="p-2 text-green-600 hover:text-green-800"
                              title="Reactivar"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )
                        ) : (
                          <>
                            {canEdit && (
                              <button
                                onClick={() => openMovement(part)}
                                className="p-2 text-blue-600 hover:text-blue-800"
                                title="Registrar movimiento"
                              >
                                <SlidersHorizontal size={16} />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setSelectedPart(part);
                                  setIsFormOpen(true);
                                }}
                                className="p-2 text-yellow-600 hover:text-yellow-800"
                                title="Editar"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteConfirm({ open: true, id: part.id })}
                                className="p-2 text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {isFormOpen && (
        <SparePartFormModal
          part={selectedPart}
          machineTypes={machineTypes}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedPart(null);
          }}
          onSave={handleSave}
        />
      )}

      {isMovementOpen && movementPart && (
        <MovementModal
          part={movementPart}
          onClose={() => {
            setIsMovementOpen(false);
            setMovementPart(null);
          }}
          onSaved={() => {
            setIsMovementOpen(false);
            setMovementPart(null);
            loadParts();
          }}
        />
      )}

      {isDetailOpen && detailPart && (
        <DetailModal
          part={detailPart}
          onClose={() => {
            setIsDetailOpen(false);
            setDetailPart(null);
          }}
          onMovement={() => {
            setIsDetailOpen(false);
            setDetailPart(null);
            openMovement(detailPart);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactivar repuesto"
        message="¿Estás seguro de que deseas desactivar este repuesto? Podrás reactivarlo después."
        confirmLabel="Desactivar"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}

function SparePartFormModal({
  part,
  machineTypes,
  onClose,
  onSave,
}: {
  part: SparePart | null;
  machineTypes: MachineType[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditing = !!part;

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: SparePartCategory;
    unit: SparePartUnit;
    quantity: string;
    minStock: string;
    unitCost: string;
    supplier: string;
    location: string;
    machineTypeId: string;
    description: string;
  }>({
    code: part?.code || '',
    name: part?.name || '',
    category: (part?.category || 'OTHER') as SparePartCategory,
    unit: (part?.unit || 'UNIT') as SparePartUnit,
    quantity: part?.quantity?.toString() || '0',
    minStock: part?.minStock?.toString() || '0',
    unitCost: part?.unitCost !== undefined && part?.unitCost !== null ? part.unitCost.toString() : '',
    supplier: part?.supplier || '',
    location: part?.location || '',
    machineTypeId: part?.machineTypeId || '',
    description: part?.description || '',
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
        category: formData.category as SparePartCategory,
        unit: formData.unit as SparePartUnit,
        quantity: parseFloat(formData.quantity) || 0,
        minStock: parseFloat(formData.minStock) || 0,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        supplier: formData.supplier || null,
        location: formData.location || null,
        machineTypeId: formData.machineTypeId || null,
        description: formData.description || null,
      };

      if (isEditing) {
        await sparePartsApi.update(part.id, payload);
      } else {
        await sparePartsApi.create(payload);
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
            <span className="inline-flex items-center gap-2">
              <Package size={20} className="text-red-600" />
              {isEditing ? 'Editar Repuesto' : 'Nuevo Repuesto'}
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
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
                placeholder="Ej: RPT-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Aceite hidráulico 68"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SparePartCategory })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as SparePartUnit })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad en stock</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo (alerta)</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="any"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario</label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="any"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de máquina (si es específico)</label>
              <select
                value={formData.machineTypeId}
                onChange={(e) => setFormData({ ...formData, machineTypeId: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Aplica a todas / general</option>
                {machineTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Repuestos SAC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación en almacén</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Estante A-1"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>

          {!isEditing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
              Después de crear el repuesto podrás registrar entradas / salidas de stock desde el historial.
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
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

function MovementModal({
  part,
  onClose,
  onSaved,
}: {
  part: SparePart;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<SparePartMovementType>('IN');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState(part.unitCost ? part.unitCost.toString() : '');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await sparePartsApi.addMovement(part.id, {
        type,
        quantity: parseFloat(quantity),
        unitCost: unitCost ? parseFloat(unitCost) : null,
        notes: notes || null,
      });
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error al registrar movimiento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Registrar Movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="font-medium text-gray-900">{part.name}</div>
          <div className="text-sm text-gray-500">
            {part.code} — Stock actual:{' '}
            <span className="font-semibold">
              {part.quantity.toLocaleString('es-PE')} {unitLabel(part.unit)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['IN', 'OUT', 'ADJUST'] as SparePartMovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border text-sm font-medium min-h-[44px] ${
                    type === t
                      ? t === 'IN'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : t === 'OUT'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'IN' ? <ArrowDownToLine size={18} /> : t === 'OUT' ? <ArrowUpFromLine size={18} /> : <SlidersHorizontal size={18} />}
                  {MOVEMENT_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad ({unitLabel(part.unit)}) *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0.0001"
                step="any"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario</label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="any"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Motivo</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
              placeholder={
                type === 'IN'
                  ? 'Ej: Compra a proveedor, devolución'
                  : type === 'OUT'
                  ? 'Ej: Usado en mantenimiento MQ-001'
                  : 'Ej: Corrección de conteo'
              }
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
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
              {isSaving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({
  part,
  onClose,
  onMovement,
}: {
  part: SparePart;
  onClose: () => void;
  onMovement: () => void;
}) {
  const { user } = useAuthStore();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR' || user?.role === 'TECHNICIAN';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-2xl sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Historial del Repuesto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-gray-900 text-lg">{part.name}</div>
              <div className="text-sm text-gray-500">{part.code}</div>
            </div>
            {getStockBadge(part)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Categoría: </span>
              <span className="font-medium">{categoryLabel(part.category)}</span>
            </div>
            <div>
              <span className="text-gray-500">Stock: </span>
              <span className="font-semibold">
                {part.quantity.toLocaleString('es-PE')} {unitLabel(part.unit)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Mínimo: </span>
              <span className="font-medium">
                {part.minStock.toLocaleString('es-PE')} {unitLabel(part.unit)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Costo unit.: </span>
              <span className="font-medium">{formatCurrency(part.unitCost)}</span>
            </div>
            <div>
              <span className="text-gray-500">Proveedor: </span>
              <span className="font-medium">{part.supplier || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">Para máquina: </span>
              <span className="font-medium">{part.machineType?.name || 'General'}</span>
            </div>
            {part.location && (
              <div>
                <span className="text-gray-500">Ubicación: </span>
                <span className="font-medium">{part.location}</span>
              </div>
            )}
          </div>
          {part.description && <div className="mt-2 text-sm text-gray-600">{part.description}</div>}
        </div>

        {canEdit && (
          <div className="mb-4">
            <button
              onClick={onMovement}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 min-h-[44px]"
            >
              <SlidersHorizontal size={16} />
              Registrar Entrada / Salida
            </button>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Movimientos recientes</h3>
          {!part.movements || part.movements.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md text-sm">
              Sin movimientos registrados
            </div>
          ) : (
            <div className="space-y-2">
              {part.movements.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">
                      {m.type === 'IN' ? (
                        <ArrowDownToLine size={16} className="text-green-600" />
                      ) : m.type === 'OUT' ? (
                        <ArrowUpFromLine size={16} className="text-red-600" />
                      ) : (
                        <SlidersHorizontal size={16} className="text-blue-600" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <MovementTypeBadge type={m.type} />
                        <span className="text-sm font-medium text-gray-900">
                          {m.type === 'ADJUST'
                            ? `Se fijó en ${m.quantity.toLocaleString('es-PE')}`
                            : `${m.type === 'IN' ? '+' : '-'}${m.quantity.toLocaleString('es-PE')} ${unitLabel(part.unit)}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(m.createdAt)} {m.user ? `por ${m.user.name}` : ''}
                      </div>
                      {m.notes && <div className="text-xs text-gray-600 mt-1">{m.notes}</div>}
                      {m.unitCost !== null && m.unitCost !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">Costo unit: {formatCurrency(m.unitCost)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
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
