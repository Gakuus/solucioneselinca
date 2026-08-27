import { z } from 'zod';

export const createMachineSchema = z.object({
  code: z.string().min(1, 'Código requerido').max(50),
  name: z.string().min(1, 'Nombre requerido').max(200),
  machineTypeId: z.string().uuid('ID de tipo de máquina inválido'),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  serialNumber: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED']).optional(),
  purchaseDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de compra inválida',
  }),
  warrantyExpiration: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Fecha de garantía inválida',
  }),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateMachineSchema = createMachineSchema.partial();

export const machineQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED']).optional(),
  machineTypeId: z.string().uuid().optional(),
  sortBy: z.enum(['code', 'name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const changeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED']),
  reason: z.string().max(500).optional(),
});

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
export type MachineQueryInput = z.infer<typeof machineQuerySchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
