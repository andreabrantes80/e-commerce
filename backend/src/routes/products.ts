import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

type ProductBody = {
  name: string;
  sku: string;
  description?: string | null;
  priceCents: number;
  stock: number;
  categoryId?: string | null;
  active?: boolean;
  images?: {
    url: string;
    alt?: string | null;
  }[];
};

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
  // LISTAR PRODUTOS
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

  // BUSCAR PRODUTO POR ID - ADMIN
  app.get<{ Params: { id: string } }>(
    "/api/admin/products/:id",
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

  // BUSCAR PRODUTO POR SLUG - LOJA
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

  // CRIAR PRODUTO
  app.post<{ Body: ProductBody }>(
    "/api/admin/products",
    async (request, reply) => {
      const {
        name,
        sku,
        description,
        priceCents,
        stock,
        categoryId,
        active = true,
        images = [],
      } = request.body;

      if (!name?.trim()) {
        return reply.code(400).send({
          message: "Nome do produto é obrigatório",
        });
      }

      if (!sku?.trim()) {
        return reply.code(400).send({
          message: "SKU é obrigatório",
        });
      }

      if (!Number.isInteger(priceCents) || priceCents < 0) {
        return reply.code(400).send({
          message: "Preço inválido",
        });
      }

      if (!Number.isInteger(stock) || stock < 0) {
        return reply.code(400).send({
          message: "Estoque inválido",
        });
      }

      const existingSku = await prisma.product.findUnique({
        where: {
          sku: sku.trim(),
        },
      });

      if (existingSku) {
        return reply.code(409).send({
          message: "Já existe um produto com este SKU",
        });
      }

      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          return reply.code(400).send({
            message: "Categoria não encontrada",
          });
        }
      }

      const slug = await uniqueSlug(name);

      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          slug,
          sku: sku.trim(),
          description: description?.trim() || null,
          priceCents,
          stock,
          categoryId: categoryId || null,
          active,
          images: {
            create: images.map((image, index) => ({
              url: image.url,
              alt: image.alt || name.trim(),
              position: index,
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

  // EDITAR PRODUTO
  app.patch<{
    Params: { id: string };
    Body: ProductBody;
  }>("/api/admin/products/:id", async (request, reply) => {
    const { id } = request.params;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return reply.code(404).send({
        message: "Produto não encontrado",
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
    } = request.body;

    if (!name?.trim()) {
      return reply.code(400).send({
        message: "Nome do produto é obrigatório",
      });
    }

    if (!sku?.trim()) {
      return reply.code(400).send({
        message: "SKU é obrigatório",
      });
    }

    if (!Number.isInteger(priceCents) || priceCents < 0) {
      return reply.code(400).send({
        message: "Preço inválido",
      });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return reply.code(400).send({
        message: "Estoque inválido",
      });
    }

    const skuProduct = await prisma.product.findUnique({
      where: {
        sku: sku.trim(),
      },
    });

    if (skuProduct && skuProduct.id !== id) {
      return reply.code(409).send({
        message: "Já existe outro produto com este SKU",
      });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return reply.code(400).send({
          message: "Categoria não encontrada",
        });
      }
    }

    const slug = await uniqueSlug(name, id);

    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      return tx.product.update({
        where: {
          id,
        },
        data: {
          name: name.trim(),
          slug,
          sku: sku.trim(),
          description: description?.trim() || null,
          priceCents,
          stock,
          categoryId: categoryId || null,
          active,
          images: {
            create: images.map((image, index) => ({
              url: image.url,
              alt: image.alt || name.trim(),
              position: index,
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
    });

    return product;
  });

  // EXCLUIR PRODUTO
  app.delete<{ Params: { id: string } }>(
    "/api/admin/products/:id",
    async (request, reply) => {
      const existing = await prisma.product.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!existing) {
        return reply.code(404).send({
          message: "Produto não encontrado",
        });
      }

      await prisma.product.delete({
        where: {
          id: request.params.id,
        },
      });

      return {
        success: true,
      };
    },
  );
}
