import { Request, Response, NextFunction } from 'express';
import { machinesService } from './machines.service';
import { auditService } from '../audit/audit.service';
import {
  buildMachineHistoryExcel as buildHistoryExcelData,
} from '../reports';
import { buildMachineHistoryPdf } from '../reports/pdf-render';
import {
  createMachineSchema,
  updateMachineSchema,
  machineQuerySchema,
  changeStatusSchema,
} from './machines.validation';
import { importMachinesFromExcel } from './machines-import';
import { buildMachinesListPdf } from './machines-export';
import { ZodError } from 'zod';

export class MachinesController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = machineQuerySchema.parse(req.query);
      const result = await machinesService.findAll(query);

      res.json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Parámetros inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const machine = await machinesService.findById(id);

      res.json({
        status: 'success',
        data: machine,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createMachineSchema.parse(req.body);
      const machine = await machinesService.create(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'Machine',
        entityId: machine.id,
        newValues: { code: machine.code, name: machine.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        status: 'success',
        data: machine,
      });
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateMachineSchema.parse(req.body);
      const machine = await machinesService.update(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'Machine',
        entityId: id,
        newValues: data,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        data: machine,
      });
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

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = changeStatusSchema.parse(req.body);
      const machine = await machinesService.changeStatus(id, data.status, data.reason);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'Machine',
        entityId: id,
        newValues: { status: data.status, reason: data.reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        data: machine,
      });
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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await machinesService.delete(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'Machine',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        message: 'Máquina desactivada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await machinesService.restore(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'Machine',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        message: 'Máquina reactivada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await machinesService.getHistory(id);

      res.json({
        status: 'success',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, machineTypeId, sortBy, sortOrder } = req.query;

      const { buffer, filename } = await machinesService.exportExcel({
        search: search as string,
        status: status as 'ACTIVE' | 'INACTIVE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED',
        machineTypeId: machineTypeId as string,
        sortBy: (sortBy as 'code' | 'name' | 'createdAt' | 'updatedAt') || 'code',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async exportListPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, machineTypeId, sortBy, sortOrder } = req.query;

      const pdf = await buildMachinesListPdf({
        search: search as string,
        status: status as 'ACTIVE' | 'INACTIVE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED',
        machineTypeId: machineTypeId as string,
        sortBy: (sortBy as 'code' | 'name' | 'createdAt' | 'updatedAt') || 'code',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=maquinas.pdf');
      res.send(Buffer.from(pdf));
    } catch (error) {
      next(error);
    }
  }

  async getMachineTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = await machinesService.getMachineTypes();

      res.json({
        status: 'success',
        data: types,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportHistoryPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pdf = await buildMachineHistoryPdf(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ficha_maquina_${id}.pdf`);
      res.send(Buffer.from(pdf));
    } catch (error) {
      next(error);
    }
  }

  async exportHistoryExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { buffer, filename } = await buildHistoryExcelData(id);

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

      const result = await importMachinesFromExcel(file.buffer, req.user?.userId);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'Machine',
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

export const machinesController = new MachinesController();
