import { Router } from 'express';
import multer from 'multer';
import { machinesController } from './machines.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { idParamSchema } from '../../shared/middleware/paramSchemas';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authenticate);

// GET /api/v1/machines - List machines (all roles)
router.get('/', (req, res, next) => machinesController.findAll(req, res, next));

// GET /api/v1/machines/export - Export Excel (Admin, Supervisor)
router.get('/export', authorize('ADMIN', 'SUPERVISOR'), (req, res, next) => machinesController.exportExcel(req, res, next));

// GET /api/v1/machines/export-pdf - Export PDF (Admin, Supervisor)
router.get('/export-pdf', authorize('ADMIN', 'SUPERVISOR'), (req, res, next) =>
  machinesController.exportListPdf(req, res, next)
);

// GET /api/v1/machines/types - Get machine types (all roles)
router.get('/types', (req, res, next) => machinesController.getMachineTypes(req, res, next));

// POST /api/v1/machines/import - Import machines from Excel (Admin, Supervisor)
router.post('/import', authorize('ADMIN', 'SUPERVISOR'), upload.single('file'), (req, res, next) =>
  machinesController.importExcel(req, res, next)
);

// GET /api/v1/machines/:id - Get machine by ID (all roles)
router.get('/:id', validate({ params: idParamSchema }), (req, res, next) => machinesController.findById(req, res, next));

// GET /api/v1/machines/:id/history - Get machine history (all roles)
router.get('/:id/history', validate({ params: idParamSchema }), (req, res, next) => machinesController.getHistory(req, res, next));

// GET /api/v1/machines/:id/history-pdf - Export machine history as PDF
router.get('/:id/history-pdf', validate({ params: idParamSchema }), (req, res, next) =>
  machinesController.exportHistoryPdf(req, res, next)
);

// GET /api/v1/machines/:id/history-xlsx - Export machine history as Excel
router.get('/:id/history-xlsx', validate({ params: idParamSchema }), (req, res, next) =>
  machinesController.exportHistoryExcel(req, res, next)
);

// POST /api/v1/machines - Create machine (Admin, Supervisor)
router.post('/', authorize('ADMIN', 'SUPERVISOR'), (req, res, next) =>
  machinesController.create(req, res, next)
);

// PUT /api/v1/machines/:id - Update machine (Admin, Supervisor)
router.put('/:id', authorize('ADMIN', 'SUPERVISOR'), validate({ params: idParamSchema }), (req, res, next) =>
  machinesController.update(req, res, next)
);

// PATCH /api/v1/machines/:id/status - Change machine status (Admin, Supervisor)
router.patch('/:id/status', authorize('ADMIN', 'SUPERVISOR'), validate({ params: idParamSchema }), (req, res, next) =>
  machinesController.changeStatus(req, res, next)
);

// PATCH /api/v1/machines/:id/restore - Restore machine (Admin only)
router.patch('/:id/restore', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  machinesController.restore(req, res, next)
);

// DELETE /api/v1/machines/:id - Delete machine (Admin only)
router.delete('/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  machinesController.delete(req, res, next)
);

export default router;
