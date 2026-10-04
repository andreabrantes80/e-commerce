import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(name: string, excludeId?: string) {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function categoryRoutes(app: FastifyInstance) {
  // Listar categorias
  app.get("/api/categories", async () => {
    return prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  });

  // Criar categoria
  app.post<{
    Body: {
      name: string;
      description?: string;
    };
  }>("/api/admin/categories", async (request, reply) => {
    const name = request.body.name?.trim();

    if (!name) {
      return reply.code(400).send({
        message: "Nome da categoria é obrigatório",
      });
    }

    const slug = await uniqueSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: request.body.description?.trim() || null,
      },
    });

    return reply.code(201).send(category);
  });

  // Atualizar categoria
  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      name?: string;
      description?: string;
    };
  }>("/api/admin/categories/:id", async (request, reply) => {
    const category = await prisma.category.findUnique({
      where: {
        id: request.params.id,
      },
    });

    if (!category) {
      return reply.code(404).send({
        message: "Categoria não encontrada",
      });
    }

    const name = request.body.name?.trim();

    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
    } = {};

    if (name) {
      data.name = name;
      data.slug = await uniqueSlug(name, category.id);
    }

    if (request.body.description !== undefined) {
      data.description = request.body.description.trim() || null;
    }

    const updated = await prisma.category.update({
      where: {
        id: category.id,
      },
      data,
    });

    return updated;
  });

  // Excluir categoria
  app.delete<{
    Params: {
      id: string;
    };
  }>("/api/admin/categories/:id", async (request, reply) => {
    const category = await prisma.category.findUnique({
      where: {
        id: request.params.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return reply.code(404).send({
        message: "Categoria não encontrada",
      });
    }

    if (category._count.products > 0) {
      return reply.code(409).send({
        message: "Não é possível excluir uma categoria que possui produtos.",
      });
    }

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    return {
      message: "Categoria excluída com sucesso",
    };
  });
}
