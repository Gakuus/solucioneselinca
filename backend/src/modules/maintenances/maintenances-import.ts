import { prisma } from '../../config/database';
import {
  parseExcelSheet,
  getValue,
  parseNumber,
  parseDate,
} from '../../shared/utils/excel-import';
import { BadRequestError } from '../../shared/errors/AppError';

const MAINT_STATUS_MAP: Record<string, string> = {
  programado: 'SCHEDULED',
  programada: 'SCHEDULED',
  schedule: 'SCHEDULED',
  pendiente: 'SCHEDULED',
  enprogreso: 'IN_PROGRESS',
  'en progreso': 'IN_PROGRESS',
  'en curso': 'IN_PROGRESS',
  inprogress: 'IN_PROGRESS',
  completado: 'COMPLETED',
  completada: 'COMPLETED',
  completo: 'COMPLETED',
  done: 'COMPLETED',
  cancelado: 'CANCELLED',
  cancelada: 'CANCELLED',
  cancel: 'CANCELLED',
};

export interface MaintenanceImportResult {
  imported: number;
  errors: string[];
}

async function resolveMaintenanceType(name: string | undefined): Promise<string> {
  const typeName = (name || 'General').trim();
  const existing = await prisma.maintenanceType.findFirst({
    where: { name: { equals: typeName, mode: 'insensitive' }, deletedAt: null },
  });
  if (existing) {
    return existing.id;
  }
  const created = await prisma.maintenanceType.create({
    data: {
      name: typeName,
      isPreventive: /prevent/i.test(typeName) ? true : false,
    },
  });
  return created.id;
}

async function resolveTechnician(nameOrEmail: string | undefined): Promise<string | null> {
  if (!nameOrEmail) {
    return null;
  }
  const value = nameOrEmail.trim();

  const byEmail = await prisma.user.findFirst({
    where: { email: { equals: value, mode: 'insensitive' }, role: 'TECHNICIAN', isActive: true, deletedAt: null },
  });
  if (byEmail) {
    return byEmail.id;
  }

  const byName = await prisma.user.findFirst({
    where: { name: { equals: value, mode: 'insensitive' }, role: 'TECHNICIAN', isActive: true, deletedAt: null },
  });
  if (byName) {
    return byName.id;
  }

  return null;
}

async function resolveDefaultTechnician(): Promise<string | null> {
  const anyTech = await prisma.user.findFirst({
    where: { role: 'TECHNICIAN', isActive: true, deletedAt: null },
  });
  return anyTech ? anyTech.id : null;
}

export async function importMaintenancesFromExcel(
  buffer: Buffer,
  createdByUserId?: string
): Promise<MaintenanceImportResult> {
  const { rows } = await parseExcelSheet(buffer);

  if (rows.length === 0) {
    throw new BadRequestError('El archivo no contiene filas de datos');
  }

  const result: MaintenanceImportResult = { imported: 0, errors: [] };
  const typeCache = new Map<string, string>();
  const techCache = new Map<string, string | null>();
  const defaultTechId = await resolveDefaultTechnician();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;

    const machineCode = getValue(row, [
      'codigomaquina',
      'codigomaq',
      'maquina',
      'machine',
      'codigomaquina',
    ]);
    const typeName = getValue(row, [
      'tipomantenimiento',
      'tipodeatencion',
      'tipo',
      'maintenancetype',
    ]);
    const techRaw = getValue(row, ['tecnico', 'technician', 'responsable']);
    const receivedRaw = getValue(row, [
      'fecharecepcion',
      'fechainicio',
      'fecharecibido',
      'fecha',
      'receiveddate',
    ]);
    const currentHours = parseNumber(
      getValue(row, ['horasactuales', 'horas', 'currenthours'])
    );
    const description = getValue(row, ['descripcion', 'description', 'detalle']);
    const statusRaw = getValue(row, ['estado', 'status']);

    if (!machineCode) {
      result.errors.push(`Fila ${lineNum}: falta el código de máquina.`);
      continue;
    }

    const machine = await prisma.machine.findUnique({ where: { code: machineCode } });
    if (!machine) {
      result.errors.push(`Fila ${lineNum}: no existe la máquina con código "${machineCode}".`);
      continue;
    }

    let maintenanceTypeId: string;
    const typeKey = (typeName || 'General').toLowerCase();
    if (typeCache.has(typeKey)) {
      maintenanceTypeId = typeCache.get(typeKey)!;
    } else {
      maintenanceTypeId = await resolveMaintenanceType(typeName);
      typeCache.set(typeKey, maintenanceTypeId);
    }

    let technicianId: string | null = null;
    if (techRaw) {
      const techKey = techRaw.toLowerCase();
      if (techCache.has(techKey)) {
        technicianId = techCache.get(techKey)!;
      } else {
        technicianId = await resolveTechnician(techRaw);
        techCache.set(techKey, technicianId);
      }
    }
    if (!technicianId) {
      technicianId = defaultTechId;
    }
    if (!technicianId) {
      result.errors.push(
        `Fila ${lineNum}: no se pudo asignar un técnico (no existe "${techRaw || '-'}" ni hay técnicos activos).`
      );
      continue;
    }

    const receivedDate = parseDate(receivedRaw);
    const status = statusRaw
      ? (MAINT_STATUS_MAP[statusRaw.toLowerCase()] ?? 'SCHEDULED')
      : 'SCHEDULED';

    await prisma.maintenance.create({
      data: {
        machineId: machine.id,
        maintenanceTypeId,
        technicianId,
        receivedDate: receivedDate ?? new Date(),
        currentHours: currentHours ?? machine.dailyHoursAverage ?? 0,
        description: description ?? `Mantenimiento importado de ${machineCode}`,
        status: status as any,
        typeAssignments: {
          create: [{ maintenanceTypeId, order: 0 }],
        },
        technicianAssignments: {
          create: [{ technicianId, order: 0 }],
        },
      },
    });

    result.imported++;
  }

  return result;
}

export { MAINT_STATUS_MAP };
