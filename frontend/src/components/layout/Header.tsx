import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu, Check, CheckCheck, AlertTriangle, AlertCircle, Info, X, ChevronDown, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { alertsApi, Alert } from '@/services/alerts';

interface HeaderProps {
  onMenuToggle: () => void;
}

const severityConfig: Record<string, { icon: typeof Bell; color: string }> = {
  CRITICAL: { icon: AlertCircle, color: 'text-red-600' },
  HIGH: { icon: AlertTriangle, color: 'text-orange-500' },
  MEDIUM: { icon: Info, color: 'text-yellow-500' },
  LOW: { icon: Info, color: 'text-blue-500' },
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador',
};

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const stats = await alertsApi.getStats();
      setUnreadCount(stats.unread);
    } catch {
      // silently fail
    }
  }, []);

  const fetchRecentAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await alertsApi.getAll({ isRead: false, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      setRecentAlerts(result.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchRecentAlerts();
    }
  }, [isOpen, fetchRecentAlerts]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (isOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, profileOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      setRecentAlerts((prev) => prev.filter((a) => a.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      setRecentAlerts([]);
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <input
            type="text"
            placeholder="Buscar..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full max-w-[200px] md:w-64"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <Button
              ref={bellRef}
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-sm">Notificaciones</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        Marcar todo
                      </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent mb-2"></div>
                      <div>Cargando...</div>
                    </div>
                  ) : recentAlerts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                      {unreadCount === 0 ? 'No hay notificaciones nuevas' : 'Todas las notificaciones leídas'}
                    </div>
                  ) : (
                    recentAlerts.map((alert) => {
                      const sev = severityConfig[alert.severity] || severityConfig.LOW;
                      const SevIcon = sev.icon;
                      return (
                        <div
                          key={alert.id}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-start gap-3 transition-colors"
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${sev.color}`}>
                            <SevIcon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 line-clamp-2">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{alert.machine?.code}</span>
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(alert.id);
                            }}
                            className="text-gray-400 hover:text-green-600 flex-shrink-0 mt-0.5"
                            title="Marcar como leída"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/alerts');
                    }}
                    className="w-full text-center text-sm text-red-600 hover:text-red-800 font-medium py-1"
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name ? getInitials(user.name) : <User size={16} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 leading-tight">{roleLabels[user?.role || ''] || user?.role}</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name ? getInitials(user.name) : <User size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={16} className="text-gray-400" />
                    Mi perfil
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/config');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Configuración
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
