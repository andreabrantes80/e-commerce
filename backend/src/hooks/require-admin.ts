import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAuthToken } from "../lib/auth.js";

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies.auth_token;

  if (!token) {
    return reply.code(401).send({
      message: "Não autenticado",
    });
  }

  try {
    const payload = verifyAuthToken(token);

    if (payload.role !== "ADMIN") {
      return reply.code(403).send({
        message: "Acesso administrativo não autorizado",
      });
    }
  } catch {
    return reply.code(401).send({
      message: "Sessão inválida ou expirada",
    });
  }
}
