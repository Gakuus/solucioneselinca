import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { auditService } from '../audit/audit.service';
import { createUserSchema, updateUserSchema, userQuerySchema } from './users.validation';
import { ZodError } from 'zod';

export class UsersController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = userQuerySchema.parse(req.query);
      const result = await usersService.findAll(query);

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
      const user = await usersService.findById(id);

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await usersService.create(data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        newValues: { name: user.name, email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        status: 'success',
        data: user,
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
      const data = updateUserSchema.parse(req.body);
      const user = await usersService.update(id, data);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        newValues: data,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        data: user,
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
      await usersService.delete(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        message: 'Usuario desactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await usersService.restore(id);

      await auditService.log({
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        message: 'Usuario reactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await usersService.getStats();

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
