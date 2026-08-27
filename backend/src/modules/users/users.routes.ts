import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { idParamSchema } from '../../shared/middleware/paramSchemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users/stats - User statistics (Admin only)
router.get('/stats', authorize('ADMIN'), (req, res, next) =>
  usersController.getStats(req, res, next)
);

// GET /api/v1/users - List users (Admin, Supervisor)
router.get('/', authorize('ADMIN', 'SUPERVISOR'), (req, res, next) =>
  usersController.findAll(req, res, next)
);

// GET /api/v1/users/:id - Get user by ID (Admin, Supervisor)
router.get('/:id', authorize('ADMIN', 'SUPERVISOR'), validate({ params: idParamSchema }), (req, res, next) =>
  usersController.findById(req, res, next)
);

// POST /api/v1/users - Create user (Admin only)
router.post('/', authorize('ADMIN'), (req, res, next) =>
  usersController.create(req, res, next)
);

// PUT /api/v1/users/:id - Update user (Admin only)
router.put('/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  usersController.update(req, res, next)
);

// DELETE /api/v1/users/:id - Delete user (Admin only)
router.delete('/:id', authorize('ADMIN'), validate({ params: idParamSchema }), (req, res, next) =>
  usersController.delete(req, res, next)
);

export default router;
