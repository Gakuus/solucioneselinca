import { Router } from 'express';
import { maintenancesController } from './maintenances.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { idParamSchema, idAndItemIdParamSchema } from '../../shared/middleware/paramSchemas';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceQuerySchema,
  changeMaintenanceStatusSchema,
  addMaintenanceItemSchema,
  updateMaintenanceItemSchema,
} from './maintenances.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/stats',
  maintenancesController.getStats
);

router.get(
  '/calendar',
  maintenancesController.getCalendar
);

router.get(
  '/',
  validate({ query: maintenanceQuerySchema }),
  maintenancesController.getAll
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  maintenancesController.getById
);

router.post(
  '/',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ body: createMaintenanceSchema }),
  maintenancesController.create
);

router.put(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idParamSchema, body: updateMaintenanceSchema }),
  maintenancesController.update
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ body: changeMaintenanceStatusSchema }),
  maintenancesController.changeStatus
);

router.delete(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR'),
  validate({ params: idParamSchema }),
  maintenancesController.delete
);

router.post(
  '/:id/items',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idParamSchema, body: addMaintenanceItemSchema }),
  maintenancesController.addItem
);

router.put(
  '/:id/items/:itemId',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idAndItemIdParamSchema, body: updateMaintenanceItemSchema }),
  maintenancesController.updateItem
);

router.delete(
  '/:id/items/:itemId',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idAndItemIdParamSchema }),
  maintenancesController.deleteItem
);

export default router;
