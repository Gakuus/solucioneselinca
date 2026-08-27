import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { usersApi, UserStats } from '../services/users';
import { configApi, SystemConfigItem } from '../services/config';
import { useToast } from '../components/ui/toast';

export function ConfigPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Configuración</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-12">
            No tienes permisos para acceder a la configuración del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemParametersCard />
        <div className="space-y-6">
          <SystemInfoCard />
          <UserStatsCard />
        </div>
      </div>
    </div>
  );
}

function SystemParametersCard() {
  const { toast } = useToast();
  const [items, setItems] = useState<SystemConfigItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await configApi.getAll();
        setItems(data);
        const initial: Record<string, string> = {};
        data.forEach((item) => {
          initial[item.key] = String(item.value);
        });
        setDrafts(initial);
      } catch {
        toast('error', 'No se pudieron cargar los parámetros del sistema');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleSave = async (key: string) => {
    const raw = drafts[key];
    const item = items.find((i) => i.key === key);
    if (!item) return;

    let parsed: unknown = raw;
    if (typeof item.value === 'number') {
      parsed = Number(raw);
      if (isNaN(parsed as number)) {
        toast('error', 'El valor debe ser un número');
        return;
      }
    }

    setSavingKey(key);
    try {
      const updated = await configApi.update(key, parsed);
      setItems((prev) => prev.map((i) => (i.key === key ? updated : i)));
      toast('success', `Parámetro "${key}" guardado`);
    } catch {
      toast('error', 'Error al guardar el parámetro');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Parámetros del Sistema</h2>

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay parámetros configurados.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="mb-2">
                <div className="text-sm font-semibold text-gray-800">
                  {formatKey(item.key)}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={typeof item.value === 'number' ? 'number' : 'text'}
                  value={drafts[item.key] ?? ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <button
                  onClick={() => handleSave(item.key)}
                  disabled={savingKey === item.key}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {savingKey === item.key ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function SystemInfoCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Información del Sistema</h2>
      <dl className="space-y-3">
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500">Versión</dt>
          <dd className="text-sm font-medium">1.0.0</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500">Entorno</dt>
          <dd className="text-sm font-medium">Desarrollo</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500">Backend</dt>
          <dd className="text-sm font-medium">Node.js + Express</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500">Base de Datos</dt>
          <dd className="text-sm font-medium">PostgreSQL 15</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500">Cache</dt>
          <dd className="text-sm font-medium">Redis 7</dd>
        </div>
      </dl>
    </div>
  );
}

function UserStatsCard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await usersApi.getStats();
        setStats(data);
      } catch {
        toast('error', 'No se pudieron cargar las estadísticas de usuarios');
      }
    };
    loadStats();
  }, [toast]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Resumen de Usuarios</h2>
      {stats ? (
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Total</dt>
            <dd className="text-sm font-medium">{stats.total}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Activos</dt>
            <dd className="text-sm font-medium text-green-600">{stats.active}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Inactivos</dt>
            <dd className="text-sm font-medium text-red-600">{stats.inactive}</dd>
          </div>
          {Object.entries(stats.byRole).map(([role, count]) => (
            <div key={role} className="flex justify-between">
              <dt className="text-sm text-gray-500">{role}</dt>
              <dd className="text-sm font-medium">{count}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">Cargando...</div>
      )}
    </div>
  );
}
