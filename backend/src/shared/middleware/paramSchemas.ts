import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const idAndItemIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
  itemId: z.string().uuid('Item ID inválido'),
});
