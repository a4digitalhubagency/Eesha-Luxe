import { PrismaClient, Prisma } from "@prisma/client";
export { Prisma };

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDbUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";

  // In development, the Supabase pooler (port 6543) is often blocked by home
  // routers, ISPs, or firewalls. Prefer DIRECT_URL (port 5432) which is the
  // standard PostgreSQL port and is almost never blocked.
  // On Vercel (production) DATABASE_URL is always the pooler — keep it that way.
  const isDev = process.env.NODE_ENV !== "production";
  const poolerInUrl = dbUrl.includes(":6543") || dbUrl.includes("pooler.supabase");

  let base: string;
  if (isDev && poolerInUrl && directUrl) {
    base = directUrl;
    console.log("[prisma] dev mode: using DIRECT_URL (port 5432) instead of pooler");
  } else if (isDev && poolerInUrl && !directUrl) {
    console.warn(
      "[prisma] WARNING: DATABASE_URL uses the Supabase pooler (port 6543) but DIRECT_URL is not set.\n" +
      "         Port 6543 is often blocked locally. Add DIRECT_URL to your .env:\n" +
      "         DIRECT_URL=\"postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres\""
    );
    base = dbUrl;
  } else {
    base = dbUrl;
  }

  // Cap the connection pool to avoid exhausting Supabase free-tier slots.
  if (base && !base.includes("connection_limit")) {
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
