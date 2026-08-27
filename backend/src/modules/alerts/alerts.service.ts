import { PrismaClient, Prisma, AlertType, AlertSeverity } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { CreateAlertInput, UpdateAlertInput, AlertQueryInput } from './alerts.validation';

const prisma = new PrismaClient();

export class AlertsService {
  async getAll(query: AlertQueryInput) {
    const { page, limit, search, type, severity, isRead, machineId, sortBy, sortOrder } = query;

    const where: Prisma.AlertWhereInput = {};

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { machine: { code: { contains: search, mode: 'insensitive' } } },
        { machine: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (severity) {
      where.severity = severity;
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (machineId) {
      where.machineId = machineId;
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          machine: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          maintenance: {
            select: {
              id: true,
              description: true,
              status: true,
            },
          },
          readBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const alert = await prisma.alert.findUnique({
      where: { id },
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
        maintenance: {
          select: {
            id: true,
            description: true,
            status: true,
            maintenanceType: {
              select: { name: true },
            },
          },
        },
        readBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundError('Alerta no encontrada');
    }

    return alert;
  }

  async create(data: CreateAlertInput) {
    const machine = await prisma.machine.findUnique({ where: { id: data.machineId } });
    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    if (data.maintenanceId) {
      const maintenance = await prisma.maintenance.findUnique({ where: { id: data.maintenanceId } });
      if (!maintenance) {
        throw new NotFoundError('Mantenimiento no encontrado');
      }
    }

    const alert = await prisma.alert.create({
      data: {
        machineId: data.machineId,
        maintenanceId: data.maintenanceId,
        type: data.type,
        message: data.message,
        severity: data.severity,
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return alert;
  }

  async markAsRead(id: string, userId: string) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundError('Alerta no encontrada');
    }

    if (alert.isRead) {
      throw new BadRequestError('La alerta ya está marcada como leída');
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
        readById: userId,
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.alert.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
        readById: userId,
      },
    });

    return { message: `${result.count} alertas marcadas como leídas` };
  }

  async delete(id: string) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundError('Alerta no encontrada');
    }

    await prisma.alert.delete({ where: { id } });
    return { message: 'Alerta eliminada correctamente' };
  }

  async getStats() {
    const [total, unread, byType, bySeverity] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { isRead: false } }),
      prisma.alert.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        _count: true,
        where: { isRead: false },
      }),
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async checkUpcomingMaintenances() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingMaintenances = await prisma.maintenance.findMany({
      where: {
        status: 'SCHEDULED',
        nextMaintenanceDate: {
          gte: now,
          lte: nextWeek,
        },
      },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    const alerts = [];
    for (const maintenance of upcomingMaintenances) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          maintenanceId: maintenance.id,
          type: 'UPCOMING',
        },
      });

      if (!existingAlert) {
        const alert = await prisma.alert.create({
          data: {
            machineId: maintenance.machineId,
            maintenanceId: maintenance.id,
            type: 'UPCOMING',
            message: `Mantenimiento programado para ${maintenance.machine.code} - ${maintenance.machine.name} el ${maintenance.nextMaintenanceDate?.toLocaleDateString()}`,
            severity: 'MEDIUM',
          },
        });
        alerts.push(alert);
      }
    }

    return { created: alerts.length };
  }
}

export const alertsService = new AlertsService();
