import { NavLink } from 'react-router-dom';
import { X,
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || 'VIEWER';

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = () => {
    onClose();
  };

  return (
    <aside className={`
      bg-black text-white w-64 flex-shrink-0
      fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
      lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-bold">SOLUCIONES <span className="text-red-500">EL INCA</span></h1>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={handleNavClick}
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
