import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (process.env.NODE_ENV !== "production") {
    const cached = globalForPrisma.prisma;
    if (
      cached &&
      "investment" in cached &&
      "income" in cached &&
      "asset" in cached &&
      "userInfo" in cached &&
      "debtPayment" in cached
    ) {
      return cached;
    }
  } else if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
