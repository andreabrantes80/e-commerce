import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(200),
  sku: z.string().trim().min(1, "SKU é obrigatório").max(100),
  description: z.string().trim().max(5000).optional(),
  priceCents: z
    .number()
    .int("Preço deve ser inteiro")
    .min(1, "Preço deve ser maior que zero"),
  stock: z
    .number()
    .int("Estoque deve ser inteiro")
    .min(0, "Estoque não pode ser negativo"),
  categoryId: z.string().trim().min(1).optional(),
  active: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url: z.string().trim().url("URL da imagem inválida"),
        alt: z.string().trim().max(255).optional(),
        position: z.number().int().min(0).optional(),
      }),
    )
    .max(20)
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
