import { Request, Response, NextFunction } from 'express';
import { maintenancesService } from './maintenances.service';
import { auditService } from '../audit/audit.service';
import { buildMaintenancesListPdf, buildMaintenancesListExcel } from './maintenances-export';
import { importMaintenancesFromExcel } from './maintenances-import';
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
        newValues: { machineId: data.machineId, maintenanceTypeId: data.maintenanceTypeId, maintenanceTypeIds: data.maintenanceTypeIds, technicianId: data.technicianId, technicianIds: data.technicianIds },
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

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await maintenancesService.restore(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
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

  async exportListPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as MaintenanceQueryInput;
      const pdf = await buildMaintenancesListPdf(query);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=mantenimientos.pdf');
      res.send(Buffer.from(pdf));
    } catch (error) {
      next(error);
    }
  }

  async exportListXlsx(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as MaintenanceQueryInput;
      const { buffer, filename } = await buildMaintenancesListExcel(query);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async importExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ status: 'error', message: 'No se subió ningún archivo' });
      }

      const result = await importMaintenancesFromExcel(file.buffer, req.user?.userId);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'Maintenance',
        newValues: { import: result, file: file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const maintenancesController = new MaintenancesController();
