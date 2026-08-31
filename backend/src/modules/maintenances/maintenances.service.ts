import { PrismaClient, MaintenanceStatus, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError';
import { parseLocalDate, endOfLocalDay } from '../../shared/utils/dates';
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

const TYPE_ASSIGNMENTS_INCLUDE = {
  typeAssignments: {
    include: {
      maintenanceType: {
        select: { id: true, name: true, isPreventive: true },
      },
    },
    orderBy: { order: 'asc' as const },
  },
};

const TECHNICIAN_ASSIGNMENTS_INCLUDE = {
  technicianAssignments: {
    include: {
      technician: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { order: 'asc' as const },
  },
};

export class MaintenancesService {
  private async resolveTypeIds(input: {
    maintenanceTypeId?: string;
    maintenanceTypeIds?: string[];
  }): Promise<{ ids: string[]; primaryId: string }> {
    let ids = input.maintenanceTypeIds ? [...input.maintenanceTypeIds] : [];
    if (ids.length === 0 && input.maintenanceTypeId) {
      ids = [input.maintenanceTypeId];
    }
    if (ids.length === 0) {
      throw new BadRequestError('Se requiere al menos un tipo de mantenimiento');
    }
    const unique = [...new Set(ids)];
    const existing = await prisma.maintenanceType.findMany({
      where: { id: { in: unique }, deletedAt: null },
      select: { id: true },
    });
    if (existing.length !== unique.length) {
      throw new NotFoundError('Uno o más tipos de mantenimiento no encontrados');
    }
    return { ids: unique, primaryId: unique[0] };
  }

  private async resolveTechnicianIds(input: {
    technicianId?: string;
    technicianIds?: string[];
  }): Promise<{ ids: string[]; primaryId: string }> {
    let ids = input.technicianIds ? [...input.technicianIds] : [];
    if (ids.length === 0 && input.technicianId) {
      ids = [input.technicianId];
    }
    if (ids.length === 0) {
      throw new BadRequestError('Se requiere al menos un técnico');
    }
    const unique = [...new Set(ids)];
    const existing = await prisma.user.findMany({
      where: { id: { in: unique }, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (existing.length !== unique.length) {
      throw new NotFoundError('Uno o más técnicos no encontrados');
    }
    return { ids: unique, primaryId: unique[0] };
  }

  async getAll(query: MaintenanceQueryInput) {
    const { page, limit, search, status, machineId, technicianId, maintenanceTypeId, category, startDate, endDate, sortBy, sortOrder, includeDeleted } = query;

    const where: Prisma.MaintenanceWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

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
        where.receivedDate.gte = parseLocalDate(startDate);
      }
      if (endDate) {
        where.receivedDate.lte = endOfLocalDay(endDate);
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
          ...TYPE_ASSIGNMENTS_INCLUDE,
        ...TECHNICIAN_ASSIGNMENTS_INCLUDE,
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
        ...TYPE_ASSIGNMENTS_INCLUDE,
        ...TECHNICIAN_ASSIGNMENTS_INCLUDE,
      },
    });

    if (!maintenance) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    return maintenance;
  }

  async create(data: CreateMaintenanceInput) {
    const { ids: typeIds, primaryId } = await this.resolveTypeIds(data);
    const { ids: techIds, primaryId: primaryTechId } = await this.resolveTechnicianIds(data);

    const [machine] = await Promise.all([
      prisma.machine.findUnique({ where: { id: data.machineId } }),
    ]);

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        machineId: data.machineId,
        maintenanceTypeId: primaryId,
        technicianId: primaryTechId,
        receivedDate: parseLocalDate(data.receivedDate),
        currentHours: data.currentHours,
        description: data.description,
        observations: data.observations,
        hoursUntilNext: data.hoursUntilNext,
        nextMaintenanceDate: data.nextMaintenanceDate ? parseLocalDate(data.nextMaintenanceDate) : null,
        estimatedNextDate: data.estimatedNextDate ? parseLocalDate(data.estimatedNextDate) : null,
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
        typeAssignments: {
          create: typeIds.map((typeId, order) => ({
            maintenanceTypeId: typeId,
            order,
          })),
        },
        technicianAssignments: {
          create: techIds.map((techId, order) => ({
            technicianId: techId,
            order,
          })),
        },
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
        ...TYPE_ASSIGNMENTS_INCLUDE,
        ...TECHNICIAN_ASSIGNMENTS_INCLUDE,
      },
    });

    return maintenance;
  }

  async update(id: string, data: UpdateMaintenanceInput) {
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestError('No se puede editar un mantenimiento cancelado');
    }

    const updateData: Prisma.MaintenanceUpdateInput = {};

    if (data.maintenanceTypeIds || data.maintenanceTypeId) {
      const { ids: typeIds, primaryId } = await this.resolveTypeIds(data);
      updateData.maintenanceType = { connect: { id: primaryId } };
      updateData.typeAssignments = {
        deleteMany: {},
        create: typeIds.map((typeId, order) => ({
          maintenanceTypeId: typeId,
          order,
        })),
      };
    }

    if (data.technicianIds || data.technicianId) {
      const { ids: techIds, primaryId: primaryTechId } = await this.resolveTechnicianIds(data);
      updateData.technician = { connect: { id: primaryTechId } };
      updateData.technicianAssignments = {
        deleteMany: {},
        create: techIds.map((techId, order) => ({
          technicianId: techId,
          order,
        })),
      };
    }

    if (data.maintenanceDate) updateData.maintenanceDate = parseLocalDate(data.maintenanceDate);
    if (data.currentHours !== undefined) updateData.currentHours = data.currentHours;
    if (data.description) updateData.description = data.description;
    if (data.observations !== undefined) updateData.observations = data.observations;
    if (data.hoursUntilNext !== undefined) updateData.hoursUntilNext = data.hoursUntilNext;
    if (data.nextMaintenanceDate !== undefined) {
      updateData.nextMaintenanceDate = data.nextMaintenanceDate ? parseLocalDate(data.nextMaintenanceDate) : null;
    }
    if (data.estimatedNextDate !== undefined) {
      updateData.estimatedNextDate = data.estimatedNextDate ? parseLocalDate(data.estimatedNextDate) : null;
    }
    if (data.items) {
      updateData.items = {
        deleteMany: {},
        create: data.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitCost: item.unitCost,
          supplier: item.supplier,
          category: item.category,
        })),
      };
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
        ...TYPE_ASSIGNMENTS_INCLUDE,
        ...TECHNICIAN_ASSIGNMENTS_INCLUDE,
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
        ...TYPE_ASSIGNMENTS_INCLUDE,
        ...TECHNICIAN_ASSIGNMENTS_INCLUDE,
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

    await prisma.maintenance.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Mantenimiento desactivado correctamente' };
  }

  async restore(id: string) {
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    await prisma.maintenance.update({
      where: { id },
      data: { deletedAt: null },
    });
    return { message: 'Mantenimiento reactivado correctamente' };
  }

  async addItem(maintenanceId: string, data: AddMaintenanceItemInput) {
    const maintenance = await prisma.maintenance.findUnique({ where: { id: maintenanceId } });
    if (!maintenance) {
      throw new NotFoundError('Mantenimiento no encontrado');
    }

    if (maintenance.status === 'CANCELLED') {
      throw new BadRequestError('No se pueden agregar ítems a un mantenimiento cancelado');
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

    if (maintenance.status === 'CANCELLED') {
      throw new BadRequestError('No se pueden modificar ítems de un mantenimiento cancelado');
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

    if (maintenance.status === 'CANCELLED') {
      throw new BadRequestError('No se pueden eliminar ítems de un mantenimiento cancelado');
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
      prisma.maintenance.count({ where: { deletedAt: null } }),
      prisma.maintenance.count({ where: { status: 'SCHEDULED', deletedAt: null } }),
      prisma.maintenance.count({ where: { status: 'IN_PROGRESS', deletedAt: null } }),
      prisma.maintenance.count({ where: { status: 'COMPLETED', deletedAt: null } }),
      prisma.maintenance.count({ where: { status: 'CANCELLED', deletedAt: null } }),
    ]);

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = await prisma.maintenance.count({
      where: {
        status: 'SCHEDULED',
        deletedAt: null,
        nextMaintenanceDate: {
          lte: nextWeek,
        },
      },
    });

    const overdue = await prisma.maintenance.count({
      where: {
        status: 'SCHEDULED',
        deletedAt: null,
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
        deletedAt: null,
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
        ...TYPE_ASSIGNMENTS_INCLUDE,
        ...TECHNICIAN_ASSIGNMENTS_INCLUDE,
      },
      orderBy: { receivedDate: 'asc' },
    });

    return maintenances;
  }
}

export const maintenancesService = new MaintenancesService();
