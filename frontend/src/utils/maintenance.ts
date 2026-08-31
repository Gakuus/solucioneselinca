export interface MaintenanceTypeLike {
  id: string;
  name: string;
  isPreventive?: boolean;
}

export function maintenanceTypesLabel(m: {
  maintenanceType?: MaintenanceTypeLike | null;
  typeAssignments?: { order: number; maintenanceType: MaintenanceTypeLike }[] | null;
}): string {
  if (m.typeAssignments && m.typeAssignments.length > 0) {
    const sorted = [...m.typeAssignments].sort((a, b) => a.order - b.order);
    const names = sorted.map((a) => a.maintenanceType?.name).filter((n): n is string => !!n);
    if (names.length > 0) return names.join(' + ');
  }
  return m.maintenanceType?.name || '-';
}

export function maintenanceTechniciansLabel(m: {
  technician?: { name?: string | null; email?: string | null } | null;
  technicianAssignments?: { order: number; technician: { name?: string | null } }[] | null;
}): string {
  if (m.technicianAssignments && m.technicianAssignments.length > 0) {
    const sorted = [...m.technicianAssignments].sort((a, b) => a.order - b.order);
    const names = sorted.map((a) => a.technician?.name).filter((n): n is string => !!n);
    if (names.length > 0) return names.join(', ');
  }
  return m.technician?.name || '-';
}