import { PrismaClient, Prisma } from "@prisma/client";
export { Prisma };

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// In local development, port 6543 (Supabase PgBouncer pooler) is often blocked
// by firewalls or ISPs. Fall back to DIRECT_URL (port 5432) automatically so
// the dev server always connects. In production (Vercel), DATABASE_URL stays as
// the pooler URL which is required for serverless connection management.
function resolveDbUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";

  const usesDirect =
    process.env.NODE_ENV !== "production" &&
    dbUrl.includes(":6543") &&
    directUrl.length > 0;

  const base = usesDirect ? directUrl : dbUrl;

  // Cap the connection pool so we don't exhaust Supabase free-tier slots.
  if (!base.includes("connection_limit")) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}connection_limit=5&pool_timeout=30`;
  }
  return base;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasourceUrl: resolveDbUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
