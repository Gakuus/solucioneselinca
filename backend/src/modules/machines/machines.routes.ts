import { Router } from 'express';
import { machinesController } from './machines.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/machines - List machines (all roles)
router.get('/', (req, res, next) => machinesController.findAll(req, res, next));

// GET /api/v1/machines/types - Get machine types (all roles)
router.get('/types', (req, res, next) => machinesController.getMachineTypes(req, res, next));

// GET /api/v1/machines/:id - Get machine by ID (all roles)
router.get('/:id', (req, res, next) => machinesController.findById(req, res, next));

// POST /api/v1/machines - Create machine (Admin, Supervisor)
router.post('/', authorize('ADMIN', 'SUPERVISOR'), (req, res, next) =>
  machinesController.create(req, res, next)
);

// PUT /api/v1/machines/:id - Update machine (Admin, Supervisor)
router.put('/:id', authorize('ADMIN', 'SUPERVISOR'), (req, res, next) =>
  machinesController.update(req, res, next)
);

// DELETE /api/v1/machines/:id - Delete machine (Admin only)
router.delete('/:id', authorize('ADMIN'), (req, res, next) =>
  machinesController.delete(req, res, next)
);

export default router;
