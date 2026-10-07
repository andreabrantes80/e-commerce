import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  });
}
