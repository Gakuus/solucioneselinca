import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
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

      res.json({
        status: 'success',
        message: 'Usuario eliminado exitosamente',
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
