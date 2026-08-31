import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import type {
  CreateMachineTypeInput,
  UpdateMachineTypeInput,
  CreateMaintenanceTypeInput,
  UpdateMaintenanceTypeInput,
} from './catalogs.validation';

export class CatalogsService {
  // Machine Types
  async getAllMachineTypes(includeDeleted = false) {
    return prisma.machineType.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getMachineTypeById(id: string) {
    const machineType = await prisma.machineType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { machines: true },
        },
      },
    });

    if (!machineType) {
      throw new NotFoundError('Tipo de máquina no encontrado');
    }

    return machineType;
  }

  async createMachineType(data: CreateMachineTypeInput) {
    const existing = await prisma.machineType.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });

    if (existing) {
      if (existing.deletedAt) {
        throw new ConflictError(`Ya existe un tipo de máquina con el nombre: ${data.name} (desactivado). Puedes reactivarlo desde el listado de inactivos.`);
      }
      throw new ConflictError(`Ya existe un tipo de máquina con el nombre: ${data.name}`);
    }

    return prisma.machineType.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateMachineType(id: string, data: UpdateMachineTypeInput) {
    const existing = await prisma.machineType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Tipo de máquina no encontrado');
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.machineType.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' }, deletedAt: null },
      });

      if (nameExists) {
        throw new ConflictError(`Ya existe un tipo de máquina con el nombre: ${data.name}`);
      }
    }

    return prisma.machineType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteMachineType(id: string) {
    const machineType = await prisma.machineType.findUnique({
      where: { id },
      include: {
        machines: { take: 1 },
      },
    });

    if (!machineType) {
      throw new NotFoundError('Tipo de máquina no encontrado');
    }

    if (machineType.machines.length > 0) {
      throw new ConflictError(
        'No se puede desactivar el tipo porque tiene máquinas asociadas. Puedes desactivarlo con el estado inactivo.'
      );
    }

    await prisma.machineType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreMachineType(id: string) {
    const machineType = await prisma.machineType.findUnique({ where: { id } });
    if (!machineType) {
      throw new NotFoundError('Tipo de máquina no encontrado');
    }
    await prisma.machineType.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // Maintenance Types
  async getAllMaintenanceTypes(includeDeleted = false) {
    return prisma.maintenanceType.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getMaintenanceTypeById(id: string) {
    const maintenanceType = await prisma.maintenanceType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { maintenances: true },
        },
      },
    });

    if (!maintenanceType) {
      throw new NotFoundError('Tipo de mantenimiento no encontrado');
    }

    return maintenanceType;
  }

  async createMaintenanceType(data: CreateMaintenanceTypeInput) {
    const existing = await prisma.maintenanceType.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });

    if (existing) {
      if (existing.deletedAt) {
        throw new ConflictError(`Ya existe un tipo de mantenimiento con el nombre: ${data.name} (desactivado). Puedes reactivarlo desde el listado de inactivos.`);
      }
      throw new ConflictError(`Ya existe un tipo de mantenimiento con el nombre: ${data.name}`);
    }

    return prisma.maintenanceType.create({
      data: {
        name: data.name,
        description: data.description,
        isPreventive: data.isPreventive,
        estimatedHours: data.estimatedHours,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateMaintenanceType(id: string, data: UpdateMaintenanceTypeInput) {
    const existing = await prisma.maintenanceType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Tipo de mantenimiento no encontrado');
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.maintenanceType.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' }, deletedAt: null },
      });

      if (nameExists) {
        throw new ConflictError(`Ya existe un tipo de mantenimiento con el nombre: ${data.name}`);
      }
    }

    return prisma.maintenanceType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isPreventive !== undefined && { isPreventive: data.isPreventive }),
        ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteMaintenanceType(id: string) {
    const maintenanceType = await prisma.maintenanceType.findUnique({
      where: { id },
      include: {
        maintenances: { take: 1 },
      },
    });

    if (!maintenanceType) {
      throw new NotFoundError('Tipo de mantenimiento no encontrado');
    }

    if (maintenanceType.maintenances.length > 0) {
      throw new ConflictError(
        'No se puede desactivar el tipo porque tiene mantenimientos asociados. Puedes desactivarlo con el estado inactivo.'
      );
    }

    await prisma.maintenanceType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreMaintenanceType(id: string) {
    const maintenanceType = await prisma.maintenanceType.findUnique({ where: { id } });
    if (!maintenanceType) {
      throw new NotFoundError('Tipo de mantenimiento no encontrado');
    }
    await prisma.maintenanceType.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}

export const catalogsService = new CatalogsService();
