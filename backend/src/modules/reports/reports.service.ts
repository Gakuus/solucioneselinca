import { PrismaClient, Prisma } from '@prisma/client';
import { ReportQueryInput, DashboardQueryInput } from './reports.validation';
import { maintenanceTypeLabel } from './maint-types';
import { maintenanceTechniciansLabel } from './maint-technicians';
import { parseLocalDate, endOfLocalDay } from '../../shared/utils/dates';

const prisma = new PrismaClient();

const fmtDate = (d: Date | string | null | undefined) => (d ? new Date(d).toLocaleDateString('es-ES') : '');

// Convierte los rangos de fecha (YYYY-MM-DD) a objeto Prisma, llevando el
// endDate al final del día para incluir todos los registros de esa fecha.
function dateRange(startDate: string, endDate: string): { gte: Date; lte: Date } {
  const start = parseLocalDate(startDate);
  const end = endOfLocalDay(endDate);
  return { gte: start, lte: end };
}

const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

const escapeCsv = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export class ReportsService {
  async getMaintenanceReport(query: ReportQueryInput) {
    const { startDate, endDate, machineId, technicianId, maintenanceTypeId, category } = query;

    const where: Prisma.MaintenanceWhereInput = {
      receivedDate: dateRange(startDate, endDate),
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
          technicianAssignments: {
            include: {
              technician: { select: { id: true, name: true } },
            },
            orderBy: { order: 'asc' },
          },
          items: true,
          typeAssignments: {
            include: {
              maintenanceType: { select: { name: true, isPreventive: true } },
            },
            orderBy: { order: 'asc' },
          },
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
            receivedDate: dateRange(startDate, endDate),
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
            receivedDate: dateRange(startDate, endDate),
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

  async exportCSV(type: string, query: ReportQueryInput) {
    if (type === 'maintenance') {
      const report = await this.getMaintenanceReport(query);
      const headers = ['Máquina', 'Código', 'Tipo', 'Técnico', 'Fecha', 'Estado', 'Costo'];
      const rows = report.data.map((m: any) => [
        m.machine?.name || '',
        m.machine?.code || '',
        maintenanceTypeLabel(m),
        maintenanceTechniciansLabel(m),
        fmtDate(m.receivedDate),
        m.status,
        (m.items || []).reduce((s: number, i: any) => s + (i.unitCost || 0) * i.quantity, 0).toFixed(2),
      ]);
      return toCsv(headers, rows);
    }

    if (type === 'machine') {
      const report = await this.getMachineReport(query);
      const headers = ['Código', 'Nombre', 'Tipo', 'Estado', 'Total Mant.', 'Preventivos', 'Correctivos', 'Costo'];
      const rows = report.map((m) => [
        m.code,
        m.name,
        m.type || '',
        m.status,
        m.totalMaintenances,
        m.preventiveCount,
        m.correctiveCount,
        m.totalCost.toFixed(2),
      ]);
      return toCsv(headers, rows);
    }

    if (type === 'technician') {
      const report = await this.getTechnicianReport(query);
      const headers = ['Nombre', 'Email', 'Total Mant.', 'Completados', 'Tasa Éxito', 'Prom. Días'];
      const rows = report.map((t) => [
        t.name,
        t.email,
        t.totalMaintenances,
        t.completedMaintenances,
        `${t.completionRate.toFixed(1)}%`,
        t.avgCompletionDays,
      ]);
      return toCsv(headers, rows);
    }

    if (type === 'cost') {
      const report = await this.getCostReport(query);
      const headers = ['Proveedor', 'Costo'];
      const rows = Object.entries(report.bySupplier)
        .sort(([, a], [, b]) => b - a)
        .map(([supplier, cost]) => [supplier, cost.toFixed(2)]);
      rows.push(['TOTAL', report.totalCost.toFixed(2)]);
      return toCsv(headers, rows);
    }

    throw new Error('Tipo de reporte no soportado');
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
        typeAssignments: {
          include: {
            maintenanceType: { select: { id: true, name: true, isPreventive: true } },
          },
          orderBy: { order: 'asc' },
        },
        technicianAssignments: {
          include: {
            technician: { select: { id: true, name: true } },
          },
          orderBy: { order: 'asc' },
        },
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
