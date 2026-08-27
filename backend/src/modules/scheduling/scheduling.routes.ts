import { Router } from 'express';
import { schedulingController } from './scheduling.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { idParamSchema } from '../../shared/middleware/paramSchemas';
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
  validate({ params: idParamSchema }),
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
  validate({ params: idParamSchema, body: updateScheduleSchema }),
  schedulingController.update
);

router.delete(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ params: idParamSchema }),
  schedulingController.delete
);

router.patch(
  '/:id/toggle',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ params: idParamSchema }),
  schedulingController.toggleActive
);

router.post(
  '/:id/execute',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idParamSchema }),
  schedulingController.executeSchedule
);

export default router;
