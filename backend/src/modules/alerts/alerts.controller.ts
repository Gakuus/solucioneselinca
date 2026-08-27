import { Request, Response, NextFunction } from 'express';
import { alertsService } from './alerts.service';
import { CreateAlertInput, AlertQueryInput } from './alerts.validation';

export class AlertsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as AlertQueryInput;
      const result = await alertsService.getAll(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await alertsService.getById(id);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateAlertInput;
      const alert = await alertsService.create(data);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const alert = await alertsService.markAsRead(id, userId);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const result = await alertsService.markAllAsRead(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await alertsService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await alertsService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async checkUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await alertsService.checkUpcomingMaintenances();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const alertsController = new AlertsController();
