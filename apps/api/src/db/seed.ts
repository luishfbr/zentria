import { eq } from "drizzle-orm";
import { env } from "../lib/env";
import { db } from "./client";
import { users } from "./schema/auth/users";
import { auth } from "../lib/auth";

const admin = {
  name: env.SUPERADMIN_NAME,
  email: env.SUPERADMIN_EMAIL,
  password: env.SUPERADMIN_PASSWORD,
};

async function main() {
  console.log("Iniciando Seed!");

  console.log("Procurando pelo usuário administrador.");
  const exists = await db.query.users.findFirst({
    where: eq(users.email, admin.email),
  });

  if (exists) {
    console.log("Usuário administrador já registrado!");
    return;
  }

  const data = await auth.api.createUser({
    body: {
      email: admin.email,
      name: admin.name,
      password: admin.password,
      role: "superadmin",
    },
  });

  if (!data.user) {
    console.log("Erro ao criar usuário administrador!");
    return;
  }

  console.log("Usuário administrador criado com sucesso!");
  console.log("Usuário:", data.user.email);

  return;
}

main();
