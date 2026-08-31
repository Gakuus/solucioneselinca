import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { reportQuerySchema, dashboardQuerySchema, reportExportParamSchema } from './reports.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/dashboard',
  validate({ query: dashboardQuerySchema }),
  reportsController.getDashboardStats
);

router.get(
  '/maintenance',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ query: reportQuerySchema }),
  reportsController.getMaintenanceReport
);

router.get(
  '/machine',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ query: reportQuerySchema }),
  reportsController.getMachineReport
);

router.get(
  '/technician',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ query: reportQuerySchema }),
  reportsController.getTechnicianReport
);

router.get(
  '/cost',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ query: reportQuerySchema }),
  reportsController.getCostReport
);

router.get(
  '/:type/export',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ params: reportExportParamSchema, query: reportQuerySchema }),
  reportsController.exportCSV
);

router.get(
  '/:type/export-pdf',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ params: reportExportParamSchema, query: reportQuerySchema }),
  reportsController.exportPDF
);

router.get(
  '/:type/export-xlsx',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ params: reportExportParamSchema, query: reportQuerySchema }),
  reportsController.exportExcel
);

export default router;
