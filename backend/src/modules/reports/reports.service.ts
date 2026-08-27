import { PrismaClient, Prisma } from '@prisma/client';
import { ReportQueryInput, DashboardQueryInput } from './reports.validation';

const prisma = new PrismaClient();

export class ReportsService {
  async getMaintenanceReport(query: ReportQueryInput) {
    const { startDate, endDate, machineId, technicianId, maintenanceTypeId, category } = query;

    const where: Prisma.MaintenanceWhereInput = {
      receivedDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (machineId) where.machineId = machineId;
    if (technicianId) where.technicianId = technicianId;
    if (maintenanceTypeId) where.maintenanceTypeId = maintenanceTypeId;
    if (category) {
      where.maintenanceType = { isPreventive: category === 'PREVENTIVE' };
    }

    const [maintenances, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
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
          items: true,
        },
        orderBy: { receivedDate: 'desc' },
      }),
      prisma.maintenance.count({ where }),
    ]);

    const stats = {
      total,
      byStatus: {
        scheduled: maintenances.filter((m) => m.status === 'SCHEDULED').length,
        inProgress: maintenances.filter((m) => m.status === 'IN_PROGRESS').length,
        completed: maintenances.filter((m) => m.status === 'COMPLETED').length,
        cancelled: maintenances.filter((m) => m.status === 'CANCELLED').length,
      },
      byCategory: {
        preventive: maintenances.filter((m) => m.maintenanceType?.isPreventive).length,
        corrective: maintenances.filter((m) => !m.maintenanceType?.isPreventive).length,
      },
      totalItems: maintenances.reduce((sum, m) => sum + (m.items?.length || 0), 0),
      totalCost: maintenances.reduce((sum, m) => {
        return sum + (m.items?.reduce((itemSum, item) => itemSum + (item.unitCost || 0) * item.quantity, 0) || 0);
      }, 0),
    };

    return {
      data: maintenances,
      stats,
    };
  }

  async getMachineReport(query: ReportQueryInput) {
    const { startDate, endDate } = query;

    const machines = await prisma.machine.findMany({
      include: {
        machineType: {
          select: { name: true },
        },
        maintenances: {
          where: {
            receivedDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          select: {
            id: true,
            status: true,
            maintenanceType: {
              select: { isPreventive: true },
            },
            items: {
              select: { unitCost: true, quantity: true },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const report = machines.map((machine) => {
      const totalMaintenances = machine.maintenances.length;
      const preventiveCount = machine.maintenances.filter((m) => m.maintenanceType?.isPreventive).length;
      const correctiveCount = totalMaintenances - preventiveCount;
      const totalCost = machine.maintenances.reduce((sum, m) => {
        return sum + m.items.reduce((itemSum, item) => itemSum + (item.unitCost || 0) * item.quantity, 0);
      }, 0);

      return {
        id: machine.id,
        code: machine.code,
        name: machine.name,
        type: machine.machineType?.name,
        status: machine.status,
        totalMaintenances,
        preventiveCount,
        correctiveCount,
        totalCost,
      };
    });

    return report;
  }

  async getTechnicianReport(query: ReportQueryInput) {
    const { startDate, endDate } = query;

    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      include: {
        maintenances: {
          where: {
            receivedDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          select: {
            id: true,
            status: true,
            completedAt: true,
            receivedDate: true,
          },
        },
      },
    });

    const report = technicians.map((tech) => {
      const totalMaintenances = tech.maintenances.length;
      const completedMaintenances = tech.maintenances.filter((m) => m.status === 'COMPLETED').length;
      const avgCompletionTime = tech.maintenances
        .filter((m) => m.completedAt)
        .reduce((sum, m) => {
          const diff = new Date(m.completedAt!).getTime() - new Date(m.receivedDate).getTime();
          return sum + diff / (1000 * 60 * 60 * 24);
        }, 0) / (completedMaintenances || 1);

      return {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        totalMaintenances,
        completedMaintenances,
        completionRate: totalMaintenances > 0 ? (completedMaintenances / totalMaintenances) * 100 : 0,
        avgCompletionDays: Math.round(avgCompletionTime * 10) / 10,
      };
    });

    return report;
  }

  async getCostReport(query: ReportQueryInput) {
    const { startDate, endDate } = query;

    const items = await prisma.maintenanceItem.findMany({
      where: {
        maintenance: {
          receivedDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      },
      include: {
        maintenance: {
          select: {
            machine: {
              select: { code: true, name: true },
            },
            maintenanceType: {
              select: { name: true, isPreventive: true },
            },
          },
        },
      },
    });

    const totalCost = items.reduce((sum, item) => sum + (item.unitCost || 0) * item.quantity, 0);
    const byCategory = {
      preventive: items
        .filter((item) => item.maintenance.maintenanceType?.isPreventive)
        .reduce((sum, item) => sum + (item.unitCost || 0) * item.quantity, 0),
      corrective: items
        .filter((item) => !item.maintenance.maintenanceType?.isPreventive)
        .reduce((sum, item) => sum + (item.unitCost || 0) * item.quantity, 0),
    };

    const bySupplier = items.reduce((acc, item) => {
      const supplier = item.supplier || 'Sin proveedor';
      acc[supplier] = (acc[supplier] || 0) + (item.unitCost || 0) * item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCost,
      byCategory,
      bySupplier,
      itemCount: items.length,
    };
  }

  async getDashboardStats(query: DashboardQueryInput) {
    const { period } = query;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const [totalMachines, activeMachines, totalMaintenances, completedMaintenances, pendingMaintenances, overdueAlerts] =
      await Promise.all([
        prisma.machine.count(),
        prisma.machine.count({ where: { status: 'ACTIVE' } }),
        prisma.maintenance.count({
          where: { receivedDate: { gte: startDate } },
        }),
        prisma.maintenance.count({
          where: {
            receivedDate: { gte: startDate },
            status: 'COMPLETED',
          },
        }),
        prisma.maintenance.count({
          where: { status: 'SCHEDULED' },
        }),
        prisma.alert.count({
          where: {
            type: 'OVERDUE',
            isRead: false,
          },
        }),
      ]);

    const recentMaintenances = await prisma.maintenance.findMany({
      take: 5,
      include: {
        machine: { select: { code: true, name: true } },
        maintenanceType: { select: { name: true } },
        technician: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const maintenancesByMonth = await prisma.maintenance.groupBy({
      by: ['status'],
      where: { receivedDate: { gte: startDate } },
      _count: true,
    });

    return {
      totalMachines,
      activeMachines,
      totalMaintenances,
      completedMaintenances,
      pendingMaintenances,
      overdueAlerts,
      recentMaintenances,
      maintenancesByStatus: maintenancesByMonth.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const reportsService = new ReportsService();
