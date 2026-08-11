// Aplica migrations incrementais ao SQLite antes de iniciar o servidor
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function run() {
  // Adiciona coluna ativo se não existir (idempotente)
  await p.$executeRawUnsafe(
    "ALTER TABLE User ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1"
  ).catch(() => {}); // ignora erro se coluna já existe
  console.log("[migrate] ok");
}

run().finally(() => p.$disconnect());
