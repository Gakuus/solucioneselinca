import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Save, Key, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/toast';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador',
};

const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  SUPERVISOR: 'bg-blue-100 text-blue-800',
  TECHNICIAN: 'bg-green-100 text-green-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

export function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (!name.trim()) {
      setProfileError('El nombre es requerido');
      return;
    }
    if (!email.trim()) {
      setProfileError('El email es requerido');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      toast('success', 'Perfil actualizado correctamente');
    } catch (err: any) {
      const msg = err.message || 'Error al actualizar el perfil';
      setProfileError(msg);
      toast('error', msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseña actual');
      return;
    }
    if (!newPassword) {
      setPasswordError('Ingresa la nueva contraseña');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast('success', 'Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.message || 'Error al cambiar la contraseña';
      setPasswordError(msg);
      toast('error', msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Gestiona tu información personal y contraseña</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Avatar + Info Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.name ? getInitials(user.name) : <User size={28} />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[user?.role || ''] || 'bg-gray-100 text-gray-800'}`}>
                <Shield size={10} className="inline mr-1" />
                {roleLabels[user?.role || ''] || user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Información personal</h3>

          {profileError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              {profileError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 pt-2">
              <Calendar size={14} />
              <span>Miembro desde {user?.role ? new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : ''}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isSavingProfile ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save size={16} />
              )}
              {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Key size={16} className="text-gray-500" />
            Cambiar contraseña
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="p-6">
          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-400">
                Mínimo 8 caracteres con 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isSavingPassword ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Key size={16} />
              )}
              {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
