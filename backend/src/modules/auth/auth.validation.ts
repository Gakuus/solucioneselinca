import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo'
    ),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'VIEWER']).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo'
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  email: z.string().email('Email inválido').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
