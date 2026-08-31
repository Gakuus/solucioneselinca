import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  machineId: z.string().uuid('ID de máquina inválido'),
  maintenanceTypeId: z.string().uuid('ID de tipo de mantenimiento inválido').optional(),
  maintenanceTypeIds: z.array(z.string().uuid('ID de tipo de mantenimiento inválido')).min(1).optional(),
  technicianId: z.string().uuid('ID de técnico inválido').optional(),
  technicianIds: z.array(z.string().uuid('ID de técnico inválido')).min(1).optional(),
  receivedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de recepción inválida',
  }),
  currentHours: z.number().min(0, 'Horas actuales inválidas'),
  description: z.string().min(1, 'Descripción requerida').max(1000),
  observations: z.string().max(2000).optional(),
  hoursUntilNext: z.number().min(0).optional(),
  nextMaintenanceDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de próximo mantenimiento inválida',
  }),
  estimatedNextDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha estimada inválida',
  }),
  items: z.array(z.object({
    name: z.string().min(1, 'Nombre del item requerido').max(200),
    quantity: z.number().int().min(1).default(1),
    unitCost: z.number().min(0).optional(),
    supplier: z.string().max(200).optional(),
    category: z.string().max(100).optional(),
  })).optional(),
});

export const updateMaintenanceSchema = z.object({
  maintenanceTypeId: z.string().uuid('ID de tipo de mantenimiento inválido').optional(),
  maintenanceTypeIds: z.array(z.string().uuid('ID de tipo de mantenimiento inválido')).min(1).optional(),
  technicianId: z.string().uuid('ID de técnico inválido').optional(),
  technicianIds: z.array(z.string().uuid('ID de técnico inválido')).min(1).optional(),
  maintenanceDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de mantenimiento inválida',
  }),
  currentHours: z.number().min(0).optional(),
  description: z.string().min(1).max(1000).optional(),
  observations: z.string().max(2000).optional(),
  hoursUntilNext: z.number().min(0).optional(),
  nextMaintenanceDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de próximo mantenimiento inválida',
  }),
  estimatedNextDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha estimada inválida',
  }),
  items: z.array(z.object({
    name: z.string().min(1, 'Nombre del item requerido').max(200),
    quantity: z.number().int().min(1).default(1),
    unitCost: z.number().min(0).optional(),
    supplier: z.string().max(200).optional(),
    category: z.string().max(100).optional(),
  })).optional(),
});

export const maintenanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  machineId: z.string().uuid().optional(),
  technicianId: z.string().uuid().optional(),
  maintenanceTypeId: z.string().uuid().optional(),
  category: z.enum(['PREVENTIVE', 'CORRECTIVE']).optional(),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida',
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida',
  }),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(['receivedDate', 'maintenanceDate', 'createdAt', 'updatedAt', 'status']).default('receivedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const changeMaintenanceStatusSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  reason: z.string().max(500).optional(),
  completedHours: z.number().min(0).optional(),
  observations: z.string().max(2000).optional(),
});

export const addMaintenanceItemSchema = z.object({
  name: z.string().min(1, 'Nombre del item requerido').max(200),
  quantity: z.number().int().min(1).default(1),
  unitCost: z.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
});

export const updateMaintenanceItemSchema = addMaintenanceItemSchema.partial();

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type MaintenanceQueryInput = z.infer<typeof maintenanceQuerySchema>;
export type ChangeMaintenanceStatusInput = z.infer<typeof changeMaintenanceStatusSchema>;
export type AddMaintenanceItemInput = z.infer<typeof addMaintenanceItemSchema>;
export type UpdateMaintenanceItemInput = z.infer<typeof updateMaintenanceItemSchema>;
