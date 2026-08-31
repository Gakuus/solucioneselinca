import { z } from 'zod';

export const reportQuerySchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida',
  }),
  machineId: z.string().uuid().optional(),
  technicianId: z.string().uuid().optional(),
  maintenanceTypeId: z.string().uuid().optional(),
  category: z.enum(['PREVENTIVE', 'CORRECTIVE']).optional(),
});

export const dashboardQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
});

export const reportExportParamSchema = z.object({
  type: z.enum(['maintenance', 'machine', 'technician', 'cost'], {
    message: 'Tipo de reporte no soportado',
  }),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
