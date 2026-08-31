import { prisma } from '../../config/database';
import {
  parseExcelSheet,
  getValue,
  parseNumber,
} from '../../shared/utils/excel-import';
import { BadRequestError } from '../../shared/errors/AppError';

const MACHINE_STATUS_MAP: Record<string, string> = {
  activa: 'ACTIVE',
  activo: 'ACTIVE',
  enmantenimiento: 'IN_MAINTENANCE',
  'en mantenimiento': 'IN_MAINTENANCE',
  inactiva: 'INACTIVE',
  inactivo: 'INACTIVE',
  decomisionada: 'DECOMMISSIONED',
  decomisionado: 'DECOMMISSIONED',
};

async function resolveMachineType(name: string | undefined): Promise<string> {
  const typeName = (name || 'General').trim();
  const existing = await prisma.machineType.findFirst({
    where: { name: { equals: typeName, mode: 'insensitive' }, deletedAt: null },
  });
  if (existing) {
    return existing.id;
  }
  const created = await prisma.machineType.create({
    data: { name: typeName },
  });
  return created.id;
}

export interface MachineImportResult {
  imported: number;
  updated: number;
  errors: string[];
}

export async function importMachinesFromExcel(buffer: Buffer, createdByUserId?: string): Promise<MachineImportResult> {
  const { rows } = await parseExcelSheet(buffer);

  if (rows.length === 0) {
    throw new BadRequestError('El archivo no contiene filas de datos');
  }

  const result: MachineImportResult = { imported: 0, updated: 0, errors: [] };
  const machineTypesCache = new Map<string, string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2; // header is row 1
    const code = getValue(row, ['código', 'codigo', 'code']);
    const name = getValue(row, ['nombre', 'name']);
    const typeName = getValue(row, ['tipo', 'type', 'tipodemáquina']);
    const brand = getValue(row, ['marca', 'brand']) || '';
    const model = getValue(row, ['modelo', 'model']) || '';
    const serialNumber = getValue(row, ['serie', 'nserie', 'serial', 'numerodeserie']);
    const year = parseNumber(getValue(row, ['año', 'anio', 'year']));
    const dailyHoursAvg = parseNumber(getValue(row, ['horasdia', 'horasaldia', 'horaspordia', 'dailyhours'])) ?? 8;
    const statusRaw = getValue(row, ['estado', 'status']);

    if (!code || !name) {
      result.errors.push(`Fila ${lineNum}: falta el código o el nombre.`);
      continue;
    }

    let status = 'ACTIVE';
    if (statusRaw) {
      status = MACHINE_STATUS_MAP[statusRaw.toLowerCase()] ?? 'ACTIVE';
    }

    let machineTypeId: string;
    const cacheKey = (typeName || 'General').toLowerCase();
    if (machineTypesCache.has(cacheKey)) {
      machineTypeId = machineTypesCache.get(cacheKey)!;
    } else {
      machineTypeId = await resolveMachineType(typeName);
      machineTypesCache.set(cacheKey, machineTypeId);
    }

    const existing = await prisma.machine.findUnique({ where: { code } });
    if (existing) {
      await prisma.machine.update({
        where: { id: existing.id },
        data: {
          name,
          machineTypeId,
          brand,
          model,
          serialNumber: serialNumber ?? existing.serialNumber,
          year: year ?? existing.year,
          dailyHoursAverage: dailyHoursAvg,
          status: status as any,
          deletedAt: null,
        },
      });
      result.updated++;
    } else {
      await prisma.machine.create({
        data: {
          code,
          name,
          machineTypeId,
          brand,
          model,
          serialNumber: serialNumber ?? undefined,
          year: year ?? undefined,
          dailyHoursAverage: dailyHoursAvg,
          status: status as any,
        },
      });
      result.imported++;
    }
  }

  return result;
}

export { MACHINE_STATUS_MAP };
