import { Router } from 'express';
import { schedulingController } from './scheduling.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { createScheduleSchema, updateScheduleSchema, scheduleQuerySchema } from './scheduling.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/upcoming',
  schedulingController.getUpcomingExecutions
);

router.get(
  '/',
  validate({ query: scheduleQuerySchema }),
  schedulingController.getAll
);

router.get(
  '/:id',
  schedulingController.getById
);

router.post(
  '/',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ body: createScheduleSchema }),
  schedulingController.create
);

router.put(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ body: updateScheduleSchema }),
  schedulingController.update
);

router.delete(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR'),
  schedulingController.delete
);

router.patch(
  '/:id/toggle',
  authorize('ADMIN', 'SUPERVISOR'),
  schedulingController.toggleActive
);

router.post(
  '/:id/execute',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  schedulingController.executeSchedule
);

export default router;
