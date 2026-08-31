import { Router } from 'express';
import { sparePartsController } from './spareparts.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { idParamSchema } from '../../shared/middleware/paramSchemas';
import {
  createSparePartSchema,
  updateSparePartSchema,
  sparePartQuerySchema,
  addMovementSchema,
} from './spareparts.validation';

const router = Router();

router.use(authenticate);

// GET /api/v1/spare-parts - List spare parts (all roles)
router.get('/', validate({ query: sparePartQuerySchema }), sparePartsController.findAll);

// GET /api/v1/spare-parts/:id - Get spare part by ID (all roles)
router.get('/:id', validate({ params: idParamSchema }), sparePartsController.findById);

// POST /api/v1/spare-parts - Create spare part (Admin, Supervisor, Technician)
router.post(
  '/',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ body: createSparePartSchema }),
  sparePartsController.create
);

// PUT /api/v1/spare-parts/:id - Update spare part (Admin, Supervisor, Technician)
router.put(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idParamSchema, body: updateSparePartSchema }),
  sparePartsController.update
);

// POST /api/v1/spare-parts/:id/movements - Register stock movement (Admin, Supervisor, Technician)
router.post(
  '/:id/movements',
  authorize('ADMIN', 'SUPERVISOR', 'TECHNICIAN'),
  validate({ params: idParamSchema, body: addMovementSchema }),
  sparePartsController.addMovement
);

// PATCH /api/v1/spare-parts/:id/restore - Restore spare part (Admin only)
router.patch(
  '/:id/restore',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  sparePartsController.restore
);

// DELETE /api/v1/spare-parts/:id - Delete spare part (Admin only)
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  sparePartsController.delete
);

export default router;
