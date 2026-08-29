import { PrismaClient } from "@prisma/client";
import { applyPrismaEnv } from "@/lib/database-url";

applyPrismaEnv();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma() {
  globalForPrisma.prisma ??= createPrisma();
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
