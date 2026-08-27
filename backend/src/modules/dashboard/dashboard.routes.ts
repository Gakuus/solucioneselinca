import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/stats', async (_req, res, next) => {
  try {
    const [
      totalMachines,
      activeMachines,
      maintenanceMachines,
      totalMaintenances,
      pendingMaintenances,
      completedMaintenances,
      totalUsers,
      activeUsers,
      totalAlerts,
      unreadAlerts,
    ] = await Promise.all([
      prisma.machine.count(),
      prisma.machine.count({ where: { status: 'ACTIVE' } }),
      prisma.machine.count({ where: { status: 'MAINTENANCE' } }),
      prisma.maintenance.count(),
      prisma.maintenance.count({ where: { status: 'PENDING' } }),
      prisma.maintenance.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.alert.count(),
      prisma.alert.count({ where: { isRead: false } }),
    ]);

    res.json({
      status: 'success',
      data: {
        machines: {
          total: totalMachines,
          active: activeMachines,
          maintenance: maintenanceMachines,
        },
        maintenances: {
          total: totalMaintenances,
          pending: pendingMaintenances,
          completed: completedMaintenances,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        alerts: {
          total: totalAlerts,
          unread: unreadAlerts,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/recent-maintenances', async (_req, res, next) => {
  try {
    const recentMaintenances = await prisma.maintenance.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        machine: {
          select: { id: true, code: true, name: true },
        },
        maintenanceType: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      status: 'success',
      data: recentMaintenances,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/recent-machines', async (_req, res, next) => {
  try {
    const recentMachines = await prisma.machine.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        machineType: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      status: 'success',
      data: recentMachines,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
