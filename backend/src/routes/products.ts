import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../hooks/require-admin.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/products.js";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(name: string, currentId?: string) {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function productRoutes(app: FastifyInstance) {
  // =========================================================
  // LISTAR PRODUTOS - LOJA
  // =========================================================

  app.get("/api/products", async () => {
    return prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  // =========================================================
  // BUSCAR PRODUTO POR ID - ADMIN
  // =========================================================

  app.get<{ Params: { id: string } }>(
    "/api/admin/products/:id",
    {
      preHandler: requireAdmin,
    },
    async (request, reply) => {
      const product = await prisma.product.findUnique({
        where: {
          id: request.params.id,
        },
        include: {
          category: true,
          images: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      if (!product) {
        return reply.code(404).send({
          message: "Produto não encontrado",
        });
      }

      return product;
    },
  );

  // =========================================================
  // BUSCAR PRODUTO POR SLUG - LOJA
  // =========================================================

  app.get<{ Params: { slug: string } }>(
    "/api/products/:slug",
    async (request, reply) => {
      const product = await prisma.product.findUnique({
        where: {
          slug: request.params.slug,
        },
        include: {
          category: true,
          images: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      if (!product || !product.active) {
        return reply.code(404).send({
          message: "Produto não encontrado",
        });
      }

      return product;
    },
  );

  // =========================================================
  // CRIAR PRODUTO - ADMIN
  // =========================================================

  app.post(
    "/api/admin/products",
    {
      preHandler: requireAdmin,
    },
    async (request, reply) => {
      const result = createProductSchema.safeParse(request.body);

      if (!result.success) {
        return reply.code(400).send({
          message: "Dados inválidos",
          errors: result.error.flatten().fieldErrors,
        });
      }

      const {
        name,
        sku,
        description,
        priceCents,
        stock,
        categoryId,
        active = true,
        images = [],
      } = result.data;

      // Verificar SKU duplicado
      const existingSku = await prisma.product.findUnique({
        where: {
          sku,
        },
      });

      if (existingSku) {
        return reply.code(409).send({
          message: "Já existe um produto com este SKU",
        });
      }

      // Verificar categoria
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          return reply.code(400).send({
            message: "Categoria não encontrada",
          });
        }
      }

      // Gerar slug único
      const slug = await uniqueSlug(name);

      // Criar produto
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          sku,
          description: description || null,
          priceCents,
          stock,
          categoryId: categoryId || null,
          active,
          images: {
            create: images.map((image, index) => ({
              url: image.url,
              alt: image.alt || name,
              position: image.position ?? index,
            })),
          },
        },
        include: {
          category: true,
          images: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      return reply.code(201).send(product);
    },
  );

  // =========================================================
  // EDITAR PRODUTO - ADMIN
  // =========================================================

  app.patch<{
    Params: { id: string };
  }>(
    "/api/admin/products/:id",
    {
      preHandler: requireAdmin,
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verificar se produto existe
      const existing = await prisma.product.findUnique({
        where: {
          id,
        },
      });

      if (!existing) {
        return reply.code(404).send({
          message: "Produto não encontrado",
        });
      }

      // Validar dados
      const result = updateProductSchema.safeParse(request.body);

      if (!result.success) {
        return reply.code(400).send({
          message: "Dados inválidos",
          errors: result.error.flatten().fieldErrors,
        });
      }

      const {
        name,
        sku,
        description,
        priceCents,
        stock,
        categoryId,
        active,
        images,
      } = result.data;

      // Verificar SKU somente se foi enviado
      if (sku !== undefined) {
        const skuProduct = await prisma.product.findUnique({
          where: {
            sku,
          },
        });

        if (skuProduct && skuProduct.id !== id) {
          return reply.code(409).send({
            message: "Já existe outro produto com este SKU",
          });
        }
      }

      // Verificar categoria somente se foi enviada
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          return reply.code(400).send({
            message: "Categoria não encontrada",
          });
        }
      }

      // Montar dados da atualização
      const data: {
        name?: string;
        slug?: string;
        sku?: string;
        description?: string | null;
        priceCents?: number;
        stock?: number;
        categoryId?: string | null;
        active?: boolean;
      } = {};

      if (name !== undefined) {
        data.name = name;
        data.slug = await uniqueSlug(name, id);
      }

      if (sku !== undefined) {
        data.sku = sku;
      }

      if (description !== undefined) {
        data.description = description || null;
      }

      if (priceCents !== undefined) {
        data.priceCents = priceCents;
      }

      if (stock !== undefined) {
        data.stock = stock;
      }

      if (categoryId !== undefined) {
        data.categoryId = categoryId || null;
      }

      if (active !== undefined) {
        data.active = active;
      }

      // Atualizar produto e imagens dentro de uma transação
      const product = await prisma.$transaction(async (tx) => {
        if (images !== undefined) {
          await tx.productImage.deleteMany({
            where: {
              productId: id,
            },
          });
        }

        return tx.product.update({
          where: {
            id,
          },
          data: {
            ...data,

            ...(images !== undefined
              ? {
                  images: {
                    create: images.map((image, index) => ({
                      url: image.url,
                      alt: image.alt || name || existing.name,
                      position: image.position ?? index,
                    })),
                  },
                }
              : {}),
          },
          include: {
            category: true,
            images: {
              orderBy: {
                position: "asc",
              },
            },
          },
        });
      });

      return product;
    },
  );

  // =========================================================
  // EXCLUIR PRODUTO - ADMIN
  // =========================================================

  app.delete<{ Params: { id: string } }>(
    "/api/admin/products/:id",
    {
      preHandler: requireAdmin,
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await prisma.product.findUnique({
        where: {
          id,
        },
        include: {
          cartItems: true,
          orderItems: true,
        },
      });

      if (!existing) {
        return reply.code(404).send({
          message: "Produto não encontrado",
        });
      }

      const hasCartItems = existing.cartItems.length > 0;
      const hasOrderItems = existing.orderItems.length > 0;

      // Se o produto já foi usado em carrinho ou pedido,
      // não apagamos fisicamente para preservar o histórico.
      if (hasCartItems || hasOrderItems) {
        const product = await prisma.product.update({
          where: {
            id,
          },
          data: {
            active: false,
          },
        });

        return {
          success: true,
          action: "deactivated",
          message:
            "O produto possui histórico de uso e foi desativado em vez de excluído.",
          product,
        };
      }

      // Produto sem dependências: pode ser excluído definitivamente.
      await prisma.product.delete({
        where: {
          id,
        },
      });

      return {
        success: true,
        action: "deleted",
        message: "Produto excluído com sucesso.",
      };
    },
  );
}
