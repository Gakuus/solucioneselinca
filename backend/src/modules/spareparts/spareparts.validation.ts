import { z } from 'zod';

export const createSparePartSchema = z.object({
  code: z.string().min(1, 'Código requerido').max(100),
  name: z.string().min(1, 'Nombre requerido').max(200),
  category: z.enum(['FILTER', 'LUBRICANT', 'HYDRAULIC', 'ELECTRICAL', 'MECHANICAL', 'TIRE', 'CHEMICAL', 'OTHER']).default('OTHER'),
  unit: z.enum(['UNIT', 'LITER', 'KILOGRAM', 'GALLON', 'METER', 'PACK']).default('UNIT'),
  quantity: z.number().min(0, 'Cantidad no puede ser negativa').default(0),
  minStock: z.number().min(0, 'Stock mínimo no puede ser negativo').default(0),
  unitCost: z.number().min(0).optional().nullable(),
  supplier: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  machineTypeId: z.string().uuid('Tipo de máquina inválido').optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const updateSparePartSchema = createSparePartSchema.partial();

export const sparePartQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.enum(['FILTER', 'LUBRICANT', 'HYDRAULIC', 'ELECTRICAL', 'MECHANICAL', 'TIRE', 'CHEMICAL', 'OTHER']).optional(),
  machineTypeId: z.string().uuid().optional(),
  lowStock: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'category', 'quantity', 'unitCost', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const addMovementSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().min(0.0001, 'Cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateSparePartInput = z.infer<typeof createSparePartSchema>;
export type UpdateSparePartInput = z.infer<typeof updateSparePartSchema>;
export type SparePartQueryInput = z.infer<typeof sparePartQuerySchema>;
export type AddMovementInput = z.infer<typeof addMovementSchema>;
