import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { auditQuerySchema } from './audit.validation';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get(
  '/stats',
  auditController.getStats
);

router.get(
  '/recent',
  auditController.getRecentActivity
);

router.get(
  '/',
  validate({ query: auditQuerySchema }),
  auditController.getAll
);

router.get(
  '/:id',
  auditController.getById
);

export default router;
