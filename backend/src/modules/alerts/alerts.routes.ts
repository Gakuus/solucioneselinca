import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { createAlertSchema, alertQuerySchema } from './alerts.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  alertsController.getStats
);

router.get(
  '/',
  validate({ query: alertQuerySchema }),
  alertsController.getAll
);

router.get(
  '/:id',
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
  alertsController.markAsRead
);

router.patch(
  '/read-all',
  alertsController.markAllAsRead
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  alertsController.delete
);

router.post(
  '/check-upcoming',
  authorize('ADMIN', 'SUPERVISOR'),
  alertsController.checkUpcoming
);

export default router;
