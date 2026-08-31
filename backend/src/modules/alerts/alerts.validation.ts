import { z } from 'zod';

export const createAlertSchema = z.object({
  machineId: z.string().uuid('ID de máquina inválido'),
  maintenanceId: z.string().uuid('ID de mantenimiento inválido').optional(),
  type: z.enum(['UPCOMING', 'OVERDUE', 'CUSTOM']),
  message: z.string().min(1, 'Mensaje requerido').max(1000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export const updateAlertSchema = z.object({
  isRead: z.boolean(),
});

export const alertQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['UPCOMING', 'OVERDUE', 'CUSTOM']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  isRead: z.coerce.boolean().optional(),
  machineId: z.string().uuid().optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'severity', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type AlertQueryInput = z.infer<typeof alertQuerySchema>;
