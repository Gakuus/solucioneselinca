import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import type { CreateMachineInput, UpdateMachineInput, MachineQueryInput } from './machines.validation';

export class MachinesService {
  async findAll(query: MachineQueryInput) {
    const { page, limit, search, status, machineTypeId, sortBy, sortOrder } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (machineTypeId) {
      where.machineTypeId = machineTypeId;
    }

    const [machines, total] = await Promise.all([
      prisma.machine.findMany({
        where,
        include: {
          machineType: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.machine.count({ where }),
    ]);

    return {
      data: machines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        machineType: true,
        maintenances: {
          take: 5,
          orderBy: { scheduledDate: 'desc' },
          include: {
            maintenanceType: true,
            technician: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    return machine;
  }

  async create(data: CreateMachineInput) {
    // Check if code already exists
    const existingMachine = await prisma.machine.findUnique({
      where: { code: data.code },
    });

    if (existingMachine) {
      throw new ConflictError(`Ya existe una máquina con el código: ${data.code}`);
    }

    // Verify machine type exists
    const machineType = await prisma.machineType.findUnique({
      where: { id: data.machineTypeId },
    });

    if (!machineType) {
      throw new NotFoundError('Tipo de máquina no encontrado');
    }

    const machine = await prisma.machine.create({
      data: {
        code: data.code,
        name: data.name,
        machineTypeId: data.machineTypeId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        serialNumber: data.serialNumber,
        status: data.status || 'ACTIVE',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiration: data.warrantyExpiration ? new Date(data.warrantyExpiration) : null,
        location: data.location,
        notes: data.notes,
      },
      include: {
        machineType: true,
      },
    });

    return machine;
  }

  async update(id: string, data: UpdateMachineInput) {
    const existingMachine = await prisma.machine.findUnique({
      where: { id },
    });

    if (!existingMachine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    // Check if code conflicts with another machine
    if (data.code && data.code !== existingMachine.code) {
      const codeExists = await prisma.machine.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new ConflictError(`Ya existe una máquina con el código: ${data.code}`);
      }
    }

    // Verify machine type exists if being updated
    if (data.machineTypeId) {
      const machineType = await prisma.machineType.findUnique({
        where: { id: data.machineTypeId },
      });

      if (!machineType) {
        throw new NotFoundError('Tipo de máquina no encontrado');
      }
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.machineTypeId && { machineTypeId: data.machineTypeId }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
        ...(data.status && { status: data.status }),
        ...(data.purchaseDate !== undefined && {
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        }),
        ...(data.warrantyExpiration !== undefined && {
          warrantyExpiration: data.warrantyExpiration ? new Date(data.warrantyExpiration) : null,
        }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        machineType: true,
      },
    });

    return machine;
  }

  async delete(id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        maintenances: { take: 1 },
      },
    });

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    if (machine.maintenances.length > 0) {
      throw new ConflictError(
        'No se puede eliminar la máquina porque tiene registros de mantenimiento asociados'
      );
    }

    await prisma.machine.delete({ where: { id } });
  }

  async getMachineTypes() {
    return prisma.machineType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const machinesService = new MachinesService();
