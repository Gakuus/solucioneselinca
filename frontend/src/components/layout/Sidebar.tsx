import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Calendar,
  BarChart3,
  Bell,
  Users,
  FileText,
  Settings,
  BookOpen,
  Package
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/machines', label: 'Máquinas', icon: Wrench, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/maintenances', label: 'Mantenimientos', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/spare-parts', label: 'Repuestos', icon: Package, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/scheduling', label: 'Programación', icon: Calendar, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/reports', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'SUPERVISOR', 'VIEWER'] },
  { path: '/alerts', label: 'Alertas', icon: Bell, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/users', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { path: '/audit', label: 'Auditoría', icon: FileText, roles: ['ADMIN'] },
  { path: '/catalogs', label: 'Catálogos', icon: BookOpen, roles: ['ADMIN'] },
  { path: '/config', label: 'Configuración', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const userRole = user?.role || 'VIEWER';

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={`
      relative
      hidden lg:flex flex-col
      w-64 flex-shrink-0 overflow-hidden
      text-white
      bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
    `}>
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 bg-red-600/20 blur-3xl rounded-full" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 -left-10 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full" aria-hidden />

      <div className="relative p-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          SOLUCIONES{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            EL INCA
          </span>
        </h1>
      </div>

      <nav className="relative p-3 pb-8">
        <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Menú
        </p>
        <ul className="space-y-1">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 min-h-[48px] px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-gradient-to-b from-red-400 to-orange-400" />
                    )}
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/15'
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={20} />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
