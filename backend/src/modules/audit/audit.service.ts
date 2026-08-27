import { prisma } from '../../config/database';
import { Prisma, AuditAction } from '@prisma/client';
import { AuditQueryInput } from './audit.validation';

export class AuditService {
  async getAll(query: AuditQueryInput) {
    const { page, limit, search, action, entityType, userId, startDate, endDate, sortBy, sortOrder } = query;

    const where: Prisma.AuditLogWhereInput = {};

    if (search) {
      where.OR = [
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return log;
  }

  async log(data: {
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const log = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return log;
  }

  async getStats() {
    const [total, byAction, byEntityType] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['entityType'],
        _count: true,
        orderBy: { _count: { entityType: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      byAction: byAction.reduce((acc, item) => {
        acc[item.action] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byEntityType: byEntityType.reduce((acc, item) => {
        acc[item.entityType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getRecentActivity(limit: number = 10) {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  }
}

export const auditService = new AuditService();
