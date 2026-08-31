// Convierte una fecha "YYYY-MM-DD" a medianoche local. `new Date("YYYY-MM-DD")`
// se interpreta como medianoche UTC y en zonas negativas (ej. Argentina, UTC-3)
// se desplaza al día anterior al mostrarse en hora local.
export function parseLocalDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

// Fin del día local para un rango: incluye todo el día de `value`.
export function endOfLocalDay(value: string): Date {
  const d = parseLocalDate(value);
  d.setHours(23, 59, 59, 999);
  return d;
}