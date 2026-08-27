import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { authRateLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// Public routes (with aggressive rate limiting for brute-force protection)
router.post('/login', authRateLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/register', authRateLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/refresh-token', authRateLimiter, (req, res, next) => authController.refreshToken(req, res, next));

// Protected routes
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.post('/change-password', authenticate, (req, res, next) =>
  authController.changePassword(req, res, next)
);
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));
router.put('/profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));

export default router;
