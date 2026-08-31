import { Request, Response, NextFunction } from 'express';
import { sparePartsService } from './spareparts.service';
import { auditService } from '../audit/audit.service';
import {
  createSparePartSchema,
  updateSparePartSchema,
  sparePartQuerySchema,
  addMovementSchema,
} from './spareparts.validation';
import { ZodError } from 'zod';

function handleZod(res: Response, error: ZodError, message: string) {
  return res.status(400).json({ status: 'error', message, errors: error.errors });
}

export class SparePartsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = sparePartQuerySchema.parse(req.query);
      const result = await sparePartsService.findAll(query);

      res.json({ status: 'success', ...result });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZod(res, error, 'Parámetros inválidos');
      }
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sparePart = await sparePartsService.findById(id);

      res.json({ status: 'success', data: sparePart });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSparePartSchema.parse(req.body);
      const sparePart = await sparePartsService.create(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'SparePart',
        entityId: sparePart.id,
        newValues: { code: sparePart.code, name: sparePart.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ status: 'success', data: sparePart });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZod(res, error, 'Datos inválidos');
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateSparePartSchema.parse(req.body);
      const sparePart = await sparePartsService.update(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'SparePart',
        entityId: id,
        newValues: data,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', data: sparePart });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZod(res, error, 'Datos inválidos');
      }
      next(error);
    }
  }

  async addMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = addMovementSchema.parse(req.body);
      const movement = await sparePartsService.addMovement(id, data, req.user?.userId);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'SparePart',
        entityId: id,
        newValues: { movement: data },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ status: 'success', data: movement });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZod(res, error, 'Datos inválidos');
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await sparePartsService.delete(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'SparePart',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', message: 'Repuesto desactivado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await sparePartsService.restore(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'SparePart',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({ status: 'success', message: 'Repuesto reactivado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const sparePartsController = new SparePartsController();
