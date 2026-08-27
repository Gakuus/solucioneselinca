import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { AuditQueryInput } from './audit.validation';

export class AuditController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as AuditQueryInput;
      const result = await auditService.getAll(query);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const log = await auditService.getById(id);
      if (!log) {
        return res.status(404).json({ status: 'error', message: 'Registro de auditoría no encontrado' });
      }
      res.json({ status: 'success', data: log });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await auditService.getStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await auditService.getRecentActivity(limit);
      res.json({ status: 'success', data: logs });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
