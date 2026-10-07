import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { comparePassword, createAuthToken } from "../lib/auth.js";
import { verifyAuthToken } from "../lib/auth.js";

type LoginBody = {
  email: string;
  password: string;
};

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>("/api/auth/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email?.trim() || !password) {
      return reply.code(400).send({
        message: "E-mail e senha são obrigatórios",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      return reply.code(401).send({
        message: "E-mail ou senha inválidos",
      });
    }

    const passwordValid = await comparePassword(password, user.passwordHash);

    if (!passwordValid) {
      return reply.code(401).send({
        message: "E-mail ou senha inválidos",
      });
    }

    if (user.role !== "ADMIN") {
      return reply.code(403).send({
        message: "Acesso administrativo não autorizado",
      });
    }

    const token = createAuthToken({
      userId: user.id,
      role: user.role,
    });

    reply.setCookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie("auth_token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return {
      success: true,
    };
  });

    app.get("/api/auth/me", async (request, reply) => {
      const token = request.cookies.auth_token;

      if (!token) {
        return reply.code(401).send({
          message: "Não autenticado",
        });
      }

      try {
        const payload = verifyAuthToken(token);

        const user = await prisma.user.findUnique({
          where: {
            id: payload.userId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        if (!user) {
          return reply.code(401).send({
            message: "Usuário não encontrado",
          });
        }

        return {
          authenticated: true,
          user,
        };
      } catch {
        return reply.code(401).send({
          message: "Sessão inválida ou expirada",
        });
      }
    });
}
