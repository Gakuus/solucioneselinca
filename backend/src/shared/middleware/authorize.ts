import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';

type Role = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'VIEWER';

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 4,
  SUPERVISOR: 3,
  TECHNICIAN: 2,
  VIEWER: 1,
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;

    if (!userRole) {
      return next(new ForbiddenError('No autenticado'));
    }

    if (allowedRoles.length === 0) {
      // No roles specified, just check if authenticated
      return next();
    }

    const hasPermission = allowedRoles.some((role) => {
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[role] || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          `No tienes permiso para realizar esta acción. Roles requeridos: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
