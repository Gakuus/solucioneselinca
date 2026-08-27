import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { ReportQueryInput, DashboardQueryInput } from './reports.validation';

export class ReportsController {
  async getMaintenanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ReportQueryInput;
      const result = await reportsService.getMaintenanceReport(query);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMachineReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ReportQueryInput;
      const result = await reportsService.getMachineReport(query);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTechnicianReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ReportQueryInput;
      const result = await reportsService.getTechnicianReport(query);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCostReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ReportQueryInput;
      const result = await reportsService.getCostReport(query);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      const result = await reportsService.getDashboardStats(query);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
