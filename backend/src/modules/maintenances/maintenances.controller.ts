import { Request, Response, NextFunction } from 'express';
import { maintenancesService } from './maintenances.service';
import { auditService } from '../audit/audit.service';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  MaintenanceQueryInput,
  ChangeMaintenanceStatusInput,
  AddMaintenanceItemInput,
  UpdateMaintenanceItemInput,
} from './maintenances.validation';

export class MaintenancesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as MaintenanceQueryInput;
      const result = await maintenancesService.getAll(query);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const maintenance = await maintenancesService.getById(id);
      res.json({ status: 'success', data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateMaintenanceInput;
      const maintenance = await maintenancesService.create(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'Maintenance',
        entityId: maintenance.id,
        newValues: { machineId: data.machineId, maintenanceTypeId: data.maintenanceTypeId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ status: 'success', data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateMaintenanceInput;
      const maintenance = await maintenancesService.update(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'Maintenance',
        entityId: id,
        newValues: data,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as ChangeMaintenanceStatusInput;
      const maintenance = await maintenancesService.changeStatus(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'Maintenance',
        entityId: id,
        newValues: { status: data.status },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await maintenancesService.delete(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'Maintenance',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as AddMaintenanceItemInput;
      const item = await maintenancesService.addItem(id, data);
      res.status(201).json({ status: 'success', data: item });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = req.params;
      const data = req.body as UpdateMaintenanceItemInput;
      const item = await maintenancesService.updateItem(id, itemId, data);
      res.json({ status: 'success', data: item });
    } catch (error) {
      next(error);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = req.params;
      const result = await maintenancesService.deleteItem(id, itemId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await maintenancesService.getStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;
      const result = await maintenancesService.getCalendar(
        Number(year),
        Number(month)
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const maintenancesController = new MaintenancesController();
