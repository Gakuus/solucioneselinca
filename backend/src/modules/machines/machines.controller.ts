import { Request, Response, NextFunction } from 'express';
import { machinesService } from './machines.service';
import {
  createMachineSchema,
  updateMachineSchema,
  machineQuerySchema,
} from './machines.validation';
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

      res.json({
        status: 'success',
        message: 'Máquina eliminada exitosamente',
      });
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
}

export const machinesController = new MachinesController();
