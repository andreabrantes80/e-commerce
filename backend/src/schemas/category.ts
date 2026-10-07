import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  description: z.string().trim().max(1000).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
