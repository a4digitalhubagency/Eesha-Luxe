import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  const orders = await prisma.order.findMany({
    where: search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { user: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true } },
    },
  });

  const total = await prisma.order.count({
    where: search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { user: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
  });

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}
