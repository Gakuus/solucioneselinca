import { Request, Response, NextFunction } from 'express';
import { alertsService } from './alerts.service';
import { auditService } from '../audit/audit.service';
import { CreateAlertInput, AlertQueryInput } from './alerts.validation';

export class AlertsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as AlertQueryInput;
      const result = await alertsService.getAll(query);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await alertsService.getById(id);
      res.json({ status: 'success', data: alert });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateAlertInput;
      const alert = await alertsService.create(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'Alert',
        entityId: alert.id,
        newValues: { machineId: data.machineId, type: data.type, severity: data.severity },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ status: 'success', data: alert });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'No autorizado' });
      }
      const alert = await alertsService.markAsRead(id, userId);
      res.json({ status: 'success', data: alert });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'No autorizado' });
      }
      const result = await alertsService.markAllAsRead(userId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await alertsService.delete(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'Alert',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await alertsService.restore(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'Alert',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await alertsService.getStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  async checkUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await alertsService.checkUpcomingMaintenances();
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const alertsController = new AlertsController();
