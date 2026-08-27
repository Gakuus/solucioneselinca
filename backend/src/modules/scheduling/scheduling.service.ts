import { PrismaClient, Prisma, MaintenanceFrequency } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { CreateScheduleInput, UpdateScheduleInput, ScheduleQueryInput } from './scheduling.validation';

const prisma = new PrismaClient();

function calculateNextExecution(lastExecution: Date, frequency: MaintenanceFrequency, interval: number): Date {
  const next = new Date(lastExecution);

  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + interval);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7 * interval);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'QUARTERLY':
      next.setMonth(next.getMonth() + 3 * interval);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }

  return next;
}

export class SchedulingService {
  async getAll(query: ScheduleQueryInput) {
    const { page, limit, search, machineId, maintenanceTypeId, frequency, isActive, sortBy, sortOrder } = query;

    const where: Prisma.MaintenanceScheduleWhereInput = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { machine: { code: { contains: search, mode: 'insensitive' } } },
        { machine: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (machineId) {
      where.machineId = machineId;
    }

    if (maintenanceTypeId) {
      where.maintenanceTypeId = maintenanceTypeId;
    }

    if (frequency) {
      where.frequency = frequency;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [schedules, total] = await Promise.all([
      prisma.maintenanceSchedule.findMany({
        where,
        include: {
          machine: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
            },
          },
          maintenanceType: {
            select: {
              id: true,
              name: true,
              isPreventive: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenanceSchedule.count({ where }),
    ]);

    return {
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const schedule = await prisma.maintenanceSchedule.findUnique({
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
      },
    });

    if (!schedule) {
      throw new NotFoundError('Programación no encontrada');
    }

    return schedule;
  }

  async create(data: CreateScheduleInput) {
    const [machine, maintenanceType] = await Promise.all([
      prisma.machine.findUnique({ where: { id: data.machineId } }),
      prisma.maintenanceType.findUnique({ where: { id: data.maintenanceTypeId } }),
    ]);

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }
    if (!maintenanceType) {
      throw new NotFoundError('Tipo de mantenimiento no encontrado');
    }

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        machineId: data.machineId,
        maintenanceTypeId: data.maintenanceTypeId,
        frequency: data.frequency,
        interval: data.interval,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        nextExecution: new Date(data.nextExecution),
        hoursInterval: data.hoursInterval,
        isActive: data.isActive,
        description: data.description,
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
      },
    });

    return schedule;
  }

  async update(id: string, data: UpdateScheduleInput) {
    const existing = await prisma.maintenanceSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Programación no encontrada');
    }

    const updateData: Prisma.MaintenanceScheduleUpdateInput = {};

    if (data.machineId) {
      const machine = await prisma.machine.findUnique({ where: { id: data.machineId } });
      if (!machine) {
        throw new NotFoundError('Máquina no encontrada');
      }
      updateData.machine = { connect: { id: data.machineId } };
    }

    if (data.maintenanceTypeId) {
      const maintenanceType = await prisma.maintenanceType.findUnique({ where: { id: data.maintenanceTypeId } });
      if (!maintenanceType) {
        throw new NotFoundError('Tipo de mantenimiento no encontrado');
      }
      updateData.maintenanceType = { connect: { id: data.maintenanceTypeId } };
    }

    if (data.frequency) updateData.frequency = data.frequency;
    if (data.interval) updateData.interval = data.interval;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.nextExecution) updateData.nextExecution = new Date(data.nextExecution);
    if (data.hoursInterval !== undefined) updateData.hoursInterval = data.hoursInterval;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.description !== undefined) updateData.description = data.description;

    const schedule = await prisma.maintenanceSchedule.update({
      where: { id },
      data: updateData,
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
      },
    });

    return schedule;
  }

  async delete(id: string) {
    const existing = await prisma.maintenanceSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Programación no encontrada');
    }

    await prisma.maintenanceSchedule.delete({ where: { id } });
    return { message: 'Programación eliminada correctamente' };
  }

  async toggleActive(id: string) {
    const existing = await prisma.maintenanceSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Programación no encontrada');
    }

    const schedule = await prisma.maintenanceSchedule.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return schedule;
  }

  async executeSchedule(id: string, technicianId: string) {
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: { maintenanceType: true },
    });
    if (!schedule) {
      throw new NotFoundError('Programación no encontrada');
    }

    if (!schedule.isActive) {
      throw new BadRequestError('La programación está inactiva');
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        machineId: schedule.machineId,
        maintenanceTypeId: schedule.maintenanceTypeId,
        technicianId,
        receivedDate: new Date(),
        currentHours: 0,
        description: schedule.description || `Mantenimiento programado: ${schedule.maintenanceType?.name || schedule.maintenanceTypeId}`,
        status: 'SCHEDULED',
      },
    });

    const nextExecution = calculateNextExecution(schedule.nextExecution, schedule.frequency, schedule.interval);

    await prisma.maintenanceSchedule.update({
      where: { id },
      data: {
        nextExecution,
        lastExecution: new Date(),
      },
    });

    return maintenance;
  }

  async getUpcomingExecutions(days: number = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const schedules = await prisma.maintenanceSchedule.findMany({
      where: {
        isActive: true,
        nextExecution: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
      },
      orderBy: { nextExecution: 'asc' },
    });

    return schedules;
  }
}

export const schedulingService = new SchedulingService();
