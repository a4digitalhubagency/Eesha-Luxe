import { PrismaClient, Prisma } from "@prisma/client";
export { Prisma };

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Cap Prisma's internal pool before the client is instantiated so we don't
// exhaust Supabase's free-tier connection limit (typically 15–25 slots).
// Your DATABASE_URL should use the Supabase pooler (port 6543, ?pgbouncer=true).
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("connection_limit")) {
  const sep = process.env.DATABASE_URL.includes("?") ? "&" : "?";
  process.env.DATABASE_URL += `${sep}connection_limit=5&pool_timeout=30`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
