import { z } from 'zod';

export const createMachineTypeSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const updateMachineTypeSchema = createMachineTypeSchema.partial();

export const createMaintenanceTypeSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  isPreventive: z.boolean().default(true),
  estimatedHours: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const updateMaintenanceTypeSchema = createMaintenanceTypeSchema.partial();

export type CreateMachineTypeInput = z.infer<typeof createMachineTypeSchema>;
export type UpdateMachineTypeInput = z.infer<typeof updateMachineTypeSchema>;
export type CreateMaintenanceTypeInput = z.infer<typeof createMaintenanceTypeSchema>;
export type UpdateMaintenanceTypeInput = z.infer<typeof updateMaintenanceTypeSchema>;
