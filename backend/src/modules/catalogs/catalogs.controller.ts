import { Request, Response, NextFunction } from 'express';
import { catalogsService } from './catalogs.service';
import { auditService } from '../audit/audit.service';
import {
  createMachineTypeSchema,
  updateMachineTypeSchema,
  createMaintenanceTypeSchema,
  updateMaintenanceTypeSchema,
} from './catalogs.validation';
import { ZodError } from 'zod';

export class CatalogsController {
  // Machine Types
  async getAllMachineTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = await catalogsService.getAllMachineTypes();
      res.json({ status: 'success', data: types });
    } catch (error) {
      next(error);
    }
  }

  async getMachineTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const type = await catalogsService.getMachineTypeById(id);
      res.json({ status: 'success', data: type });
    } catch (error) {
      next(error);
    }
  }

  async createMachineType(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createMachineTypeSchema.parse(req.body);
      const type = await catalogsService.createMachineType(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'MachineType',
        entityId: type.id,
        newValues: { name: type.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ status: 'success', data: type });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async updateMachineType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateMachineTypeSchema.parse(req.body);
      const type = await catalogsService.updateMachineType(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'MachineType',
        entityId: type.id,
        newValues: { name: type.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: type });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async deleteMachineType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await catalogsService.deleteMachineType(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'MachineType',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', message: 'Tipo de máquina eliminado' });
    } catch (error) {
      next(error);
    }
  }

  // Maintenance Types
  async getAllMaintenanceTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = await catalogsService.getAllMaintenanceTypes();
      res.json({ status: 'success', data: types });
    } catch (error) {
      next(error);
    }
  }

  async getMaintenanceTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const type = await catalogsService.getMaintenanceTypeById(id);
      res.json({ status: 'success', data: type });
    } catch (error) {
      next(error);
    }
  }

  async createMaintenanceType(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createMaintenanceTypeSchema.parse(req.body);
      const type = await catalogsService.createMaintenanceType(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'MaintenanceType',
        entityId: type.id,
        newValues: { name: type.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ status: 'success', data: type });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async updateMaintenanceType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateMaintenanceTypeSchema.parse(req.body);
      const type = await catalogsService.updateMaintenanceType(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'MaintenanceType',
        entityId: type.id,
        newValues: { name: type.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: type });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async deleteMaintenanceType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await catalogsService.deleteMaintenanceType(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'MaintenanceType',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', message: 'Tipo de mantenimiento eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

export const catalogsController = new CatalogsController();
