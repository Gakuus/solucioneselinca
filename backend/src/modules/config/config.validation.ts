import { z } from 'zod';

export const configKeyParamSchema = z.object({
  key: z.string().min(1).max(100),
});

export const updateConfigBodySchema = z.object({
  value: z.unknown(),
});

export type UpdateConfigInput = z.infer<typeof updateConfigBodySchema>;
