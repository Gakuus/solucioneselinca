import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';

const router = Router();

// Public routes
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));

// Protected routes
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.post('/change-password', authenticate, (req, res, next) =>
  authController.changePassword(req, res, next)
);
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));

export default router;
