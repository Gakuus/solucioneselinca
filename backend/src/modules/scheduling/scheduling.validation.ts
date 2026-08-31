import { z } from 'zod';

export const createScheduleSchema = z.object({
  machineId: z.string().uuid('ID de máquina inválido'),
  maintenanceTypeId: z.string().uuid('ID de tipo de mantenimiento inválido'),
  technicianId: z.string().uuid('ID de técnico inválido').optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  interval: z.number().int().min(1).default(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida',
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida',
  }),
  nextExecution: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de próxima ejecución inválida',
  }),
  hoursInterval: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  description: z.string().max(1000).optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const scheduleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  machineId: z.string().uuid().optional(),
  maintenanceTypeId: z.string().uuid().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  isActive: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(['nextExecution', 'createdAt', 'frequency']).default('nextExecution'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ScheduleQueryInput = z.infer<typeof scheduleQuerySchema>;
