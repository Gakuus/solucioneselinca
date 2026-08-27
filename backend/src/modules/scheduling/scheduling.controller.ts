import { Request, Response, NextFunction } from 'express';
import { schedulingService } from './scheduling.service';
import { CreateScheduleInput, UpdateScheduleInput, ScheduleQueryInput } from './scheduling.validation';

export class SchedulingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ScheduleQueryInput;
      const result = await schedulingService.getAll(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await schedulingService.getById(id);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateScheduleInput;
      const schedule = await schedulingService.create(data);
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateScheduleInput;
      const schedule = await schedulingService.update(id, data);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await schedulingService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await schedulingService.toggleActive(id);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async executeSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const technicianId = req.user?.id;
      if (!technicianId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const maintenance = await schedulingService.executeSchedule(id, technicianId);
      res.status(201).json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingExecutions(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const schedules = await schedulingService.getUpcomingExecutions(days);
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  }
}

export const schedulingController = new SchedulingController();
