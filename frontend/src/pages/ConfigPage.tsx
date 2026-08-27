import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { usersApi, UserStats } from '../services/users';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemInfoCard />
        <UserStatsCard />
      </div>
    </div>
  );
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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await usersApi.getStats();
        setStats(data);
      } catch {
        // Ignore error
      }
    };
    loadStats();
  }, []);

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
