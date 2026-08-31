export const MAINTENANCE_STATUS: Record<string, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const MACHINE_STATUS: Record<string, string> = {
  ACTIVE: 'Activa',
  IN_MAINTENANCE: 'En Mantenimiento',
  INACTIVE: 'Inactiva',
  DECOMMISSIONED: 'Decomisionada',
};

export const MACHINE_TYPE: Record<string, string> = {
  FIXED: 'Fija',
  MOBILE: 'Móvil',
  PORTABLE: 'Portátil',
  VEHICLE: 'Vehículo',
};

export const MAINTENANCE_CATEGORY: Record<string, string> = {
  PREVENTIVE: 'Preventivo',
  CORRECTIVE: 'Correctivo',
};

export const ALERT_TYPE: Record<string, string> = {
  UPCOMING: 'Próximo',
  OVERDUE: 'Vencido',
  CUSTOM: 'Personalizado',
};

export const ALERT_SEVERITY: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const MAINTENANCE_FREQUENCY: Record<string, string> = {
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
};

export const AUDIT_ACTION: Record<string, string> = {
  CREATE: 'Crear',
  UPDATE: 'Actualizar',
  DELETE: 'Eliminar',
  LOGIN: 'Iniciar sesión',
  LOGOUT: 'Cerrar sesión',
};

export const USER_ROLE: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECHNICIAN: 'Técnico',
  VIEWER: 'Espectador',
};

export function label(map: Record<string, string>, value?: string | null): string {
  if (!value) return '-';
  return map[value] || value;
}
