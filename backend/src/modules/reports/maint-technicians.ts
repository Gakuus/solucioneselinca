type MaintLike = {
  technician?: { name?: string | null } | null;
  technicianAssignments?: Array<{ technician?: { name?: string | null } | null }> | null;
};

export function maintenanceTechniciansLabel(m: MaintLike | null | undefined): string {
  if (!m) return '-';
  const names: string[] = [];
  for (const a of m.technicianAssignments ?? []) {
    const n = a.technician?.name;
    if (n && !names.includes(n)) {
      names.push(n);
    }
  }
  if (names.length === 0 && m.technician?.name) {
    names.push(m.technician.name);
  }
  return names.length ? names.join(', ') : '-';
}