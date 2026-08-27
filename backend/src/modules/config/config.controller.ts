import { Request, Response, NextFunction } from 'express';
import { configService } from './config.service';
import { auditService } from '../audit/audit.service';

export class ConfigController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const config = await configService.getAll();
      res.json({ status: 'success', data: config });
    } catch (error) {
      next(error);
    }
  }

  async getByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const config = await configService.getByKey(key);
      res.json({ status: 'success', data: config });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      // Reject unknown config keys to prevent arbitrary data injection
      const allowed = configService.isKnownKey(key);
      if (!allowed) {
        return res.status(400).json({ status: 'error', message: `Clave de configuración desconocida: ${key}` });
      }

      const config = await configService.update(key, value);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'SystemConfig',
        entityId: key,
        newValues: { [key]: value },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: config });
    } catch (error) {
      next(error);
    }
  }
}

export const configController = new ConfigController();
