import "dotenv/config";
import Fastify from "fastify";
import { registerCors } from "./plugins/cors.js";
import { healthRoutes } from "./routes/health.js";
import { productRoutes } from "./routes/products.js";
import { categoryRoutes } from "./routes/categories.js";
import { authRoutes } from "./routes/auth.js";
import cookie from "@fastify/cookie";

const app = Fastify({ logger: true });

await registerCors(app);

await app.register(cookie);

await app.register(healthRoutes);
await app.register(productRoutes);
await app.register(categoryRoutes);
await app.register(authRoutes);

await app.listen({
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
});
