import { useState, useEffect } from 'react';
import { Pencil, ToggleLeft, Trash2, RefreshCw, X } from 'lucide-react';
import { usersApi, User } from '../services/users';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/toast';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { MobileCard, MobileRow } from '../components/ui/mobile-card';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [currentPage, search, roleFilter, showInactive]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAll({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        includeDeleted: showInactive,
      });
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.delete(id);
      setDeleteConfirm({ open: false, id: '' });
      toast('success', 'Usuario desactivado correctamente');
      loadUsers();
    } catch (err: any) {
      toast('error', err.message || 'Error al desactivar usuario');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await usersApi.restore(id);
      toast('success', 'Usuario reactivado correctamente');
      loadUsers();
    } catch (err: any) {
      toast('error', err.message || 'Error al reactivar usuario');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive });
      toast('success', `Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
      loadUsers();
    } catch (err: any) {
      toast('error', err.message || 'Error al actualizar usuario');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      SUPERVISOR: 'bg-red-100 text-red-800',
      TECHNICIAN: 'bg-green-100 text-green-800',
      VIEWER: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      SUPERVISOR: 'Supervisor',
      TECHNICIAN: 'Técnico',
      VIEWER: 'Visualizador',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[role] || 'bg-gray-100'}`}>
        {labels[role] || role}
      </span>
    );
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Nuevo Usuario
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
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="TECHNICIAN">Técnico</option>
            <option value="VIEWER">Visualizador</option>
          </select>
          <button
            onClick={() => {
              setSearch('');
              setRoleFilter('');
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
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">No se encontraron usuarios</div>
        ) : (
          users.map((user) => (
            <MobileCard key={user.id} inactive={!!user.deletedAt}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base">{user.name}</div>
                  <div className="text-sm text-gray-500 break-all">{user.email}</div>
                </div>
                {getRoleBadge(user.role)}
              </div>
              <MobileRow label="Estado">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.deletedAt ? 'bg-gray-100 text-gray-800' : user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.deletedAt ? 'Eliminado' : user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </MobileRow>
              <MobileRow label="Último acceso">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
              </MobileRow>
              {isAdmin && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.deletedAt ? (
                    <button
                      onClick={() => handleRestore(user.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg"
                    >
                      <RefreshCw size={15} /> Reactivar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsFormOpen(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg"
                      >
                        <Pencil size={15} /> Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg ${
                          user.isActive ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                        }`}
                      >
                        <ToggleLeft size={15} /> {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteConfirm({ open: true, id: user.id })}
                          className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                        >
                          <Trash2 size={15} /> Eliminar
                        </button>
                      )}
                    </>
                  )}
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
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No se encontraron usuarios</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Último Acceso</th>
                {isAdmin && (
                  <th className="px-6 py-3">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={`${user.deletedAt ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <div>{user.name}</div>
                    {user.deletedAt && <div className="text-xs text-gray-500">Inactivo</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.deletedAt ? 'bg-gray-100 text-gray-800' : user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.deletedAt ? 'Eliminado' : user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'Nunca'}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-2">
                      {user.deletedAt ? (
                        <button
                          onClick={() => handleRestore(user.id)}
                          className="action-btn action-btn-success"
                        >
                          <RefreshCw size={15} />
                          Reactivar
                        </button>
                      ) : (
                      <>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsFormOpen(true);
                        }}
                        className="action-btn action-btn-danger"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`${
                          user.isActive ? 'action-btn action-btn-warning' : 'action-btn action-btn-success'
                        }`}
                      >
                        <ToggleLeft size={15} />
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteConfirm({ open: true, id: user.id })}
                          className="action-btn action-btn-danger"
                        >
                          <Trash2 size={15} />
                          Eliminar
                        </button>
                      )}
                      </>
                      )}
                      </div>
                    </td>
                  )}
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

      {/* User Form Modal */}
      {isFormOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
            toast('success', selectedUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            loadUsers();
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Desactivar usuario"
        message="¿Estás seguro de desactivar este usuario? Podrás reactivarlo más tarde."
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: '' })}
      />
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSave,
}: {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'VIEWER',
    isActive: user?.isActive ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Update
        await usersApi.update(user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role as any,
          isActive: formData.isActive,
        });
      } else {
        // Create
        if (!formData.password) {
          setError('La contraseña es requerida para nuevos usuarios');
          setIsLoading(false);
          return;
        }
        await usersApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role as any,
        });
      }
      onSave();
    } catch (err: any) {
      const fieldErrors = Array.isArray(err?.errors)
        ? err.errors.map((e: any) => e?.message).filter(Boolean)
        : [];
      setError(
        fieldErrors.length
          ? fieldErrors.join(' · ')
          : err.message || 'Error al guardar usuario'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
              required
            />
          </div>

          {!user && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                required={!user}
                minLength={6}
              />
              {!user && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 6 caracteres.
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
            >
              <option value="ADMIN">Administrador</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="TECHNICIAN">Técnico</option>
              <option value="VIEWER">Visualizador</option>
            </select>
          </div>

          {user && (
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
