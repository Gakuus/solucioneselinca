import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.validation';
import { ZodError } from 'zod';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Refresh token requerido',
        });
      }

      const data = refreshTokenSchema.parse({ refreshToken: token });
      const tokens = await authService.refreshToken(data.refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        status: 'success',
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const token = req.headers.authorization?.split(' ')[1];

      if (userId) {
        await authService.logout(userId, token);
      }

      res.clearCookie('refreshToken');
      res.json({
        status: 'success',
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'No autenticado',
        });
      }

      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(userId, data);

      res.json({
        status: 'success',
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'No autenticado',
        });
      }

      const profile = await authService.getProfile(userId);

      res.json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
