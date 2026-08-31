import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Bell,
  Calendar,
  MoreHorizontal,
  BarChart3,
  Users,
  FileText,
  BookOpen,
  Settings,
  User,
  Package,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const mainItems = [
  { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/machines', label: 'Máquinas', icon: Wrench, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/maintenances', label: 'Manten.', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/spare-parts', label: 'Repuestos', icon: Package, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/scheduling', label: 'Program.', icon: Calendar, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/alerts', label: 'Alertas', icon: Bell, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
];

const moreItems = [
  { path: '/reports', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'SUPERVISOR', 'VIEWER'] },
  { path: '/profile', label: 'Mi perfil', icon: User, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/users', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { path: '/audit', label: 'Auditoría', icon: FileText, roles: ['ADMIN'] },
  { path: '/catalogs', label: 'Catálogos', icon: BookOpen, roles: ['ADMIN'] },
  { path: '/config', label: 'Configuración', icon: Settings, roles: ['ADMIN'] },
];

export function MobileBottomNav() {
  const { user } = useAuthStore();
  const role = user?.role || 'VIEWER';
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const visible = mainItems.filter((item) => item.roles.includes(role));
  const visibleMore = moreItems.filter((item) => item.roles.includes(role));

  const goToMore = (path: string) => {
    setMoreOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {visible.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px] ${
                  isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px] ${
              moreOpen ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Más opciones"
          >
            <MoreHorizontal size={22} />
            Más
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-4 pt-3 pb-1 sticky top-0 bg-white">
              <h3 className="text-base font-semibold text-gray-900">Más opciones</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3">
              {visibleMore.map((item) => (
                <button
                  key={item.path}
                  onClick={() => goToMore(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  <item.icon size={20} className="text-red-600" />
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
