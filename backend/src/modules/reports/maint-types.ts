type MaintLike = {
  maintenanceType?: { name?: string | null } | null;
  typeAssignments?: Array<{ maintenanceType?: { name?: string | null } | null }> | null;
};

export function maintenanceTypeLabel(m: MaintLike | null | undefined): string {
  if (!m) return '-';
  const names: string[] = [];
  for (const a of m.typeAssignments ?? []) {
    const n = a.maintenanceType?.name;
    if (n && !names.includes(n)) {
      names.push(n);
    }
  }
  if (names.length === 0 && m.maintenanceType?.name) {
    names.push(m.maintenanceType.name);
  }
  return names.length ? names.join(' + ') : '-';
}