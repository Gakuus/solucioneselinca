import { PrismaClient, MaintenanceStatus, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  MaintenanceQueryInput,
  ChangeMaintenanceStatusInput,
  AddMaintenanceItemInput,
  UpdateMaintenanceItemInput,
} from './maintenances.validation';

const prisma = new PrismaClient();

const VALID_STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export class MaintenancesService {
  async getAll(query: MaintenanceQueryInput) {
    const { page, limit, search, status, machineId, technicianId, maintenanceTypeId, category, startDate, endDate, sortBy, sortOrder } = query;

    const where: Prisma.MaintenanceWhereInput = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { machine: { code: { contains: search, mode: 'insensitive' } } },
        { machine: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (machineId) {
      where.machineId = machineId;
    }

    if (technicianId) {
      where.technicianId = technicianId;
    }

    if (maintenanceTypeId) {
      where.maintenanceTypeId = maintenanceTypeId;
    }

    if (category) {
      where.maintenanceType = {
        isPreventive: category === 'PREVENTIVE',
      };
    }

    if (startDate || endDate) {
      where.receivedDate = {};
      if (startDate) {
        where.receivedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.receivedDate.lte = new Date(endDate);
      }
    }

    const [maintenances, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        include: {
          machine: {
            select: {
              id: true,
              code: true,
              name: true,
              brand: true,
              model: true,
            },
          },
          maintenanceType: {
            select: {
              id: true,
              name: true,
              isPreventive: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenance.count({ where }),
    ]);

    return {
      data: maintenances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: {
        machine: {
          select: {
            id: true,
            code: true,
            name: true,
            brand: true,
            model: true,
            status: true,
            dailyHoursAverage: true,
          },
        },
        maintenanceType: {
          select: {
            id: true,
            name: true,
            isPreventive: true,
            description: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: true,
        alerts: {
          select: {
            id: true,
            type: true,
            message: true,
            severity: true,
            createdAt: true,
          },
        },
      },
    });

    if (!maintenance) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    return maintenance;
  }

  async create(data: CreateMaintenanceInput) {
    const [machine, maintenanceType, technician] = await Promise.all([
      prisma.machine.findUnique({ where: { id: data.machineId } }),
      prisma.maintenanceType.findUnique({ where: { id: data.maintenanceTypeId } }),
      prisma.user.findUnique({ where: { id: data.technicianId } }),
    ]);

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }
    if (!maintenanceType) {
      throw new NotFoundError('Tipo de mantenimiento no encontrado');
    }
    if (!technician) {
      throw new NotFoundError('Técnico no encontrado');
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        machineId: data.machineId,
        maintenanceTypeId: data.maintenanceTypeId,
        technicianId: data.technicianId,
        receivedDate: new Date(data.receivedDate),
        currentHours: data.currentHours,
        description: data.description,
        observations: data.observations,
        hoursUntilNext: data.hoursUntilNext,
        nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : null,
        estimatedNextDate: data.estimatedNextDate ? new Date(data.estimatedNextDate) : null,
        items: data.items
          ? {
              create: data.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unitCost: item.unitCost,
                supplier: item.supplier,
                category: item.category,
              })),
            }
          : undefined,
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return maintenance;
  }

  async update(id: string, data: UpdateMaintenanceInput) {
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestError('No se puede editar un mantenimiento finalizado o cancelado');
    }

    const updateData: Prisma.MaintenanceUpdateInput = {};

    if (data.maintenanceTypeId) {
      const maintenanceType = await prisma.maintenanceType.findUnique({
        where: { id: data.maintenanceTypeId },
      });
      if (!maintenanceType) {
        throw new NotFoundError('Tipo de mantenimiento no encontrado');
      }
      updateData.maintenanceType = { connect: { id: data.maintenanceTypeId } };
    }

    if (data.technicianId) {
      const technician = await prisma.user.findUnique({ where: { id: data.technicianId } });
      if (!technician) {
        throw new NotFoundError('Técnico no encontrado');
      }
      updateData.technician = { connect: { id: data.technicianId } };
    }

    if (data.maintenanceDate) updateData.maintenanceDate = new Date(data.maintenanceDate);
    if (data.currentHours !== undefined) updateData.currentHours = data.currentHours;
    if (data.description) updateData.description = data.description;
    if (data.observations !== undefined) updateData.observations = data.observations;
    if (data.hoursUntilNext !== undefined) updateData.hoursUntilNext = data.hoursUntilNext;
    if (data.nextMaintenanceDate !== undefined) {
      updateData.nextMaintenanceDate = data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : null;
    }
    if (data.estimatedNextDate !== undefined) {
      updateData.estimatedNextDate = data.estimatedNextDate ? new Date(data.estimatedNextDate) : null;
    }

    const maintenance = await prisma.maintenance.update({
      where: { id },
      data: updateData,
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return maintenance;
  }

  async changeStatus(id: string, data: ChangeMaintenanceStatusInput) {
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowedTransitions.includes(data.status)) {
      throw new BadRequestError(
        `No se puede cambiar de estado ${existing.status} a ${data.status}`
      );
    }

    const updateData: Prisma.MaintenanceUpdateInput = {
      status: data.status,
    };

    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
      if (data.completedHours) {
        updateData.currentHours = data.completedHours;
      }
      if (data.observations) {
        updateData.observations = data.observations;
      }
    }

    if (data.status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = data.reason;
    }

    if (data.status === 'IN_PROGRESS') {
      updateData.maintenanceDate = new Date();
    }

    const maintenance = await prisma.maintenance.update({
      where: { id },
      data: updateData,
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return maintenance;
  }

  async delete(id: string) {
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (existing.status !== 'SCHEDULED') {
      throw new BadRequestError('Solo se pueden eliminar mantenimientos programados');
    }

    await prisma.maintenance.delete({ where: { id } });
    return { message: 'Mantenimiento eliminado correctamente' };
  }

  async addItem(maintenanceId: string, data: AddMaintenanceItemInput) {
    const maintenance = await prisma.maintenance.findUnique({ where: { id: maintenanceId } });
    if (!maintenance) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (maintenance.status === 'COMPLETED' || maintenance.status === 'CANCELLED') {
      throw new BadRequestError('No se pueden agregar ítems a un mantenimiento finalizado');
    }

    const item = await prisma.maintenanceItem.create({
      data: {
        maintenanceId,
        name: data.name,
        quantity: data.quantity,
        unitCost: data.unitCost,
        supplier: data.supplier,
        category: data.category,
      },
    });

    return item;
  }

  async updateItem(maintenanceId: string, itemId: string, data: UpdateMaintenanceItemInput) {
    const maintenance = await prisma.maintenance.findUnique({ where: { id: maintenanceId } });
    if (!maintenance) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (maintenance.status === 'COMPLETED' || maintenance.status === 'CANCELLED') {
      throw new BadRequestError('No se pueden modificar ítems de un mantenimiento finalizado');
    }

    const existingItem = await prisma.maintenanceItem.findFirst({
      where: { id: itemId, maintenanceId },
    });

    if (!existingItem) {
      throw new NotFoundError('Ítem no encontrado');
    }

    const item = await prisma.maintenanceItem.update({
      where: { id: itemId },
      data,
    });

    return item;
  }

  async deleteItem(maintenanceId: string, itemId: string) {
    const maintenance = await prisma.maintenance.findUnique({ where: { id: maintenanceId } });
    if (!maintenance) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (maintenance.status === 'COMPLETED' || maintenance.status === 'CANCELLED') {
      throw new BadRequestError('No se pueden eliminar ítems de un mantenimiento finalizado');
    }

    const existingItem = await prisma.maintenanceItem.findFirst({
      where: { id: itemId, maintenanceId },
    });

    if (!existingItem) {
      throw new NotFoundError('Ítem no encontrado');
    }

    await prisma.maintenanceItem.delete({ where: { id: itemId } });
    return { message: 'Ítem eliminado correctamente' };
  }

  async getStats() {
    const [total, scheduled, inProgress, completed, cancelled] = await Promise.all([
      prisma.maintenance.count(),
      prisma.maintenance.count({ where: { status: 'SCHEDULED' } }),
      prisma.maintenance.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.maintenance.count({ where: { status: 'COMPLETED' } }),
      prisma.maintenance.count({ where: { status: 'CANCELLED' } }),
    ]);

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = await prisma.maintenance.count({
      where: {
        status: 'SCHEDULED',
        nextMaintenanceDate: {
          lte: nextWeek,
        },
      },
    });

    const overdue = await prisma.maintenance.count({
      where: {
        status: 'SCHEDULED',
        nextMaintenanceDate: {
          lt: now,
        },
      },
    });

    return {
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      upcoming,
      overdue,
    };
  }

  async getCalendar(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const maintenances = await prisma.maintenance.findMany({
      where: {
        OR: [
          {
            receivedDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            nextMaintenanceDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            maintenanceDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true, isPreventive: true },
        },
        technician: {
          select: { id: true, name: true },
        },
      },
      orderBy: { receivedDate: 'asc' },
    });

    return maintenances;
  }
}

export const maintenancesService = new MaintenancesService();
