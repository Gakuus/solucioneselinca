import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { ReportQueryInput, DashboardQueryInput } from './reports.validation';
import { buildReportPdf } from './pdf-render';
import { buildReportExcel } from './excel.service';

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

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const query = req.query as unknown as ReportQueryInput;
      const csv = await reportsService.exportCSV(type, query);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${type}.csv`);
      // BOM para que Excel abra UTF-8 correctamente
      res.send('\uFEFF' + csv);
    } catch (error) {
      next(error);
    }
  }

  async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const query = req.query as unknown as ReportQueryInput;
      const pdf = await buildReportPdf(type, query);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${type}.pdf`);
      res.send(Buffer.from(pdf));
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const query = req.query as unknown as ReportQueryInput;
      const { buffer, filename } = await buildReportExcel(type, query);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
