import { Router } from 'express';
import { catalogsController } from './catalogs.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { idParamSchema } from '../../shared/middleware/paramSchemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Machine Types
router.get('/machine-types', (req, res, next) =>
  catalogsController.getAllMachineTypes(req, res, next)
);

router.get('/machine-types/:id', validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.getMachineTypeById(req, res, next)
);

router.post('/machine-types', authorize('ADMIN'), (req, res, next) =>
  catalogsController.createMachineType(req, res, next)
);

router.put('/machine-types/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.updateMachineType(req, res, next)
);

router.delete('/machine-types/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.deleteMachineType(req, res, next)
);

router.patch('/machine-types/:id/restore', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.restoreMachineType(req, res, next)
);

// Maintenance Types
router.get('/maintenance-types', (req, res, next) =>
  catalogsController.getAllMaintenanceTypes(req, res, next)
);

router.get('/maintenance-types/:id', validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.getMaintenanceTypeById(req, res, next)
);

router.post('/maintenance-types', authorize('ADMIN'), (req, res, next) =>
  catalogsController.createMaintenanceType(req, res, next)
);

router.put('/maintenance-types/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.updateMaintenanceType(req, res, next)
);

router.delete('/maintenance-types/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.deleteMaintenanceType(req, res, next)
);

router.patch('/maintenance-types/:id/restore', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  catalogsController.restoreMaintenanceType(req, res, next)
);

export default router;
