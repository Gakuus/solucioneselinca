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
  BookOpen 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/machines', label: 'Máquinas', icon: Wrench, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
  { path: '/maintenances', label: 'Mantenimientos', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER'] },
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
    <aside className="bg-black text-white w-64 flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Soluciones ELINCA</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
