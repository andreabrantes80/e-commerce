import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/auth.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email) {
  throw new Error("ADMIN_EMAIL é obrigatório");
}

if (!password) {
  throw new Error("ADMIN_PASSWORD é obrigatório");
}

if (password.length < 8) {
  throw new Error("A senha deve ter pelo menos 8 caracteres");
}

try {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(`Já existe um usuário cadastrado com o e-mail ${email}`);
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("");
  console.log("======================================");
  console.log(" ADMINISTRADOR CRIADO COM SUCESSO");
  console.log("======================================");
  console.log(`ID:    ${admin.id}`);
  console.log(`Nome:  ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role:  ${admin.role}`);
  console.log("Senha: armazenada com hash bcrypt");
  console.log("======================================");
  console.log("");
} finally {
  await prisma.$disconnect();
}
