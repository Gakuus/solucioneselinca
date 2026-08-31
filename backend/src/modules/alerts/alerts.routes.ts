import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { createAlertSchema, alertQuerySchema } from './alerts.validation';
import { idParamSchema } from '../../shared/middleware/paramSchemas';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  alertsController.getStats
);

router.get(
  '/',
  validate({ query: alertQuerySchema }),
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  alertsController.getAll
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  alertsController.getById
);

router.post(
  '/',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ body: createAlertSchema }),
  alertsController.create
);

router.patch(
  '/:id/read',
  validate({ params: idParamSchema }),
  alertsController.markAsRead
);

router.patch(
  '/read-all',
  alertsController.markAllAsRead
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  authorize('ADMIN'),
  alertsController.delete
);

router.patch(
  '/:id/restore',
  validate({ params: idParamSchema }),
  authorize('ADMIN'),
  alertsController.restore
);

router.post(
  '/check-upcoming',
  authorize('ADMIN', 'SUPERVISOR'),
  alertsController.checkUpcoming
);

export default router;
