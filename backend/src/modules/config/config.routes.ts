import { Router } from 'express';
import { configController } from './config.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { configKeyParamSchema, updateConfigBodySchema } from './config.validation';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get(
  '/',
  configController.getAll
);

router.get(
  '/:key',
  validate({ params: configKeyParamSchema }),
  configController.getByKey
);

router.put(
  '/:key',
  validate({ params: configKeyParamSchema, body: updateConfigBodySchema }),
  configController.update
);

export default router;
